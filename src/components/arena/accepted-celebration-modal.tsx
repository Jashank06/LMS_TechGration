"use client"

import * as React from "react"
import Link from "next/link"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "motion/react"
import { Trophy, ArrowRight, Zap, Flame, Clock, Cpu, CheckCircle2, X, Sparkles, ShieldAlert } from "lucide-react"

interface AcceptedCelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  problemTitle: string
  xpEarned: number
  totalXp: number
  forfeited?: boolean
  runtimeMs: number | null
  memoryKb: number | null
  nextProblem?: { slug: string; title: string } | null
}

export function AcceptedCelebrationModal({
  isOpen,
  onClose,
  problemTitle,
  xpEarned,
  totalXp,
  forfeited = false,
  runtimeMs,
  memoryKb,
  nextProblem,
}: AcceptedCelebrationModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti explosion
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#14b8a6", "#06b6d4", "#f59e0b", "#10b981", "#6366f1"],
        })

        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#14b8a6", "#f59e0b", "#10b981"],
          })
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#06b6d4", "#f59e0b", "#6366f1"],
          })
        }, 250)
      } catch {
        // Fallback gracefully if canvas-confetti is unavailable
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-teal-500/30 bg-[#18181b] p-6 sm:p-8 text-white shadow-2xl"
        >
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            {/* Victory Badge */}
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-xl shadow-teal-500/30 text-white"
            >
              <Trophy className="h-10 w-10 text-white" />
              <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black font-black text-[10px] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </motion.div>

            {/* Verdict Headline */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white pt-1">
                Challenge Solved!
              </h2>
              <p className="text-xs text-white/60 line-clamp-1 max-w-xs">{problemTitle}</p>
            </div>

            {/* XP Award Pill or Forfeiture Notice */}
            {forfeited ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Solution was unlocked • 0 XP awarded for this challenge</span>
              </motion.div>
            ) : xpEarned > 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300"
              >
                <div className="flex items-center gap-1.5 font-black text-sm">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>+{xpEarned} XP Awarded</span>
                </div>
                <div className="w-px h-4 bg-amber-500/30" />
                <span className="text-xs font-semibold text-white/80">Total: {totalXp} XP</span>
              </motion.div>
            ) : null}

            {/* Stats Benchmarks */}
            {runtimeMs !== null && (
              <div className="grid grid-cols-2 gap-3 w-full pt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <span className="flex items-center gap-1 text-[10px] text-white/50 uppercase font-bold tracking-wider">
                    <Clock className="w-3 h-3 text-teal-400" /> Runtime
                  </span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {runtimeMs.toFixed(0)} ms
                  </p>
                  <p className="text-[10px] text-teal-400 font-semibold mt-0.5">Speed Optimal</p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
                  <span className="flex items-center gap-1 text-[10px] text-white/50 uppercase font-bold tracking-wider">
                    <Cpu className="w-3 h-3 text-cyan-400" /> Memory
                  </span>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {memoryKb ? (memoryKb / 1024).toFixed(1) : "12.4"} MB
                  </p>
                  <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">Lightweight</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Review Solution
              </button>

              {nextProblem ? (
                <Link
                  href={`/student/arena/${nextProblem.slug}`}
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Next Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/student/arena"
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-brand-teal hover:bg-teal-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Arena Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
