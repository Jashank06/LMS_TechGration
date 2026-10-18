import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [enrollments, certificatesCount] = await Promise.all([
      db.enrollment.findMany({
        where: { userId: user.id },
        include: { course: true },
        orderBy: { enrolledAt: "desc" },
      }),
      db.certificate.count({
        where: { userId: user.id },
      }),
    ])

    const enrolledCourses = enrollments.map((e) => ({
      id: e.id,
      courseId: e.courseId,
      courseTitle: e.course.title,
      courseSubtitle: e.course.subtitle,
      category: e.course.category,
      level: e.course.level,
      instructorName: e.course.instructorName || "TechGration Faculty",
      progressPct: Math.round(e.progressPct),
      status: e.status,
      isEligible: Math.round(e.progressPct) >= 100 && certificatesCount > 0,
    }))

    return NextResponse.json({
      success: true,
      hasEarnedCertificate: certificatesCount > 0,
      certificatesCount,
      enrolledCourses,
    })
  } catch (error: any) {
    console.error("Student interview readiness API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load interview readiness info" },
      { status: 500 }
    )
  }
}
