import * as React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { LearningPlayer, LearnLessonData } from "@/components/learn/learning-player"

interface PageProps {
  params: Promise<{ lessonId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const lesson = await db.lesson.findUnique({
    where: { id: resolvedParams.lessonId },
  })

  return {
    title: lesson ? `${lesson.title} — TechGration Learn` : "Learning Workspace",
    description: lesson?.content || "Watch and complete architectural lessons on TechGration LMS.",
  }
}

export default async function LearnLessonPage({ params }: PageProps) {
  const user = await requireStudent()
  const resolvedParams = await params

  // 1. Fetch Lesson with Module and Course
  const lesson = await db.lesson.findUnique({
    where: { id: resolvedParams.lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { position: "asc" },
                include: {
                  lessons: {
                    orderBy: { position: "asc" },
                  },
                },
              },
            },
          },
        },
      },
      progress: {
        where: { userId: user.id },
      },
      notes: {
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      },
      discussions: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      resources: true,
    },
  })

  if (!lesson) {
    notFound()
  }

  // 2. Determine completed lessons across this course for this user
  const courseLessons = lesson.module.course.modules.flatMap((m) => m.lessons)
  const completedProgress = await db.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: courseLessons.map((l) => l.id) },
      status: "COMPLETED",
    },
    select: { lessonId: true },
  })
  const completedLessonIdSet = new Set(completedProgress.map((p) => p.lessonId))

  // Find prev & next lessons
  const currentIdx = courseLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIdx > 0 ? courseLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < courseLessons.length - 1 ? courseLessons[currentIdx + 1] : null

  // Format curriculum
  const curriculum = lesson.module.course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      durationMinutes: Math.round(l.durationSec / 60),
      isCompleted: completedLessonIdSet.has(l.id),
    })),
  }))

  const initialNotes = lesson.notes.map((n) => ({
    id: n.id,
    content: n.body,
    timestampSeconds: n.timestampSec,
    createdAt: n.createdAt.toLocaleDateString(),
  }))

  const initialDiscussions = lesson.discussions.map((d) => ({
    id: d.id,
    userName: d.authorName,
    avatarUrl: d.user?.profile?.avatarUrl ?? null,
    content: d.question,
    createdAt: d.createdAt.toLocaleDateString(),
    repliesCount: d.answer ? 1 : 0,
  }))

  const lessonData: LearnLessonData = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.content || "",
    type: lesson.type,
    videoUrl: lesson.videoUrl,
    durationMinutes: Math.round(lesson.durationSec / 60),
    isCompleted: completedLessonIdSet.has(lesson.id),
    moduleTitle: lesson.module.title,
    courseTitle: lesson.module.course.title,
    courseId: lesson.module.course.id,
    prevLessonId: prevLesson?.id,
    nextLessonId: nextLesson?.id,
    curriculum,
    initialNotes,
    initialDiscussions,
    resources: lesson.resources.map((r) => ({
      id: r.id,
      title: r.title,
      fileUrl: r.fileUrl,
      fileSize: r.fileSize,
      fileType: r.fileType,
    })),
  }

  return <LearningPlayer lesson={lessonData} />
}
