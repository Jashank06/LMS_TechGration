"use server"

import { revalidatePath } from "next/cache"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export async function completeLessonAction(lessonId: string) {
  const user = await requireStudent()

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  })

  if (!lesson) {
    return { success: false, error: "Lesson not found" }
  }

  // Update or create lessonProgress
  await db.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      status: "COMPLETED",
      watchedSec: lesson.durationSec,
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      status: "COMPLETED",
      watchedSec: lesson.durationSec,
      completedAt: new Date(),
    },
  })

  // Recalculate Course progress percentage
  const courseId = lesson.module.courseId
  const allLessonsInCourse = await db.lesson.findMany({
    where: {
      module: { courseId },
    },
    select: { id: true },
  })

  const totalCourseLessons = allLessonsInCourse.length

  const completedCount = await db.lessonProgress.count({
    where: {
      userId: user.id,
      status: "COMPLETED",
      lessonId: {
        in: allLessonsInCourse.map((l) => l.id),
      },
    },
  })

  const newProgressPct =
    totalCourseLessons > 0 ? Math.min(100, Math.round((completedCount / totalCourseLessons) * 100)) : 0

  await db.enrollment.update({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    data: {
      progressPct: newProgressPct,
      lastAccessedAt: new Date(),
      status: newProgressPct >= 100 ? "COMPLETED" : "ACTIVE",
    },
  })

  revalidatePath(`/student/learn/${lessonId}`)
  revalidatePath("/student/dashboard")
  revalidatePath("/student/my-courses")

  return { success: true, progressPercent: newProgressPct }
}

export async function saveNoteAction(lessonId: string, content: string, timestampSeconds: number = 0) {
  const user = await requireStudent()

  if (!content.trim()) {
    return { success: false, error: "Note content cannot be empty" }
  }

  const note = await db.learningNote.create({
    data: {
      userId: user.id,
      lessonId,
      body: content.trim(),
      timestampSec: timestampSeconds,
    },
  })

  revalidatePath(`/student/learn/${lessonId}`)
  return {
    success: true,
    note: {
      id: note.id,
      content: note.body,
      timestampSeconds: note.timestampSec,
    },
  }
}

export async function createDiscussionAction(lessonId: string, content: string) {
  const user = await requireStudent()

  if (!content.trim()) {
    return { success: false, error: "Question cannot be empty" }
  }

  const discussion = await db.lessonDiscussion.create({
    data: {
      userId: user.id,
      lessonId,
      authorName: user.name,
      authorRole: "Student",
      question: content.trim(),
    },
  })

  revalidatePath(`/student/learn/${lessonId}`)
  return {
    success: true,
    discussion: {
      id: discussion.id,
      content: discussion.question,
    },
  }
}
