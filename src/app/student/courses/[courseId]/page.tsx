import * as React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { CourseHubClient, CourseHubData } from "./course-hub-client"

interface PageProps {
  params: Promise<{ courseId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const course = await db.course.findUnique({
    where: { id: resolvedParams.courseId },
  })

  return {
    title: course ? `${course.title} — TechGration LMS` : "Course Details",
    description: course?.subtitle || course?.description || "Live classes, session recordings, schedule timetable, and study materials.",
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const user = await requireStudent()
  const resolvedParams = await params

  const course = await db.course.findUnique({
    where: { id: resolvedParams.courseId },
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
      enrollments: {
        where: { userId: user.id },
      },
      liveClasses: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { startsAt: "asc" },
      },
      materials: {
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: {
          submissions: {
            where: { userId: user.id },
          },
        },
        orderBy: { dueAt: "asc" },
      },
      assessments: {
        include: {
          questions: { select: { id: true } },
          attempts: {
            where: { userId: user.id },
            orderBy: { scorePct: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!course) {
    notFound()
  }

  // Get user progress for all recordings in this course
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const userProgress =
    allLessons.length > 0
      ? await db.lessonProgress.findMany({
          where: {
            userId: user.id,
            lessonId: { in: allLessons.map((l) => l.id) },
          },
        })
      : []

  const completedLessonSet = new Set(
    userProgress.filter((p) => p.status === "COMPLETED").map((p) => p.lessonId)
  )

  const isEnrolled = course.enrollments.length > 0
  const enrollment = course.enrollments[0]
  const progressPct = enrollment ? enrollment.progressPct : 0
  const firstLessonId = allLessons[0]?.id
  const lastLessonId = enrollment?.lastLessonId || firstLessonId

  // Extract all study materials across the course sessions
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

  // Map assignments
  const assignments = (course.assignments || []).map((a) => {
    const sub = a.submissions[0]
    return {
      id: a.id,
      title: a.title,
      instructions: a.instructions,
      maxMarks: a.maxMarks,
      dueAt: a.dueAt.toISOString(),
      attachments: a.attachments,
      submissionStatus: (sub
        ? sub.status === "GRADED"
          ? "GRADED"
          : "SUBMITTED"
        : "PENDING") as "PENDING" | "SUBMITTED" | "GRADED",
      marksAwarded: sub?.marksAwarded ?? null,
      feedback: sub?.feedback ?? null,
      submittedAt: sub?.submittedAt ? sub.submittedAt.toISOString() : null,
      studentNotes: sub?.studentNotes ?? null,
      fileUrl: sub?.fileUrl ?? null,
    }
  })

  // Map quizzes / assessments
  const quizzes = (course.assessments || []).map((q) => {
    const bestAttempt = q.attempts[0]
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      timeLimitMinutes: Math.round(q.timeLimitSec / 60),
      passingPct: q.passingPct,
      questionCount: q.questions.length,
      bestScorePct: bestAttempt ? bestAttempt.scorePct : null,
      hasPassed: bestAttempt ? bestAttempt.passed : false,
      totalAttempts: q.attempts.length,
    }
  })

  // Map recordings (strictly real live classes that have an actual recordingUrl)
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
        startsAt: lc.startsAt.toISOString(),
        endsAt: lc.endsAt.toISOString(),
        instructorName: lc.instructorName,
        platform: lc.platform,
        meetingPasscode: lc.meetingPasscode,
        position: idx + 1,
        isCompleted: false,
        resourcesCount: 0,
      }
    })

  // Map live classes (strictly non-cancelled)
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
    joinOpensMinBefore: lc.joinOpensMinBefore,
  }))

  const courseHubData: CourseHubData = {
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
    firstLessonId,
    lastLessonId,
    liveClasses,
    recordings,
    studyMaterials,
    assignments,
    quizzes,
    timetableUrl: course.timetableUrl,
    timetableTitle: course.timetableTitle,
    timetableFileName: course.timetableFileName,
    timetableFileSize: course.timetableFileSize,
    timetableFileType: course.timetableFileType,
    timetableUpdatedAt: course.timetableUpdatedAt ? course.timetableUpdatedAt.toISOString() : null,
  }

  return <CourseHubClient course={courseHubData} />
}
