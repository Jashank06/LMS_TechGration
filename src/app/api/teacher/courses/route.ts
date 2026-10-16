import { NextResponse } from "next/server"
import { courseCreateSchema } from "@/server/schemas/teacher-schemas"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")?.toLowerCase()

    const where: any = {
      instructorName: session.user.name,
    }

    if (status && status !== "ALL") {
      where.approvalStatus = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    const coursesRaw = await db.course.findMany({
      where,
      include: {
        modules: {
          include: {
            lessons: true,
          },
          orderBy: { position: "asc" },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const courses = coursesRaw.map((c) => ({
      id: c.id,
      code: c.slug.toUpperCase().slice(0, 8),
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle || "",
      category: c.category,
      level: c.level,
      format: c.format,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl || "/brand/og-image.png",
      durationHours: c.durationHours,
      enrolledCount: c._count.enrollments,
      rating: 5.0,
      isPublished: c.isPublished,
      approvalStatus: c.approvalStatus,
      outcomes: c.outcomes,
      prerequisites: c.prerequisites,
      updatedAt: c.updatedAt.toISOString(),
      modules: c.modules.map((m) => ({
        id: m.id,
        courseId: m.courseId,
        title: m.title,
        description: m.description,
        position: m.position,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          moduleId: l.moduleId,
          title: l.title,
          slug: l.slug,
          type: l.type,
          durationSec: l.durationSec,
          position: l.position,
          videoUrl: l.videoUrl,
          content: l.content,
          isPreview: l.isPreview,
          resources: [],
        })),
      })),
    }))

    return NextResponse.json({ courses })
  } catch (error) {
    console.error("Courses list API error:", error)
    return NextResponse.json({ error: "Failed to load courses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const parsed = courseCreateSchema.parse(json)

    const baseSlug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`

    const created = await db.course.create({
      data: {
        slug: uniqueSlug,
        title: parsed.title,
        subtitle: parsed.subtitle || null,
        description: parsed.description,
        thumbnailUrl: parsed.thumbnailUrl || "/brand/og-image.png",
        category: parsed.category,
        level: parsed.level as any,
        format: parsed.format as any,
        instructorName: session.user.name,
        instructorTitle: session.user.headline || "Course Instructor",
        durationHours: parsed.durationHours,
        outcomes: parsed.outcomes,
        prerequisites: parsed.prerequisites,
        isPublished: false,
        approvalStatus: parsed.submitForApproval ? "IN_REVIEW" : "DRAFT",
      },
    })

    return NextResponse.json(
      {
        success: true,
        course: {
          ...created,
          code: parsed.code || "TG-" + Math.floor(100 + Math.random() * 900),
          enrolledCount: 0,
          modules: [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create course API error:", error)
    return NextResponse.json({ error: "Invalid course data" }, { status: 400 })
  }
}
