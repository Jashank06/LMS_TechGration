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
    title: quiz ? `${quiz.title} — Assessment` : "Assessment",
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
              isCorrect: true,
            },
          },
        },
      },
    },
  })

  if (!assessment) {
    notFound()
  }

  const isAuthorizedTester =
    assessment.isPublished ||
    assessment.allowedEmails.includes(user.email) ||
    user.role === "ADMIN" ||
    user.role === "TEACHER"

  if (!isAuthorizedTester) {
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

  const latestAttempt = await db.assessmentAttempt.findFirst({
    where: {
      assessmentId: assessment.id,
      userId: user.id,
    },
    orderBy: { startedAt: "desc" },
    include: {
      answers: true,
    },
  })

  const isResultsPublished = Boolean(assessment.resultsPublished)

  const codingProblems = await db.codingProblem.findMany({
    where: {
      slug: { in: ["student-marks-analyzer", "student-data-analysis-pandas"] },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      topics: true,
      statement: true,
      starterCode: true,
      solutionCode: true,
      xpReward: true,
    },
    orderBy: { position: "asc" },
  })

  const questionData: QuizQuestionData[] = assessment.questions.map((q) => {
    const correctOption = isResultsPublished ? q.options.find((o) => o.isCorrect) : null
    return {
      id: q.id,
      prompt: q.prompt,
      points: q.points,
      topic: q.topic || undefined,
      explanation: isResultsPublished ? q.explanation || undefined : undefined,
      correctOptionId: correctOption?.id,
      correctOptionText: correctOption?.label,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.label,
        isCorrect: isResultsPublished ? o.isCorrect : undefined,
      })),
    }
  })

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
          isPublished: assessment.isPublished,
          isPrivateBeta: !assessment.isPublished,
          resultsPublished: isResultsPublished,
          userEmail: user.email,
          latestAttempt: latestAttempt
            ? {
                id: latestAttempt.id,
                submittedAt: latestAttempt.submittedAt?.toISOString() || null,
                scorePct: latestAttempt.scorePct,
                earnedMarks: latestAttempt.earnedMarks,
                totalMarks: latestAttempt.totalMarks,
                mcqMarks: latestAttempt.mcqMarks,
                codingMarks: latestAttempt.codingMarks,
                allowReattempt: latestAttempt.allowReattempt,
                passed: latestAttempt.passed,
                codingResponses: (latestAttempt.codingResponses as any) || [],
                selectedAnswers: latestAttempt.answers.reduce((acc, ans) => {
                  if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) {
                    acc[ans.questionId] = ans.selectedOptionIds[0]
                  }
                  return acc
                }, {} as Record<string, string>),
              }
            : null,
          questions: questionData,
          codingProblems: codingProblems.map((cp) => ({
            id: cp.id,
            slug: cp.slug,
            title: cp.title,
            difficulty: cp.difficulty,
            topics: cp.topics,
            statement: cp.statement,
            marks: 5,
            starterCode: typeof cp.starterCode === "object" ? (cp.starterCode as any)?.python || "" : "",
            solutionCode: isResultsPublished && typeof cp.solutionCode === "object" ? (cp.solutionCode as any)?.python || "" : undefined,
          })),
        }}
      />
    </div>
  )
}
