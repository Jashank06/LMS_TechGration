"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { submitQuizAttemptAction, type CodingSubmissionInput } from "@/actions/assessments"
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
  Code2,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Check,
  X,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Terminal,
  Lock,
} from "lucide-react"

export interface QuizQuestionData {
  id: string
  prompt: string
  points: number
  topic?: string
  explanation?: string
  correctOptionId?: string
  correctOptionText?: string
  options: Array<{
    id: string
    text: string
    isCorrect?: boolean
  }>
}

export interface CodingChallengeData {
  id: string
  slug: string
  title: string
  difficulty: string
  topics: string[]
  statement: string
  marks: number
  starterCode?: string
  solutionCode?: string
}

export interface StudentAttemptData {
  id: string
  submittedAt: string | null
  scorePct: number
  earnedMarks: number
  totalMarks: number
  mcqMarks: number
  codingMarks: number
  allowReattempt: boolean
  passed: boolean
  codingResponses?: any[]
  selectedAnswers?: Record<string, string>
}

interface QuizPlayerProps {
  assessment: {
    id: string
    title: string
    description: string
    timeLimitMinutes: number
    passingScorePercent: number
    courseTitle: string
    isPublished?: boolean
    isPrivateBeta?: boolean
    resultsPublished?: boolean
    userEmail?: string
    latestAttempt?: StudentAttemptData | null
    questions: QuizQuestionData[]
    codingProblems?: CodingChallengeData[]
  }
}

