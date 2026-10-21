"use client"

import * as React from "react"
import { Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Copy, Check, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SubmissionItem {
  id: string
  language: string
  verdict: string
  passedTests: number
  totalTests: number
  executionTimeMs: number | null
  memoryUsedKb: number | null
  submittedAt: string
  code?: string
}

const verdictColors: Record<string, string> = {
  ACCEPTED: "text-emerald-500",
  WRONG_ANSWER: "text-rose-500",
  COMPILATION_ERROR: "text-amber-500",
  RUNTIME_ERROR: "text-orange-500",
  TIME_LIMIT_EXCEEDED: "text-purple-500",
  MEMORY_LIMIT_EXCEEDED: "text-blue-500",
  INTERNAL_ERROR: "text-red-500",
}

const verdictLabels: Record<string, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILATION_ERROR: "Compile Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "TLE",
  MEMORY_LIMIT_EXCEEDED: "MLE",
  INTERNAL_ERROR: "Error",
  PENDING: "Pending",
}

const languageLabels: Record<string, string> = {
  python: "Python 3",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
}

interface SubmissionHistoryProps {
  submissions: SubmissionItem[]
  onLoadCode?: (code: string, language: string) => void
}

export function SubmissionHistory({ submissions, onLoadCode }: SubmissionHistoryProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  if (submissions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-xs">
        <p>No submissions recorded yet for this problem.</p>
        <p className="mt-1 text-muted-foreground/60">Run and submit your solution to track performance over time.</p>
      </div>
    )
  }

  const handleCopy = async (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLoad = (code: string, language: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLoadCode) {
      onLoadCode(code, language)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Submission Logs ({submissions.length})</span>
        <span className="text-[10px] lowercase text-muted-foreground/60">Click any row to inspect & reload code</span>
      </div>

      <div className="space-y-1.5">
        {submissions.map((s) => {
          const isAc = s.verdict === "ACCEPTED"
          const isExpanded = expandedId === s.id

          return (
            <div
              key={s.id}
              className={cn(
                "rounded-xl border border-white/10 bg-white/5 transition-all overflow-hidden",
                isExpanded ? "ring-1 ring-teal-500/40" : "hover:bg-white/[0.08]"
              )}
            >
              {/* Header row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
                className="flex items-center gap-3 px-3 py-2.5 text-xs cursor-pointer select-none"
              >
                {isAc ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                )}

                <span className={cn("font-bold min-w-[85px]", verdictColors[s.verdict])}>
                  {verdictLabels[s.verdict] || s.verdict}
                </span>

                <span className="text-white/80 font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10">
                  {languageLabels[s.language] || s.language}
                </span>

                <span className="text-white/60 text-[11px]">
                  {s.passedTests}/{s.totalTests} passed
                </span>

                {s.executionTimeMs !== null && (
                  <span className="text-white/60 flex items-center gap-0.5 text-[11px] ml-auto">
                    <Clock className="w-3 h-3 text-teal-400" />
                    {s.executionTimeMs.toFixed(0)} ms
                  </span>
                )}

                <span className="text-white/40 text-[11px] hidden sm:inline">
                  {new Date(s.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <div className="text-white/50 pl-1">
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Expanded details & code block */}
              {isExpanded && (
                <div className="p-3 border-t border-white/10 bg-[#121214] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/60">Submitted Code:</span>

                    <div className="flex items-center gap-1.5">
                      {s.code && (
                        <button
                          onClick={(e) => handleCopy(s.code!, s.id, e)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {copiedId === s.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-white/70" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}

                      {s.code && onLoadCode && (
                        <button
                          onClick={(e) => handleLoad(s.code!, s.language, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500 hover:bg-teal-600 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Load into Editor</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {s.code ? (
                    <pre className="p-3 rounded-lg bg-[#18181b] border border-white/10 font-mono text-xs text-white/90 overflow-x-auto max-h-56 select-text whitespace-pre">
                      {s.code}
                    </pre>
                  ) : (
                    <p className="text-[11px] text-white/40 italic">Source code not available for this legacy record.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
