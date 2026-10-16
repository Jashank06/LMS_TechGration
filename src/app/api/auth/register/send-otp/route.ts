import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { db } from "@/server/db"
import { sendRegistrationOtpEmail } from "@/server/email/mailer"
import { OtpPurpose } from "@prisma/client"

const sendOtpSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = sendOtpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      )
    }

    // 2. Cooldown check: 60-second rate limit
    const recentOtp = await db.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.REGISTRATION,
        isUsed: false,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    })

    if (recentOtp) {
      return NextResponse.json(
        { error: "Please wait 60 seconds before requesting a new verification code." },
        { status: 429 }
      )
    }

    // 3. Hash temporary password securely for verification metadata
    const passwordHash = await bcrypt.hash(password, 10)

    // 4. Generate 6-digit cryptographic OTP code
    const otpCode = crypto.randomInt(100000, 1000000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // 5. Invalidate previous unverified OTPs for this email
    await db.otpVerification.updateMany({
      where: {
        email: normalizedEmail,
        purpose: OtpPurpose.REGISTRATION,
        isUsed: false,
      },
      data: { isUsed: true },
    })

    // 6. Store pending OTP in MongoDB
    await db.otpVerification.create({
      data: {
        email: normalizedEmail,
        otpCode,
        purpose: OtpPurpose.REGISTRATION,
        expiresAt,
        metadata: {
          name: name.trim(),
          passwordHash,
          role: "STUDENT",
        },
      },
    })

    // 7. Dispatch branded HTML email via Gmail SMTP
    const mailResult = await sendRegistrationOtpEmail({
      email: normalizedEmail,
      otpCode,
      name: name.trim(),
    })

    if (!mailResult.success) {
      console.error("Mailer failed to send OTP:", mailResult.error)
      return NextResponse.json(
        { error: "Could not send verification email. Please check your email address." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "A 6-digit verification code has been dispatched to your email.",
      email: normalizedEmail,
    })
  } catch (error: any) {
    console.error("Register send-otp error:", error)
    const errorMsg = error?.message || ""
    if (
      errorMsg.includes("Server selection timeout") ||
      errorMsg.includes("InternalError") ||
      error?.code === "P2010"
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection timeout. Please verify that your current IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address).",
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: "Failed to process registration request. Please try again." },
      { status: 500 }
    )
  }
}
