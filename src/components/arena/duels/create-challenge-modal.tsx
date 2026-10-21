"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Swords,
  Share2,
  Copy,
  Check,
  Coins,
  Clock,
  Sparkles,
  Loader2,
  X,
  ExternalLink,
  Send,
  MessageCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { ARENA_TOPICS, TOPIC_LABELS } from "@/lib/arena-constants"
import { STAKE_OPTIONS, EXPIRY_OPTIONS } from "@/lib/duel-constants"
import { cn } from "@/lib/utils"

interface CreateChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  userXp: number
}

export function CreateChallengeModal({ isOpen, onClose, userXp }: CreateChallengeModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"OPEN" | "INVITE">("OPEN")

  // Common parameters
  const [difficulty, setDifficulty] = React.useState<"EASY" | "MEDIUM" | "HARD">("EASY")
  const [topic, setTopic] = React.useState<string>("arrays")
  const [stakeXp, setStakeXp] = React.useState<number>(0)
  const [expiryHours, setExpiryHours] = React.useState<number>(24)

  // Friend Invite generated state
  const [createdDuelCode, setCreatedDuelCode] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Reset state on close
  React.useEffect(() => {
    if (!isOpen) {
      setCreatedDuelCode(null)
      setIsLoading(false)
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreateOpenChallenge = async () => {
    if (stakeXp > userXp) {
      toast.error(`Insufficient XP. You have ${userXp} XP, but selected ${stakeXp} XP stake.`)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/student/arena/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "OPEN_CHALLENGE",
          difficulty,
          topic,
          stakeXp,
          expiryHours,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create challenge")

      toast.success("⚔️ Open Challenge Created! Batchmates notified.")
      onClose()
      router.push(`/student/arena/duels/room/${data.duel.code}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to create open challenge")
      setIsLoading(false)
    }
  }

  const handleGenerateInvite = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/student/arena/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "DIRECT_INVITE",
          difficulty,
          topic,
          stakeXp: 0,
          expiryHours: 24,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate invite")

      setCreatedDuelCode(data.duel.code)
      toast.success("🔗 Invite link generated! Share with your friend.")
    } catch (err: any) {
      toast.error(err.message || "Failed to create invite link")
    } finally {
      setIsLoading(false)
    }
  }

  const getInviteUrl = () => {
    if (typeof window === "undefined" || !createdDuelCode) return ""
    return `${window.location.origin}/student/arena/duels/room/${createdDuelCode}`
  }

  const handleCopyLink = async () => {
    const url = getInviteUrl()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const url = getInviteUrl()
    const msg = `⚔️ *1v1 Coding Duel Challenge!*\nDekhte hain kaun pehle solve karta hai. Join my duel room on TechGration now:\n${url}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank")
  }

  const handleShareTelegram = () => {
    const url = getInviteUrl()
    const msg = `⚔️ 1v1 Coding Duel Challenge! Dekhte hain kaun pehle solve karta hai:`
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
      "_blank"
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card text-foreground backdrop-blur-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400">
              <Swords className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Create 1v1 Coding Challenge</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-muted/60 dark:bg-muted/40 border-b border-border/60 gap-1.5">
          <button
            onClick={() => {
              setActiveTab("OPEN")
              setCreatedDuelCode(null)
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "OPEN"
                ? "bg-card text-foreground shadow-xs border border-border/80 font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Swords className="w-4 h-4 text-teal-500" />
            <span>⚔️ Open Challenge (Lobby)</span>
          </button>

          <button
            onClick={() => setActiveTab("INVITE")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "INVITE"
                ? "bg-card text-foreground shadow-xs border border-border/80 font-extrabold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Share2 className="w-4 h-4 text-cyan-500" />
            <span>🔗 Direct Friend Link</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer",
                    difficulty === d
                      ? d === "EASY"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                        : d === "MEDIUM"
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-2xs"
                        : "bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-400 shadow-2xs"
                      : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">DSA Topic</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-background text-foreground text-xs font-semibold px-3 py-2.5 rounded-xl border border-border/80 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="Random">🎲 Random (Any Algorithm)</option>
              {ARENA_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {TOPIC_LABELS[t] || t}
                </option>
              ))}
            </select>
          </div>

          {/* Open Challenge Specific: Stake & Expiry */}
          {activeTab === "OPEN" && (
            <>
              {/* Stake XP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Bounty Stake (Winner Takes All)
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Balance: <strong className="text-amber-600 dark:text-amber-400 font-bold">{userXp} XP</strong>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STAKE_OPTIONS.map((amt) => {
                    const disabled = amt > userXp
                    return (
                      <button
                        key={amt}
                        type="button"
                        disabled={disabled}
                        onClick={() => setStakeXp(amt)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1.5",
                          stakeXp === amt
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-400 shadow-2xs"
                            : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                          disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>{amt === 0 ? "Free (0 XP)" : `${amt} XP`}</span>
                      </button>
                    )
                  })}
                </div>
                {stakeXp > 0 && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    💡 {stakeXp} XP locked in escrow. Winner claims <strong className="font-extrabold">{stakeXp * 2} XP</strong>! 100% refunded if expired.
                  </p>
                )}
              </div>

              {/* Expiry */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Challenge Lifetime</label>
                <div className="grid grid-cols-3 gap-2">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setExpiryHours(opt.hours)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        expiryHours === opt.hours
                          ? "bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-400 shadow-2xs font-extrabold"
                          : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Open Challenge Button */}
              <button
                onClick={handleCreateOpenChallenge}
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700 text-white font-black text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing Challenge &amp; Notifying...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Publish Challenge to Public Lobby</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Direct Invite Tab */}
          {activeTab === "INVITE" && (
            <div className="space-y-4">
              {!createdDuelCode ? (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Create a private duel link. Both of you will face the chosen difficulty and race to solve it in real time!
                  </p>

                  <button
                    onClick={handleGenerateInvite}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-700 text-white font-black text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Generating Private Link...</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Generate Instant Duel Link</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-1">
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                      Room Generated Successfully
                    </span>
                    <p className="text-3xl font-mono font-black text-foreground tracking-wider">
                      {createdDuelCode}
                    </p>
                  </div>

                  {/* Share Link Row */}
                  <div className="flex items-center gap-2 bg-muted/70 border border-border/80 rounded-xl px-3 py-2.5">
                    <span className="text-xs font-mono text-muted-foreground truncate flex-1">
                      {getInviteUrl()}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="p-1.5 rounded-lg bg-card hover:bg-muted text-foreground transition-colors cursor-pointer border border-border/80"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* WhatsApp & Telegram 1-Click Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleShareWhatsApp}
                      className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#25D366]/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Share</span>
                    </button>

                    <button
                      onClick={handleShareTelegram}
                      className="py-3 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#229ED9]/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegram Share</span>
                    </button>
                  </div>

                  {/* Enter room CTA */}
                  <button
                    onClick={() => {
                      onClose()
                      router.push(`/student/arena/duels/room/${createdDuelCode}`)
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-black text-xs transition-all shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enter Duel Room Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
