import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { Button } from "@/components/ui/button"
import {
  FileCheck2,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Assignments Workspace — TechGration LMS",
  description: "Manage, submit, and review grades for your architectural assignments and practical tasks.",
}

export default async function AssignmentsPage() {
  const user = await requireStudent()

  const assignments = await db.assignment.findMany({
    include: {
      course: true,
      submissions: {
        where: { userId: user.id },
      },
    },
    orderBy: { dueAt: "asc" },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Banner with Apple/Google Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-brand-teal/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-xs backdrop-blur-md">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span className="tracking-wide">Practical Engineering Deliverables</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Assignments Workspace
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Hands-on architecture blueprints, Infrastructure-as-Code codebases, and system design submissions evaluated directly by senior faculty.
          </p>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 mx-auto shadow-md">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No assignments active</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your instructors have not published any pending assignments yet.
              </p>
            </div>
          </div>
        ) : (
          assignments.map((asgn) => {
            const submission = asgn.submissions[0]
            const isGraded = submission?.status === "GRADED"
            const isSubmitted = submission?.status === "SUBMITTED"
            const dueDate = new Date(asgn.dueAt)
            const formattedDue = dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })

            return (
              <div
                key={asgn.id}
                className="group p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-brand-teal/50 hover:shadow-[0_8px_25px_-5px_rgba(0,214,214,0.15)] transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                      {asgn.course.title}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      Max {asgn.maxMarks} Points
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand-teal transition-colors">
                    {asgn.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {asgn.instructions}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Due Date: {formattedDue}</span>
                    </span>
                  </div>
                </div>

                {/* Right Status & Action */}
                <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 justify-between">
                  <div>
                    {isGraded ? (
                      <div>
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center sm:justify-start gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Score: {submission.marksAwarded}/{asgn.maxMarks} pts</span>
                        </span>
                      </div>
                    ) : isSubmitted ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center sm:justify-start gap-1.5 shadow-xs">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>In Faculty Review</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center sm:justify-start gap-1.5 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Pending Submission</span>
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full sm:w-auto font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs h-11 sm:h-10 px-5 rounded-xl shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Link href={`/student/assignments/${asgn.id}`} className="justify-center">
                      <span>{isGraded ? "View Feedback" : isSubmitted ? "View Submission" : "Submit Assignment"}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
