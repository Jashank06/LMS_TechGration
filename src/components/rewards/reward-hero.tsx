"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Trophy,
  Crown,
  Sparkles,
  Lock,
  Unlock,
  PackageCheck,
  Truck,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StudentRewardEligibility } from "@/server/services/rewards"

interface RewardHeroProps {
  eligibility: StudentRewardEligibility
  claimsCount: number
  simulatedChampion: boolean
  onToggleSimulate: () => void
  onTriggerConfetti: () => void
}

export function RewardHero({
  eligibility,
  claimsCount,
  simulatedChampion,
  onToggleSimulate,
  onTriggerConfetti,
}: RewardHeroProps) {
  const isChampion = eligibility.isChampion || simulatedChampion
  const courseName = eligibility.championCourse?.title || eligibility.courses[0]?.title || "Enrolled Course"

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 via-card/50 to-background backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl">
      {/* Dynamic Ambient Background Glows */}
      <div
        className={`pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          isChampion
            ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500"
            : "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600"
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-15 transition-all duration-700 ${
          isChampion ? "bg-amber-300" : "bg-cyan-400"
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Heading & Eligibility Status */}
        <div className="space-y-4 max-w-2xl">
          {/* Status Chip */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isChampion ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-lg shadow-amber-500/10"
              >
                <Crown className="w-4 h-4 animate-bounce text-amber-500" />
                <span>#1 Course Champion Unlocked</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </motion.div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked for Rank #1 Champion</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Free Official Merch</span>
            </div>

            {claimsCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{claimsCount} Item{claimsCount > 1 ? "s" : ""} Claimed</span>
              </div>
            )}
          </div>

          {/* Main Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
              TechGration <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Champion Swag Hub</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Exclusive premium developer merchandise & audio gear designed exclusively for our top-tier learners. Only students who hold the <strong className="text-foreground font-semibold">#1 Rank on the Course Leaderboard</strong> can select and claim their customized reward package.
            </p>
          </div>

          {/* Real Status Detail Box */}
          <div className="p-4 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Active Evaluation Course:
              </span>
              <span className="font-semibold text-foreground truncate max-w-[220px] sm:max-w-none">
                {courseName}
              </span>
            </div>

            {isChampion ? (
              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-border/40">
                <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Eligibility Verified:
                </span>
                <span className="font-bold text-amber-500">
                  Rank #1 Champion (Eligible to Claim Free Swag)
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-2 border-t border-border/40">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                  Your Current Standing:
                </span>
                <span className="font-medium text-foreground">
                  {eligibility.currentRank
                    ? `Rank #${eligibility.currentRank} (${eligibility.marksGap} marks behind #1)`
                    : "Waiting for first evaluated assignment or quiz"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Quick Actions & Preview Simulator */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 min-w-[240px]">
          <Link href="/student/leaderboard" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-2xl border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-xs sm:text-sm font-semibold transition-all"
            >
              <Trophy className="w-4 h-4 mr-2 text-amber-500" />
              <span>View Course Leaderboard</span>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
          </Link>

          {isChampion && (
            <Button
              onClick={onTriggerConfetti}
              variant="default"
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Celebrate Champion 🎊</span>
            </Button>
          )}

          {/* Demo / Simulation Mode Switch for Immediate Testing */}
          <div className="w-full p-3 rounded-2xl border border-dashed border-border/80 bg-muted/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">Demo / Testing Mode</span>
              <button
                type="button"
                onClick={onToggleSimulate}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  simulatedChampion
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {simulatedChampion ? "Simulating #1 (Active)" : "Simulate #1 Unlock"}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-tight">
              Test both the locked non-#1 state and the full unlocked claiming flow with address & tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
