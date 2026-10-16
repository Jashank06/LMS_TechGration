import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/server/db"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { OtpPurpose, UserStatus } from "@prisma/client"

const resetCompleteSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  otpCode: z.string().length(6, "Verification code must be 6 digits"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = resetCompleteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, otpCode, newPassword } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    // 1. Fetch latest active OTP for password reset
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.PASSWORD_RESET,
        isUsed: false,
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No active password reset request found. Please request a new code." },
        { status: 400 }
      )
    }

    // 2. Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })
      return NextResponse.json(
        { error: "Your reset code has expired. Please request a new code." },
        { status: 400 }
      )
    }

    // 3. Check attempts
    if (otpRecord.attempts >= 5) {
      await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      })
      return NextResponse.json(
        { error: "Too many invalid attempts. Please request a new code." },
        { status: 429 }
      )
    }

    // 4. Verify code
    if (otpRecord.otpCode !== otpCode.trim()) {
      const updated = await db.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      })
      const remaining = 5 - updated.attempts
      return NextResponse.json(
        {
          error: `Incorrect reset code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
        },
        { status: 400 }
      )
    }

    // 5. Code is valid! Find target user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 })
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) {
      return NextResponse.json(
        { error: "Account is suspended or deactivated. Contact support." },
        { status: 403 }
      )
    }

    // 6. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // 7. Update password hash in MongoDB
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    // 8. Revoke all active sessions for security
    await db.session.deleteMany({
      where: { userId: user.id },
    })

    // 9. Mark OTP as used
    await db.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    })

    // 10. Audit log
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const userAgent = req.headers.get("user-agent") || undefined

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "AUTH_PASSWORD_RESET_SUCCESS",
      resource: "AUTH",
      resourceId: user.id,
      details: { email: user.email, method: "EMAIL_OTP" },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset. Please sign in with your new password.",
    })
  } catch (error: any) {
    console.error("Reset password complete error:", error)
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    )
  }
}
