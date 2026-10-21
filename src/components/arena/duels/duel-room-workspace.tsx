"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  Swords,
  Timer,
  Play,
  Send,
  Flag,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ShieldAlert,
  Coins,
  Trophy,
  Ghost,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DifficultyBadge } from "@/components/arena/difficulty-badge"
import { StatementMathRenderer } from "@/components/arena/statement-math-renderer"
import { duelAudio } from "@/lib/duel-audio"
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  type SupportedLanguage,
} from "@/lib/arena-constants"
import { cn } from "@/lib/utils"

// Dynamic import Monaco Editor to avoid SSR mismatch
const CodeEditor = dynamic(
  () => import("@/components/arena/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-[#1e1e1e] rounded-xl flex items-center justify-center text-white/40 text-xs">
        Loading Monaco editor...
      </div>
    ),
  }
)

interface DuelRoomWorkspaceProps {
  initialRoom: any
  currentUserId: string
}

export function DuelRoomWorkspace({ initialRoom, currentUserId }: DuelRoomWorkspaceProps) {
  const router = useRouter()

  const [room, setRoom] = React.useState(initialRoom)
  const [selectedLanguage, setSelectedLanguage] = React.useState<SupportedLanguage>("python")
  const [code, setCode] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isRunningSample, setIsRunningSample] = React.useState(false)
  const [sampleOutput, setSampleOutput] = React.useState<any | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [showForfeitModal, setShowForfeitModal] = React.useState(false)

  // Countdown state: 3, 2, 1, 0
  const [countdown, setCountdown] = React.useState<number | null>(null)
  const countdownPlayedRef = React.useRef(false)

  // Victory celebration state
  const [celebrationTriggered, setCelebrationTriggered] = React.useState(false)

  // Determine current player identity
  const isCreator = room.creator?.id === currentUserId
  const isOpponent = room.opponent?.id === currentUserId
  const you = isCreator ? room.creator : room.opponent
  const opponent = isCreator ? room.opponent : room.creator

  const yourPassedTests = isCreator ? room.creatorPassedTests : room.opponentPassedTests
  const yourTotalTests = isCreator ? room.creatorTotalTests || 5 : room.opponentTotalTests || 5
  const opponentPassedTests = isCreator ? room.opponentPassedTests : room.creatorPassedTests
  const opponentTotalTests = isCreator ? room.opponentTotalTests || 5 : room.creatorTotalTests || 5

  const yourTabSwitches = isCreator ? room.creatorTabSwitches : room.opponentTabSwitches
  const opponentTabSwitches = isCreator ? room.opponentTabSwitches : room.creatorTabSwitches

  // Initialize Starter Code
  React.useEffect(() => {
    const starter = room.problem?.starterCode?.[selectedLanguage] || ""
    setCode(starter)
  }, [selectedLanguage, room.problem?.starterCode])

  // Sound mute state
  React.useEffect(() => {
    setIsMuted(duelAudio.getMuted())
  }, [])

  const handleToggleMute = () => {
    const nextMuted = duelAudio.toggleMute()
    setIsMuted(nextMuted)
    toast(nextMuted ? "Sound muted" : "Sound unmuted")
  }

  // ─── REAL-TIME HEARTBEAT POLLING (1.5s interval) ───────────────────
  React.useEffect(() => {
    if (room.status === "COMPLETED" || room.status === "FORFEITED" || room.status === "CANCELLED") {
      return
    }

    const intervalMs = room.status === "IN_PROGRESS" || room.status === "COUNTDOWN" ? 1500 : 2500

    const poller = setInterval(async () => {
      try {
        const res = await fetch(`/api/student/arena/duels/${room.code}`)
        if (!res.ok) return
        const data = await res.json()
        if (data.success && data.room) {
          setRoom(data.room)
        }
      } catch (e) {
        console.warn("Duel poll tick error:", e)
      }
    }, intervalMs)

    return () => clearInterval(poller)
  }, [room.code, room.status])

  // ─── SYNCHRONIZED 3-2-1 COUNTDOWN BARRIER ──────────────────────────
  React.useEffect(() => {
    if (room.status === "COUNTDOWN" && countdown === null && !countdownPlayedRef.current) {
      countdownPlayedRef.current = true
      setCountdown(3)
      duelAudio.playCountdownTick()

      const t1 = setTimeout(() => {
        setCountdown(2)
        duelAudio.playCountdownTick()
      }, 1000)

      const t2 = setTimeout(() => {
        setCountdown(1)
        duelAudio.playCountdownTick()
      }, 2000)

      const t3 = setTimeout(() => {
        setCountdown(0)
        duelAudio.playCountdownGo()
      }, 3000)

      const t4 = setTimeout(() => {
        setCountdown(null)
      }, 3800)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        clearTimeout(t4)
      }
    }
  }, [room.status, countdown])

  // ─── ANTI-CHEAT TAB BLUR TELEMETRY ─────────────────────────────────
  React.useEffect(() => {
    if (room.status !== "IN_PROGRESS") return

    const handleBlur = () => {
      fetch(`/api/student/arena/duels/${room.code}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tabSwitched: true }),
      }).catch(() => {})
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        handleBlur()
      }
    }

    window.addEventListener("blur", handleBlur)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("blur", handleBlur)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [room.code, room.status])

  // ─── MATCH COMPLETION / CONFETTI EFFECT ───────────────────────────
  React.useEffect(() => {
    if (room.status === "COMPLETED" && !celebrationTriggered) {
      setCelebrationTriggered(true)
      const didWin = room.winnerId === currentUserId

      if (didWin) {
        duelAudio.playVictoryFanfare()
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#00D6D6", "#10B981", "#F59E0B", "#8B5CF6"],
        })
      } else {
        duelAudio.playDefeatSound()
      }
    }
  }, [room.status, room.winnerId, currentUserId, celebrationTriggered])

  // ─── ACTION: RUN SAMPLE TESTS ─────────────────────────────────────
  const handleRunSample = async () => {
    if (!code.trim()) {
      toast.error("Please write code before running tests")
      return
    }

    setIsRunningSample(true)
    setSampleOutput(null)
    try {
      const res = await fetch("/api/student/arena/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: room.problem.slug,
          code,
          language: selectedLanguage,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Execution failed")

      setSampleOutput(data)
      if (data.overallVerdict === "ACCEPTED") {
        duelAudio.playTestcasePassed()
        toast.success("✓ All sample test cases passed!")
      } else {
        toast.error(`Sample tests verdict: ${data.overallVerdict}`)
      }

      // Sync test progress to opponent
      fetch(`/api/student/arena/duels/${room.code}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passedTests: data.passedCount || 0,
          totalTests: data.totalCount || 5,
        }),
      }).catch(() => {})
    } catch (err: any) {
      toast.error(err.message || "Failed to run sample tests")
    } finally {
      setIsRunningSample(false)
    }
  }

  // ─── ACTION: SUBMIT SOLUTION (FINAL EVALUATION) ───────────────────
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write code before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/student/arena/duels/${room.code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")

      if (data.isWinner) {
        toast.success(`🎉 VICTORY! You won the duel! (+${data.xpReward} XP)`)
      } else if (data.isAccepted) {
        toast.info("✓ Solution Accepted! Opponent finished first.")
      } else {
        toast.error(`Verdict: ${data.verdict} (${data.passedTests}/${data.totalTests} passed)`)
      }

      // Re-fetch room state immediately
      const roomRes = await fetch(`/api/student/arena/duels/${room.code}`)
      const roomData = await roomRes.json()
      if (roomData.success) {
        setRoom(roomData.room)
      }
    } catch (err: any) {
      toast.error(err.message || "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── ACTION: SURRENDER / FORFEIT ──────────────────────────────────
  const handleForfeit = async () => {
    try {
      const res = await fetch(`/api/student/arena/duels/${room.code}/forfeit`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to forfeit")

      setShowForfeitModal(false)
      toast.info("Match surrendered.")
      const roomRes = await fetch(`/api/student/arena/duels/${room.code}`)
      const roomData = await roomRes.json()
      if (roomData.success) setRoom(roomData.room)
    } catch (err: any) {
      toast.error(err.message || "Failed to surrender")
    }
  }

  const getInviteUrl = () => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/student/arena/duels/room/${room.code}`
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getInviteUrl())
    setCopied(true)
    toast.success("Room link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  // Format server-authoritative elapsed match time
  const elapsedSec = Math.floor((room.elapsedMs || 0) / 1000)
  const timerStr = `${Math.floor(elapsedSec / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSec % 60).toString().padStart(2, "0")}`

  // ─── RENDER: WAITING LOBBY ─────────────────────────────────────────
  if (room.status === "WAITING") {
    // Visitor screen: Incoming Challenge Card
    if (!isCreator) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-lg w-full overflow-hidden rounded-3xl border border-teal-500/30 bg-card text-foreground backdrop-blur-2xl p-8 text-center space-y-6 shadow-2xl shadow-teal-500/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto shadow-md shadow-teal-500/20 animate-pulse">
              <Swords className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30">
                Incoming 1v1 Challenge
              </span>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {room.creator?.name || "A Batchmate"} Has Challenged You!
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Accept this head-to-head 1v1 coding battle. Both of you will write code simultaneously and race to pass all test cases!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Target Problem</span>
                <DifficultyBadge difficulty={room.problem.difficulty} />
              </div>
              <p className="text-sm font-extrabold text-foreground">{room.problem.title}</p>
              {room.stakeXp > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-extrabold pt-1">
                  <Coins className="w-4 h-4" />
                  <span>Staked Bounty: {room.stakeXp * 2} XP Pot (Requires {room.stakeXp} XP stake)</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={async () => {
                  setIsSubmitting(true)
                  try {
                    const res = await fetch(`/api/student/arena/duels/${room.code}/join`, {
                      method: "POST",
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || "Failed to join duel")
                    toast.success("⚔️ Challenge Accepted! 3... 2... 1...")
                    const roomRes = await fetch(`/api/student/arena/duels/${room.code}`)
                    const roomData = await roomRes.json()
                    if (roomData.success) setRoom(roomData.room)
                  } catch (err: any) {
                    toast.error(err.message || "Failed to join duel")
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700 text-white font-black text-sm transition-all shadow-lg shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Entering Duel...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Accept Challenge &amp; Start Duel</span>
                  </>
                )}
              </button>

              <button
                onClick={() => router.push("/student/arena/duels")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto pt-1 cursor-pointer font-semibold"
              >
                Decline &amp; Back to Hub
              </button>
            </div>
          </motion.div>
        </div>
      )
    }

    // Creator screen: Radar Scanner Animation
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-lg w-full overflow-hidden rounded-3xl border border-border/80 bg-card text-foreground backdrop-blur-2xl p-8 text-center space-y-6 shadow-2xl"
        >
          {/* Radar Scanner Animation */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping opacity-75" />
            <div className="absolute inset-3 rounded-full border border-teal-500/40 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-lg shadow-teal-500/20">
              <Swords className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Waiting for Opponent...</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Share your duel code with your friend. As soon as they open this link, the synchronized 3-second countdown will begin!
            </p>
          </div>

          {/* Room Code Badge */}
          <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-semibold">Duel Room Code</span>
              <span className="font-mono text-base font-black text-teal-600 dark:text-teal-400">{room.code}</span>
            </div>

            <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2">
              <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                {getInviteUrl()}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer border border-border/80"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Direct Share Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                const msg = `⚔️ *1v1 Coding Duel Challenge!*\nDekhte hain kaun pehle solve karta hai. Join my duel room now:\n${getInviteUrl()}`
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank")
              }}
              className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              onClick={() => {
                const msg = `⚔️ 1v1 Coding Duel Challenge on TechGration:`
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(getInviteUrl())}&text=${encodeURIComponent(msg)}`,
                  "_blank"
                )
              }}
              className="py-3 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#229ED9]/20"
            >
              <Send className="w-4 h-4" />
              <span>Share to Telegram</span>
            </button>
          </div>

          {/* Cancel button */}
          {isCreator && (
            <button
              onClick={handleForfeit}
              className="text-xs text-muted-foreground hover:text-rose-500 transition-colors pt-2 block mx-auto cursor-pointer font-semibold"
            >
              Cancel Challenge &amp; Refund Stake
            </button>
          )}
        </motion.div>
      </div>
    )
  }

  // ─── RENDER: LIVE DUEL SPLIT WORKSPACE ─────────────────────────────
  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] max-w-[1920px] mx-auto overflow-hidden bg-background text-foreground">
      {/* ─── FULLSCREEN 3-2-1 COUNTDOWN OVERLAY ───────────────────────── */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-center"
            >
              {countdown > 0 ? (
                <span className="font-mono text-9xl sm:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-400 via-cyan-400 to-amber-400 drop-shadow-[0_0_50px_rgba(0,214,214,0.4)]">
                  {countdown}
                </span>
              ) : (
                <span className="font-black text-8xl sm:text-[10rem] tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_0_60px_rgba(16,185,129,0.5)]">
                  CODE!
                </span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TOP BATTLE HUD ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-card/95 border-b border-border/80 backdrop-blur-xl z-20 text-foreground shadow-2xs">
        {/* Left: Player (You) */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar className="w-9 h-9 border border-teal-500/40 ring-2 ring-teal-500/20">
            <AvatarImage src={you?.profile?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
              {you?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "ME"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-xs font-black text-foreground flex items-center gap-1.5">
              <span>{you?.name} (You)</span>
              {yourTabSwitches > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                  {yourTabSwitches} tab blur
                </span>
              )}
            </p>
            {/* Live Progress Meter */}
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-36 h-2.5 rounded-full bg-muted border border-border/60 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
                  animate={{ width: `${Math.min(100, (yourPassedTests / yourTotalTests) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
              <span className="text-xs font-mono font-black text-teal-600 dark:text-teal-400">
                {yourPassedTests}/{yourTotalTests}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Match Timer, Pot & Mute Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Stake pot */}
          {room.stakeXp > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black shadow-2xs">
              <Coins className="w-3.5 h-3.5" />
              <span>Pot: {room.stakeXp * 2} XP</span>
            </div>
          )}

          {/* 2x Rush Badge */}
          {room.isHappyHour && (
            <div className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-[11px] font-black uppercase">
              <span>⚡ 2x Rush</span>
            </div>
          )}

          {/* Timer Clock */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted/80 border border-border/80 shadow-2xs">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-mono font-black text-foreground">{timerStr}</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border border-border/60"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
          </button>
        </div>

        {/* Right: Opponent / Ghost */}
        <div className="flex items-center justify-end gap-3 min-w-[200px]">
          <div className="space-y-0.5 text-right">
            <p className="text-xs font-black text-foreground flex items-center justify-end gap-1.5">
              {room.isGhost && <Ghost className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              <span>{opponent?.name || (room.isGhost ? "Ghost Runner" : "Opponent")}</span>
              {opponentTabSwitches > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                  {opponentTabSwitches} tab blur
                </span>
              )}
            </p>
            {/* Live Progress Meter */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400">
                {opponentPassedTests}/{opponentTotalTests}
              </span>
              <div className="w-24 sm:w-36 h-2.5 rounded-full bg-muted border border-border/60 overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full",
                    room.isGhost
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-rose-500 to-amber-500"
                  )}
                  animate={{
                    width: `${Math.min(100, (opponentPassedTests / opponentTotalTests) * 100)}%`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
          </div>

          <Avatar
            className={cn(
              "w-9 h-9 border ring-2",
              room.isGhost
                ? "border-purple-500/40 ring-purple-500/20"
                : "border-rose-500/40 ring-rose-500/20"
            )}
          >
            <AvatarImage src={opponent?.profile?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
              {opponent?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "OP"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* ─── MAIN SPLIT CONTENT: STATEMENT & EDITOR ──────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left Pane: Problem Statement with KaTeX */}
        <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-border/80 bg-card/40 backdrop-blur-xl overflow-y-auto p-5 sm:p-6 space-y-5 text-foreground">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <DifficultyBadge difficulty={room.problem.difficulty} />
              <span className="text-xs text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                +{room.problem.xpReward} XP Base
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">{room.problem.title}</h2>
          </div>

          {/* Statement Math Renderer */}
          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            <StatementMathRenderer content={room.problem.statement} />
          </div>

          {/* Sample Test Cases */}
          {room.problem.testCases && room.problem.testCases.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border/80">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Sample Test Cases
              </p>
              {room.problem.testCases.map((tc: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 space-y-2 text-xs">
                  <p className="font-extrabold text-foreground">Example {idx + 1}:</p>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="bg-card p-2.5 rounded-xl border border-border/60">
                      <span className="text-muted-foreground font-semibold">Input: </span>
                      <span className="text-foreground">{tc.input}</span>
                    </div>
                    <div className="bg-card p-2.5 rounded-xl border border-border/60">
                      <span className="text-muted-foreground font-semibold">Output: </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{tc.expectedOutput}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Monaco Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 bg-[#1e1e1e]">
          {/* Editor Area */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              code={code}
              onCodeChange={setCode}
              starterCode={room.problem.starterCode || {}}
              problemSlug={room.problem.slug}
              readOnly={room.status === "COMPLETED" || room.status === "FORFEITED"}
            />
          </div>

          {/* Sample Tests Run Drawer Output (if executed) */}
          {sampleOutput && (
            <div className="border-t border-border/80 bg-card p-4 max-h-52 overflow-y-auto space-y-2 text-xs text-foreground">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-foreground">Sample Test Results</span>
                <span
                  className={cn(
                    "font-bold font-mono",
                    sampleOutput.overallVerdict === "ACCEPTED" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {sampleOutput.overallVerdict} ({sampleOutput.passedCount}/{sampleOutput.totalCount})
                </span>
              </div>
              {sampleOutput.results?.map((res: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/60 text-[11px] border border-border/60">
                  <span className="font-semibold text-foreground">Test Case {idx + 1}</span>
                  <span className={res.passed ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                    {res.passed ? "✓ Passed" : `✗ ${res.verdict}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action Console Bar */}
          <footer className="flex items-center justify-between px-4 py-3 bg-card border-t border-border/80">
            <button
              onClick={() => setShowForfeitModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Surrender</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRunSample}
                disabled={isRunningSample || isSubmitting || room.status !== "IN_PROGRESS"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs transition-colors cursor-pointer border border-border/80 disabled:opacity-50"
              >
                {isRunningSample ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-foreground" />}
                <span>Run Sample</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isRunningSample || room.status !== "IN_PROGRESS"}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700 text-white font-black text-xs transition-all shadow-md shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit &amp; Win</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* ─── MODAL: SURRENDER CONFIRMATION ──────────────────────────── */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-card border border-border/80 text-foreground space-y-4 text-center shadow-2xl">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-black text-foreground">Surrender Match?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Surrendering will immediately award the win and any staked XP bounty pot to your opponent. Are you sure?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowForfeitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors border border-border/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleForfeit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Yes, Surrender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: POST-MATCH VICTORY / DEFEAT CELEBRATION ─────────── */}
      <AnimatePresence>
        {(room.status === "COMPLETED" || room.status === "FORFEITED") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative max-w-md w-full overflow-hidden rounded-3xl border border-border/80 bg-card text-foreground p-7 text-center space-y-6 shadow-2xl"
            >
              {room.winnerId === currentUserId ? (
                /* VICTORY SCREEN */
                <>
                  <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400 shadow-xl shadow-teal-500/30 animate-bounce">
                    <Trophy className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                      VICTORY!
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      You solved &ldquo;{room.problem.title}&rdquo; first!
                    </p>
                  </div>

                  {/* XP Award Breakdown */}
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                      Total XP Earned
                    </span>
                    <p className="text-3xl font-black font-mono text-foreground">
                      +{room.isHappyHour ? room.problem.xpReward * 2 : room.problem.xpReward} XP
                    </p>
                    {room.stakeXp > 0 && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-extrabold">
                        💰 Claimed {room.stakeXp * 2} XP Stake Bounty!
                      </p>
                    )}
                  </div>
                </>
              ) : (
                /* DEFEAT SCREEN */
                <>
                  <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-500 shadow-xl shadow-rose-500/30">
                    <XCircle className="w-10 h-10" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-rose-600 dark:text-rose-400">MATCH OVER</h2>
                    <p className="text-xs text-muted-foreground">
                      {room.winner?.name || "Opponent"} took the victory this round.
                    </p>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                {room.winnerId === currentUserId && (
                  <button
                    onClick={() => {
                      const msg = `🏆 *I just won a 1v1 Coding Duel on TechGration!*\nI defeated my opponent on "${room.problem.title}". Can you beat my score? Join the arena: ${window.location.origin}/student/arena/duels`
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank")
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#25D366]/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share Victory on WhatsApp</span>
                  </button>
                )}

                <button
                  onClick={() => router.push("/student/arena/duels")}
                  className="w-full py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs transition-colors cursor-pointer border border-border/80"
                >
                  Return to Battle Arena Hub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
