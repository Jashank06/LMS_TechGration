"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { submitQuizAttemptAction } from "@/actions/assessments"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import { Button } from "@/components/ui/button"
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
} from "lucide-react"

export interface QuizQuestionData {
  id: string
  prompt: string
  points: number
  options: Array<{
    id: string
    text: string
  }>
}

interface QuizPlayerProps {
  assessment: {
    id: string
    title: string
    description: string
    timeLimitMinutes: number
    passingScorePercent: number
    courseTitle: string
    questions: QuizQuestionData[]
  }
}

export function QuizPlayer({ assessment }: QuizPlayerProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>({})
  const [timeLeftSeconds, setTimeLeftSeconds] = React.useState(assessment.timeLimitMinutes * 60)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [result, setResult] = React.useState<{
    scorePercent: number
    isPassed: boolean
    correctCount: number
    totalQuestions: number
    earnedMarks?: number
    totalPossibleMarks?: number
  } | null>(null)

  // Countdown timer
  React.useEffect(() => {
    if (result) return
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [result])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const currentQuestion = assessment.questions[currentQuestionIndex]

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const res = await submitQuizAttemptAction(assessment.id, selectedAnswers)
    if (res.success) {
      setResult({
        scorePercent: res.scorePercent ?? 0,
        isPassed: Boolean(res.isPassed),
        correctCount: res.correctCount ?? 0,
        totalQuestions: res.totalQuestions ?? assessment.questions.length,
        earnedMarks: res.earnedMarks,
        totalPossibleMarks: res.totalPossibleMarks,
      })

      if (res.isPassed) {
        triggerBrandCelebration()
      }
    }
    setIsSubmitting(false)
  }

  const answeredCount = Object.keys(selectedAnswers).length

  // Results View
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-border bg-card shadow-lg text-center space-y-6">
        <div className="flex justify-center">
          {result.isPassed ? (
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <AlertCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              result.isPassed
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}
          >
            {result.isPassed ? "Assessment Passed 🎉" : "Needs Review"}
          </span>
          <h2 className="text-3xl font-extrabold text-foreground">
            {result.earnedMarks !== undefined && result.totalPossibleMarks !== undefined
              ? `${result.earnedMarks} / ${result.totalPossibleMarks} Marks (${result.scorePercent}%)`
              : `${result.scorePercent}% Score Achieved`}
          </h2>
          <p className="text-xs text-muted-foreground">
            You answered {result.correctCount} out of {result.totalQuestions} questions correctly. Passing requirement is {assessment.passingScorePercent}%.
          </p>
        </div>

        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => {
              setResult(null)
              setSelectedAnswers({})
              setCurrentQuestionIndex(0)
              setTimeLeftSeconds(assessment.timeLimitMinutes * 60)
            }}
            variant="outline"
            className="w-full sm:w-auto text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Retake Assessment</span>
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs shadow-xs"
          >
            <Link href="/student/assessments">
              <span>Back to Assessments</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header with Timer */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {assessment.courseTitle}
          </span>
          <h2 className="text-base font-bold text-foreground">{assessment.title}</h2>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-secondary/50 font-mono text-sm font-bold">
          <Clock className="w-4 h-4 text-brand-teal" />
          <span className={timeLeftSeconds < 120 ? "text-red-500 animate-pulse" : "text-foreground"}>
            {formatTimer(timeLeftSeconds)}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span>
              Question <strong className="text-foreground">{currentQuestionIndex + 1}</strong> of{" "}
              {assessment.questions.length}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-foreground">
              {currentQuestion.points} Marks
            </span>
          </span>
          <span>{answeredCount} Answered</span>
        </div>

        {/* Prompt */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
          {currentQuestion.prompt}
        </h3>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option.id
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? "bg-brand-teal/15 text-foreground border-brand-teal shadow-xs font-semibold"
                    : "bg-secondary/30 text-muted-foreground border-border hover:border-foreground/30 hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "border-brand-teal bg-brand-teal text-brand-charcoal"
                      : "border-muted-foreground"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-brand-charcoal" />}
                </div>
                <span>{option.text}</span>
              </button>
            )
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="text-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            {currentQuestionIndex < assessment.questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-semibold text-xs"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleSubmitQuiz}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Submit Quiz & Finish</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Question Number Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {assessment.questions.map((q, idx) => {
          const isAnswered = Boolean(selectedAnswers[q.id])
          const isCurrent = idx === currentQuestionIndex
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                isCurrent
                  ? "ring-2 ring-brand-teal bg-brand-teal text-brand-charcoal font-bold"
                  : isAnswered
                  ? "bg-secondary text-foreground border border-brand-teal/40"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}
