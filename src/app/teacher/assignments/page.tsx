"use client"

import * as React from "react"
import Link from "next/link"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckSquare,
  Clock,
  ArrowRight,
  FileText,
  AlertCircle,
  Users,
  Award,
  Plus,
} from "lucide-react"
import { type TeacherAssignment } from "@/server/services/teacher-mock-data"

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = React.useState<TeacherAssignment[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await fetch("/api/teacher/assignments")
        const json = await res.json()
        setAssignments(json.assignments || [])
      } catch (err) {
        console.error("Failed to load assignments:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAssignments()
  }, [])

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Assignment & Grading Workspace
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Evaluate submitted student projects, grade code files, apply rubrics, and publish feedback.
          </p>
        </div>

        <Button
          asChild
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-amber-500/20 gap-2 shrink-0"
        >
          <Link href="/teacher/courses">
            <Plus className="w-4 h-4" />
            <span>Create New Assignment</span>
          </Link>
        </Button>
      </div>

      {/* Assignment Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 mx-auto flex items-center justify-center text-muted-foreground">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">No assignments created yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create curriculum modules with assignment lessons to receive student project submissions.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/teacher/courses">View Assigned Courses</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const hasPending = assignment.pendingGrading > 0
            const firstSubmissionId = assignment.submissions[0]?.id

            return (
              <Card
                key={assignment.id}
                className="shadow-card border-border/80 hover:shadow-hover transition-all"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-brand-ink dark:text-brand-cyan">
                        {assignment.courseTitle}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(assignment.dueAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {hasPending && (
                        <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10 text-[10px]">
                          {assignment.pendingGrading} Needing Review
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground">{assignment.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                      {assignment.instructions}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="font-mono">Max Marks: {assignment.maxMarks} pts</span>
                      <span>•</span>
                      <span>Average Score: {assignment.averageScore}%</span>
                    </div>
                  </div>

                  {/* Submission Statistics & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/30 border border-border text-center text-xs">
                      <div>
                        <div className="font-bold text-foreground">{assignment.totalSubmissions}</div>
                        <div className="text-[10px] text-muted-foreground">Received</div>
                      </div>
                      <div className="w-px h-6 bg-border" />
                      <div>
                        <div className="font-bold text-success">{assignment.gradedSubmissions}</div>
                        <div className="text-[10px] text-muted-foreground">Graded</div>
                      </div>
                      <div className="w-px h-6 bg-border" />
                      <div>
                        <div className="font-bold text-warning">{assignment.pendingGrading}</div>
                        <div className="text-[10px] text-muted-foreground">Pending</div>
                      </div>
                    </div>

                    <Button asChild size="sm" className="shadow-teal-glow gap-1.5">
                      <Link
                        href={`/teacher/assignments/${assignment.id}/grade${
                          firstSubmissionId ? `?submissionId=${firstSubmissionId}` : ""
                        }`}
                      >
                        <span>Open Split-Screen Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PageTransition>
  )
}
