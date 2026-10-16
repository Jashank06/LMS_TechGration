import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { isStaff, ownedByTeacher } from "@/server/services/teacher-scope"
import { getCourseLeaderboard } from "@/server/services/leaderboard"

function csvCell(value: string | number | null): string {
  const s = value === null ? "" : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const courseId = new URL(request.url).searchParams.get("courseId")
    if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 })

    const owned = await db.course.findFirst({
      where: { id: courseId, ...(isStaff(session.user.role) ? {} : ownedByTeacher(session.user)) },
      select: { id: true },
    })
    if (!owned) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const data = await getCourseLeaderboard(courseId, { id: session.user.id, isStaff: true })
    if (!data) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const header = [
      "Rank",
      "Name",
      "Email",
      "Total Marks",
      "Assignment Marks",
      "Quiz Marks",
      "Accuracy %",
      "Graded Assignments",
      "Quizzes Taken",
      "Last Scored At",
    ]
    const lines = [header.join(",")]
    for (const r of data.ranked) {
      lines.push(
        [
          r.rank,
          r.displayName,
          r.email,
          r.totalMarks,
          r.assignmentMarks,
          r.quizMarks,
          r.accuracyPct,
          r.gradedAssignments,
          r.quizzesTaken,
          r.lastScoredAt,
        ]
          .map(csvCell)
          .join(",")
      )
    }

    const safeTitle = data.course.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leaderboard-${safeTitle || "course"}.csv"`,
      },
    })
  } catch (error) {
    console.error("Leaderboard export failed:", error)
    return NextResponse.json({ error: "Failed to export leaderboard" }, { status: 500 })
  }
}
