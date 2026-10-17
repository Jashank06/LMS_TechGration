import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(
  _request: Request,
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
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                resources: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
        liveClasses: {
          orderBy: { startsAt: "asc" },
        },
        materials: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      course: {
        ...course,
        code: course.slug.toUpperCase().slice(0, 8),
        enrolledCount: course._count.enrollments,
        liveClasses: course.liveClasses.map((lc) => ({
          ...lc,
          startsAt: lc.startsAt.toISOString(),
          endsAt: lc.endsAt.toISOString(),
        })),
        materials: course.materials.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
        modules: course.modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => ({
            ...l,
            resources: l.resources || [],
          })),
        })),
        timetableUpdatedAt: course.timetableUpdatedAt ? course.timetableUpdatedAt.toISOString() : null,
      },
    })
  } catch (error) {
    console.error("Get course API error:", error)
    return NextResponse.json({ error: "Failed to get course" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const json = await request.json()

    const updated = await db.course.update({
      where: { id: courseId },
      data: {
        title: json.title,
        subtitle: json.subtitle,
        description: json.description,
        category: json.category,
        level: json.level,
        format: json.format,
        durationHours: json.durationHours,
        outcomes: json.outcomes,
        prerequisites: json.prerequisites,
      },
    })

    return NextResponse.json({ success: true, course: updated })
  } catch (error) {
    console.error("Update course API error:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}
