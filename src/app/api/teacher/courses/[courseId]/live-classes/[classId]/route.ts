import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { LiveClassStatus } from "@prisma/client"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; classId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, classId } = await params

    const liveClass = await db.liveClass.findUnique({
      where: { id: classId },
    })

    if (!liveClass || liveClass.courseId !== courseId) {
      return NextResponse.json({ error: "Live class not found" }, { status: 404 })
    }

    // Clean up related attendance & dispatches
    await db.attendanceRecord.deleteMany({ where: { liveClassId: classId } })
    await db.reminderDispatch.deleteMany({ where: { liveClassId: classId } })
    await db.liveClass.delete({ where: { id: classId } })

    return NextResponse.json({
      success: true,
      message: "Live class session removed successfully.",
    })
  } catch (error) {
    console.error("Delete live class error:", error)
    return NextResponse.json(
      { error: "Failed to delete live class session" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string; classId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, classId } = await params
    const body = await request.json()

    const liveClass = await db.liveClass.findUnique({
      where: { id: classId },
    })

    if (!liveClass || liveClass.courseId !== courseId) {
      return NextResponse.json({ error: "Live class not found" }, { status: 404 })
    }

    const updated = await db.liveClass.update({
      where: { id: classId },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.status && { status: body.status as LiveClassStatus }),
        ...(body.meetingUrl && { meetingUrl: body.meetingUrl.trim() }),
        ...(body.recordingUrl !== undefined && { recordingUrl: body.recordingUrl?.trim() || null }),
        ...(body.startsAt && { startsAt: new Date(body.startsAt) }),
        ...(body.endsAt && { endsAt: new Date(body.endsAt) }),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Live class session updated successfully.",
      liveClass: {
        ...updated,
        startsAt: updated.startsAt.toISOString(),
        endsAt: updated.endsAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Patch live class error:", error)
    return NextResponse.json(
      { error: "Failed to update live class session" },
      { status: 500 }
    )
  }
}
