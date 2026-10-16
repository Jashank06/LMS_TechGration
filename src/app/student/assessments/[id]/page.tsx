import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { QuizPlayer, QuizQuestionData } from "@/components/assessment/quiz-player"
import { ArrowLeft } from "lucide-react"

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
  await requireStudent()
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
