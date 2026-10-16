import { redirect } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export const dynamic = "force-dynamic"

export default async function StudentLearnIndexPage() {
  const user = await requireStudent()

  // Find user's latest enrollment with course modules and lessons
  const enrollment = await db.enrollment.findFirst({
    where: { userId: user.id },
    orderBy: { lastAccessedAt: "desc" },
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
  })

  if (!enrollment) {
    redirect("/student/my-courses")
  }

  // If user has a lastLessonId recorded, navigate there
  if (enrollment.lastLessonId) {
    redirect(`/student/learn/${enrollment.lastLessonId}`)
  }

  // Find the first available lesson in the course
  for (const mod of enrollment.course.modules) {
    if (mod.lessons.length > 0) {
      redirect(`/student/learn/${mod.lessons[0].id}`)
    }
  }

  // If the course currently has no lessons, open the Course Hub
  redirect(`/student/courses/${enrollment.course.id}`)
}
