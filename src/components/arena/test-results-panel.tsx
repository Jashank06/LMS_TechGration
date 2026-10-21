"use client"

import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  AlertTriangle,
  Loader2,
  Terminal,
  Zap,
  Copy,
  Check,
  ChevronRight,
  Gauge,
  Flame,
  Bot,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

export interface RunTestResult {
  testCase: number
  passed: boolean
  verdict: string
  stdout: string | null
  stderr: string | null
  compileOutput: string | null
  expectedOutput: string
  input: string
  time: string | null
  memory: number | null
}

export interface RunResult {
  isCustomInput: false
  overallVerdict: string
  passedCount: number
  totalCount: number
  maxTimeMs: number | null
  maxMemoryKb: number | null
  results: RunTestResult[]
}

export interface CustomInputResult {
  isCustomInput: true
  stdout: string
  stderr: string
  compileOutput: string
  statusDescription: string
  verdict: string
  time: string | null
  memory: number | null
}

export interface SubmitResult {
  verdict: string
  passedTests: number
  totalTests: number
  maxTimeMs: number | null
  maxMemoryKb: number | null
  compileOutput: string | null
  errorOutput: string | null
  firstFailingTest: number | null
  runtimePercentile?: number | null
  memoryPercentile?: number | null
  xp: { awarded: boolean; amount: number; totalXp: number; forfeited?: boolean }
}

interface TestResultsPanelProps {
  runResult?: RunResult | CustomInputResult | null
  submitResult?: SubmitResult | null
  isLoading?: boolean
  error?: string | null
  onAskAiCoach?: (ctx?: any) => void
}

const verdictColors: Record<string, string> = {
  ACCEPTED: "text-emerald-500",
  WRONG_ANSWER: "text-rose-500",
  COMPILATION_ERROR: "text-amber-500",
  RUNTIME_ERROR: "text-orange-500",
  TIME_LIMIT_EXCEEDED: "text-purple-500",
  MEMORY_LIMIT_EXCEEDED: "text-blue-500",
  INTERNAL_ERROR: "text-red-500",
  PENDING: "text-muted-foreground",
}

const verdictLabels: Record<string, string> = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  COMPILATION_ERROR: "Compilation Error",
  RUNTIME_ERROR: "Runtime Error",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  INTERNAL_ERROR: "Internal Error",
  PENDING: "Pending",
}

