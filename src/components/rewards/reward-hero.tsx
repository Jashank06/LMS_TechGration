"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Trophy,
  Crown,
  Sparkles,
  Lock,
  PackageCheck,
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
  simulatedChampion?: boolean
  onToggleSimulate?: () => void
  onTriggerConfetti: () => void
}

export function RewardHero({
  eligibility,
  claimsCount,
  simulatedChampion = false,
  onTriggerConfetti,
}: RewardHeroProps) {
  const isChampion = eligibility.isChampion || simulatedChampion
  const courseName = eligibility.championCourse?.title || eligibility.courses[0]?.title || "Enrolled Course"

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-gradient-to-b from-card/90 via-card/50 to-background backdrop-blur-xl px-5 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-5 shadow-lg">
      {/* Dynamic Ambient Background Glows */}
      <div
        className={`pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          isChampion
            ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500"
            : "bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600"
        }`}
      />
      <div
        className={`pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl opacity-15 transition-all duration-700 ${
          isChampion ? "bg-amber-300" : "bg-cyan-400"
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
        {/* Left Column: Heading & Eligibility Status */}
        <div className="space-y-2.5 max-w-3xl">
          {/* Status Chip */}
          <div className="flex flex-wrap items-center gap-2">
            {isChampion ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 animate-bounce text-amber-500" />
                <span>#1 Course Champion Unlocked</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </motion.div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked for Rank #1 Champion</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Free Official Merch</span>
            </div>

            {claimsCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{claimsCount} Item{claimsCount > 1 ? "s" : ""} Claimed</span>
              </div>
            )}
          </div>

          {/* Main Title & Description */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              TechGration <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Champion Swag Hub</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Exclusive premium developer merchandise & audio gear for top learners. Only students who hold the <strong className="text-foreground font-semibold">#1 Rank on the Course Leaderboard</strong> can claim their free reward package.
            </p>
          </div>

          {/* Real Status Detail Compact Bar */}
          <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3.5 py-1.5 rounded-xl border border-border/50 bg-background/60 backdrop-blur-md text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Active Course:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                {courseName}
              </span>
            </div>

            <div className="h-3 w-px bg-border/60 hidden sm:block" />

            {isChampion ? (
              <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Eligibility:</span>
                <span className="font-bold text-amber-500">
                  Rank #1 Champion (Eligible)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Standing:</span>
                <span className="font-medium text-foreground">
                  {eligibility.currentRank
                    ? `Rank #${eligibility.currentRank} (${eligibility.marksGap} marks behind #1)`
                    : "Waiting for first evaluated assignment or quiz"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-row lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
          <Link href="/student/leaderboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto rounded-xl border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-xs sm:text-sm font-semibold transition-all h-9 px-4"
            >
              <Trophy className="w-4 h-4 mr-2 text-amber-500" />
              <span>View Course Leaderboard</span>
              <ChevronRight className="w-4 h-4 ml-1.5 text-muted-foreground" />
            </Button>
          </Link>

          {isChampion && (
            <Button
              onClick={onTriggerConfetti}
              variant="default"
              size="sm"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm h-9 px-4 shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Celebrate Champion 🎊</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
