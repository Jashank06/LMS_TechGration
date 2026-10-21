"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Swords,
  Ghost,
  Share2,
  Clock,
  Trophy,
  Flame,
  Zap,
  ArrowLeft,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Users,
  Target,
  ShieldCheck,
  Send,
} from "lucide-react"
import { motion } from "motion/react"
import { HappyHourBanner } from "./happy-hour-banner"
import { OpenChallengeCard, type OpenChallengeItem } from "./open-challenge-card"
import { GhostRunnerCard, type GhostRunnerItem } from "./ghost-runner-card"
import { CreateChallengeModal } from "./create-challenge-modal"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DuelsHubClientProps {
  initialOpenChallenges: OpenChallengeItem[]
  initialGhostRunners: GhostRunnerItem[]
  happyHour: any
  stats: {
    totalDuels: number
    wonDuels: number
    winRate: number
    currentStreak: number
    totalXp: number
  }
  activeDuel: any | null
  currentUserId: string
}

export function DuelsHubClient({
  initialOpenChallenges,
  initialGhostRunners,
  happyHour,
  stats,
  activeDuel,
  currentUserId,
}: DuelsHubClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"OPEN" | "GHOST" | "INVITE" | "HAPPY_HOUR">("OPEN")
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Filters for Open Challenges
  const [searchQuery, setSearchQuery] = React.useState("")
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("ALL")

  const filteredChallenges = React.useMemo(() => {
    return initialOpenChallenges.filter((ch) => {
      const matchesSearch =
        ch.problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDiff = difficultyFilter === "ALL" || ch.difficulty === difficultyFilter
      return matchesSearch && matchesDiff
    })
  }, [initialOpenChallenges, searchQuery, difficultyFilter])

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ─── HERO HEADER BANNER ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-card/95 to-card backdrop-blur-2xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Link
              href="/student/arena"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal-600 dark:text-teal-400 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Problem Hub</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-sm">
                <Swords className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  1v1 Battle Arena
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-700 dark:text-teal-300 font-extrabold border border-teal-500/30 shadow-2xs">
                  Esports Mode
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Compete head-to-head in real time, race authentic batchmate speedruns, challenge friends with 1-click links, or jump into the 9 PM 2x XP rush.
            </p>
          </div>

          {/* Create Challenge Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-400 hover:via-cyan-400 hover:to-teal-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Challenge</span>
          </button>
        </div>
      </div>

      {/* ─── ACTIVE BATTLE RE-ENTRY BANNER ────────────────────────────── */}
      {activeDuel && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent backdrop-blur-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <p className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                <span>Active Duel in Progress:</span>
                <span className="font-extrabold text-amber-700 dark:text-amber-400">&ldquo;{activeDuel.problem.title}&rdquo;</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {activeDuel.status}
                </span>
              </p>
              <p className="text-xs text-muted-foreground font-mono">Room Code: {activeDuel.code}</p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/student/arena/duels/room/${activeDuel.code}`)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-sm shadow-amber-500/25 hover:scale-[1.02] cursor-pointer"
          >
            Resume Duel Room →
          </button>
        </motion.div>
      )}

      {/* ─── STATS HUD BAR (4 AESTHETIC CARDS) ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Duels Played",
            value: stats.totalDuels.toString(),
            icon: Swords,
            color: "text-teal-600 dark:text-teal-400",
            bg: "bg-teal-500/10 border-teal-500/20",
            borderTop: "border-t-2 border-t-teal-500",
          },
          {
            label: "Win Rate",
            value: `${stats.winRate}%`,
            icon: Trophy,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
            borderTop: "border-t-2 border-t-amber-500",
          },
          {
            label: "Duels Won",
            value: stats.wonDuels.toString(),
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            borderTop: "border-t-2 border-t-emerald-500",
          },
          {
            label: "Arena XP",
            value: stats.totalXp.toLocaleString(),
            icon: Zap,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
            borderTop: "border-t-2 border-t-purple-500",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={cn(
              "flex items-center gap-3.5 p-4 rounded-2xl border border-border/80 bg-card/90 dark:bg-card/60 backdrop-blur-xl hover:border-teal-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all shadow-2xs",
              item.borderTop
            )}
          >
            <div className={cn("p-2.5 rounded-xl border shrink-0", item.bg)}>
              <item.icon className={cn("w-5 h-5", item.color)} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">{item.value}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── FLAMING HAPPY HOUR RUSH BANNER ───────────────────────────── */}
      <HappyHourBanner status={happyHour} />

      {/* ─── 4 DEDICATED UNMIXED MODE TABS ────────────────────────────── */}
      <div className="space-y-5">
        {/* Apple/Linear-style Segmented Navigation */}
        <div className="p-1.5 bg-muted/60 dark:bg-muted/40 border border-border/80 rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-2xs backdrop-blur-xl">
          {[
            {
              id: "OPEN",
              label: `⚔️ Open Challenges`,
              count: initialOpenChallenges.length,
              dotColor: "bg-emerald-500",
            },
            {
              id: "GHOST",
              label: `👻 Ghost Battles`,
              count: initialGhostRunners.length,
              dotColor: "bg-purple-500",
            },
            {
              id: "INVITE",
              label: "🔗 1-Click Friend Invite",
              count: null,
              dotColor: null,
            },
            {
              id: "HAPPY_HOUR",
              label: "⏰ 2x XP Rush Hour",
              count: happyHour?.isLive ? "LIVE" : null,
              dotColor: "bg-amber-500",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-card text-foreground font-extrabold shadow-sm border border-border/80 scale-[1.01]"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                    activeTab === tab.id
                      ? "bg-muted text-foreground border-border"
                      : "bg-background/80 text-muted-foreground border-border/60"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: OPEN CHALLENGES LOBBY ────────────────────────────── */}
        {activeTab === "OPEN" && (
          <div className="space-y-4">
            {/* Search + Difficulty Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges by problem, creator, or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-2xl bg-card/90 border-border/80 text-foreground placeholder:text-muted-foreground text-xs shadow-2xs focus-visible:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 bg-muted/60 dark:bg-muted/40 border border-border/80 rounded-xl">
                {[
                  { id: "ALL", label: "All" },
                  { id: "EASY", label: "Easy", activeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40" },
                  { id: "MEDIUM", label: "Medium", activeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40" },
                  { id: "HARD", label: "Hard", activeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficultyFilter(d.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-transparent",
                      difficultyFilter === d.id
                        ? d.activeColor || "bg-card text-foreground font-bold shadow-2xs border-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenges Grid */}
            {filteredChallenges.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 backdrop-blur-xl p-12 text-center space-y-3.5 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
                  <Swords className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">No Open Challenges in Lobby</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Be the first student to throw down the gauntlet! Create an open challenge with an optional XP bounty and notify your batchmates.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-extrabold text-xs transition-all shadow-md shadow-teal-500/20 hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Open Challenge</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((challenge) => (
                  <OpenChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: GHOST BATTLES (ZERO FAKE DATA) ───────────────────── */}
        {activeTab === "GHOST" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-3 shadow-2xs">
              <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 shrink-0">
                <Ghost className="w-4 h-4" />
              </div>
              <span className="leading-relaxed">
                <strong>Asynchronous Speedrun Racing:</strong> Race against real batchmate runs with authentic solve durations. If you beat their time, they receive an instant email notification to reclaim their crown!
              </span>
            </div>

            {initialGhostRunners.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/80 bg-card/50 backdrop-blur-xl p-12 text-center space-y-3.5 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-sm">
                  <Ghost className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">No Ghost Records Available Yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  As soon as other students solve coding problems, their authentic accepted runs will appear here for speedrun racing!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialGhostRunners.map((ghost) => (
                  <GhostRunnerCard key={ghost.submissionId} ghost={ghost} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: 1-CLICK FRIEND INVITE ────────────────────────────── */}
        {activeTab === "INVITE" && (
          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-teal-500/5 via-card/90 to-card backdrop-blur-xl p-8 max-w-2xl mx-auto text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
              <Share2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Challenge a Friend Directly
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Generate a private 1v1 battle link and share it on WhatsApp or Telegram. When your friend opens the link, both of you start simultaneously after a synchronized 3-second countdown!
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-3 text-left border-t border-b border-border/60 py-4">
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-teal-500" />
                  Instant Match
                </span>
                <p className="text-[11px] text-muted-foreground">Zero waiting queue. 1-click WhatsApp launch.</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Fair Play
                </span>
                <p className="text-[11px] text-muted-foreground">Live tab-switch detection &amp; sync countdown.</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  XP Rewards
                </span>
                <p className="text-[11px] text-muted-foreground">Winner claims full base XP + streak score.</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 hover:from-teal-400 hover:via-cyan-400 hover:to-teal-500 text-white font-black text-sm transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Generate WhatsApp / Telegram Invite</span>
            </button>
          </div>
        )}

        {/* ─── TAB 4: HAPPY HOUR INFO ──────────────────────────────────── */}
        {activeTab === "HAPPY_HOUR" && (
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card/90 to-card backdrop-blur-xl p-8 max-w-2xl mx-auto space-y-5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">Daily 2x XP Duel Rush</h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                  Strictly 9:00 PM to 9:30 PM Indian Standard Time (IST)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed border-t border-b border-border/80 py-4">
              <p>
                ⚡ <strong className="text-foreground">Instant Matchmaking:</strong> Every night at 9 PM IST, all active students enter the arena at once. Our rapid queue pairs you within 5-10 seconds.
              </p>
              <p>
                💰 <strong className="text-foreground">2x Double XP:</strong> Victories achieved during the 30-minute rush window award double base XP + streak bonuses.
              </p>
              <p>
                🛡️ <strong className="text-foreground">Fair Play:</strong> Live tab-blur tracking and server-authoritative clocks protect match integrity.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-card border border-border/80">
              <span className="text-muted-foreground font-semibold">Next Rush Window:</span>
              <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">{happyHour.formattedNext}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userXp={stats.totalXp}
      />
    </div>
  )
}
