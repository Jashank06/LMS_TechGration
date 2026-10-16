"use client"

import * as React from "react"
import Link from "next/link"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function TeacherCoursesPage() {
  const [courses, setCourses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  React.useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/teacher/courses")
        const json = await res.json()
        setCourses(json.courses || [])
      } catch (err) {
        console.error("Failed to load courses:", err)
      } finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || c.approvalStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header & New Course CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Management & Curriculum</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Organize modules, edit lessons, manage media assets, and submit courses for admin approval.
          </p>
        </div>

        <Button asChild size="sm" className="shadow-teal-glow gap-1.5 self-start sm:self-auto">
          <Link href="/teacher/courses/new">
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by course title, code (TG-CS401), or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "APPROVED", "PENDING_APPROVAL", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All Courses" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-12 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center mx-auto text-brand-ink dark:text-brand-cyan">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">No courses created yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start building your technical curriculum using our interactive multi-step wizard.
            </p>
          </div>
          <Button asChild size="sm" className="shadow-teal-glow">
            <Link href="/teacher/courses/new">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Create Your First Course</span>
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const statusConfig = {
              APPROVED: {
                label: "Published & Active",
                badgeClass: "bg-success/15 text-success border-success/30",
              },
              PENDING_APPROVAL: {
                label: "Pending Admin Approval",
                badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
              },
              DRAFT: {
                label: "Draft Workspace",
                badgeClass: "bg-muted text-muted-foreground border-border",
              },
              REJECTED: {
                label: "Revision Requested",
                badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
              },
            }[course.approvalStatus as "APPROVED" | "PENDING_APPROVAL" | "DRAFT" | "REJECTED"] || {
              label: course.approvalStatus,
              badgeClass: "bg-muted text-muted-foreground",
            }

            const totalLessons = course.modules?.reduce(
              (acc: number, m: any) => acc + (m.lessons?.length || 0),
              0
            ) || 0

            return (
              <Card
                key={course.id}
                className="shadow-card hover:shadow-hover transition-all flex flex-col justify-between border-border/80 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={`text-[10px] font-semibold ${statusConfig.badgeClass}`}>
                      {statusConfig.label}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">{course.code}</span>
                  </div>
                  <CardTitle className="text-base font-bold mt-2 leading-snug line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {course.subtitle || course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-muted/40 text-center text-xs">
                    <div>
                      <div className="font-bold text-foreground">{course.modules?.length || 0}</div>
                      <div className="text-[10px] text-muted-foreground">Modules</div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{totalLessons}</div>
                      <div className="text-[10px] text-muted-foreground">Lessons</div>
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{course.enrolledCount}</div>
                      <div className="text-[10px] text-muted-foreground">Students</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Format: {course.format}</span>
                    <span>Level: {course.level}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <Button asChild size="sm" className="w-full gap-1.5 shadow-sm">
                    <Link href={`/teacher/courses/${course.id}/builder`}>
                      <Layers className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Course Content & Live Classes</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </PageTransition>
  )
}
