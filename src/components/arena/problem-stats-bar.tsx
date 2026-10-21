"use client"

import * as React from "react"
import { Zap, Flame, CheckCircle2, Target, BarChart2, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import { StudentCodingProfileModal } from "./student-coding-profile-modal"

interface ArenaStats {
  totalXp: number
  currentStreak: number
  longestStreak?: number
  totalSolved: number
  accuracy: number
  solvedByDifficulty?: { EASY: number; MEDIUM: number; HARD: number }
  totalByDifficulty?: { EASY?: number; MEDIUM?: number; HARD?: number }
  topicProgress?: Record<string, number>
}

interface ProblemStatsBarProps {
  stats: ArenaStats
  bookmarkedProblems?: Array<{
    id: string
    slug: string
    title: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    topics: string[]
    isSolved: boolean
  }>
}

export function ProblemStatsBar({ stats, bookmarkedProblems = [] }: ProblemStatsBarProps) {
  const [showProfileModal, setShowProfileModal] = React.useState(false)

  const items = [
    { icon: Zap, label: "Total XP", value: stats.totalXp.toLocaleString(), color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: Flame, label: "Day Streak", value: `${stats.currentStreak} Days`, color: "text-orange-500", bg: "bg-orange-500/10" },
    { icon: CheckCircle2, label: "Solved", value: stats.totalSolved.toString(), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  ]

  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setShowProfileModal(true)}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl px-4 py-3.5 hover:border-teal-500/40 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-lg font-black tracking-tight text-foreground">{item.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{item.label}</p>
                </div>
              </div>

              <div className="hidden sm:block text-muted-foreground/30 group-hover:text-brand-teal transition-colors text-xs font-semibold">
                →
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowProfileModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:underline cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>View Coding Analytics & Bookmarks</span>
          </button>
        </div>
      </div>

      <StudentCodingProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        stats={stats}
        bookmarkedProblems={bookmarkedProblems}
      />
    </>
  )
}
