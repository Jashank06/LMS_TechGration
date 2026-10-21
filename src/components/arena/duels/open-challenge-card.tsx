"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Swords, Clock, Coins, Loader2, ArrowRight, UserCheck } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DifficultyBadge } from "@/components/arena/difficulty-badge"
import { TOPIC_LABELS } from "@/lib/arena-constants"
import { cn } from "@/lib/utils"

export interface OpenChallengeItem {
  id: string
  code: string
  topic: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  stakeXp: number
  expiresAt: string | Date
  createdAt: string | Date
  creator: {
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

interface OpenChallengeCardProps {
  challenge: OpenChallengeItem
  currentUserId: string
}

export function OpenChallengeCard({ challenge, currentUserId }: OpenChallengeCardProps) {
  const router = useRouter()
  const [isJoining, setIsJoining] = React.useState(false)

  const isCreator = challenge.creator.id === currentUserId
  const potXp = challenge.stakeXp * 2

  // Time remaining calculation
  const [timeLeftStr, setTimeLeftStr] = React.useState("")
  React.useEffect(() => {
    const calc = () => {
      const diff = new Date(challenge.expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeftStr("Expired")
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeftStr(hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`)
    }
    calc()
    const timer = setInterval(calc, 60000)
    return () => clearInterval(timer)
  }, [challenge.expiresAt])

  const handleJoin = async () => {
    if (isCreator) {
      router.push(`/student/arena/duels/room/${challenge.code}`)
      return
    }

    setIsJoining(true)
    try {
      const res = await fetch(`/api/student/arena/duels/${challenge.code}/join`, {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept duel")
      }

      toast.success("⚔️ Challenge Accepted! Entering Duel Room...")
      router.push(`/student/arena/duels/room/${challenge.code}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to join duel")
      setIsJoining(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 dark:bg-card/60 backdrop-blur-xl p-5 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all flex flex-col justify-between gap-4 shadow-2xs"
    >
      {/* Top accent gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Top row: Creator avatar & details */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-teal-500/30 ring-2 ring-teal-500/15">
            <AvatarImage src={challenge.creator.profile?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
              {challenge.creator.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
              {challenge.creator.name}
              {isCreator && (
                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  You
                </span>
              )}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-muted-foreground/70" />
              <span>{timeLeftStr}</span>
            </p>
          </div>
        </div>

        {/* Stake Bounty Pill */}
        {challenge.stakeXp > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-extrabold shadow-2xs">
            <Coins className="w-3.5 h-3.5 fill-amber-500/20" />
            <span>Pot: {potXp} XP</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-bold border border-teal-500/20">
            <span>Free Match</span>
          </div>
        )}
      </div>

      {/* Middle: Problem & Topic info */}
      <div className="space-y-2 border-t border-b border-border/60 py-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={challenge.difficulty} />
          {challenge.topic && (
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/80 border border-border/60 px-2 py-0.5 rounded-md">
              {TOPIC_LABELS[challenge.topic] || challenge.topic}
            </span>
          )}
        </div>
        <p className="text-sm font-extrabold text-foreground leading-snug truncate">
          {challenge.problem.title}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-muted-foreground font-mono font-semibold px-2 py-1 rounded-lg bg-muted/60 border border-border/60">
          {challenge.code}
        </span>

        {isCreator ? (
          <button
            onClick={handleJoin}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-extrabold text-xs transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Your Lobby →</span>
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700 text-white font-extrabold text-xs transition-all shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Entering...</span>
              </>
            ) : (
              <>
                <Swords className="w-3.5 h-3.5" />
                <span>Accept Duel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}
