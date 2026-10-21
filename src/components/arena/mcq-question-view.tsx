"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, XCircle, HelpCircle, Sparkles, Zap, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DifficultyBadge } from "./difficulty-badge"
import { cn } from "@/lib/utils"

interface McqOption {
  id: string
  text: string
}

interface McqQuestionViewProps {
  problem: {
    id: string
    slug: string
    title: string
    statement: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    xpReward: number
    hints?: string[]
    editorial?: string | null
    mcqOptions?: McqOption[] | any
  }
  isSolvedInitially?: boolean
  onSubmitted?: (result: { isCorrect: boolean; xpAwarded: boolean; totalXp: number }) => void
  onNext?: () => void
}

export function McqQuestionView({
  problem,
  isSolvedInitially = false,
  onSubmitted,
  onNext,
}: McqQuestionViewProps) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submittedStatus, setSubmittedStatus] = React.useState<"correct" | "incorrect" | null>(
    isSolvedInitially ? "correct" : null
  )
  const [attemptsLeft, setAttemptsLeft] = React.useState(4)
  const [explanation, setExplanation] = React.useState<string | null>(
    isSolvedInitially ? problem.editorial || null : null
  )
  const [earnedXp, setEarnedXp] = React.useState<number | null>(null)

  const options: McqOption[] = Array.isArray(problem.mcqOptions) ? problem.mcqOptions : []

  const handleSubmit = async () => {
    if (!selected || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/student/arena/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: problem.slug,
          selectedOption: selected,
        }),
      })

      const data = await res.json()

      if (data.isCorrect) {
        setSubmittedStatus("correct")
        setExplanation(data.explanation || problem.editorial || "Great job! That is the correct answer.")
        if (data.xp?.awarded) {
          setEarnedXp(data.xp.amount)
        }
        onSubmitted?.({
          isCorrect: true,
          xpAwarded: Boolean(data.xp?.awarded),
          totalXp: data.xp?.totalXp || 0,
        })
      } else {
        setSubmittedStatus("incorrect")
        setAttemptsLeft((prev) => Math.max(0, prev - 1))
        onSubmitted?.({
          isCorrect: false,
          xpAwarded: false,
          totalXp: 0,
        })
      }
    } catch (err) {
      console.error("MCQ submit error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSubmittedStatus(null)
    setSelected(null)
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 max-w-4xl mx-auto w-full text-foreground">
      <div className="space-y-6">
        {/* Header meta */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500 font-mono text-xs font-bold">
              MCQ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {problem.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Zap className="w-3 h-3" />
              {problem.xpReward} XP
            </span>
          </div>
        </div>

        {/* Statement / Prompt */}
        <div className="bg-card/60 backdrop-blur-md rounded-2xl p-5 border border-border/80 shadow-xs">
          <p className="text-base sm:text-lg leading-relaxed text-foreground font-medium whitespace-pre-line">
            {problem.statement}
          </p>
        </div>

        {/* Options section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
            <span>Options: Pick one correct answer from below</span>
            <span>Attempts left: {attemptsLeft}/4</span>
          </div>

          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = selected === opt.id
              const isCorrectState = submittedStatus === "correct" && isSelected
              const isWrongState = submittedStatus === "incorrect" && isSelected

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={submittedStatus === "correct"}
                  onClick={() => {
                    if (submittedStatus !== "correct") {
                      setSelected(opt.id)
                      setSubmittedStatus(null)
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl text-left text-sm font-medium border transition-all cursor-pointer",
                    isSelected
                      ? "border-teal-500 bg-teal-500/10 text-foreground ring-1 ring-teal-500"
                      : "border-border/80 bg-card/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                    isCorrectState && "border-emerald-500 bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500",
                    isWrongState && "border-rose-500 bg-rose-500/15 text-rose-500 ring-1 ring-rose-500"
                  )}
                >
                  {/* Option letter bubble */}
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                      isSelected
                        ? "bg-teal-500 text-white"
                        : "bg-muted text-muted-foreground",
                      isCorrectState && "bg-emerald-500 text-white",
                      isWrongState && "bg-rose-500 text-white"
                    )}
                  >
                    {opt.id}
                  </span>

                  <span className="flex-1 leading-snug">{opt.text}</span>

                  {isCorrectState && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  {isWrongState && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Feedback / Results Banner */}
        <AnimatePresence>
          {submittedStatus === "correct" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 border border-emerald-500/40 bg-emerald-500/10 space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>Correct Answer!</span>
                {earnedXp && (
                  <span className="ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> +{earnedXp} XP Awarded
                  </span>
                )}
              </div>
              {explanation && (
                <p className="text-sm text-foreground/90 leading-relaxed font-normal pt-1">
                  {explanation}
                </p>
              )}
            </motion.div>
          )}

          {submittedStatus === "incorrect" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 border border-rose-500/40 bg-rose-500/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 text-rose-500 text-sm font-semibold">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>Incorrect option. Think carefully and give it another shot!</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-xs gap-1 border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Submit Action */}
      <div className="pt-8 border-t border-border/60 flex items-center justify-between">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <HelpCircle className="w-4 h-4 text-muted-foreground/60" />
          <span>Need help? Check hints on the left sidebar.</span>
        </div>

        <div className="flex items-center gap-3">
          {submittedStatus === "correct" && onNext ? (
            <Button
              onClick={onNext}
              className="bg-brand-teal hover:bg-brand-teal/90 text-white font-semibold gap-1.5 shadow-md shadow-brand-teal/20"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              disabled={!selected || isSubmitting || submittedStatus === "correct"}
              onClick={handleSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 shadow-md shadow-orange-500/20"
            >
              {isSubmitting ? "Checking..." : "Submit MCQ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
