import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    const { courseId } = await params

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              include: {
                resources: true,
              },
            },
          },
        },
        enrollments: user ? { where: { userId: user.id } } : false,
        liveClasses: {
          where: { status: { not: "CANCELLED" } },
          orderBy: { startsAt: "asc" },
        },
        materials: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          include: {
            submissions: user ? { where: { userId: user.id } } : false,
          },
          orderBy: { dueAt: "asc" },
        },
        assessments: {
          include: {
            questions: { select: { id: true } },
            attempts: user
              ? {
                  where: { userId: user.id },
                  orderBy: { scorePct: "desc" },
                }
              : false,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const allLessons = course.modules.flatMap((m) => m.lessons)
    const isEnrolled = course.enrollments && course.enrollments.length > 0
    const enrollment = isEnrolled ? course.enrollments[0] : null
    const progressPct = enrollment ? enrollment.progressPct : 0

    const directMaterials = (course.materials || []).map((m) => ({
      id: m.id,
      title: m.title,
      fileUrl: m.fileUrl,
      fileSize: m.fileSize,
      fileType: m.fileType,
      lessonTitle: "Course Study Material",
      lessonId: m.id,
    }))

    const lessonMaterials = allLessons.flatMap((l) =>
      l.resources.map((r) => ({
        id: r.id,
        title: r.title,
        fileUrl: r.fileUrl,
        fileSize: r.fileSize,
        fileType: r.fileType,
        lessonTitle: l.title,
        lessonId: l.id,
      }))
    )

    const studyMaterials = [...directMaterials, ...lessonMaterials]

    const assignments = (course.assignments || []).map((a) => {
      const sub = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null
      return {
        id: a.id,
        title: a.title,
        instructions: a.instructions,
        maxMarks: a.maxMarks,
        dueAt: a.dueAt.toISOString(),
        attachments: a.attachments,
        submissionStatus: sub
          ? sub.status === "GRADED"
            ? "GRADED"
            : "SUBMITTED"
          : "PENDING",
        marksAwarded: sub?.marksAwarded ?? null,
        feedback: sub?.feedback ?? null,
        submittedAt: sub?.submittedAt ? sub.submittedAt.toISOString() : null,
        studentNotes: sub?.studentNotes ?? null,
        fileUrl: sub?.fileUrl ?? null,
      }
    })

    const quizzes = (course.assessments || []).map((q) => {
      const bestAttempt = q.attempts && q.attempts.length > 0 ? q.attempts[0] : null
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        timeLimitMinutes: Math.round(q.timeLimitSec / 60),
        passingPct: q.passingPct,
        questionCount: q.questions.length,
        bestScorePct: bestAttempt ? bestAttempt.scorePct : null,
        hasPassed: bestAttempt ? bestAttempt.passed : false,
        totalAttempts: q.attempts?.length || 0,
      }
    })

    const recordings = course.liveClasses
      .filter((lc) => Boolean(lc.recordingUrl && lc.recordingUrl.trim().length > 0))
      .map((lc, idx) => {
        const durationMs = new Date(lc.endsAt).getTime() - new Date(lc.startsAt).getTime()
        const durationSec = Math.max(300, Math.round(durationMs / 1000))
        return {
          id: lc.id,
          title: lc.title,
          description: lc.description,
          durationSec,
          durationMinutes: Math.round(durationSec / 60),
          videoUrl: lc.recordingUrl,
          position: idx + 1,
          isCompleted: false,
          resourcesCount: 0,
        }
      })

    const liveClasses = course.liveClasses
      .filter((lc) => lc.status !== "CANCELLED")
      .map((lc) => ({
        id: lc.id,
        title: lc.title,
        description: lc.description,
        instructorName: lc.instructorName,
        startsAt: lc.startsAt.toISOString(),
        endsAt: lc.endsAt.toISOString(),
        timezone: lc.timezone,
        meetingUrl: lc.meetingUrl,
        recordingUrl: lc.recordingUrl,
        platform: lc.platform,
        status: lc.status,
        meetingId: lc.meetingId,
        meetingPasscode: lc.meetingPasscode,
      }))

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        category: course.category,
        level: course.level,
        format: course.format,
        durationHours: course.durationHours,
        instructorName: course.instructorName,
        instructorTitle: course.instructorTitle,
        isEnrolled,
        progressPct,
        timetableUrl: course.timetableUrl,
        timetableTitle: course.timetableTitle,
        timetableFileName: course.timetableFileName,
        timetableFileSize: course.timetableFileSize,
        timetableFileType: course.timetableFileType,
        timetableUpdatedAt: course.timetableUpdatedAt ? course.timetableUpdatedAt.toISOString() : null,
        liveClasses,
        recordings,
        studyMaterials,
        assignments,
        quizzes,
      },
    })
  } catch (error: any) {
    console.error("Student course detail API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load course details" },
      { status: 500 }
    )
  }
}
