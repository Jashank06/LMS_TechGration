"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Layers, List, Play, CheckCircle2, Zap, ArrowRight, Code } from "lucide-react"
import { StageCurriculumList, type CurriculumProblem } from "./stage-curriculum-list"
import { ProblemTable } from "./problem-table"
import { cn } from "@/lib/utils"

interface ArenaCurriculumViewProps {
  problems: CurriculumProblem[]
}

export function ArenaCurriculumView({ problems }: ArenaCurriculumViewProps) {
  const [viewMode, setViewMode] = React.useState<"curriculum" | "table">("curriculum")

  // Find next unsolved problem to resume
  const nextProblemToSolve = React.useMemo(() => {
    return problems.find((p) => !p.isSolved) || problems[0]
  }, [problems])

  const totalSolved = problems.filter((p) => p.isSolved).length
  const totalProblems = problems.length
  const overallPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Resume learning card */}
      {nextProblemToSolve && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent p-5 sm:p-6 backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>CONTINUE LEARNING PATH</span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                {nextProblemToSolve.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>Stage {nextProblemToSolve.stage || 1}</span>
                <span>•</span>
                <span className="capitalize">{nextProblemToSolve.difficulty.toLowerCase()} difficulty</span>
                <span>•</span>
                <span className="text-amber-500 font-semibold">+{nextProblemToSolve.xpReward} XP</span>
              </div>
            </div>

            <Link
              href={`/student/arena/${nextProblemToSolve.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold text-sm shadow-lg shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <span>{nextProblemToSolve.isSolved ? "Solve Next" : "Resume Learning"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("curriculum")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              viewMode === "curriculum"
                ? "bg-brand-teal text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Curriculum Path (Stages)</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              viewMode === "table"
                ? "bg-brand-teal text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <List className="w-4 h-4" />
            <span>All Questions (Table)</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground hidden sm:block">
          Overall Progress: <strong className="text-foreground">{totalSolved}/{totalProblems}</strong> ({overallPercentage}%)
        </div>
      </div>

      {/* View Render */}
      {viewMode === "curriculum" ? (
        <StageCurriculumList problems={problems} />
      ) : (
        <ProblemTable initialProblems={problems as any} />
      )}
    </div>
  )
}
