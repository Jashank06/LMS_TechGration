"use client"

import * as React from "react"
import { Sparkles, Bot, AlertCircle, RefreshCw, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface AiCoachPanelProps {
  problemSlug: string
  code: string
  language: string
  verdict?: string | null
  compileOutput?: string | null
  errorOutput?: string | null
  testInput?: string | null
  expectedOutput?: string | null
  actualOutput?: string | null
  isOpen: boolean
  onClose: () => void
}

export function AiCoachPanel({
  problemSlug,
  code,
  language,
  verdict,
  compileOutput,
  errorOutput,
  testInput,
  expectedOutput,
  actualOutput,
  isOpen,
  onClose,
}: AiCoachPanelProps) {
  const [loading, setLoading] = React.useState(false)
  const [advice, setAdvice] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAdvice = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/student/arena/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug,
          code,
          language,
          verdict,
          compileOutput,
          errorOutput,
          testInput,
          expectedOutput,
          actualOutput,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to consult Code Coach")
        return
      }

      setAdvice(data.coachReply)
    } catch {
      setError("Network connection issue. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (isOpen && !advice && !loading) {
      fetchAdvice()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg rounded-3xl border border-teal-500/30 bg-[#161618] text-white p-6 shadow-2xl overflow-hidden"
        >
          {/* Subtle Glow backdrop */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 bg-teal-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>AI Code Coach</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30">
                    Socratic Mode
                  </span>
                </h3>
                <p className="text-[11px] text-white/50">Guided hint assistance without code spoilers</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="py-4 min-h-[140px] text-xs leading-relaxed relative z-10">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-white/60">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
                <p className="text-xs font-medium">Analyzing your code structure & logic flow...</p>
              </div>
            ) : error ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-3 whitespace-pre-line text-white/90 font-sans">
                {advice}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
            <button
              onClick={fetchAdvice}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Ask Another Perspective</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Got it, let me fix it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