export function TestResultsPanel({
  runResult,
  submitResult,
  isLoading,
  error,
  onAskAiCoach,
}: TestResultsPanelProps) {
  const [activeCaseIndex, setActiveCaseIndex] = React.useState<number>(0)
  const [copiedText, setCopiedText] = React.useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-white/70">
        <Loader2 className="w-7 h-7 animate-spin text-teal-400" />
        <div className="text-center">
          <p className="text-sm font-bold text-white">Sandboxing & Compiling Code...</p>
          <p className="text-xs text-white/50">Running test suite through native sandboxed engine</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider">Execution Notice</p>
          <p className="text-xs text-white/90 leading-relaxed font-mono">{error}</p>
        </div>
      </div>
    )
  }

  // ─── Case 1: Submit Result Mode ──────────────────────────────────
  if (submitResult) {
    const v = submitResult.verdict
    const isAc = v === "ACCEPTED"

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Main Verdict Card */}
        <div
          className={cn(
            "rounded-2xl p-4 sm:p-5 border relative overflow-hidden transition-all",
            isAc
              ? "bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/40"
              : "bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent border-rose-500/40"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                  isAc ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                )}
              >
                {isAc ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
              </div>

              <div>
                <h3 className={cn("text-xl font-black tracking-tight", verdictColors[v] || "text-white")}>
                  {verdictLabels[v] || v}
                </h3>
                <p className="text-xs text-white/70 font-medium mt-0.5">
                  {submitResult.passedTests} / {submitResult.totalTests} test cases passed
                </p>
              </div>
            </div>

            {/* Benchmark meters */}
            {submitResult.maxTimeMs !== null && (
              <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs">
                <div>
                  <div className="flex items-center gap-1 text-white/50 text-[10px]">
                    <Clock className="w-3 h-3 text-teal-400" /> Runtime
                  </div>
                  <p className="text-white font-mono font-bold">{submitResult.maxTimeMs.toFixed(0)} ms</p>
                  {submitResult.runtimePercentile !== undefined && submitResult.runtimePercentile !== null ? (
                    <p className="text-[10px] text-teal-400 font-semibold">Beats {submitResult.runtimePercentile}%</p>
                  ) : (
                    <p className="text-[10px] text-white/40 font-medium">Verified</p>
                  )}
                </div>

                <div className="w-px h-8 bg-white/10" />

                {submitResult.maxMemoryKb !== null && (
                  <div>
                    <div className="flex items-center gap-1 text-white/50 text-[10px]">
                      <Cpu className="w-3 h-3 text-cyan-400" /> Memory
                    </div>
                    <p className="text-white font-mono font-bold">
                      {(submitResult.maxMemoryKb / 1024).toFixed(1)} MB
                    </p>
                    {submitResult.memoryPercentile !== undefined && submitResult.memoryPercentile !== null ? (
                      <p className="text-[10px] text-cyan-400 font-semibold">Beats {submitResult.memoryPercentile}%</p>
                    ) : (
                      <p className="text-[10px] text-white/40 font-medium">Optimal</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* XP Banner */}
          {submitResult.xp.awarded && (
            <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>+{submitResult.xp.amount} XP Earned! Total Score: {submitResult.xp.totalXp} XP</span>
            </div>
          )}

          {submitResult.firstFailingTest && (
            <div className="mt-3 text-xs text-rose-300/90 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Failed on hidden test case #{submitResult.firstFailingTest}. Check edge cases, large inputs, or zero conditions!
            </div>
          )}

          {/* Ask AI Code Coach button on non-AC verdicts */}
          {!isAc && onAskAiCoach && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
              <p className="text-[11px] text-white/60">Stuck or failing tricky edge cases?</p>
              <button
                onClick={() =>
                  onAskAiCoach({
                    verdict: submitResult.verdict,
                    compileOutput: submitResult.compileOutput,
                    errorOutput: submitResult.errorOutput,
                    failingTest: submitResult.firstFailingTest,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <Bot className="w-3.5 h-3.5 text-teal-400" />
                <span>Ask AI Coach for Hint</span>
              </button>
            </div>
          )}
        </div>

        {/* Compile Output / Error Trace */}
        {submitResult.compileOutput && (
          <div className="rounded-xl border border-amber-500/30 bg-[#121214] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Compilation Log
              </span>
              <button
                onClick={() => handleCopy(submitResult.compileOutput!, "compile")}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {copiedText === "compile" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/50 font-mono text-xs text-amber-300/90 overflow-x-auto whitespace-pre max-h-48">
              {submitResult.compileOutput}
            </pre>
          </div>
        )}

        {submitResult.errorOutput && (
          <div className="rounded-xl border border-rose-500/30 bg-[#121214] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> Runtime Error Traceback
              </span>
              <button
                onClick={() => handleCopy(submitResult.errorOutput!, "error")}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {copiedText === "error" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/50 font-mono text-xs text-rose-300/90 overflow-x-auto whitespace-pre max-h-48">
              {submitResult.errorOutput}
            </pre>
          </div>
        )}
      </motion.div>
    )
  }

  // ─── Case 2: Custom Input Run Result ─────────────────────────────
  if (runResult && runResult.isCustomInput) {
    const r = runResult as CustomInputResult
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-teal-400" /> Custom Stdin Execution
          </span>
          {r.time && (
            <span className="text-xs text-white/50 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-teal-400" /> {r.time}s
            </span>
          )}
        </div>

        {r.compileOutput && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-amber-400">Compilation Output</p>
            <pre className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 overflow-x-auto">
              {r.compileOutput}
            </pre>
          </div>
        )}

        {r.stderr && (
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-rose-400">Standard Error (stderr)</p>
            <pre className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-mono text-rose-300 overflow-x-auto">
              {r.stderr}
            </pre>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-white/70">Standard Output (stdout)</p>
            <button
              onClick={() => handleCopy(r.stdout || "", "custom_stdout")}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              {copiedText === "custom_stdout" ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-[#121214] border border-white/10 text-xs font-mono text-white/95 overflow-x-auto min-h-[4rem] whitespace-pre">
            {r.stdout || "(program finished with no stdout output)"}
          </pre>
        </div>
      </motion.div>
    )
  }

  // ─── Case 3: Interactive Tabbed Sample Tests Runner ───────────────
  if (runResult && !runResult.isCustomInput) {
    const r = runResult as RunResult
    const isAllPassed = r.overallVerdict === "ACCEPTED"
    const currentCase = r.results[activeCaseIndex] || r.results[0]

    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* Overall Status Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isAllPassed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <span className={cn("text-sm font-black tracking-tight", isAllPassed ? "text-emerald-400" : "text-rose-400")}>
              {isAllPassed ? "All Sample Test Cases Passed" : `${r.passedCount} / ${r.totalCount} Passed`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {r.maxTimeMs !== null && (
              <span className="flex items-center gap-1 text-xs text-white/60 font-mono">
                <Clock className="w-3.5 h-3.5 text-teal-400" /> {r.maxTimeMs.toFixed(0)} ms
              </span>
            )}

            {!isAllPassed && onAskAiCoach && (
              <button
                onClick={() =>
                  onAskAiCoach({
                    verdict: r.overallVerdict,
                    testInput: currentCase?.input,
                    expectedOutput: currentCase?.expectedOutput,
                    actualOutput: currentCase?.stdout,
                    errorOutput: currentCase?.stderr,
                    compileOutput: currentCase?.compileOutput,
                  })
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <Bot className="w-3 h-3 text-teal-400" />
                <span>Ask AI Coach</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Tabs Header */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {r.results.map((tc, idx) => {
            const isActive = activeCaseIndex === idx
            return (
              <button
                key={tc.testCase}
                onClick={() => setActiveCaseIndex(idx)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer border",
                  isActive
                    ? "bg-white/15 text-white border-white/20 shadow-sm"
                    : "bg-white/5 hover:bg-white/10 text-white/60 border-transparent"
                )}
              >
                {tc.passed ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-xs shadow-rose-400" />
                )}
                <span>Case {tc.testCase}</span>
              </button>
            )
          })}
        </div>

        {/* Selected Test Case Inspection & Side-by-Side Diff */}
        {currentCase && (
          <div className="space-y-3 bg-[#121214] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Test Case #{currentCase.testCase}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    currentCase.passed
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  )}
                >
                  {verdictLabels[currentCase.verdict] || currentCase.verdict}
                </span>
              </div>

              {currentCase.time && (
                <span className="text-white/40 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" /> {parseFloat(currentCase.time) * 1000} ms
                </span>
              )}
            </div>

            {/* Input Block */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Input Stdin</span>
              <pre className="p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-white/90 overflow-x-auto whitespace-pre">
                {currentCase.input}
              </pre>
            </div>

            {/* Side-by-Side Visual Diff Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Expected Output */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <span>Expected Output</span>
                  <button
                    onClick={() => handleCopy(currentCase.expectedOutput, "exp")}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedText === "exp" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <pre className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/25 font-mono text-xs text-emerald-200 overflow-x-auto min-h-[3.5rem] whitespace-pre">
                  {currentCase.expectedOutput}
                </pre>
              </div>

              {/* Your Output */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className={currentCase.passed ? "text-emerald-400" : "text-rose-400"}>
                    Your Output {currentCase.passed ? "(Match)" : "(Discrepancy)"}
                  </span>
                  <button
                    onClick={() => handleCopy(currentCase.stdout || "", "act")}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedText === "act" ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <pre
                  className={cn(
                    "p-2.5 rounded-xl font-mono text-xs overflow-x-auto min-h-[3.5rem] whitespace-pre border",
                    currentCase.passed
                      ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                  )}
                >
                  {currentCase.stdout || "(no output)"}
                </pre>
              </div>
            </div>

            {/* Stderr if any */}
            {currentCase.stderr && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Stderr Trace</span>
                <pre className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 font-mono text-xs text-rose-300 overflow-x-auto whitespace-pre max-h-32">
                  {currentCase.stderr}
                </pre>
              </div>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  // Default Empty Prompt
  return (
    <div className="py-10 text-center text-white/50 space-y-2">
      <Terminal className="w-8 h-8 mx-auto text-white/30 mb-2" />
      <p className="text-sm font-semibold text-white/80">Compiler Terminal Ready</p>
      <p className="text-xs text-white/40 max-w-sm mx-auto">
        Press <span className="text-teal-400 font-mono font-bold">Run</span> (Ctrl+Enter) to test against sample cases, or{" "}
        <span className="text-orange-400 font-mono font-bold">Submit</span> to evaluate full hidden test cases.
      </p>
    </div>
  )
}
