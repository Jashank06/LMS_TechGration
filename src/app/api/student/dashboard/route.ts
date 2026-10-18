import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch Student Enrollments
    const rawEnrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            level: true,
            format: true,
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
    })

    // Prioritize "Artificial Intelligence" course in Continue Learning / Enrollments
    const enrollments = [...rawEnrollments].sort((a, b) => {
      const isAiA =
        a.course.id === "6ad283b4e196d0b8fbfb9eae" ||
        a.course.title.toLowerCase().includes("artificial intelligence")
      const isAiB =
        b.course.id === "6ad283b4e196d0b8fbfb9eae" ||
        b.course.title.toLowerCase().includes("artificial intelligence")

      if (isAiA && !isAiB) return -1
      if (!isAiA && isAiB) return 1
      return 0
    })

    const enrolledCourseIds = enrollments.map((e) => e.courseId)

    // 2. Fetch Completed Lessons Count
    const completedLessonsCount = await db.lessonProgress.count({
      where: { userId: user.id, status: "COMPLETED" },
    })

    // 3. Fetch Upcoming & Live Classes
    const liveClasses = await db.liveClass.findMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startsAt: "asc" },
      take: 5,
    })

    // 4. Fetch Active Assignments
    const assignments = await db.assignment.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: {
          where: { userId: user.id },
          select: {
            id: true,
            status: true,
            marksAwarded: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { dueAt: "asc" },
      take: 6,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.profile?.avatarUrl ?? null,
        phone: user.profile?.phone ?? null,
        headline: user.profile?.headline ?? null,
        bio: user.profile?.bio ?? null,
        timezone: user.profile?.timezone ?? "Asia/Kolkata",
        learningGoals: user.profile?.learningGoals ?? null,
        campus: "TechGration Learning Portal",
        profile: user.profile
          ? {
              phone: user.profile.phone,
              headline: user.profile.headline,
              bio: user.profile.bio,
              avatarUrl: user.profile.avatarUrl,
              timezone: user.profile.timezone,
              learningGoals: user.profile.learningGoals,
            }
          : null,
      },
      stats: {
        enrolledCoursesCount: enrollments.length,
        completedLessonsCount,
        avgProgressPct: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPct, 0) / enrollments.length)
          : 0,
        hoursInvested: "0.0 hrs",
        passedQuizzesCount: 0,
        certificatesCount: 0,
      },
      enrollments: enrollments.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        title: e.course.title,
        progressPct: e.progressPct,
        thumbnailUrl: e.course.thumbnailUrl,
        level: e.course.level,
      })),
      liveClasses: liveClasses.map((lc) => ({
        id: lc.id,
        title: lc.title,
        courseTitle: lc.course.title,
        status: lc.status,
        meetingUrl: lc.meetingUrl,
        startsAt: lc.startsAt,
        platform: lc.platform,
      })),
      assignments: assignments.map((a) => {
        const submission = a.submissions[0]
        return {
          id: a.id,
          title: a.title,
          courseTitle: a.course.title,
          dueAt: a.dueAt,
          maxMarks: a.maxMarks,
          status: submission ? submission.status : "PENDING",
          marksAwarded: submission?.marksAwarded ?? null,
        }
      }),
    })
  } catch (error: any) {
    console.error("Student dashboard API error:", error)
    return NextResponse.json({ error: error.message || "Failed to load dashboard" }, { status: 500 })
  }
}
