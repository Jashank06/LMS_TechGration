"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  Trophy,
  Zap,
  Flame,
  CheckCircle2,
  Target,
  Bookmark,
  Code,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react"
import { TOPIC_LABELS } from "@/lib/arena-constants"
import { DifficultyBadge } from "./difficulty-badge"
import { cn } from "@/lib/utils"

interface StudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  stats: {
    totalXp: number
    currentStreak: number
    longestStreak?: number
    totalSolved: number
    accuracy: number
    solvedByDifficulty?: { EASY: number; MEDIUM: number; HARD: number }
    totalByDifficulty?: { EASY?: number; MEDIUM?: number; HARD?: number }
    topicProgress?: Record<string, number>
  }
  bookmarkedProblems?: Array<{
    id: string
    slug: string
    title: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    topics: string[]
    isSolved: boolean
  }>
}

export function StudentCodingProfileModal({
  isOpen,
  onClose,
  stats,
  bookmarkedProblems = [],
}: StudentProfileModalProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "bookmarks">("overview")

  if (!isOpen) return null

  const easySolved = stats.solvedByDifficulty?.EASY || 0
  const easyTotal = stats.totalByDifficulty?.EASY || 35
  const medSolved = stats.solvedByDifficulty?.MEDIUM || 0
  const medTotal = stats.totalByDifficulty?.MEDIUM || 40
  const hardSolved = stats.solvedByDifficulty?.HARD || 0
  const hardTotal = stats.totalByDifficulty?.HARD || 25

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl text-foreground shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-brand-teal flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Coding Profile & Performance</h3>
                <p className="text-xs text-muted-foreground">Your verified DSA problem-solving statistics</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-6 pt-3 border-b border-border/60 gap-4 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "pb-2.5 border-b-2 transition-colors cursor-pointer",
                activeTab === "overview"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Mastery & Analytics
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={cn(
                "pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer",
                activeTab === "bookmarks"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarked ({bookmarkedProblems.length})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" ? (
              <>
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                      <Zap className="w-3.5 h-3.5" /> Total XP
                    </span>
                    <p className="text-xl font-black text-foreground">{stats.totalXp.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Global points</p>
                  </div>

                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-3.5 space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-500">
                      <Flame className="w-3.5 h-3.5" /> Streak
                    </span>
                    <p className="text-xl font-black text-foreground">{stats.currentStreak} Days</p>
                    <p className="text-[10px] text-muted-foreground">
                      Best: {stats.longestStreak || stats.currentStreak} days
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                    </span>
                    <p className="text-xl font-black text-foreground">{stats.totalSolved}</p>
                    <p className="text-[10px] text-muted-foreground">Questions passed</p>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-500">
                      <Target className="w-3.5 h-3.5" /> Accuracy
                    </span>
                    <p className="text-xl font-black text-foreground">{stats.accuracy}%</p>
                    <p className="text-[10px] text-muted-foreground">Acceptance rate</p>
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Difficulty Distribution
                  </h4>

                  <div className="space-y-3">
                    {/* Easy */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-500 font-bold">Easy</span>
                        <span className="text-foreground">
                          {easySolved} / {easyTotal}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({Math.round((easySolved / (easyTotal || 1)) * 100)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (easySolved / (easyTotal || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-500 font-bold">Medium</span>
                        <span className="text-foreground">
                          {medSolved} / {medTotal}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({Math.round((medSolved / (medTotal || 1)) * 100)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (medSolved / (medTotal || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Hard */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-rose-500 font-bold">Hard</span>
                        <span className="text-foreground">
                          {hardSolved} / {hardTotal}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({Math.round((hardSolved / (hardTotal || 1)) * 100)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, (hardSolved / (hardTotal || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topic Progress Breakdown */}
                {stats.topicProgress && Object.keys(stats.topicProgress).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Topic Progress
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(stats.topicProgress)
                        .sort((a, b) => b[1] - a[1])
                        .map(([topic, count]) => (
                          <div
                            key={topic}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs"
                          >
                            <span className="text-muted-foreground truncate">{TOPIC_LABELS[topic] || topic}</span>
                            <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded ml-2">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Bookmarks Tab */
              <div className="space-y-3">
                {bookmarkedProblems.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground space-y-2">
                    <Bookmark className="w-8 h-8 mx-auto text-muted-foreground/40" />
                    <p className="text-sm font-semibold">No Bookmarks Saved</p>
                    <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                      Click the star icon while solving any problem to pin it here for revision.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 rounded-2xl border border-border/80 overflow-hidden bg-card">
                    {bookmarkedProblems.map((prob) => (
                      <Link
                        key={prob.id}
                        href={`/student/arena/${prob.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3.5 hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prob.isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Code className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground group-hover:text-brand-teal truncate">
                              {prob.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {prob.topics.slice(0, 2).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                                >
                                  {TOPIC_LABELS[t] || t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <DifficultyBadge difficulty={prob.difficulty} />
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
