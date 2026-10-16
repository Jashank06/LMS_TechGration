import { NextResponse } from "next/server"
import { db } from "@/server/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params
    const session = await db.liveClass.findUnique({
      where: { id: classId },
      include: {
        course: true,
        attendances: {
          include: { user: true },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const headers = [
      "Student ID",
      "Full Name",
      "Email Address",
      "Course Code",
      "Course Title",
      "Session Title",
      "Session Date",
      "Status",
      "Marked Timestamp",
    ]

    const rows = session.attendances.map((r) => [
      `"${r.userId}"`,
      `"${r.user.name.replace(/"/g, '""')}"`,
      `"${r.user.email}"`,
      `"${session.course.slug.toUpperCase().slice(0, 8)}"`,
      `"${session.course.title.replace(/"/g, '""')}"`,
      `"${session.title.replace(/"/g, '""')}"`,
      `"${new Date(session.startsAt).toISOString().split("T")[0]}"`,
      `"${r.status}"`,
      `"${r.markedAt.toISOString()}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n")

    const safeTitle = session.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")
    const filename = `attendance_${session.course.slug.slice(0, 8)}_${safeTitle}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("CSV Export API error:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}
