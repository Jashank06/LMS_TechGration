"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Flame, Zap, Clock, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface HappyHourStatus {
  isLive: boolean
  secondsRemaining: number
  nextRushDate: string | Date
  formattedNext: string
}

interface HappyHourBannerProps {
  status: HappyHourStatus
  className?: string
}

export function HappyHourBanner({ status, className }: HappyHourBannerProps) {
  const router = useRouter()
  const [isQueueing, setIsQueueing] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState(status.secondsRemaining)

  // Local live tick countdown
  React.useEffect(() => {
    setTimeLeft(status.secondsRemaining)
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [status.secondsRemaining])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEnterQueue = async () => {
    setIsQueueing(true)
    try {
      const res = await fetch("/api/student/arena/duels/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to enter queue")
      }

      toast.success(
        data.matched ? "⚡ Peer Matched! Entering Duel Room..." : "🎯 Room Created! Waiting for peer..."
      )
      router.push(`/student/arena/duels/room/${data.duelCode}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to enter Happy Hour queue")
      setIsQueueing(false)
    }
  }

  // ─── LIVE STATE ───────────────────────────────────────────────────
  if (status.isLive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/10 dark:from-amber-950/80 dark:via-orange-950/60 dark:to-red-950/40 backdrop-blur-2xl p-6 sm:p-7 shadow-xl shadow-amber-500/15",
          className
        )}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-amber-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/25 to-red-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
              <span>LIVE NOW • 2X XP DUEL RUSH</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>Daily Duel Prime Time</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 font-extrabold">
                ⚡ 2x Double XP Active!
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              All 1v1 duels during 9:00 PM - 9:30 PM IST grant <strong className="text-amber-600 dark:text-amber-400">2x Double XP</strong> on victory! Rapid matchmaking connects you in 5-10 seconds.
            </p>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 border-border/80 pt-4 sm:pt-0">
            <div className="flex items-center gap-2.5 text-right">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground font-semibold block">Rush Ends In</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            <button
              onClick={handleEnterQueue}
              disabled={isQueueing}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-black text-sm transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {isQueueing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Matching Peer...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Enter 2x Rush Queue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── UPCOMING STATE ───────────────────────────────────────────────
  const hoursLeft = Math.floor(timeLeft / 3600)
  const minsLeft = Math.floor((timeLeft % 3600) / 60)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card/90 to-card dark:from-amber-950/30 dark:via-card/60 dark:to-card backdrop-blur-xl p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl opacity-70" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Daily Duel Prime Time • 9:00 PM IST</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            Daily 2x XP Duel Rush: Raat 9:00 Baje!
          </h3>

          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Every night from 9:00 PM to 9:30 PM IST, the platform unlocks <strong className="text-foreground">2x Double XP</strong> on all 1v1 duels with an instant 5-second rapid queue!
          </p>
        </div>

        {/* Countdown Box */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border/80 pt-3 md:pt-0 md:pl-6 shrink-0">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Starts In
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-foreground">
              {hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block">
              9:00 PM IST Guaranteed
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
