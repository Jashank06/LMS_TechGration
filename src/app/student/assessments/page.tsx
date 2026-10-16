import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { Button } from "@/components/ui/button"
import {
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Assessments & Quizzes — TechGration LMS",
  description: "Test your architectural mastery with timed scenario-based quizzes.",
}

export default async function AssessmentsPage() {
  const user = await requireStudent()

  const assessments = await db.assessment.findMany({
    include: {
      course: true,
      questions: true,
      attempts: {
        where: { userId: user.id },
        orderBy: { scorePct: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Banner with Apple/Google Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-brand-teal/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs backdrop-blur-md">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="tracking-wide">Interactive Knowledge Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Assessments & Quizzes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Timed scenario-based assessments designed to validate your systems engineering skills and prepare you for enterprise industry certifications.
          </p>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 mx-auto shadow-md">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No active quizzes yet</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quizzes are unlocked as you progress through course modules. Complete your upcoming lessons to unlock evaluations.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((quiz) => {
            const bestAttempt = quiz.attempts[0]
            const isPassed = bestAttempt?.passed

            return (
              <div
                key={quiz.id}
                className="group p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-brand-teal/50 hover:shadow-[0_12px_35px_-8px_rgba(0,214,214,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                      {quiz.course.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-secondary/60 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{Math.round(quiz.timeLimitSec / 60)} mins</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-brand-teal transition-colors">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">{quiz.questions.length} Questions</span>
                    <span className="font-semibold text-foreground/80">Pass mark: {quiz.passingPct}%</span>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between gap-3">
                  {bestAttempt ? (
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-xs ${
                        isPassed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Best: {Math.round(bestAttempt.scorePct)}%</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium">Not attempted yet</span>
                  )}

                  <Button
                    asChild
                    size="sm"
                    className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs h-10 px-5 rounded-xl shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Link href={`/student/assessments/${quiz.id}`}>
                      <span>{bestAttempt ? "Retake Quiz" : "Start Quiz"}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