export function QuizPlayer({ assessment }: QuizPlayerProps) {
  const router = useRouter()

  // Track if student already has a locked submitted attempt
  const hasExistingLockedAttempt = Boolean(
    assessment.latestAttempt &&
      assessment.latestAttempt.submittedAt &&
      !assessment.latestAttempt.allowReattempt
  )

  const [activeStage, setActiveStage] = React.useState<"mcq" | "coding">(
    hasExistingLockedAttempt ? "mcq" : "mcq"
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, string>>(
    assessment.latestAttempt?.selectedAnswers || {}
  )
  const [activeCodingProblemIndex, setActiveCodingProblemIndex] = React.useState(0)

  // Coding code states for Problem 1 & Problem 2
  const [codingCodes, setCodingCodes] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (assessment.codingProblems) {
      assessment.codingProblems.forEach((p) => {
        initial[p.slug] = p.starterCode || ""
      })
    }
    // If existing attempt had coding responses, restore them
    if (assessment.latestAttempt?.codingResponses) {
      assessment.latestAttempt.codingResponses.forEach((r: any) => {
        if (r.problemSlug && r.code) {
          initial[r.problemSlug] = r.code
        }
      })
    }
    return initial
  })

  // Program execution output states for Problem 1 & Problem 2
  const [codingOutputs, setCodingOutputs] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (assessment.codingProblems) {
      assessment.codingProblems.forEach((p) => {
        initial[p.slug] = ""
      })
    }
    // If existing attempt had coding responses, restore them
    if (assessment.latestAttempt?.codingResponses) {
      assessment.latestAttempt.codingResponses.forEach((r: any) => {
        if (r.problemSlug && r.output) {
          initial[r.problemSlug] = r.output
        }
      })
    }
    return initial
  })

  const [timeLeftSeconds, setTimeLeftSeconds] = React.useState(assessment.timeLimitMinutes * 60)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = React.useState(false)
  const [showDatasetPreview, setShowDatasetPreview] = React.useState(false)

  // Result state
  const [submissionResult, setSubmissionResult] = React.useState<{
    resultsPublished: boolean
    scorePercent: number
    earnedMarks: number
    totalPossibleMarks: number
    mcqMarks: number
    codingMarks: number
    isPassed?: boolean
    correctCount?: number
    totalQuestions?: number
    message?: string
    review?: any[]
  } | null>(() => {
    if (hasExistingLockedAttempt && assessment.latestAttempt) {
      return {
        resultsPublished: Boolean(assessment.resultsPublished),
        scorePercent: assessment.latestAttempt.scorePct,
        earnedMarks: assessment.latestAttempt.earnedMarks,
        totalPossibleMarks: assessment.latestAttempt.totalMarks || 50,
        mcqMarks: assessment.latestAttempt.mcqMarks,
        codingMarks: assessment.latestAttempt.codingMarks,
        isPassed: assessment.latestAttempt.passed,
      }
    }
    return null
  })

  // Countdown timer
  React.useEffect(() => {
    if (submissionResult || hasExistingLockedAttempt) return
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinalSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [submissionResult, hasExistingLockedAttempt])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleEditorKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    slug: string
  ) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      const val = target.value
      const newVal = val.substring(0, start) + "    " + val.substring(end)
      setCodingCodes((prev) => ({ ...prev, [slug]: newVal }))
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4
      }, 0)
    }
  }

  const handleResetStarterCode = (slug: string) => {
    const original =
      assessment.codingProblems?.find((p) => p.slug === slug)?.starterCode || ""
    setCodingCodes((prev) => ({ ...prev, [slug]: original }))
  }

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (hasExistingLockedAttempt) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  // Final Submit Handler: Submits MCQs + Coding Responses (Code & Output)
  const handleFinalSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setShowSubmitConfirmModal(false)

    try {
      const codingPayload: CodingSubmissionInput[] = (assessment.codingProblems || []).map((p) => {
        const code = codingCodes[p.slug] || ""
        const output = codingOutputs[p.slug] || ""
        const hasCode = code.trim().length > 20
        const hasOutput = output.trim().length > 0
        return {
          problemSlug: p.slug,
          problemTitle: p.title,
          code,
          output,
          testsPassed: hasCode && hasOutput ? 1 : 0,
          totalTests: 1,
          marksAwarded: hasCode && hasOutput ? 5 : hasCode ? 3 : 0,
        }
      })

      const res = await submitQuizAttemptAction(assessment.id, selectedAnswers, codingPayload)
      if (res.success) {
        setSubmissionResult({
          resultsPublished: Boolean(res.resultsPublished),
          scorePercent: res.scorePercent ?? 0,
          earnedMarks: res.earnedMarks ?? 0,
          totalPossibleMarks: res.totalPossibleMarks ?? 50,
          mcqMarks: res.mcqMarks ?? 0,
          codingMarks: res.codingMarks ?? 0,
          isPassed: res.isPassed,
          correctCount: res.correctCount,
          totalQuestions: res.totalQuestions,
          message: res.message,
          review: res.review,
        })

        if (res.isPassed && res.resultsPublished) {
          triggerBrandCelebration()
        }
      } else {
        alert(res.error || "Submission could not be completed.")
      }
    } catch (err) {
      console.error("Submission failed:", err)
      alert("Failed to submit assessment. Please check your connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const totalQuestions = assessment.questions.length
  const progressPct = Math.round((answeredCount / totalQuestions) * 100)

  // Dataset preview sample rows
  const sampleStudents = [
    { id: "ST001", name: "Aarav", branch: "CSE", sem: 1, marks: 88, att: 91 },
    { id: "ST002", name: "Diya", branch: "ECE", sem: 1, marks: 76, att: 85 },
    { id: "ST003", name: "Kabir", branch: "CSE", sem: 2, marks: 92, att: 89 },
    { id: "ST004", name: "Anaya", branch: "IT", sem: 2, marks: 81, att: 78 },
    { id: "ST005", name: "Vivaan", branch: "CSE", sem: 1, marks: 67, att: 74 },
    { id: "ST006", name: "Ishita", branch: "AI&ML", sem: 3, marks: 95, att: 96 },
    { id: "ST007", name: "Reyansh", branch: "ECE", sem: 2, marks: 73, att: 80 },
    { id: "ST008", name: "Saanvi", branch: "CSE", sem: 3, marks: 84, att: 87 },
    { id: "ST009", name: "Advik", branch: "IT", sem: 1, marks: 59, att: 68 },
    { id: "ST010", name: "Myra", branch: "AI&ML", sem: 2, marks: 90, att: 92 },
  ]

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: POST-SUBMISSION STATUS (Apple Clean Result & Diagnostic Card)
  // ─────────────────────────────────────────────────────────────────────────────
  if (submissionResult) {
    const isPublished = submissionResult.resultsPublished

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
        {/* Apple Frosted Status Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-60" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl opacity-60" />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs mx-auto border transition-all">
            {isPublished ? (
              submissionResult.isPassed ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Evaluation Passed · Benchmark Met</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Conceptual Review Required</span>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-brand-teal bg-brand-teal/10 border-brand-teal/30">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Assessment Submitted Successfully</span>
              </span>
            )}
          </div>

          {/* Score Typography & Explanation */}
          <div className="space-y-3 max-w-2xl mx-auto">
            {isPublished ? (
              <>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                  {submissionResult.earnedMarks} / {submissionResult.totalPossibleMarks} Marks ({submissionResult.scorePercent}%)
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  Official evaluation results released by your course instructor (Vineet Sir).
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  Evaluation Locked &amp; Under Review
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your 40 MCQ responses and 2 coding problem solutions have been securely submitted to your instructor (<strong>Vineet Sir</strong>).
                  Detailed scores, answer explanations, and model coding solutions will be unlocked once results are officially released.
                </p>
              </>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">Section A (MCQs)</span>
              <span className="text-xl font-black text-brand-teal">
                {isPublished ? `${submissionResult.mcqMarks} / 40` : "Submitted (40 Qs)"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">Section B (Coding)</span>
              <span className="text-xl font-black text-purple-500">
                {isPublished ? `${submissionResult.codingMarks} / 10` : "Submitted (2 Probs)"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">Total Evaluation</span>
              <span className="text-xl font-black text-foreground">
                {isPublished ? `${submissionResult.earnedMarks} / 50` : "50 Marks"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">Retake Policy</span>
              <span className="text-xs font-bold text-amber-500 block mt-1">
                {assessment.latestAttempt?.allowReattempt ? "Reattempt Enabled" : "Instructor Controlled"}
              </span>
            </div>
          </div>

          {/* Actions: Notice there is NO student retake button unless authorized by Vineet Sir! */}
          <div className="pt-4 border-t border-border/70 flex flex-col sm:flex-row items-center justify-center gap-3">
            {assessment.latestAttempt?.allowReattempt && (
              <Button
                onClick={() => {
                  setSubmissionResult(null)
                  setActiveStage("mcq")
                  setCurrentQuestionIndex(0)
                  setSelectedAnswers({})
                  setTimeLeftSeconds(assessment.timeLimitMinutes * 60)
                }}
                className="w-full sm:w-auto font-bold bg-amber-500 hover:bg-amber-600 text-white text-xs h-10 px-5 rounded-xl shadow-md gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Begin Authorized Reattempt</span>
              </Button>
            )}

            <Button
              asChild
              className="w-full sm:w-auto font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs h-10 px-6 rounded-xl shadow-md shadow-brand-teal/20"
            >
              <Link href="/student/assessments">
                <span>Return to Assessments</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Detailed Question Review & Model Solutions ONLY when results are officially published */}
        {isPublished && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Official Answer Key &amp; Explanations</h3>
                <p className="text-xs text-muted-foreground">
                  Published by Vineet Sir. Review official explanations and model coding solutions.
                </p>
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-3">
              {assessment.questions.map((q, idx) => {
                const selectedOptId = selectedAnswers[q.id]
                const correctOption = q.options.find((o) => o.isCorrect)
                const isCorrect = Boolean(selectedOptId && correctOption && selectedOptId === correctOption.id)

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCorrect ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-red-500/30 bg-red-500/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            isCorrect ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        >
                          {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </span>
                        <span className="font-bold text-xs text-foreground">Q{idx + 1}</span>
                        {q.topic && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                            {q.topic}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-bold ${isCorrect ? "text-emerald-500" : "text-red-500"}`}>
                        {isCorrect ? "+1 Mark" : "0 Marks"}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm font-semibold text-foreground">{q.prompt}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-background/80 border border-border">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">Your Choice</span>
                        <span className={`font-semibold ${isCorrect ? "text-emerald-500" : "text-red-500"}`}>
                          {q.options.find((o) => o.id === selectedOptId)?.text || "Not Answered"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-background/80 border border-emerald-500/30">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                          Official Correct Answer
                        </span>
                        <span className="font-semibold text-emerald-500">{correctOption?.text}</span>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-foreground font-semibold">Teacher Explanation: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Model Coding Solutions & Student Submissions */}
            {assessment.codingProblems && assessment.codingProblems.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-foreground">Official Model Coding Solutions</h3>
                {assessment.codingProblems.map((prob, idx) => {
                  const studentCode = codingCodes[prob.slug]
                  const studentOut = codingOutputs[prob.slug]

                  return (
                    <div key={prob.slug} className="p-5 rounded-2xl border border-border/80 bg-card/80 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
                            Problem {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-foreground">{prob.title}</h4>
                        </div>
                        <span className="text-xs font-bold text-purple-500">Max 5 Marks</span>
                      </div>

                      {studentCode && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                            Your Submitted Python Code
                          </span>
                          <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                            {studentCode}
                          </pre>
                        </div>
                      )}

                      {studentOut && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                            Your Submitted Execution Output
                          </span>
                          <pre className="p-3.5 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800">
                            {studentOut}
                          </pre>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
                          Official Model Solution (Python)
                        </span>
                        <pre className="p-4 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800">
                          {prob.solutionCode || "# Solution code available upon teacher publication"}
                        </pre>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: LINEAR EXAMINATION WORKSPACE
  // ─────────────────────────────────────────────────────────────────────────────
  const activeProblem = assessment.codingProblems?.[activeCodingProblemIndex]
  const currentQuestion = assessment.questions[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Floating Glass Header with Timer */}
      <div className="p-4 sm:p-5 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-teal/15 text-brand-teal border border-brand-teal/25">
              {assessment.courseTitle}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Total 50 Marks (40 MCQs + 10 Coding)
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight truncate">
            {assessment.title}
          </h2>
        </div>

        {/* Timer Pill */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-border/80 bg-secondary/60 font-mono text-sm font-bold shrink-0 self-start sm:self-auto shadow-inner">
          <Clock className="w-4 h-4 text-brand-teal shrink-0" />
          <span className={timeLeftSeconds < 180 ? "text-red-500 animate-pulse font-extrabold" : "text-foreground font-semibold"}>
            {formatTimer(timeLeftSeconds)}
          </span>
          <span className="text-[10px] font-sans font-medium text-muted-foreground">remaining</span>
        </div>
      </div>

      {/* Sequential Flow Indicator Header */}
      <div className="p-3 rounded-2xl bg-secondary/50 border border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStage("mcq")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStage === "mcq"
                ? "bg-brand-teal text-brand-charcoal shadow-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Stage 1: 40 MCQs</span>
            <span className="font-mono text-[10px]">({answeredCount}/40)</span>
          </button>

          <span className="text-muted-foreground text-xs">&rarr;</span>

          <button
            onClick={() => setActiveStage("coding")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeStage === "coding"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Stage 2: 2 Coding Problems</span>
            <span className="font-mono text-[10px]">(10 Marks)</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-muted-foreground hidden sm:block">
          {activeStage === "mcq" ? `Question ${currentQuestionIndex + 1} of 40` : `Problem ${activeCodingProblemIndex + 1} of 2`}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STAGE 1: 40 MCQS (1-40) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeStage === "mcq" && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  Question <strong className="text-foreground text-sm font-extrabold">{currentQuestionIndex + 1}</strong> of 40
                </span>
                {currentQuestion.topic && (
                  <span className="px-2.5 py-0.5 rounded-md bg-secondary text-[11px] font-bold text-foreground border border-border/60">
                    {currentQuestion.topic}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-brand-teal/15 text-brand-teal text-[11px] font-bold">
                  {currentQuestion.points} Mark
                </span>
              </div>

              <div className="text-xs font-semibold text-muted-foreground">
                {answeredCount} Answered ({progressPct}%)
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-teal to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Prompt */}
            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug tracking-tight">
              {currentQuestion.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-3 pt-1">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.id
                const letter = String.fromCharCode(65 + optIdx)

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={`w-full min-h-[52px] p-4 rounded-2xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center gap-3.5 active:scale-[0.99] ${
                      isSelected
                        ? "bg-brand-teal/15 text-foreground border-brand-teal shadow-xs font-semibold"
                        : "bg-secondary/35 text-foreground/80 border-border/80 hover:border-foreground/30 hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${
                        isSelected
                          ? "border-brand-teal bg-brand-teal text-brand-charcoal"
                          : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="leading-relaxed flex-1">{option.text}</span>
                  </button>
                )
              })}
            </div>

            {/* Navigation Bar */}
            <div className="pt-6 border-t border-border/70 flex items-center justify-between gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="h-10 px-4 text-xs font-semibold rounded-xl border-border/80"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < assessment.questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setActiveStage("coding")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md gap-2"
                  >
                    <span>Proceed to Section B: Coding Challenges</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Matrix */}
          <div className="p-5 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Question Matrix (Questions 1 to 40)
              </span>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-teal" />
                  <span>Answered</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary border border-border" />
                  <span>Pending</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-10 gap-1.5 pt-1">
              {assessment.questions.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q.id])
                const isCurrent = idx === currentQuestionIndex

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? "ring-2 ring-brand-teal bg-brand-teal text-brand-charcoal shadow-sm"
                        : isAnswered
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/40 font-semibold"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95"
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STAGE 2: 2 CODING PROBLEMS WITH RUNNER WORKSPACE */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeStage === "coding" && activeProblem && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Problem Selector Pills */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-secondary/60 border border-border/60 max-w-lg mx-auto">
            {assessment.codingProblems?.map((prob, idx) => (
              <button
                key={prob.slug}
                onClick={() => setActiveCodingProblemIndex(idx)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeCodingProblemIndex === idx
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Problem {idx + 1}: {prob.title}</span>
                <span className="text-[10px] opacity-80">(5 Marks)</span>
              </button>
            ))}
          </div>

          {/* Active Problem Workspace */}
          <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    Coding Problem {activeCodingProblemIndex + 1} · 5 Marks
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {activeProblem.topics.join(" • ")}
                  </span>
                </div>
                <h3 className="text-xl font-black text-foreground tracking-tight mt-1.5">
                  {activeProblem.title}
                </h3>
              </div>

              {activeProblem.slug === "student-data-analysis-pandas" && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold h-9 rounded-xl border-border"
                >
                  <a href="/data/students.csv" download>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    <span>Download students.csv</span>
                  </a>
                </Button>
              )}
            </div>

            {/* Problem Statement Display */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 space-y-2 text-xs leading-relaxed text-foreground/90">
              <strong className="text-foreground block text-sm">Problem Instructions:</strong>
              {activeProblem.slug === "student-marks-analyzer" ? (
                <div>
                  <p className="mb-2">Write a Python function <code>analyze_marks(marks)</code> that calculates statistics for student marks:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>1. Print student marks: <code>Student Marks: [85, 72, 90, 65, 78]</code></li>
                    <li>2. Calculate average rounded to 1 decimal: <code>Average Marks: 78.0</code></li>
                    <li>3. Find highest &amp; lowest: <code>Highest Marks: 90</code> and <code>Lowest Marks: 65</code></li>
                    <li>4. Grade performance: &gt;=75 &rarr; <code>Performance: Excellent</code>, &gt;=60 &rarr; <code>Performance: Good</code>, else &rarr; <code>Performance: Needs Improvement</code></li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Use Pandas to analyze the supplied <code>students.csv</code> dataset:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                    <li>Read <code>students.csv</code> using <code>pd.read_csv(&apos;students.csv&apos;)</code>.</li>
                    <li>Display first 5 rows with <code>df.head()</code>.</li>
                    <li>Filter students whose <code>Branch == &apos;CSE&apos;</code>.</li>
                    <li>Calculate average marks of CSE students: <code>print(&quot;Average CSE Marks:&quot;, cse_df[&apos;Marks&apos;].mean())</code>.</li>
                    <li>Sort all students by Marks in descending order and print.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Dataset Preview Toggle for Problem 2 */}
            {activeProblem.slug === "student-data-analysis-pandas" && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowDatasetPreview((prev) => !prev)}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs font-semibold text-foreground hover:bg-secondary transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <span>View Cohort Dataset Table (students.csv · 20 Records)</span>
                  </div>
                  {showDatasetPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDatasetPreview && (
                  <div className="rounded-2xl border border-border/80 overflow-hidden bg-card text-xs">
                    <div className="overflow-x-auto max-h-48">
                      <table className="w-full text-left">
                        <thead className="bg-secondary/60 border-b border-border/80 text-[10px] uppercase font-bold text-muted-foreground sticky top-0">
                          <tr>
                            <th className="p-2">ID</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Branch</th>
                            <th className="p-2 text-center">Semester</th>
                            <th className="p-2 text-center">Marks</th>
                            <th className="p-2 text-center">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {sampleStudents.map((st) => (
                            <tr key={st.id} className="hover:bg-secondary/30">
                              <td className="p-2 font-mono font-semibold">{st.id}</td>
                              <td className="p-2 font-semibold text-foreground">{st.name}</td>
                              <td className="p-2">{st.branch}</td>
                              <td className="p-2 text-center">{st.sem}</td>
                              <td className="p-2 text-center font-bold text-brand-teal">{st.marks}</td>
                              <td className="p-2 text-center font-mono">{st.att}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coding Challenge Inputs: 1. Python Code and 2. Execution Output */}
            <div className="space-y-5">
              {/* Part 1: Python Solution Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-purple-500" />
                    <span>1. Python Solution Code</span>
                    <span className="text-[10px] text-muted-foreground font-normal hidden sm:inline">(Tab key indents with 4 spaces)</span>
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResetStarterCode(activeProblem.slug)}
                    className="text-xs h-8 px-3 rounded-xl gap-1.5 border-border/80 hover:bg-secondary text-muted-foreground hover:text-foreground"
                    title="Reset to default starter code template"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Starter Code</span>
                  </Button>
                </div>

                <textarea
                  value={codingCodes[activeProblem.slug] || ""}
                  onChange={(e) =>
                    setCodingCodes((prev) => ({
                      ...prev,
                      [activeProblem.slug]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => handleEditorKeyDown(e, activeProblem.slug)}
                  spellCheck={false}
                  rows={13}
                  placeholder="Write or paste your complete Python solution code here..."
                  className="w-full p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed resize-y shadow-inner"
                />
              </div>

              {/* Part 2: Program Execution Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span>2. Program Execution Output</span>
                    <span className="text-[10px] text-emerald-500 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Required for Evaluation
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Paste the console/terminal output generated after running your code
                  </span>
                </div>

                <textarea
                  value={codingOutputs[activeProblem.slug] || ""}
                  onChange={(e) =>
                    setCodingOutputs((prev) => ({
                      ...prev,
                      [activeProblem.slug]: e.target.value,
                    }))
                  }
                  spellCheck={false}
                  rows={8}
                  placeholder="Paste your code's terminal output here (e.g. print statements, calculation results, tables)..."
                  className="w-full p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y shadow-inner placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-border/70 flex items-center justify-between gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStage("mcq")}
                className="h-10 px-4 text-xs font-semibold rounded-xl border-border"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Review Section A (MCQs)</span>
              </Button>

              <div className="flex items-center gap-2">
                {activeCodingProblemIndex === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => setActiveCodingProblemIndex(1)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 rounded-xl gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Problem 2</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setShowSubmitConfirmModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Final Submit Assessment (50 Marks) 🚀</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FINAL SUBMIT CONFIRMATION MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50 duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                Finalize &amp; Submit Assessment?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have answered <strong>{answeredCount} of 40 MCQs</strong> and completed both Coding Challenges.
              </p>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-600 dark:text-amber-400 font-semibold text-left">
                ⚠️ Once submitted, your assessment will be locked and sent directly to <strong>Vineet Sir</strong>. You will not be able to independently retake this assessment.
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="text-xs h-10 px-4 rounded-xl border-border"
              >
                Review Answers
              </Button>

              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Confirm &amp; Submit Now</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
