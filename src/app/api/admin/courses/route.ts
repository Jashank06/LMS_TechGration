import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { CourseApprovalStatus } from "@prisma/client"

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "ALL"
    const search = searchParams.get("search") || ""

    const where: any = {}

    if (status !== "ALL" && Object.values(CourseApprovalStatus).includes(status as CourseApprovalStatus)) {
      where.approvalStatus = status as CourseApprovalStatus
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { instructorName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    const courses = await db.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        modules: {
          include: {
            lessons: true,
          },
          orderBy: { position: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    const pendingCount = await db.course.count({
      where: { approvalStatus: CourseApprovalStatus.IN_REVIEW },
    })

    return NextResponse.json({
      courses: courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        category: c.category,
        instructorName: c.instructorName,
        instructorTitle: c.instructorTitle,
        durationHours: c.durationHours,
        price: c.price,
        compareAtPrice: c.compareAtPrice,
        approvalStatus: c.approvalStatus,
        reviewerNotes: c.reviewerNotes,
        submittedAt: c.submittedAt,
        reviewedAt: c.reviewedAt,
        modulesCount: c.modules.length,
        lessonsCount: c.modules.reduce((acc, m) => acc + m.lessons.length, 0),
        enrollmentsCount: c._count.enrollments,
        modules: c.modules,
      })),
      pendingCount,
    })
  } catch (error: any) {
    console.error("Courses GET error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
