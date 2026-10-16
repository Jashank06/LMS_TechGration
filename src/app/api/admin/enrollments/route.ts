import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { EnrollmentStatus } from "@prisma/client"

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "ALL"

    const where: any = {}

    if (status !== "ALL" && Object.values(EnrollmentStatus).includes(status as EnrollmentStatus)) {
      where.status = status as EnrollmentStatus
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { course: { title: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [enrollments, students, courses] = await Promise.all([
      db.enrollment.findMany({
        where,
        orderBy: { enrolledAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true, slug: true } },
        },
      }),
      db.user.findMany({
        where: { role: "STUDENT" },
        select: { id: true, name: true, email: true },
        take: 100,
      }),
      db.course.findMany({
        where: { isPublished: true },
        select: { id: true, title: true, slug: true },
      }),
    ])

    return NextResponse.json({
      enrollments: enrollments.map((e) => ({
        id: e.id,
        userId: e.userId,
        userName: e.user.name,
        userEmail: e.user.email,
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseSlug: e.course.slug,
        status: e.status,
        progressPct: e.progressPct,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        lastAccessedAt: e.lastAccessedAt,
      })),
      students,
      courses,
    })
  } catch (error: any) {
    console.error("Enrollments GET error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}

const manualEnrollSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  courseId: z.string().min(1, "Course ID required"),
  status: z.nativeEnum(EnrollmentStatus).default(EnrollmentStatus.ACTIVE),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = manualEnrollSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { userId, courseId, status } = validation.data

    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 409 })
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId,
        status,
        progressPct: 0,
      },
      include: {
        user: { select: { email: true } },
        course: { select: { title: true } },
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "ENROLLMENT_MANUAL_CREATE",
      resource: "ENROLLMENT",
      resourceId: enrollment.id,
      details: { studentEmail: enrollment.user.email, course: enrollment.course.title },
      ipAddress,
    })

    return NextResponse.json({ success: true, enrollment })
  } catch (error: any) {
    console.error("Enrollment POST error:", error)
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const { id, status, reason } = body

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 })
    }

    const updated = await db.enrollment.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { email: true } },
        course: { select: { title: true } },
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "ENROLLMENT_STATUS_UPDATE",
      resource: "ENROLLMENT",
      resourceId: id,
      details: {
        studentEmail: updated.user.email,
        course: updated.course.title,
        newStatus: status,
        reason: reason || "Administrative update",
      },
      ipAddress,
    })

    return NextResponse.json({ success: true, enrollment: updated })
  } catch (error: any) {
    console.error("Enrollment PATCH error:", error)
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 })
  }
}
