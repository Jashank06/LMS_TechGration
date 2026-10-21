import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { submitAssignmentAction } from "@/actions/assignments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  MessageSquare,
  Clock,
  AlertTriangle,
  Lock,
  BookOpen,
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const asgn = await db.assignment.findUnique({
    where: { id: resolvedParams.id },
  })

  return {
    title: asgn ? `${asgn.title} — TechGration LMS` : "Assignment",
    description: asgn?.instructions || "Assignment workspace and submission portal.",
  }
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const user = await requireStudent()
  const resolvedParams = await params

  const assignment = await db.assignment.findUnique({
    where: { id: resolvedParams.id },
    include: {
      course: true,
      submissions: {
        where: { userId: user.id },
      },
    },
  })

  if (!assignment) {
    notFound()
  }

  // Verify enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: assignment.courseId,
      },
    },
    select: { status: true },
  })

  const isEnrolled = enrollment && (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED")

  if (!isEnrolled) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
        <div>
          <Link
            href="/student/assignments"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assignments Workspace</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-foreground">Course Enrollment Required</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              This assignment is part of{" "}
              <span className="font-semibold text-foreground">{assignment.course.title}</span>. You must have an active enrollment in this course to access instructions and submit deliverables.
            </p>
          </div>

          <div className="pt-2">
            <Link href={`/student/courses/${assignment.courseId}`}>
              <Button className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-semibold">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>View Course Details</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const submission = assignment.submissions[0]
  const hasSubmission = Boolean(submission)
  const isGraded = submission?.status === "GRADED"
  const isUnderReview = submission?.status === "IN_REVIEW"
  const isLate =
    submission?.status === "LATE" ||
    (Boolean(submission?.submittedAt) && submission!.submittedAt > assignment.dueAt)

  const dueDate = new Date(assignment.dueAt)
  const formattedDue = dueDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assignments Workspace</span>
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-foreground">
              {assignment.course.title}
            </span>
            <span className="text-xs text-muted-foreground">Max {assignment.maxMarks} Pts</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-brand-teal" />
            <span>Due: {formattedDue}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {assignment.title}
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {assignment.instructions}
        </p>
      </div>

      {/* Graded Feedback Card if available */}
      {isGraded && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">
                Evaluated Submission
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Grade: {submission.marksAwarded} / {assignment.maxMarks} Points
            </span>
          </div>

          {submission.feedback && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-card text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Faculty Review Remarks:</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-5">
                {submission.feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Submission Deliverables or Form */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {hasSubmission ? "Your Submitted Deliverables" : "Submit Your Assignment"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasSubmission
                ? isGraded
                  ? "Your deliverables have been evaluated and locked."
                  : isUnderReview
                  ? "Your submission is currently under review by faculty."
                  : "Deliverables submitted for faculty evaluation."
                : "Provide your GitHub repository link or architectural text summary."}
            </p>
          </div>

          {hasSubmission && (
            <div className="flex items-center gap-2">
              {isGraded ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Graded
                </span>
              ) : isUnderReview ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  Under Review
                </span>
              ) : isLate ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Submitted Late
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Submitted
                </span>
              )}
            </div>
          )}
        </div>

        {hasSubmission ? (
          <div className="space-y-4">
            {submission.fileUrl && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Repository / Pull Request Link:</Label>
                <div className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-foreground truncate">{submission.fileUrl}</span>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-ink dark:text-brand-teal hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Architectural Explanation / Code Summary:</Label>
              <div className="p-4 rounded-lg border border-border bg-secondary/30 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {submission.studentNotes}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-2">
              <Clock className="w-3.5 h-3.5 text-brand-teal" />
              <span>Submitted on {new Date(submission.submittedAt).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <form
            action={async (formData: FormData) => {
              "use server"
              await submitAssignmentAction(assignment.id, formData)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="fileUrl" className="text-xs font-medium">
                GitHub Repository or Pull Request Link
              </Label>
              <Input
                id="fileUrl"
                name="fileUrl"
                type="url"
                placeholder="https://github.com/techgration/aws-vpc-infrastructure"
                className="h-11 sm:h-10 text-base sm:text-xs focus-visible:ring-brand-teal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-xs font-medium">
                Architecture Notes & Implementation Walkthrough
              </Label>
              <textarea
                id="content"
                name="content"
                rows={6}
                required
                placeholder="Explain your VPC subnet strategy, NAT Gateway placement, routing tables, and security group rules..."
                className="w-full text-base sm:text-xs p-3.5 rounded-xl border border-border bg-background text-foreground focus:outline-brand-teal resize-none leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-11 sm:h-10 px-6 shadow-sm justify-center"
            >
              <FileCheck2 className="w-4 h-4 mr-2" />
              <span>Submit Assignment for Review</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
