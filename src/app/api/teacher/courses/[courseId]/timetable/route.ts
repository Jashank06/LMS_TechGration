import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        timetableUrl: true,
        timetableTitle: true,
        timetableFileName: true,
        timetableFileSize: true,
        timetableFileType: true,
        timetableUpdatedAt: true,
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      timetable: course.timetableUrl
        ? {
            url: course.timetableUrl,
            title: course.timetableTitle,
            fileName: course.timetableFileName,
            fileSize: course.timetableFileSize,
            fileType: course.timetableFileType,
            updatedAt: course.timetableUpdatedAt?.toISOString(),
          }
        : null,
    })
  } catch (error) {
    console.error("Fetch course timetable error:", error)
    return NextResponse.json(
      { error: "Failed to fetch timetable." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    try {
      await db.course.update({
        where: { id: courseId },
        data: {
          timetableUrl: null,
          timetableTitle: null,
          timetableFileName: null,
          timetableFileSize: null,
          timetableFileType: null,
          timetableUpdatedAt: null,
        },
      })
    } catch {
      await db.$runCommandRaw({
        update: "Course",
        updates: [
          {
            q: { _id: { $oid: courseId } },
            u: {
              $set: {
                timetableUrl: null,
                timetableTitle: null,
                timetableFileName: null,
                timetableFileSize: null,
                timetableFileType: null,
                timetableUpdatedAt: null,
              },
            },
          },
        ],
      })
    }

    return NextResponse.json({
      success: true,
      message: "Course timetable deleted successfully.",
    })
  } catch (error) {
    console.error("Delete course timetable error:", error)
    return NextResponse.json(
      { error: "Failed to delete timetable." },
      { status: 500 }
    )
  }
}
