import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.toLowerCase()
    const health = searchParams.get("health")
    const course = searchParams.get("course")

    // Find all courses taught by this teacher
    const teacherCourses = await db.course.findMany({
      where: { instructorName: session.user.name },
      include: {
        enrollments: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
    })

    // Flatten unique enrolled students
    const studentMap = new Map<string, any>()

    for (const c of teacherCourses) {
      for (const enr of c.enrollments) {
        if (!studentMap.has(enr.userId)) {
          studentMap.set(enr.userId, {
            id: enr.userId,
            name: enr.user.name,
            email: enr.user.email,
            avatarUrl: enr.user.profile?.avatarUrl || "/brand/avatar-default.png",
            enrolledCourses: [c.title],
            overallProgressPct: enr.status === "COMPLETED" ? 100 : 0,
            attendancePct: 100,
            lastActive: "Recently active",
            daysInactive: 0,
            failedQuizzesCount: 0,
            missingAssignmentsCount: 0,
            supportFlags: [],
            academicHealth: "HEALTHY",
          })
        } else {
          studentMap.get(enr.userId).enrolledCourses.push(c.title)
        }
      }
    }

    let students = Array.from(studentMap.values())

    if (search) {
      students = students.filter(
        (s) => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search)
      )
    }

    if (health && health !== "ALL") {
      students = students.filter((s) => s.academicHealth === health)
    }

    if (course && course !== "ALL") {
      students = students.filter((s) => s.enrolledCourses.some((c: string) => c.includes(course)))
    }

    return NextResponse.json({
      students,
      stats: {
        total: students.length,
        healthy: students.filter((s) => s.academicHealth === "HEALTHY").length,
        needsSupport: students.filter((s) => s.academicHealth === "NEEDS_SUPPORT").length,
        atRisk: students.filter((s) => s.academicHealth === "AT_RISK").length,
      },
    })
  } catch (error) {
    console.error("Students list API error:", error)
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 })
  }
}
