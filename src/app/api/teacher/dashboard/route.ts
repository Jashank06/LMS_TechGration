import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET() {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacherName = session.user.name

    // 1. Total courses by this teacher
    const totalCourses = await db.course.count({
      where: { instructorName: teacherName },
    })

    // 2. Total students enrolled in this teacher's courses
    const totalStudents = await db.enrollment.count({
      where: { course: { instructorName: teacherName } },
    })

    // 3. Upcoming live classes
    const upcomingClasses = await db.liveClass.count({
      where: {
        instructorName: teacherName,
        status: { in: ["SCHEDULED", "LIVE"] },
      },
    })

    // 4. Pending grading count
    const pendingGrading = await db.assignmentSubmission.count({
      where: {
        status: "SUBMITTED",
        assignment: { course: { instructorName: teacherName } },
      },
    })

    // 5. Schedule
    const schedule = await db.liveClass.findMany({
      where: { instructorName: teacherName },
      include: { course: true },
      orderBy: { startsAt: "asc" },
      take: 10,
    })

    // 6. Urgent submissions
    const urgentSubmissionsRaw = await db.assignmentSubmission.findMany({
      where: {
        status: "SUBMITTED",
        assignment: { course: { instructorName: teacherName } },
      },
      include: {
        user: true,
        assignment: {
          include: { course: true },
        },
      },
      orderBy: { submittedAt: "asc" },
      take: 5,
    })

    const urgentSubmissions = urgentSubmissionsRaw.map((s) => ({
      id: s.id,
      studentName: s.user.name,
      studentEmail: s.user.email,
      studentAvatar: "/brand/avatar-default.png",
      assignmentTitle: s.assignment.title,
      courseTitle: s.assignment.course.title,
      maxMarks: s.assignment.maxMarks,
      submittedAt: s.submittedAt.toISOString(),
      isLate: false,
      status: s.status,
    }))

    // 7. Recent activity from auditLog
    const recentActivityRaw = await db.auditLog.findMany({
      where: { actorEmail: session.user.email },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const recentActivity = recentActivityRaw.map((a) => ({
      id: a.id,
      type: a.action,
      title: `${a.action.replace(/_/g, " ")} on ${a.resource}`,
      course: a.resource,
      time: a.createdAt.toISOString(),
    }))

    return NextResponse.json({
      profile: session.user,
      stats: {
        totalCourses,
        totalStudents,
        upcomingClasses,
        pendingGrading,
        weeklyHours: upcomingClasses * 2,
        avgAttendanceRate: 0,
        rating: 5.0,
      },
      schedule: schedule.map((s) => ({
        id: s.id,
        courseId: s.courseId,
        courseTitle: s.course.title,
        courseCode: s.course.slug.toUpperCase().slice(0, 8),
        title: s.title,
        description: s.description,
        instructorName: s.instructorName,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        timezone: s.timezone,
        platform: "ZOOM",
        meetingUrl: s.meetingUrl,
        status: s.status,
        enrolledCount: 0,
      })),
      urgentSubmissions,
      recentActivity,
    })
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 })
  }
}
