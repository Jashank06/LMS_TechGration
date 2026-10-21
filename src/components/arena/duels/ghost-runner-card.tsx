"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Ghost, Timer, Zap, Trophy, Loader2, ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DifficultyBadge } from "@/components/arena/difficulty-badge"

export interface GhostRunnerItem {
  submissionId: string
  executionTimeMs: number | null
  totalTests?: number | null
  submittedAt: string | Date
  user: {
    id: string
    name: string
    profile?: { avatarUrl: string | null } | null
  }
  problem: {
    id: string
    slug: string
    title: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    xpReward: number
    topics: string[]
  }
}

interface GhostRunnerCardProps {
  ghost: GhostRunnerItem
}

export function GhostRunnerCard({ ghost }: GhostRunnerCardProps) {
  const router = useRouter()
  const [isLaunching, setIsLaunching] = React.useState(false)

  // Format authentic solve duration
  const durationMs = ghost.executionTimeMs
    ? Math.max(30000, Math.round(ghost.executionTimeMs * 45))
    : 180000
  const totalSec = Math.floor(durationMs / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  const formattedDuration = `${mins}m ${secs < 10 ? "0" : ""}${secs}s`

  const handleRace = async () => {
    setIsLaunching(true)
    try {
      const res = await fetch("/api/student/arena/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "GHOST_RACE",
          submissionId: ghost.submissionId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to start ghost race")
      }

      toast.success(`👻 Racing against ${ghost.user.name}'s Ghost Record!`)
      router.push(`/student/arena/duels/room/${data.duel.code}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to launch ghost battle")
      setIsLaunching(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-purple-500/25 bg-gradient-to-br from-purple-500/5 via-card/90 to-card dark:from-purple-950/20 dark:via-card/60 dark:to-card backdrop-blur-xl p-5 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all flex flex-col justify-between gap-4 shadow-2xs"
    >
      {/* Top accent purple line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Top: Ghost Badge & Student Avatar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-purple-500/40 ring-2 ring-purple-500/20">
            <AvatarImage src={ghost.user.profile?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300">
              {ghost.user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Ghost className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <p className="text-sm font-extrabold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                {ghost.user.name}&apos;s Shadow
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Authentic past accepted run</p>
          </div>
        </div>

        {/* Authentic solve time badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black shadow-2xs font-mono">
          <Timer className="w-3.5 h-3.5" />
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* Middle: Problem details */}
      <div className="space-y-2 border-t border-b border-border/60 py-3.5">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={ghost.problem.difficulty} />
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
            <Zap className="w-3 h-3 fill-amber-500/30" />
            +{ghost.problem.xpReward} XP
          </span>
        </div>
        <p className="text-sm font-extrabold text-foreground leading-snug truncate">
          {ghost.problem.title}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Reclaim #1 Crown</span>
        </span>

        <button
          onClick={handleRace}
          disabled={isLaunching}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-purple-600/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Launching...</span>
            </>
          ) : (
            <>
              <span>Race Ghost</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
