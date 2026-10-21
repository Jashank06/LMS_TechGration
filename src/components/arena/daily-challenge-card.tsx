"use client"

import Link from "next/link"
import { Sparkles, ArrowRight, Zap } from "lucide-react"
import { motion } from "motion/react"
import { DifficultyBadge } from "./difficulty-badge"

interface DailyChallengeProps {
  problem: {
    slug: string
    title: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    xpReward: number
    topics: string[]
    isSolved?: boolean
  } | null
}

export function DailyChallengeCard({ problem }: DailyChallengeProps) {
  if (!problem) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-xl p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-36 h-36 bg-orange-500/8 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Challenge</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{problem.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <Zap className="w-3 h-3" />
              {problem.xpReward} XP + 5 bonus
            </span>
          </div>
        </div>
        <Link
          href={`/student/arena/${problem.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          {problem.isSolved ? "View Solution" : "Solve Now"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}
