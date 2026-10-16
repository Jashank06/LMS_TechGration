import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase().trim(),
  discountPct: z.number().min(1).max(100),
  maxUses: z.number().optional().nullable(),
  maxDiscountAmount: z.number().optional().nullable(),
  minCartAmount: z.number().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = couponSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid coupon data" }, { status: 400 })
    }

    const { code, discountPct, maxUses, maxDiscountAmount, minCartAmount } = validation.data

    const existing = await db.coupon.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
    }

    const coupon = await db.coupon.create({
      data: {
        code,
        discountPct,
        maxUses: maxUses || null,
        maxDiscountAmount: maxDiscountAmount || null,
        minCartAmount: minCartAmount || null,
        isActive: true,
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "COUPON_CREATE",
      resource: "BILLING",
      resourceId: coupon.id,
      details: { code, discountPct },
      ipAddress,
    })

    return NextResponse.json({ success: true, coupon })
  } catch (error: any) {
    console.error("Coupon POST error:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const { id, isActive, deleteCoupon } = body

    if (!id) {
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 })
    }

    if (deleteCoupon) {
      await db.coupon.delete({ where: { id } })
      return NextResponse.json({ success: true, message: "Coupon deleted" })
    }

    const updated = await db.coupon.update({
      where: { id },
      data: { isActive },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "COUPON_STATUS_TOGGLE",
      resource: "BILLING",
      resourceId: id,
      details: { code: updated.code, isActive },
      ipAddress,
    })

    return NextResponse.json({ success: true, coupon: updated })
  } catch (error: any) {
    console.error("Coupon PATCH error:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}
