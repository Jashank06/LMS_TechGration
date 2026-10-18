import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { enrollCourseAction } from "@/actions/courses"
import { Button } from "@/components/ui/button"
import {
  Compass,
  Clock,
  BookOpen,
  CheckCircle,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Course Catalog — TechGration LMS",
  description: "Browse enterprise curriculums in cloud engineering, distributed systems, and DevOps.",
}

export default async function CourseCatalogPage() {
  const user = await requireStudent()

  // 1. Fetch all published courses
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
      enrollments: {
        where: { userId: user.id },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner (Apple/Google Glassmorphism) */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-brand-teal" />
            <span className="tracking-wide">TechGration Curriculum Marketplace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Explore Enterprise Engineering Programs
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Production-grade architectures, real cloud infrastructure blueprints, and industry-standard best practices taught by senior staff architects.
          </p>
        </div>
      </div>

      {/* Course Cards Grid */}
      {courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 backdrop-blur-md p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto shadow-md">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Published Courses Yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our instructional engineering team is actively authoring courses. Check back shortly for brand new curriculums!
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = course.enrollments.length > 0
            const lessonCount = course.modules.reduce(
              (acc, mod) => acc + mod.lessons.length,
              0
            )
            const firstLessonId = course.modules[0]?.lessons[0]?.id

            return (
              <div
                key={course.id}
                className="group relative rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl overflow-hidden shadow-xs hover:border-brand-teal/50 hover:shadow-[0_12px_35px_-8px_rgba(0,214,214,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-muted overflow-hidden">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md border border-white/10 shadow-xs">
                        {course.level}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {isEnrolled ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Enrolled</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-teal text-brand-charcoal backdrop-blur-md shadow-xs">
                          {course.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-teal" />
                        <span>{course.durationHours} hrs</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                        <span>{lessonCount} lessons</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-brand-teal transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.subtitle || course.description}
                    </p>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Instructor:{" "}
                        <strong className="text-foreground font-semibold">
                          {course.instructorName}
                        </strong>
                      </span>
                      <span className="text-[11px] font-semibold text-brand-teal">
                        Verified Program
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="p-5 sm:p-6 pt-0 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full xs:w-auto flex-1 text-xs font-semibold rounded-xl border-border/80 h-11 sm:h-10 hover:bg-secondary transition-all justify-center"
                  >
                    <Link href={`/student/courses/${course.id}`} className="justify-center">
                      <span>View Syllabus</span>
                    </Link>
                  </Button>

                  {isEnrolled ? (
                    <Button
                      asChild
                      size="sm"
                      className="w-full xs:w-auto flex-1 text-xs font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal rounded-xl h-11 sm:h-10 shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98] justify-center"
                    >
                      <Link href={`/student/learn/${firstLessonId}`} className="justify-center">
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <form
                      action={enrollCourseAction.bind(null, course.id)}
                      className="w-full xs:w-auto flex-1"
                    >
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full text-xs font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal rounded-xl h-11 sm:h-10 shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98] justify-center"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        <span>Enroll Free</span>
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
