"use client"

import * as React from "react"
import { Trophy, Medal, Flame, Crown } from "lucide-react"
import { motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  weeklyXp: number
  totalXp: number
  totalSolved: number
  streak: number
}

interface ArenaLeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
  period: string
}

const rankStyles: Record<number, { icon: React.ElementType; bg: string; text: string }> = {
  1: { icon: Crown, bg: "bg-amber-500/15", text: "text-amber-500" },
  2: { icon: Medal, bg: "bg-gray-400/15", text: "text-gray-400" },
  3: { icon: Medal, bg: "bg-amber-700/15", text: "text-amber-700" },
}

export function ArenaLeaderboard({ entries, currentUserId, period }: ArenaLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No arena activity this {period === "daily" ? "day" : period === "monthly" ? "month" : "week"} yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Be the first to earn XP!</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {entries.map((entry, i) => {
        const isCurrentUser = entry.userId === currentUserId
        const rankStyle = rankStyles[entry.rank]
        const RankIcon = rankStyle?.icon

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
              isCurrentUser ? "bg-teal-500/10 border border-teal-500/30" : "hover:bg-muted/50"
            )}
          >
            {/* Rank */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
              rankStyle?.bg || "bg-muted",
              rankStyle?.text || "text-muted-foreground"
            )}>
              {RankIcon ? <RankIcon className="w-4 h-4" /> : entry.rank}
            </div>

            {/* Avatar */}
            <Avatar className="w-8 h-8">
              <AvatarImage src={entry.avatarUrl || undefined} />
              <AvatarFallback className="text-[10px] font-bold">
                {entry.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-semibold truncate", isCurrentUser && "text-teal-600 dark:text-teal-400")}>
                {entry.name} {isCurrentUser && "(You)"}
              </p>
              <p className="text-[10px] text-muted-foreground">{entry.totalSolved} solved</p>
            </div>

            {/* Streak */}
            {entry.streak > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-orange-500">
                <Flame className="w-3 h-3" />
                {entry.streak}
              </span>
            )}

            {/* XP */}
            <span className="text-sm font-bold text-foreground">{entry.weeklyXp} XP</span>
          </motion.div>
        )
      })}
    </div>
  )
}
