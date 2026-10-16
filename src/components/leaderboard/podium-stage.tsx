"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Crown, FastForward } from "lucide-react"
import type { LeaderboardEntry } from "@/server/services/leaderboard"
import { RankAvatar } from "./rank-avatar"
import { CountUp } from "./count-up"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface PodiumStageProps {
  top: LeaderboardEntry[]
  courseTitle: string
  compact: boolean
  /** Play the sequenced 1st -> 2nd -> 3rd reveal. */
  intro: boolean
  onIntroDone: () => void
}

const THEMES = [
  {
    label: "1st",
    pillar: "from-yellow-200 via-amber-400 to-amber-600",
    ring: "ring-amber-300",
    glow: "0 0 70px rgba(251,191,36,0.55)",
    text: "text-amber-300",
  },
  {
    label: "2nd",
    pillar: "from-slate-100 via-slate-300 to-slate-500",
    ring: "ring-slate-300",
    glow: "0 0 50px rgba(203,213,225,0.35)",
    text: "text-slate-200",
  },
  {
    label: "3rd",
    pillar: "from-orange-200 via-orange-400 to-orange-700",
    ring: "ring-orange-300",
    glow: "0 0 50px rgba(251,146,60,0.4)",
    text: "text-orange-300",
  },
]

const BASE_HEIGHTS = [190, 150, 118]
const REVEAL_AT = [300, 1900, 2900]
const INTRO_END = 4000

