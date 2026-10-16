import { NextResponse } from "next/server"
import { attendanceBulkMarkSchema } from "@/server/schemas/teacher-schemas"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classId } = await params
    const json = await request.json()
    const parsed = attendanceBulkMarkSchema.parse({ classId, ...json })

    const auditList = []

    for (const record of parsed.records) {
      await db.attendanceRecord.upsert({
        where: {
          liveClassId_userId: {
            liveClassId: classId,
            userId: record.userId,
          },
        },
        update: {
          status: record.status,
          markedAt: new Date(),
        },
        create: {
          liveClassId: classId,
          userId: record.userId,
          status: record.status,
          markedAt: new Date(),
        },
      })

      const audit = await db.auditLog.create({
        data: {
          actorId: session.user.id,
          actorEmail: session.user.email,
          actorRole: session.user.role as any,
          action: "ATTENDANCE_MARKED",
          resource: "LIVE_CLASS",
          resourceId: classId,
          details: {
            studentUserId: record.userId,
            status: record.status,
            reason: record.reason || "Manual update by instructor",
          },
        },
      })

      auditList.push({
        id: audit.id,
        classId,
        studentName: record.userId,
        changedBy: session.user.name,
        previousStatus: "PRESENT",
        newStatus: record.status,
        reason: record.reason || "Manual instructor update",
        timestamp: audit.createdAt.toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${parsed.records.length} records.`,
      audits: auditList,
    })
  } catch (error) {
    console.error("Attendance mark API error:", error)
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 })
  }
}
