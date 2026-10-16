"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Crown, Medal, Flame, FileCheck2, HelpCircle, Rocket, EyeOff } from "lucide-react"
import type { LeaderboardEntry } from "@/server/services/leaderboard"
import type { LeaderboardBadge } from "@/lib/leaderboard-rank"
import { RankAvatar } from "./rank-avatar"
import { DeltaChip } from "./my-rank-card"

const MAX_ROWS = 50

const BADGE_META: Record<LeaderboardBadge, { label: string; icon: React.ElementType; cls: string }> = {
  TOP_SCORER: { label: "Top Scorer", icon: Crown, cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  QUIZ_ACE: { label: "Quiz Ace", icon: HelpCircle, cls: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  ASSIGNMENT_ACE: { label: "Assignment Ace", icon: FileCheck2, cls: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  RISING_STAR: { label: "Rising Star", icon: Rocket, cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const tone =
      rank === 1
        ? "from-yellow-300 to-amber-500 text-amber-950"
        : rank === 2
        ? "from-slate-200 to-slate-400 text-slate-800"
        : "from-orange-300 to-orange-600 text-orange-950"
    return (
      <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${tone} flex items-center justify-center font-black text-sm shadow-md`}>
        {rank === 1 ? <Crown className="w-4 h-4" /> : rank === 2 ? <Medal className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
        <span className="absolute -bottom-1 -right-1 text-[9px] w-4 h-4 rounded-full bg-background text-foreground flex items-center justify-center font-bold border border-border">
          {rank}
        </span>
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-muted-foreground tabular-nums">
      {rank}
    </div>
  )
}

interface LeaderboardTableProps {
  rows: LeaderboardEntry[]
  show: boolean
  staff: boolean
}

export function LeaderboardTable({ rows, show, staff }: LeaderboardTableProps) {
  const top = rows[0]?.totalMarks || 1
  const visible = rows.slice(0, MAX_ROWS)
  const selfRow = rows.find((r) => r.isSelf)
  const selfHidden = selfRow && !visible.some((r) => r.userId === selfRow.userId)

  const renderRow = (row: LeaderboardEntry, idx: number) => {
    const asgnPct = (row.assignmentMarks / top) * 100
    const quizPct = (row.quizMarks / top) * 100
    const tint =
      row.rank === 1
        ? "bg-gradient-to-r from-amber-500/10 to-transparent"
        : row.rank === 2
        ? "bg-gradient-to-r from-slate-400/10 to-transparent"
        : row.rank === 3
        ? "bg-gradient-to-r from-orange-500/10 to-transparent"
        : ""

    return (
      <motion.li
        key={row.userId}
        initial={{ opacity: 0, y: 16 }}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.4, delay: show ? Math.min(idx, 20) * 0.04 : 0, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 rounded-2xl border transition-colors ${tint} ${
          row.isSelf
            ? "border-cyan-500/50 bg-cyan-500/[0.07] ring-1 ring-cyan-500/30"
            : "border-border/60 bg-card/70 hover:bg-card"
        }`}
      >
        <RankBadge rank={row.rank} />
        <RankAvatar name={row.displayName} src={row.avatarUrl} seed={row.userId} size={40} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-foreground truncate max-w-[180px]">{row.displayName}</span>
            {row.isSelf && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 rounded-full px-1.5 py-px">
                You
              </span>
            )}
            {row.isAnonymous && (staff || row.isSelf) && (
              <span title="Hidden from classmates" className="text-muted-foreground">
                <EyeOff className="w-3 h-3" />
              </span>
            )}
            {row.badges.map((b) => {
              const meta = BADGE_META[b]
              const Icon = meta.icon
              return (
                <span key={b} className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold border rounded-full px-1.5 py-px ${meta.cls}`}>
                  <Icon className="w-2.5 h-2.5" />
                  {meta.label}
                </span>
              )
            })}
          </div>
          {staff && row.email && (
            <p className="text-[11px] text-muted-foreground truncate">{row.email}</p>
          )}
          {/* Marks split bar */}
          <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden flex">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: show ? `${asgnPct}%` : 0 }}
              transition={{ duration: 0.8, delay: show ? 0.2 + Math.min(idx, 20) * 0.04 : 0 }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
              initial={{ width: 0 }}
              animate={{ width: show ? `${quizPct}%` : 0 }}
              transition={{ duration: 0.8, delay: show ? 0.3 + Math.min(idx, 20) * 0.04 : 0 }}
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5 text-right shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Assign.</p>
            <p className="text-sm font-bold tabular-nums text-foreground">{row.assignmentMarks}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quiz</p>
            <p className="text-sm font-bold tabular-nums text-foreground">{row.quizMarks}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Accuracy</p>
            <p className="text-sm font-bold tabular-nums text-foreground">{row.accuracyPct}%</p>
          </div>
        </div>

        <div className="text-right shrink-0 w-16">
          <p className="text-lg font-black tabular-nums text-foreground leading-none">{row.totalMarks}</p>
          <div className="mt-1 flex justify-end">
            <DeltaChip delta={row.rankDelta} />
          </div>
        </div>
      </motion.li>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-3 text-[11px] font-semibold text-muted-foreground">
        <span className="uppercase tracking-wider">Full Rankings</span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />Assignments</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-violet-600" />Quizzes</span>
        </span>
      </div>
      <ol className="space-y-2">
        {visible.map((row, idx) => renderRow(row, idx))}
        {selfHidden && selfRow && (
          <>
            <li className="text-center text-muted-foreground text-xs py-1" aria-hidden>• • •</li>
            {renderRow(selfRow, visible.length)}
          </>
        )}
      </ol>
    </div>
  )
}
