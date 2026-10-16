import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { CourseApprovalStatus } from "@prisma/client"

const reviewSchema = z.object({
  action: z.enum(["APPROVE", "REQUEST_CHANGES", "REJECT"]),
  notes: z.string().optional(),
})

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin()
    const { id } = await props.params
    const body = await req.json()
    const validation = reviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid review action" }, { status: 400 })
    }

    const { action, notes } = validation.data

    const course = await db.course.findUnique({
      where: { id },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    let nextStatus: CourseApprovalStatus = CourseApprovalStatus.APPROVED
    let isPublished = course.isPublished

    if (action === "APPROVE") {
      nextStatus = CourseApprovalStatus.APPROVED
      isPublished = true
    } else if (action === "REQUEST_CHANGES") {
      nextStatus = CourseApprovalStatus.NEEDS_REVISION
      isPublished = false
    } else if (action === "REJECT") {
      nextStatus = CourseApprovalStatus.REJECTED
      isPublished = false
    }

    const updated = await db.course.update({
      where: { id },
      data: {
        approvalStatus: nextStatus,
        isPublished,
        reviewerNotes: notes || null,
        reviewedById: adminUser.id,
        reviewedAt: new Date(),
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: `COURSE_REVIEW_${action}`,
      resource: "COURSE",
      resourceId: course.id,
      details: {
        courseSlug: course.slug,
        previousStatus: course.approvalStatus,
        newStatus: nextStatus,
        reviewerNotes: notes,
      },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      course: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        approvalStatus: updated.approvalStatus,
        isPublished: updated.isPublished,
      },
    })
  } catch (error: any) {
    console.error("Course review error:", error)
    return NextResponse.json({ error: "Failed to process course review" }, { status: 500 })
  }
}
