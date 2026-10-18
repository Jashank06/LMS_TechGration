import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch earned certificates for this student
    const certificates = await db.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            instructorName: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    })

    // 2. Fetch all enrollments for this student
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            category: true,
            level: true,
            thumbnailUrl: true,
            instructorName: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    const earnedCourseIds = new Set(certificates.map((c) => c.courseId))

    const certItems = certificates.map((c) => ({
      id: c.id,
      code: c.code,
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      studentName: c.studentName,
      issuedAt: c.issuedAt.toISOString(),
      instructorName: c.course.instructorName || "TechGration Faculty",
    }))

    const inProgressCourses = enrollments
      .filter((e) => !earnedCourseIds.has(e.courseId))
      .map((e) => ({
        id: e.id,
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseSubtitle: e.course.subtitle,
        category: e.course.category,
        level: e.course.level,
        thumbnailUrl: e.course.thumbnailUrl,
        instructorName: e.course.instructorName || "TechGration Faculty",
        progressPct: Math.round(e.progressPct),
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
      }))

    return NextResponse.json({
      success: true,
      certificates: certItems,
      inProgressCourses,
    })
  } catch (error: any) {
    console.error("Student certificates API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load certificates" },
      { status: 500 }
    )
  }
}
