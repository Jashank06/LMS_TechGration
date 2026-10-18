import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { createSession } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { OtpPurpose, Role, UserStatus } from "@prisma/client"

const verifyOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  otpCode: z.string().length(6, "Verification code must be 6 digits"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = verifyOtpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, otpCode } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    // 1. Fetch latest active OTP for registration
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.REGISTRATION,
        isUsed: false,
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No pending verification code found. Please request a new code." },
        { status: 400 }
      )
    }

    // 2. Check if expired (10 minutes)
    if (new Date() > otpRecord.expiresAt) {
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })
      return NextResponse.json(
        { error: "This verification code has expired. Please request a fresh code." },
        { status: 400 }
      )
    }

    // 3. Check attempt limit
    if (otpRecord.attempts >= 5) {
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new verification code." },
        { status: 429 }
      )
    }

    // 4. Verify code match
    if (otpRecord.otpCode !== otpCode.trim()) {
      const updated = await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      })
      const remaining = 5 - updated.attempts
      return NextResponse.json(
        {
          error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
        },
        { status: 400 }
      )
    }

    // 5. Code is valid! Parse metadata
    const metadata = (otpRecord.metadata as any) || {}
    const name = metadata.name || "Student"
    const passwordHash = metadata.passwordHash

    if (!passwordHash) {
      return NextResponse.json(
        { error: "Corrupted registration session. Please restart registration." },
        { status: 500 }
      )
    }

    // Check if user was created concurrently
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })
      return NextResponse.json(
        { error: "This account has already been created. Please sign in." },
        { status: 409 }
      )
    }

    // 6. Create User in MongoDB Atlas
    const newUser = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        invitedById: metadata.invitedById || null,
        profile: {
          create: {
            headline: "Student at TechGration LMS",
            timezone: "Asia/Kolkata",
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // 7. Auto-enroll in first published course (if any)
    const starterCourse = await db.course.findFirst({
      where: { isPublished: true },
    })

    if (starterCourse) {
      await db.enrollment.create({
        data: {
          userId: newUser.id,
          courseId: starterCourse.id,
          progressPct: 0,
        },
      }).catch(() => {})
    }

    // 8. Invalidate OTP
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    })

    // 9. Log append-only audit event
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || undefined

    await logAuditEvent({
      actorId: newUser.id,
      actorEmail: newUser.email,
      actorRole: newUser.role,
      action: "USER_REGISTER_VERIFIED",
      resource: "AUTH",
      resourceId: newUser.id,
      details: { email: newUser.email, verifiedVia: "EMAIL_OTP" },
      ipAddress,
      userAgent,
    })

    // 10. Automatically establish authenticated session & write cookie
    const { token } = await createSession(newUser.id, req)

    return NextResponse.json({
      success: true,
      token,
      message: "Account verified and created successfully!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error: any) {
    console.error("Register verify-otp error:", error)
    return NextResponse.json(
      { error: "Failed to verify account. Please try again." },
      { status: 500 }
    )
  }
}
