import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { EnrollmentStatus } from "@prisma/client"

interface RowItem {
  rowNumber: number
  email: string
  courseSlug: string
}

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const { rows, mode } = body // mode: "validate" | "commit"

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided for bulk enrollment" }, { status: 400 })
    }

    const validatedResults = []
    const toEnroll = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const email = (row.email || "").toLowerCase().trim()
      const courseSlug = (row.courseSlug || row.course_slug || "").trim()

      if (!email || !courseSlug) {
        validatedResults.push({
          row: i + 1,
          email,
          courseSlug,
          status: "INVALID",
          error: "Missing email or course slug",
        })
        continue
      }

      // Check user
      const user = await db.user.findUnique({
        where: { email },
        select: { id: true, name: true },
      })

      if (!user) {
        validatedResults.push({
          row: i + 1,
          email,
          courseSlug,
          status: "USER_NOT_FOUND",
          error: "No student account found with this email",
        })
        continue
      }

      // Check course
      const course = await db.course.findUnique({
        where: { slug: courseSlug },
        select: { id: true, title: true },
      })

      if (!course) {
        validatedResults.push({
          row: i + 1,
          email,
          courseSlug,
          status: "COURSE_NOT_FOUND",
          error: "Course slug does not exist",
        })
        continue
      }

      // Check if already enrolled
      const existing = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId: user.id, courseId: course.id },
        },
      })

      if (existing) {
        validatedResults.push({
          row: i + 1,
          email,
          courseSlug,
          userName: user.name,
          courseTitle: course.title,
          status: "ALREADY_ENROLLED",
          error: "Student is already enrolled in this course",
        })
        continue
      }

      validatedResults.push({
        row: i + 1,
        email,
        courseSlug,
        userId: user.id,
        courseId: course.id,
        userName: user.name,
        courseTitle: course.title,
        status: "VALID",
      })

      toEnroll.push({
        userId: user.id,
        courseId: course.id,
        status: EnrollmentStatus.ACTIVE,
        progressPct: 0,
      })
    }

    if (mode === "commit") {
      let insertedCount = 0
      for (const item of toEnroll) {
        await db.enrollment.create({
          data: item,
        })
        insertedCount++
      }

      const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
      await logAuditEvent({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        actorRole: adminUser.role,
        action: "ENROLLMENT_BULK_IMPORT",
        resource: "ENROLLMENT",
        details: { importedCount: insertedCount, totalRows: rows.length },
        ipAddress,
      })

      return NextResponse.json({
        success: true,
        importedCount: insertedCount,
        skippedCount: rows.length - insertedCount,
        details: validatedResults,
      })
    }

    // Default validation mode
    return NextResponse.json({
      validCount: toEnroll.length,
      invalidCount: rows.length - toEnroll.length,
      rows: validatedResults,
    })
  } catch (error: any) {
    console.error("Bulk enrollment error:", error)
    return NextResponse.json({ error: "Failed to process bulk enrollment" }, { status: 500 })
  }
}
