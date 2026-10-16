import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getSession } from "@/server/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // 1. Check if certificate already exists
    const existingCert = await db.certificate.findFirst({
      where: {
        userId: session.user.id,
        courseId,
      },
      include: {
        course: true,
      },
    })

    if (existingCert) {
      return NextResponse.json({
        success: true,
        message: "Certificate already issued.",
        certificate: {
          id: existingCert.id,
          code: existingCert.code,
          courseId: existingCert.courseId,
          courseTitle: existingCert.courseTitle,
          studentName: existingCert.studentName,
          issuedAt: existingCert.issuedAt.toISOString(),
          teacherName: existingCert.course.instructorName,
        },
      })
    }

    // 2. Check enrollment
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
      },
      include: {
        course: true,
        user: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course." },
        { status: 403 }
      )
    }

    // Generate unique verification code e.g. TG-AI-9X82
    const prefix = enrollment.course.title.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, "TG")
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase()
    const timestampCode = Date.now().toString(36).slice(-4).toUpperCase()
    const code = `TG-${prefix}-${randomHex}${timestampCode}`

    // Create official certificate
    const certificate = await db.certificate.create({
      data: {
        code,
        userId: session.user.id,
        courseId: enrollment.course.id,
        studentName: enrollment.user.name || "Student",
        courseTitle: enrollment.course.title,
      },
    })

    // Mark enrollment as completed
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "COMPLETED",
        progressPct: 100,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "Congratulations! Your verified certificate has been issued.",
      certificate: {
        id: certificate.id,
        code: certificate.code,
        courseId: certificate.courseId,
        courseTitle: certificate.courseTitle,
        studentName: certificate.studentName,
        issuedAt: certificate.issuedAt.toISOString(),
        teacherName: enrollment.course.instructorName,
      },
    })
  } catch (error) {
    console.error("Claim certificate error:", error)
    return NextResponse.json(
      { error: "Failed to issue certificate" },
      { status: 500 }
    )
  }
}
