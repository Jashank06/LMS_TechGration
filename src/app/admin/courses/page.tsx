"use client"

import * as React from "react"
import { motion } from "motion/react"
import { toast } from "sonner"
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  User,
  Layers,
  Video,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Send,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet } from "@/components/ui/sheet"

interface Lesson {
  id: string
  title: string
  type: string
  durationSec: number
  videoUrl?: string | null
  isPreview: boolean
}

interface Module {
  id: string
  title: string
  description?: string | null
  position: number
  lessons: Lesson[]
}

interface CourseItem {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  description: string
  thumbnailUrl: string
  category: string
  instructorName: string
  instructorTitle: string
  durationHours: number
  price: number
  approvalStatus: "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "NEEDS_REVISION" | "PUBLISHED"
  reviewerNotes?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
  modulesCount: number
  lessonsCount: number
  enrollmentsCount: number
  modules: Module[]
}

export default function CourseApprovalsPage() {
  const [courses, setCourses] = React.useState<CourseItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState("IN_REVIEW")
  const [search, setSearch] = React.useState("")
  const [pendingCount, setPendingCount] = React.useState(0)

  // Drawer inspection state
  const [selectedCourse, setSelectedCourse] = React.useState<CourseItem | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [reviewerNotes, setReviewerNotes] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)

  const fetchCourses = React.useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        status: statusFilter,
        search,
      })
      const res = await fetch(`/api/admin/courses?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setCourses(data.courses)
        setPendingCount(data.pendingCount)
      }
    } catch (err) {
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  React.useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleOpenInspection = (course: CourseItem) => {
    setSelectedCourse(course)
    setReviewerNotes(course.reviewerNotes || "")
    setDrawerOpen(true)
  }

  const handleReviewAction = async (action: "APPROVE" | "REQUEST_CHANGES" | "REJECT") => {
    if (!selectedCourse) return
    try {
      setActionLoading(true)
      const res = await fetch(`/api/admin/courses/${selectedCourse.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: reviewerNotes,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Review action failed", { description: data.error })
        return
      }

      if (action === "APPROVE") {
        toast.success("Course Approved & Published to Catalog!")
      } else if (action === "REQUEST_CHANGES") {
        toast.info("Change request dispatched to instructor")
      } else {
        toast.error("Course submission rejected")
      }

      setDrawerOpen(false)
      fetchCourses()
    } catch (err) {
      toast.error("Failed to process review")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_REVIEW":
        return <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30">Pending Review</Badge>
      case "APPROVED":
      case "PUBLISHED":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Published</Badge>
      case "NEEDS_REVISION":
        return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30">Needs Revision</Badge>
      case "REJECTED":
        return <Badge className="bg-destructive/15 text-destructive border border-destructive/30">Rejected</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground border border-border">Draft</Badge>
    }
  }

  const tabs = [
    { label: "Review Queue", value: "IN_REVIEW", badge: pendingCount },
    { label: "Published", value: "PUBLISHED" },
    { label: "Needs Revision", value: "NEEDS_REVISION" },
    { label: "Drafts", value: "DRAFT" },
    { label: "All Courses", value: "ALL" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Course Approval & Curriculum Governance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review teacher submissions, inspect syllabi and video lessons, and approve for public catalog listing.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCourses}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border overflow-x-auto w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-brand-teal text-brand-charcoal shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.value ? "bg-brand-charcoal/20 text-brand-charcoal" : "bg-amber-500/20 text-amber-500"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
            <span>Loading courses from MongoDB...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No courses found in this category.
          </div>
        ) : (
          courses.map((course) => (
            <Card
              key={course.id}
              className="card-shine border-border/80 flex flex-col justify-between hover:border-brand-teal/50 hover:shadow-card transition-all"
            >
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="border-border text-[10px] uppercase font-semibold">
                      {course.category}
                    </Badge>
                    {getStatusBadge(course.approvalStatus)}
                  </div>
                  <CardTitle className="text-base font-bold line-clamp-2 leading-snug">
                    {course.title}
                  </CardTitle>
                  {course.subtitle && (
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {course.subtitle}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  {/* Instructor row */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    <span className="font-medium text-foreground">{course.instructorName}</span>
                    <span className="truncate">({course.instructorTitle})</span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Modules</span>
                      <span className="font-bold text-foreground">{course.modulesCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Lessons</span>
                      <span className="font-bold text-foreground">{course.lessonsCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Tuition</span>
                      <span className="font-bold text-brand-ink dark:text-brand-cyan">₹{course.price}</span>
                    </div>
                  </div>

                  {/* Review Notes alert if present */}
                  {course.reviewerNotes && (
                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border text-[11px] text-muted-foreground flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{course.reviewerNotes}</p>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Card Footer Button */}
              <div className="p-4 pt-0">
                <Button
                  onClick={() => handleOpenInspection(course)}
                  className="w-full bg-secondary hover:bg-brand-teal hover:text-brand-charcoal text-foreground text-xs font-semibold rounded-xl gap-2 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Curriculum</span>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Slide-over Curriculum Inspection Drawer */}
      <Sheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedCourse ? selectedCourse.title : "Curriculum Inspection"}
        description={selectedCourse ? `Authored by ${selectedCourse.instructorName} (${selectedCourse.category})` : ""}
      >
        {selectedCourse && (
          <div className="space-y-6 text-sm">
            {/* Metadata Overview */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Current State</span>
                {getStatusBadge(selectedCourse.approvalStatus)}
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">{selectedCourse.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>⏱️ {selectedCourse.durationHours} hours total</span>
                <span>🏷️ Fee: ₹{selectedCourse.price}</span>
                <span>👥 {selectedCourse.enrollmentsCount} learners</span>
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-teal" />
                <span>Modules & Lessons Syllabus ({selectedCourse.modules.length} modules)</span>
              </h3>

              {selectedCourse.modules.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No modules added yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCourse.modules.map((m, idx) => (
                    <div key={m.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">
                          {idx + 1}. {m.title}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {m.lessons.length} lessons
                        </Badge>
                      </div>
                      {m.description && <p className="text-[11px] text-muted-foreground">{m.description}</p>}

                      <div className="space-y-1.5 pt-1">
                        {m.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Video className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                              <span className="font-medium truncate max-w-xs">{lesson.title}</span>
                              {lesson.isPreview && (
                                <Badge className="text-[9px] bg-brand-teal/20 text-brand-cyan">Free Preview</Badge>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                              {Math.round(lesson.durationSec / 60)} mins
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviewer Action Form */}
            <div className="space-y-3 p-4 rounded-xl bg-card border border-border shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-teal" />
                <span>Reviewer Decision & Feedback Notes</span>
              </h3>
              <Textarea
                placeholder="Enter feedback notes or reasons for revision..."
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="text-xs min-h-[90px] rounded-xl"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <Button
                  onClick={() => handleReviewAction("APPROVE")}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Publish</span>
                </Button>

                <Button
                  onClick={() => handleReviewAction("REQUEST_CHANGES")}
                  disabled={actionLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Request Changes</span>
                </Button>

                <Button
                  onClick={() => handleReviewAction("REJECT")}
                  disabled={actionLoading}
                  variant="destructive"
                  className="font-semibold text-xs rounded-xl gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Course</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
