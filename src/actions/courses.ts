"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export async function enrollCourseAction(courseId: string) {
  const user = await requireStudent()

  const existing = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  })

  if (!existing) {
    await db.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        progressPct: 0,
      },
    })
  }

  // Find the first lesson of this course to redirect into
  const firstModule = await db.module.findFirst({
    where: { courseId },
    orderBy: { position: "asc" },
    include: {
      lessons: {
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  })

  revalidatePath("/student/my-courses")
  revalidatePath("/student/dashboard")

  const firstLesson = firstModule?.lessons[0]
  if (firstLesson) {
    redirect(`/student/learn/${firstLesson.id}`)
  } else {
    redirect("/student/my-courses")
  }
}
