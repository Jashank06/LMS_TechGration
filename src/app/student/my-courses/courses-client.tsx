"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  LayoutGrid,
  List,
  PlayCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  GraduationCap,
  Video,
} from "lucide-react"

export interface EnrolledCourseItem {
  id: string
  slug: string
  title: string
  category: string
  level: string
  thumbnailUrl: string
  progressPercent: number
  totalLessons: number
  completedLessons: number
  lastAccessedLessonId?: string
  lastAccessedLessonTitle?: string
  teacherName: string
}

interface CoursesClientProps {
  courses: EnrolledCourseItem[]
}

export function CoursesClient({ courses }: CoursesClientProps) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL")
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = React.useState<"recent" | "progress_high" | "progress_low">("recent")

  const categories = React.useMemo(() => {
    const set = new Set(courses.map((c) => c.category))
    return ["ALL", ...Array.from(set)]
  }, [courses])

  const filteredCourses = React.useMemo(() => {
    return courses
      .filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.category.toLowerCase().includes(search.toLowerCase())

        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "IN_PROGRESS" && course.progressPercent < 100) ||
          (statusFilter === "COMPLETED" && course.progressPercent >= 100)

        const matchesCategory =
          categoryFilter === "ALL" || course.category === categoryFilter

        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === "progress_high") return b.progressPercent - a.progressPercent
        if (sortBy === "progress_low") return a.progressPercent - b.progressPercent
        return 0
      })
  }, [courses, search, statusFilter, categoryFilter, sortBy])

  // If the user has 0 courses enrolled, render the dedicated "Enroll Now" hero showcase.
  // Jiske me 1 bhi course enrolled hai, use ye nahi dikhega.
  if (courses.length === 0) {
    return (
      <div className="relative group max-w-2xl mx-auto my-6 sm:my-10">
        {/* Ambient Lighting */}
        <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-brand-teal/20 via-cyan-500/20 to-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-70 group-hover:opacity-90 transition-opacity" />

        {/* Outer High-Tech Bezel Card */}
        <div className="relative rounded-[2rem] border-2 border-brand-teal/30 bg-gradient-to-b from-card/95 via-card to-background p-8 sm:p-14 shadow-2xl backdrop-blur-2xl text-center space-y-6 overflow-hidden">
          {/* Cyber Corner Brackets */}
          <div className="pointer-events-none absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-teal/50 rounded-tl-lg" />
          <div className="pointer-events-none absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-teal/50 rounded-tr-lg" />
          <div className="pointer-events-none absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-teal/50 rounded-bl-lg" />
          <div className="pointer-events-none absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-teal/50 rounded-br-lg" />

          {/* Micro Grid Background */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00D6D6_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Icon Badge */}
          <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-brand-teal/15 border-2 border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto shadow-xl shadow-brand-teal/10">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse" />
          </div>

          {/* Big Big Headline & Minimal Description */}
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-teal/10 text-brand-teal border border-brand-teal/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Enroll Now
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto pt-1 leading-relaxed">
              Explore our live enterprise curriculums and start your learning journey with TechGration.
            </p>
          </div>

          {/* Big High-Impact CTA Button */}
          <div className="relative z-10 pt-2 flex items-center justify-center">
            <Button
              asChild
              className="w-full sm:w-auto h-13 px-8 sm:px-10 rounded-2xl font-black text-sm sm:text-base bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal shadow-xl shadow-brand-teal/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <a href="https://techgration.live/" target="_blank" rel="noopener noreferrer">
                <span>Enroll Now</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar (Glassmorphic Container) */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between p-3 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your courses by title or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-xs rounded-xl bg-background/60 border-border/70 focus-visible:ring-brand-teal"
          />
        </div>

        {/* Filters and View toggles */}
        <div className="flex items-center justify-between sm:justify-start gap-2 overflow-x-auto no-scrollbar touch-pan-x">
          {/* Status filter buttons */}
          <div className="flex rounded-xl border border-border/70 bg-background/50 p-1 text-xs shrink-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-brand-teal/15 text-brand-teal shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({courses.length})
            </button>
            <button
              onClick={() => setStatusFilter("IN_PROGRESS")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-brand-teal/15 text-brand-teal shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                statusFilter === "COMPLETED"
                  ? "bg-brand-teal/15 text-brand-teal shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Grid vs List view */}
          <div className="flex rounded-xl border border-border/70 bg-background/50 p-1 text-xs shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                viewMode === "grid"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all min-h-[32px] min-w-[32px] flex items-center justify-center ${
                viewMode === "list"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x pb-1 text-xs">
          <span className="text-muted-foreground font-semibold shrink-0 flex items-center gap-1.5 pl-1">
            <Filter className="w-3.5 h-3.5 text-brand-teal" />
            <span>Filter:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                categoryFilter === cat
                  ? "bg-brand-teal/15 text-brand-teal border-brand-teal/40 shadow-xs"
                  : "bg-card/70 text-muted-foreground border-border/70 hover:border-foreground/30"
              }`}
            >
              {cat === "ALL" ? "All Tracks" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Courses Display */}
      {filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No matching courses found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Try adjusting your search query or reset the active filter options.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-border/80 text-xs font-semibold"
            onClick={() => {
              setSearch("")
              setStatusFilter("ALL")
              setCategoryFilter("ALL")
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const hasLesson = Boolean(course.lastAccessedLessonId && course.lastAccessedLessonId.trim())
            const continueHref = hasLesson
              ? `/student/learn/${course.lastAccessedLessonId}`
              : `/student/courses/${course.id}`
            const courseHubHref = `/student/courses/${course.id}`

            return (
              <div
                key={course.id}
                className="group rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl overflow-hidden shadow-xs hover:border-brand-teal/50 hover:shadow-[0_12px_35px_-8px_rgba(0,214,214,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Header (Clickable to Course Hub) */}
                  <Link href={courseHubHref} className="block relative aspect-video w-full bg-muted overflow-hidden">
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
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-teal text-brand-charcoal backdrop-blur-md shadow-xs">
                        {course.category}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="text-xs text-muted-foreground font-medium">
                      Instructor:{" "}
                      <strong className="text-foreground font-semibold">
                        {course.teacherName}
                      </strong>
                    </div>
                    <Link href={courseHubHref} className="block">
                      <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-brand-teal transition-colors">
                        {course.title}
                      </h3>
                    </Link>

                    {/* Progress Details */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">
                          {course.totalLessons > 0
                            ? `${course.completedLessons}/${course.totalLessons} Sessions Done`
                            : "New Batch • Live Classes"}
                        </span>
                        <span className="font-extrabold text-brand-teal">
                          {course.progressPercent}%
                        </span>
                      </div>
                      <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-teal to-cyan-400 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${Math.max(course.progressPercent, 4)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-6 pt-0 space-y-2">
                  <Button
                    asChild
                    className="w-full font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md shadow-brand-teal/20 rounded-xl h-10 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Link href={courseHubHref}>
                      <Video className="w-4 h-4 mr-2" />
                      <span>View Course & Classes</span>
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const hasLesson = Boolean(course.lastAccessedLessonId && course.lastAccessedLessonId.trim())
            const continueHref = hasLesson
              ? `/student/learn/${course.lastAccessedLessonId}`
              : `/student/courses/${course.id}`
            const courseHubHref = `/student/courses/${course.id}`

            return (
              <div
                key={course.id}
                className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-brand-teal/50 hover:shadow-[0_8px_25px_-5px_rgba(0,214,214,0.15)] transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  <Link href={courseHubHref} className="block relative w-full sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 bg-muted border border-border/60">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 144px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="min-w-0 space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                        {course.category}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {course.level}
                      </span>
                    </div>
                    <Link href={courseHubHref} className="block">
                      <h3 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-brand-teal transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Instructor: <strong className="text-foreground font-semibold">{course.teacherName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 shrink-0 justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <div className="w-full sm:w-36 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground text-[11px] font-medium">Progress</span>
                      <span className="font-extrabold text-brand-teal">
                        {course.progressPercent}%
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-teal to-cyan-400 rounded-full"
                        style={{ width: `${Math.max(course.progressPercent, 4)}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs h-11 sm:h-10 px-5 rounded-xl shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Link href={courseHubHref}>
                      <Video className="w-3.5 h-3.5 mr-1.5" />
                      <span>View Course & Classes</span>
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
