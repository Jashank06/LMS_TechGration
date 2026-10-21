import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { QuizPlayer, QuizQuestionData } from "@/components/assessment/quiz-player"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, BookOpen } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const quiz = await db.assessment.findUnique({
    where: { id: resolvedParams.id },
  })

  return {
    title: quiz ? `${quiz.title} — Quiz` : "Quiz",
    description: quiz?.description || "Take interactive course assessment on TechGration LMS.",
  }
}

export default async function AssessmentDetailPage({ params }: PageProps) {
  const user = await requireStudent()
  const resolvedParams = await params

  const assessment = await db.assessment.findUnique({
    where: { id: resolvedParams.id },
    include: {
      course: true,
      questions: {
        orderBy: { position: "asc" },
        include: {
          options: {
            select: {
              id: true,
              label: true,
            },
          },
        },
      },
    },
  })

  if (!assessment) {
    notFound()
  }

  // Verify active enrollment
  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: assessment.courseId,
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
            href="/student/assessments"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Assessments</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-foreground">Course Enrollment Required</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              This assessment is part of{" "}
              <span className="font-semibold text-foreground">{assessment.course.title}</span>. You must have an active enrollment in this course to take evaluations.
            </p>
          </div>

          <div className="pt-2">
            <Link href={`/student/courses/${assessment.courseId}`}>
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

  const questionData: QuizQuestionData[] = assessment.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    points: q.points,
    options: q.options.map((o) => ({
      id: o.id,
      text: o.label,
    })),
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <Link
          href="/student/assessments"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Assessments</span>
        </Link>
      </div>

      <QuizPlayer
        assessment={{
          id: assessment.id,
          title: assessment.title,
          description: assessment.description || "",
          timeLimitMinutes: Math.round(assessment.timeLimitSec / 60),
          passingScorePercent: assessment.passingPct,
          courseTitle: assessment.course.title,
          questions: questionData,
        }}
      />
    </div>
  )
}
