"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Target, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react"
import type { CourseLeaderboard, LeaderboardEntry } from "@/server/services/leaderboard"
import { RankAvatar } from "./rank-avatar"

interface MyRankCardProps {
  data: CourseLeaderboard
}

export function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground/70">
        <Minus className="w-3 h-3" />
        <span>New</span>
      </span>
    )
  }
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground">
        <Minus className="w-3 h-3" />
        <span>0</span>
      </span>
    )
  }
  const up = delta > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
        up ? "text-emerald-500" : "text-rose-500"
      }`}
    >
      <Icon className="w-3 h-3" />
      <span>{Math.abs(delta)}</span>
    </span>
  )
}

function nextTargetText(self: LeaderboardEntry, ranked: LeaderboardEntry[]): string {
  const idx = ranked.findIndex((r) => r.userId === self.userId)
  if (idx === 0) {
    const second = ranked.find((r) => r.rank > self.rank)
    if (!second) return "You're the only one on the board so far. Set the bar high!"
    const lead = self.totalMarks - second.totalMarks
    return lead > 0
      ? `You're leading by ${lead} mark${lead === 1 ? "" : "s"}. Keep it up!`
      : "You're tied at the top. Accuracy decides the lead."
  }
  const above = ranked.slice(0, idx).reverse().find((r) => r.rank < self.rank)
  if (!above) return "You're sharing this rank with others. A better accuracy moves you up."
  const gap = above.totalMarks - self.totalMarks
  return `${gap + 1} more mark${gap + 1 === 1 ? "" : "s"} to overtake ${above.displayName}.`
}

export function MyRankCard({ data }: MyRankCardProps) {
  const self = data.ranked.find((r) => r.isSelf)
  const waitingSelf = data.waiting.find((w) => w.isSelf)

  if (!self && !waitingSelf) return null

  if (!self && waitingSelf) {
    return (
      <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-5 flex items-center gap-4">
        <RankAvatar name={waitingSelf.displayName} src={waitingSelf.avatarUrl} seed={waitingSelf.userId} size={48} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Your spot is waiting</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit an assignment or attempt a quiz. Once your teacher evaluates it, you&apos;ll appear on the board.
          </p>
        </div>
      </div>
    )
  }

  if (!self) return null
  const topPct = Math.max(1, Math.ceil((self.rank / data.stats.ranked) * 100))
  const total = self.assignmentMarks + self.quizMarks
  const asgnShare = total > 0 ? (self.assignmentMarks / total) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-card via-card to-cyan-500/[0.06] p-5 sm:p-6 shadow-xs"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-4">
          <RankAvatar name={self.displayName} src={self.avatarUrl} seed={self.userId} size={56} className="ring-2 ring-cyan-400/50" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Your rank</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums text-foreground leading-none">#{self.rank}</span>
              <span className="text-xs font-semibold text-muted-foreground">of {data.stats.ranked}</span>
              <DeltaChip delta={self.rankDelta} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:ml-auto lg:min-w-[360px]">
          <div className="rounded-2xl bg-secondary/60 border border-border/60 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Marks</p>
            <p className="text-xl font-black tabular-nums text-foreground">{self.totalMarks}</p>
          </div>
          <div className="rounded-2xl bg-secondary/60 border border-border/60 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Accuracy</p>
            <p className="text-xl font-black tabular-nums text-foreground">{self.accuracyPct}%</p>
          </div>
          <div className="rounded-2xl bg-secondary/60 border border-border/60 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Percentile</p>
            <p className="text-xl font-black tabular-nums text-foreground">Top {topPct}%</p>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <p className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>{nextTargetText(self, data.ranked)}</span>
        </p>
        <div className="sm:ml-auto sm:w-64">
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-1">
            <span>Assignments {self.assignmentMarks}</span>
            <span>Quizzes {self.quizMarks}</span>
          </div>
          <div className="h-2 rounded-full bg-purple-500/30 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${asgnShare}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
