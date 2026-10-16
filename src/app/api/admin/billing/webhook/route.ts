import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { db } from "@/server/db"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { PaymentStatus, EnrollmentStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_razorpay_secret"

    // If billing feature flag is disabled, acknowledge in sandbox mode
    if (process.env.FEATURE_BILLING_ENABLED !== "true") {
      return NextResponse.json({
        status: "sandbox_acknowledged",
        message: "Billing is running in feature-flagged sandbox mode",
      })
    }

    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex")

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
      }
    }

    const event = JSON.parse(rawBody)
    const payload = event.payload?.payment?.entity

    if (event.event === "payment.captured" && payload) {
      const orderId = payload.order_id || `order_${Date.now()}`
      const paymentId = payload.id
      const amount = payload.amount / 100 // paise to INR
      const email = payload.email

      const user = await db.user.findUnique({ where: { email } })

      if (user) {
        // Find course from notes or metadata if available
        const courseSlug = payload.notes?.courseSlug
        const course = courseSlug ? await db.course.findUnique({ where: { slug: courseSlug } }) : null

        if (course) {
          await db.paymentTransaction.create({
            data: {
              orderId,
              paymentId,
              signature,
              userId: user.id,
              courseId: course.id,
              amount,
              currency: payload.currency || "INR",
              status: PaymentStatus.SUCCESS,
              paymentMethod: payload.method,
            },
          })

          // Auto-enroll student upon payment confirmation
          await db.enrollment.upsert({
            where: {
              userId_courseId: { userId: user.id, courseId: course.id },
            },
            update: { status: EnrollmentStatus.ACTIVE },
            create: {
              userId: user.id,
              courseId: course.id,
              status: EnrollmentStatus.ACTIVE,
            },
          })

          await logAuditEvent({
            actorId: user.id,
            actorEmail: user.email,
            action: "PAYMENT_WEBHOOK_PROCESSED",
            resource: "BILLING",
            details: { orderId, amount, courseSlug },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Razorpay webhook error:", err)
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 })
  }
}
