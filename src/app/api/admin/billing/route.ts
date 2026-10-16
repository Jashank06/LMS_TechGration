import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { env } from "@/server/env"

export async function GET() {
  try {
    await requireAdmin()

    const [courses, coupons, transactions] = await Promise.all([
      db.course.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          price: true,
          compareAtPrice: true,
          currency: true,
          isPublished: true,
        },
        orderBy: { title: "asc" },
      }),
      db.coupon.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.paymentTransaction.findMany({
        take: 25,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
    ])

    return NextResponse.json({
      billingEnabled: env.FEATURE_BILLING_ENABLED,
      courses,
      coupons,
      transactions: transactions.map((t) => ({
        id: t.id,
        orderId: t.orderId,
        paymentId: t.paymentId,
        studentName: t.user.name,
        studentEmail: t.user.email,
        courseTitle: t.course.title,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        paymentMethod: t.paymentMethod,
        couponCode: t.couponCode,
        createdAt: t.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Billing GET error:", error)
    return NextResponse.json({ error: "Failed to fetch billing data" }, { status: 500 })
  }
}

const updatePriceSchema = z.object({
  courseId: z.string().min(1),
  price: z.number().min(0),
  compareAtPrice: z.number().optional().nullable(),
})

export async function PATCH(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = updatePriceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid price payload" }, { status: 400 })
    }

    const { courseId, price, compareAtPrice } = validation.data

    const updated = await db.course.update({
      where: { id: courseId },
      data: {
        price,
        compareAtPrice: compareAtPrice || null,
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "COURSE_PRICE_UPDATE",
      resource: "BILLING",
      resourceId: courseId,
      details: { courseSlug: updated.slug, newPrice: price, compareAtPrice },
      ipAddress,
    })

    return NextResponse.json({ success: true, course: updated })
  } catch (error: any) {
    console.error("Billing PATCH error:", error)
    return NextResponse.json({ error: "Failed to update pricing" }, { status: 500 })
  }
}
