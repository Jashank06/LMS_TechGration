import { NextResponse } from "next/server"
import { db } from "@/server/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params
    const rawLogs = await db.auditLog.findMany({
      where: {
        resourceId: classId,
        action: "ATTENDANCE_MARKED",
      },
      orderBy: { createdAt: "desc" },
    })

    const audits = rawLogs.map((l) => {
      const details = (l.details as any) || {}
      return {
        id: l.id,
        classId,
        studentName: details.studentUserId || "Student",
        changedBy: l.actorEmail,
        previousStatus: "PRESENT",
        newStatus: details.status || "PRESENT",
        reason: details.reason || "Manual update",
        timestamp: l.createdAt.toISOString(),
      }
    })

    return NextResponse.json({ audits })
  } catch (error) {
    console.error("Attendance audit API error:", error)
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 })
  }
}
