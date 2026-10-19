import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { CoursesClient, EnrolledCourseItem } from "./courses-client"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export const metadata: Metadata = {
  title: "My Courses — TechGration LMS",
  description: "View and manage your enrolled enterprise courses and continuing progress.",
}

export default async function MyCoursesPage() {
  const user = await requireStudent()

  const rawEnrollments = await db.enrollment.findMany({
    where: { userId: user.id },
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
    orderBy: { lastAccessedAt: "desc" },
  })

  // Prioritize "Artificial Intelligence" course
  const enrollments = [...rawEnrollments].sort((a, b) => {
    const isAiA =
      a.course.id === "6ad283b4e196d0b8fbfb9eae" ||
      a.course.title.toLowerCase().includes("artificial intelligence")
    const isAiB =
      b.course.id === "6ad283b4e196d0b8fbfb9eae" ||
      b.course.title.toLowerCase().includes("artificial intelligence")

    if (isAiA && !isAiB) return -1
    if (!isAiA && isAiB) return 1
    return 0
  })

  // Format into EnrolledCourseItem
  const courseItems: EnrolledCourseItem[] = enrollments.map((enrollment) => {
    const course = enrollment.course
    let totalLessons = 0
    let firstLessonId = ""
    let firstLessonTitle = ""

    for (const mod of course.modules) {
      totalLessons += mod.lessons.length
      if (!firstLessonId && mod.lessons.length > 0) {
        firstLessonId = mod.lessons[0].id
        firstLessonTitle = mod.lessons[0].title
      }
    }

    const completedLessons = Math.round((enrollment.progressPct / 100) * totalLessons)

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      category: course.category,
      level: course.level,
      thumbnailUrl: course.thumbnailUrl,
      progressPercent: Math.round(enrollment.progressPct),
      totalLessons,
      completedLessons,
      lastAccessedLessonId: firstLessonId,
      lastAccessedLessonTitle: firstLessonTitle,
      teacherName: course.instructorName,
    }
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Enrolled Courses
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track your ongoing curriculums, practical architectural modules, and certifications.
          </p>
        </div>

        {courseItems.length === 0 ? (
          <Button asChild className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs h-10 px-5 rounded-xl shadow-sm">
            <a href="https://techgration.live/" target="_blank" rel="noopener noreferrer">
              <Compass className="w-4 h-4 mr-2" />
              <span>Enroll Now</span>
            </a>
          </Button>
        ) : (
          <Button asChild variant="outline" className="border-border hover:border-brand-teal/40">
            <Link href="/student/catalog">
              <Compass className="w-4 h-4 mr-2 text-brand-teal" />
              <span>Explore Course Catalog</span>
            </Link>
          </Button>
        )}
      </div>

      <CoursesClient courses={courseItems} />
    </div>
  )
}
