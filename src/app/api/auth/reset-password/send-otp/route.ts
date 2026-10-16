import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { db } from "@/server/db"
import { sendPasswordResetOtpEmail } from "@/server/email/mailer"
import { OtpPurpose, UserStatus } from "@prisma/client"

const sendResetOtpSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = sendResetOtpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    // 1. Check if user exists in MongoDB
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: "No account exists with this email address." },
        { status: 404 }
      )
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) {
      return NextResponse.json(
        { error: "This account has been suspended or deactivated. Please contact support." },
        { status: 403 }
      )
    }

    // 2. Cooldown check: 60-second limit
    const recentOtp = await db.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.PASSWORD_RESET,
        isUsed: false,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    })

    if (recentOtp) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting another reset code." },
        { status: 429 }
      )
    }

    // 3. Generate 6-digit OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // 4. Invalidate prior active password reset OTPs
    await db.otpVerification.updateMany({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.PASSWORD_RESET,
        isUsed: false,
      },
      data: { isUsed: true },
    })

    // 5. Save in database
    await db.otpVerification.create({
      data: {
        email: normalizedEmail,
        otpCode,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt,
      },
    })

    // 6. Send branded password reset email via Gmail SMTP
    const mailResult = await sendPasswordResetOtpEmail({
      email: normalizedEmail,
      otpCode,
    })

    if (!mailResult.success) {
      console.error("Mailer failed to send reset OTP:", mailResult.error)
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "A 6-digit reset code has been sent to your email address.",
      email: normalizedEmail,
    })
  } catch (error: any) {
    console.error("Reset password send-otp error:", error)
    return NextResponse.json(
      { error: "Failed to initiate password reset. Please try again." },
      { status: 500 }
    )
  }
}