// Deterministic floating particles (no Math.random -> no hydration mismatch)
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 8) % 96}%`,
  top: `${(i * 53 + 10) % 80}%`,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.4,
  duration: 3 + (i % 5) * 0.7,
}))

export function PodiumStage({ top, courseTitle, compact, intro, onIntroDone }: PodiumStageProps) {
  const reduced = useReducedMotion()
  const playIntro = intro && !reduced
  const [step, setStep] = React.useState(playIntro ? 0 : 3)
  const doneRef = React.useRef(false)

  const finish = React.useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onIntroDone()
  }, [onIntroDone])

  // Sequenced timeline: 1st -> 2nd -> 3rd -> compact board
  React.useEffect(() => {
    if (!playIntro) {
      finish()
      return
    }
    const timers = [
      ...REVEAL_AT.map((t, i) => setTimeout(() => setStep(i + 1), t)),
      setTimeout(finish, INTRO_END),
    ]
    return () => timers.forEach(clearTimeout)
  }, [playIntro, finish])

  const skip = React.useCallback(() => {
    setStep(3)
    finish()
  }, [finish])

  // Any key skips the intro
  React.useEffect(() => {
    if (!playIntro || doneRef.current) return
    const onKey = () => skip()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [playIntro, skip])

  // Gold confetti when #1 lands
  React.useEffect(() => {
    if (!playIntro || step !== 1) return
    let cancelled = false
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return
      const colors = ["#FDE68A", "#FBBF24", "#F59E0B", "#FFFFFF", "#00D6D6"]
      confetti({ particleCount: 90, spread: 80, startVelocity: 38, origin: { x: 0.5, y: 0.42 }, colors })
      setTimeout(() => {
        confetti({ particleCount: 40, angle: 60, spread: 60, origin: { x: 0.15, y: 0.6 }, colors })
        confetti({ particleCount: 40, angle: 120, spread: 60, origin: { x: 0.85, y: 0.6 }, colors })
      }, 350)
    })
    return () => {
      cancelled = true
    }
  }, [playIntro, step])

  const scale = compact ? 0.62 : 1
  const slots = top.slice(0, 3)
  const orderClass = ["order-2", "order-1", "order-3"]

  return (
    <motion.section
      aria-label={`Top performers in ${courseTitle}`}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0B1220] via-[#0E1729] to-[#070B14] shadow-2xl"
      initial={false}
      animate={{ minHeight: compact ? 300 : 500 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <ul className="sr-only">
        {slots.map((s) => (
          <li key={s.userId}>
            Rank {s.rank}: {s.displayName}, {s.totalMarks} marks
          </li>
        ))}
      </ul>

      {/* Ambient aurora */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[420px] rounded-full bg-amber-400/10 blur-[110px]" />
        <div className="absolute -bottom-24 -left-16 w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-[100px]" />
        <div className="absolute -bottom-24 -right-16 w-[320px] h-[320px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/60"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [0, -14, 0], opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Spotlight cone */}
      <motion.div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[560px] max-w-full h-full origin-top"
        style={{
          background:
            "linear-gradient(to bottom, rgba(253,230,138,0.20), rgba(253,230,138,0.05) 60%, transparent)",
          clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
        }}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: step >= 1 ? (compact ? 0.35 : 1) : 0, scaleY: step >= 1 ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between px-5 sm:px-8 pt-5">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/80">
            Course Champions
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight line-clamp-1">
            {courseTitle}
          </h2>
        </motion.div>

        {playIntro && !compact && (
          <button
            type="button"
            onClick={skip}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur transition-colors"
          >
            <FastForward className="w-3 h-3" />
            <span>Skip</span>
          </button>
        )}
      </div>

      {/* Podium */}
      <div className="relative z-10 flex items-end justify-center gap-2 sm:gap-6 px-4 pb-0 pt-6">
        {slots.map((entry, idx) => {
          const theme = THEMES[idx]
          const revealed = step >= idx + 1
          const pillarH = BASE_HEIGHTS[idx] * scale
          const avatarSize = (idx === 0 ? 92 : 70) * (compact ? 0.78 : 1)

          return (
            <div
              key={entry.userId}
              className={`flex flex-col items-center w-[30%] max-w-[190px] ${orderClass[idx]}`}
            >
              {/* Identity block rides on top of the rising pillar */}
              <motion.div
                className="relative flex flex-col items-center text-center pb-3"
                initial={{ opacity: 0, y: 50, scale: 0.7 }}
                animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 140, damping: 16, delay: revealed ? 0.25 : 0 }}
              >
                {idx === 0 && (
                  <motion.div
                    className="absolute -top-9 z-10 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                    initial={{ y: -70, opacity: 0, rotate: -18 }}
                    animate={
                      revealed
                        ? { y: [-70, 0, -4, 0], opacity: 1, rotate: [-18, 0, 0, 0] }
                        : { y: -70, opacity: 0 }
                    }
                    transition={{ duration: 0.9, delay: 0.55, ease: "easeOut" }}
                  >
                    <motion.div
                      animate={revealed ? { y: [0, -4, 0] } : undefined}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
                    >
                      <Crown className="w-8 h-8 fill-amber-300" />
                    </motion.div>
                  </motion.div>
                )}

                <div
                  className={`rounded-full ring-4 ${theme.ring} ring-offset-2 ring-offset-[#0B1220]`}
                  style={{ boxShadow: revealed ? theme.glow : "none", transition: "box-shadow 0.8s" }}
                >
                  <RankAvatar
                    name={entry.displayName}
                    src={entry.avatarUrl}
                    seed={entry.userId}
                    size={avatarSize}
                  />
                </div>

                <p className="mt-2 text-xs sm:text-sm font-bold text-white max-w-[130px] truncate">
                  {entry.displayName}
                </p>
                {entry.isSelf && (
                  <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-400/15 border border-cyan-400/30 rounded-full px-1.5 py-px">
                    You
                  </span>
                )}
                <p className={`mt-1 font-black tabular-nums leading-none ${theme.text} ${idx === 0 ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
                  <CountUp
                    value={entry.totalMarks}
                    animate={playIntro && revealed}
                    delay={450}
                    duration={1300}
                  />
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/50">
                  marks · {entry.accuracyPct}%
                </p>
              </motion.div>

              {/* Pillar */}
              <motion.div
                className={`relative w-full overflow-hidden rounded-t-2xl bg-gradient-to-b ${theme.pillar} flex items-start justify-center`}
                initial={{ height: 0 }}
                animate={{ height: revealed ? pillarH : 0 }}
                transition={
                  idx === 0
                    ? { type: "spring", stiffness: 90, damping: 14 }
                    : { duration: 0.8, ease: EASE }
                }
                style={{ boxShadow: revealed ? theme.glow : "none" }}
              >
                <span className="mt-2 text-3xl sm:text-5xl font-black text-white/85 drop-shadow-md select-none">
                  {entry.rank}
                </span>
                {revealed && playIntro && (
                  <motion.span
                    className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    initial={{ left: "-40%" }}
                    animate={{ left: "140%" }}
                    transition={{ duration: 1.1, delay: 0.7, ease: "easeInOut" }}
                  />
                )}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Floor glow */}
      <div className="relative z-10 h-1.5 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
    </motion.section>
  )
}
