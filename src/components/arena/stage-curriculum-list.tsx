"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Code,
  HelpCircle,
  Zap,
  ArrowRight,
  Flame,
  BookOpen,
  Sparkles,
  Trophy,
} from "lucide-react"
import { ARENA_STAGES, type ArenaStageInfo } from "@/lib/arena-constants"
import { DifficultyBadge } from "./difficulty-badge"
import { cn } from "@/lib/utils"

export interface CurriculumProblem {
  id: string
  slug: string
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  type?: "CODING" | "MCQ"
  stage?: number
  position: number
  xpReward: number
  isSolved: boolean
  acceptanceRate?: number
}

interface StageCurriculumListProps {
  problems: CurriculumProblem[]
}

export function StageCurriculumList({ problems }: StageCurriculumListProps) {
  // Map problems by stage number (default to stage 1 if missing)
  const problemsByStage = React.useMemo(() => {
    const map = new Map<number, CurriculumProblem[]>()
    for (const stage of ARENA_STAGES) {
      map.set(stage.id, [])
    }

    for (const p of problems) {
      let stageId = p.stage
      if (!stageId) {
        // Fallback by position
        const found = ARENA_STAGES.find((s) => p.position >= s.range[0] && p.position <= s.range[1])
        stageId = found ? found.id : 1
      }
      const list = map.get(stageId) || []
      list.push(p)
      map.set(stageId, list)
    }

    // Sort problems inside each stage by position
    for (const [sId, list] of map.entries()) {
      list.sort((a, b) => a.position - b.position)
    }

    return map
  }, [problems])

  // Determine which stage is currently active (first stage that has unsolved problems)
  const firstUnsolvedStageId = React.useMemo(() => {
    for (const stage of ARENA_STAGES) {
      const list = problemsByStage.get(stage.id) || []
      if (list.length > 0 && list.some((p) => !p.isSolved)) {
        return stage.id
      }
    }
    return 1
  }, [problemsByStage])

  // Expanded stages state (open first 2 stages by default)
  const [expandedStages, setExpandedStages] = React.useState<Record<number, boolean>>({
    [firstUnsolvedStageId]: true,
  })

  const toggleStage = (stageId: number) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }))
  }

  const expandAll = () => {
    const all: Record<number, boolean> = {}
    ARENA_STAGES.forEach((s) => (all[s.id] = true))
    setExpandedStages(all)
  }

  const collapseAll = () => {
    setExpandedStages({})
  }

  return (
    <div className="space-y-4">
      {/* Controls header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-teal" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            Structured Learning Curriculum (12 Stages)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <span className="text-muted-foreground/40">•</span>
          <button
            onClick={collapseAll}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Stages Accordion List */}
      <div className="space-y-3.5">
        {ARENA_STAGES.map((stage, idx) => {
          const stageProblems = problemsByStage.get(stage.id) || []
          const totalInStage = stageProblems.length
          const solvedInStage = stageProblems.filter((p) => p.isSolved).length
          const pct = totalInStage > 0 ? Math.round((solvedInStage / totalInStage) * 100) : 0
          const totalXp = stageProblems.reduce((sum, p) => sum + p.xpReward, 0)
          const isExpanded = Boolean(expandedStages[stage.id])
          const isCompleted = totalInStage > 0 && solvedInStage === totalInStage

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={cn(
                "rounded-2xl border transition-all overflow-hidden backdrop-blur-xl bg-card/70",
                isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                  : isExpanded
                  ? "border-teal-500/30 shadow-sm"
                  : "border-border/80 hover:border-border"
              )}
            >
              {/* Stage Header Button */}
              <button
                type="button"
                onClick={() => toggleStage(stage.id)}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 text-left gap-3.5 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Stage number circle badge */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 border transition-all",
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40"
                        : "bg-teal-500/10 text-brand-teal border-teal-500/20"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : stage.id}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Stage {stage.id} • {stage.subtitle}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground truncate mt-0.5">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* Progress & metrics */}
                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-foreground">
                      <span>{solvedInStage}/{totalInStage} Solved</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="text-brand-teal font-extrabold">{pct}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-28 sm:w-36 h-2 rounded-full bg-muted overflow-hidden mt-1.5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isCompleted
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-teal-500 to-cyan-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 transition-transform" />
                    ) : (
                      <ChevronRight className="w-5 h-5 transition-transform" />
                    )}
                  </div>
                </div>
              </button>

              {/* Nested Problems List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/60 bg-muted/20 divide-y divide-border/40"
                  >
                    {stageProblems.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No problems assigned to this stage yet.
                      </div>
                    ) : (
                      stageProblems.map((problem, pIdx) => {
                        const isMcq = problem.type === "MCQ"

                        return (
                          <div
                            key={problem.id}
                            className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 hover:bg-muted/50 transition-colors group"
                          >
                            {/* Solved checkmark */}
                            <div className="shrink-0">
                              {problem.isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/40" />
                              )}
                            </div>

                            {/* Type icon (</> or MCQ) */}
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold",
                                isMcq
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-teal-500/10 text-brand-teal border border-teal-500/20"
                              )}
                              title={isMcq ? "Multiple Choice Question" : "Coding Problem"}
                            >
                              {isMcq ? <HelpCircle className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                            </div>

                            {/* Title & subtitle */}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/student/arena/${problem.slug}`}
                                className="text-sm font-semibold text-foreground group-hover:text-brand-teal transition-colors flex items-center gap-2"
                              >
                                <span className="truncate">{problem.title}</span>
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                <span>{isMcq ? "Conceptual MCQ" : "Coding Challenge"}</span>
                                <span>•</span>
                                <span className="font-semibold text-amber-500">+{problem.xpReward} XP</span>
                              </div>
                            </div>

                            {/* Difficulty badge */}
                            <DifficultyBadge difficulty={problem.difficulty} size="sm" />

                            {/* Direct Action Link */}
                            <Link
                              href={`/student/arena/${problem.slug}`}
                              className={cn(
                                "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                problem.isSolved
                                  ? "text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80"
                                  : "bg-brand-teal hover:bg-brand-teal/90 text-white shadow-xs"
                              )}
                            >
                              <span>{problem.isSolved ? "Review" : "Solve"}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
