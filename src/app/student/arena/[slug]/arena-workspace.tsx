"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  Play,
  Send,
  Lightbulb,
  BookOpen,
  Clock,
  Cpu,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Terminal,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Code as CodeIcon,
  HelpCircle,
  Zap,
  Star,
  Lock,
  Unlock,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { DifficultyBadge } from "@/components/arena/difficulty-badge"
import { TestResultsPanel } from "@/components/arena/test-results-panel"
import { SubmissionHistory } from "@/components/arena/submission-history"
import { McqQuestionView } from "@/components/arena/mcq-question-view"
import { AcceptedCelebrationModal } from "@/components/arena/accepted-celebration-modal"
import { TOPIC_LABELS, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/arena-constants"
import { cn } from "@/lib/utils"

// Dynamic import Monaco to avoid SSR issues
const CodeEditor = dynamic(
  () => import("@/components/arena/code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-[#1e1e1e] rounded-xl flex items-center justify-center text-white/40 text-sm">
        Loading editor...
      </div>
    ),
  }
)

interface SampleTest {
  id: string
  input: string
  expectedOutput: string
  explanation: string | null
  position: number
}

interface ProblemData {
  id: string
  slug: string
  title: string
  statement: string
  type?: "CODING" | "MCQ"
  stage?: number
  stageTitle?: string | null
  mcqOptions?: any
  difficulty: "EASY" | "MEDIUM" | "HARD"
  topics: string[]
  hints: string[]
  editorial: string | null
  solutionCode?: Record<string, string> | null
  timeLimitMs: number
  memoryLimitKb: number
  starterCode: Record<string, string>
  xpReward: number
  acceptedCount: number
  submissionCount: number
  isDailyChallenge: boolean
  sampleTests: SampleTest[]
  totalTestCases: number
}

interface ProgressData {
  isSolved: boolean
  xpAwarded: number
  attemptCount: number
  solvedAt: string | null
  lastCode?: string | null
  lastLanguage?: string | null
  isBookmarked?: boolean
  isSolutionUnlocked?: boolean
}

interface SubmissionData {
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

export interface StageSiblingProblem {
  id: string
  slug: string
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  type?: "CODING" | "MCQ"
  position: number
  xpReward: number
  isSolved: boolean
}

interface ArenaWorkspaceProps {
  problem: ProblemData
  stageProblems?: StageSiblingProblem[]
  prevProblem?: { slug: string; title: string } | null
  nextProblem?: { slug: string; title: string } | null
  progress: ProgressData | null
  recentSubmissions: SubmissionData[]
}

type BottomTab = "testcases" | "results" | "submissions"

export function ArenaWorkspace({
  problem,
  stageProblems = [],
  prevProblem,
  nextProblem,
  progress,
  recentSubmissions: initialSubmissions,
}: ArenaWorkspaceProps) {
  const [language, setLanguage] = React.useState<SupportedLanguage>("python")
  const [code, setCode] = React.useState(problem.starterCode?.["python"] || "")
  const [customInput, setCustomInput] = React.useState("")
  const [useCustomInput, setUseCustomInput] = React.useState(false)
  const [isRunning, setIsRunning] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [runResult, setRunResult] = React.useState<any>(null)
  const [submitResult, setSubmitResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [bottomTab, setBottomTab] = React.useState<BottomTab>("testcases")
  const [showConsole, setShowConsole] = React.useState(false)
  const [showCurriculumDrawer, setShowCurriculumDrawer] = React.useState(false)
  const [showHints, setShowHints] = React.useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(45) // percentage
  const [isSolvedLocal, setIsSolvedLocal] = React.useState(progress?.isSolved || false)
  const [recentSubmissions, setRecentSubmissions] = React.useState(initialSubmissions)
  const [isBookmarked, setIsBookmarked] = React.useState(progress?.isBookmarked || false)
  const [showCelebration, setShowCelebration] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved">("saved")

  // Solution tab & unlock states
  const [activeLeftTab, setActiveLeftTab] = React.useState<"description" | "solution">("description")
  const [isSolutionUnlocked, setIsSolutionUnlocked] = React.useState(progress?.isSolutionUnlocked || false)
  const [solutionEditorial, setSolutionEditorial] = React.useState<string | null>(problem.editorial || null)
  const [solutionCode, setSolutionCode] = React.useState<Record<string, string> | null>(problem.solutionCode || null)
  const [showUnlockModal, setShowUnlockModal] = React.useState(false)
  const [isUnlocking, setIsUnlocking] = React.useState(false)
  const [solutionCopied, setSolutionCopied] = React.useState(false)
  const [selectedSolutionLang, setSelectedSolutionLang] = React.useState<string>("python")

  // Unlock Solution handler
  const handleUnlockSolution = async () => {
    setIsUnlocking(true)
    try {
      const res = await fetch("/api/student/arena/unlock-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug: problem.slug }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsSolutionUnlocked(true)
        if (data.editorial) setSolutionEditorial(data.editorial)
        if (data.solutionCode) setSolutionCode(data.solutionCode)
        setShowUnlockModal(false)
        setActiveLeftTab("solution")
      }
    } catch (err) {
      console.error("Unlock solution error:", err)
    } finally {
      setIsUnlocking(false)
    }
  }

  const isMcq = problem.type === "MCQ"

  // Toggle problem bookmark
  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked
    setIsBookmarked(nextState)
    try {
      const res = await fetch("/api/student/arena/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug: problem.slug }),
      })
      if (!res.ok) {
        setIsBookmarked(!nextState)
      }
    } catch {
      setIsBookmarked(!nextState)
    }
  }

  // Auto-save code draft debounced (every 2.5s of inactivity)
  React.useEffect(() => {
    if (isMcq || !code) return
    setSaveStatus("unsaved")

    const timer = setTimeout(async () => {
      try {
        setSaveStatus("saving")
        const res = await fetch("/api/student/arena/save-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemSlug: problem.slug,
            code,
            language,
          }),
        })
        if (res.ok) {
          setSaveStatus("saved")
        } else {
          setSaveStatus("unsaved")
        }
      } catch {
        setSaveStatus("unsaved")
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [code, language, problem.slug, isMcq])

  // Manual save trigger (Ctrl+S / Cmd+S)
  const handleManualSave = async () => {
    if (isMcq || !code) return
    try {
      setSaveStatus("saving")
      const res = await fetch("/api/student/arena/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: problem.slug,
          code,
          language,
        }),
      })
      if (res.ok) {
        setSaveStatus("saved")
      } else {
        setSaveStatus("unsaved")
      }
    } catch {
      setSaveStatus("unsaved")
    }
  }

  // Load past submission code into the active editor
  const handleLoadCode = (newCode: string, newLang: string) => {
    if (newLang && SUPPORTED_LANGUAGES.includes(newLang as any)) {
      setLanguage(newLang as SupportedLanguage)
    }
    setCode(newCode)
    setSaveStatus("unsaved")
  }

  // Drag resize handler for split view
  const isDragging = React.useRef(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((ev.clientX - rect.left) / rect.width) * 100
      setLeftPanelWidth(Math.min(70, Math.max(25, pct)))
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [])

  const handleRun = async () => {
    setIsRunning(true)
    setError(null)
    setRunResult(null)
    setSubmitResult(null)
    setBottomTab("results")
    setShowConsole(true)

    try {
      const res = await fetch("/api/student/arena/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: problem.slug,
          code,
          language,
          ...(useCustomInput ? { customInput } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to run code")
        return
      }

      setRunResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    setRunResult(null)
    setSubmitResult(null)
    setBottomTab("results")
    setShowConsole(true)

    try {
      const res = await fetch("/api/student/arena/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: problem.slug,
          code,
          language,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit code")
        return
      }

      setSubmitResult(data)
      if (data.verdict === "ACCEPTED") {
        setIsSolvedLocal(true)
        setShowCelebration(true)
      }

      // Add to recent submissions
      if (data.submissionId) {
        setRecentSubmissions((prev) => [
          {
            id: data.submissionId,
            language,
            verdict: data.verdict,
            passedTests: data.passedTests,
            totalTests: data.totalTests,
            executionTimeMs: data.maxTimeMs,
            memoryUsedKb: data.maxMemoryKb,
            submittedAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const acceptanceRate =
    problem.submissionCount > 0
      ? Math.round((problem.acceptedCount / problem.submissionCount) * 100)
      : 0

  const stageSolvedCount = stageProblems.filter((p) => p.isSolved || (p.slug === problem.slug && isSolvedLocal)).length
  const stageTotalCount = stageProblems.length
  const stagePct = stageTotalCount > 0 ? Math.round((stageSolvedCount / stageTotalCount) * 100) : 0

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background select-none text-foreground">
      {/* ─── Top Bar (Coding Ninjas Style) ────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/80 bg-card/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/student/arena"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            title="Back to Arena"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Curriculum drawer toggle */}
          {stageProblems.length > 0 && (
            <button
              onClick={() => setShowCurriculumDrawer(!showCurriculumDrawer)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0",
                showCurriculumDrawer
                  ? "bg-teal-500/15 text-brand-teal border-teal-500/40"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
              )}
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Curriculum</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-brand-teal font-extrabold">
                {stageSolvedCount}/{stageTotalCount}
              </span>
            </button>
          )}

          {/* Title & Stage breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground hidden lg:inline truncate">
              {problem.stageTitle || `Stage ${problem.stage || 1}`}
            </span>
            <span className="text-muted-foreground/40 hidden lg:inline">/</span>
            <h1 className="text-sm font-bold text-foreground truncate">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} size="sm" />
            {isSolvedLocal && (
              <span className="flex items-center gap-1 text-xs text-emerald-500 font-semibold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved
              </span>
            )}
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bookmark Star Button */}
          <button
            onClick={handleToggleBookmark}
            className={cn(
              "p-1.5 rounded-xl border transition-all cursor-pointer",
              isBookmarked
                ? "bg-amber-500/15 text-amber-500 border-amber-500/40"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border-border/80"
            )}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
          >
            <Star className={cn("w-4 h-4", isBookmarked && "fill-amber-400 text-amber-400")} />
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <Zap className="w-3 h-3" />
            +{problem.xpReward} XP
          </span>

          {!isMcq && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? "Running..." : "Run"}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-teal hover:bg-brand-teal/90 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-md shadow-brand-teal/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Main Content (Split view or MCQ) ─────────────────────── */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* In-Workspace Curriculum Slide-out Drawer */}
        <AnimatePresence>
          {showCurriculumDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCurriculumDrawer(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
              />

              {/* Drawer Container */}
              <motion.aside
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="absolute inset-y-0 left-0 z-40 w-80 sm:w-96 bg-card border-r border-border shadow-2xl flex flex-col justify-between"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider">
                      Module Navigator
                    </span>
                    <h2 className="text-sm font-bold text-foreground truncate mt-0.5">
                      {problem.stageTitle || `Stage ${problem.stage || 1}`}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCurriculumDrawer(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stage Progress Bar inside drawer */}
                <div className="px-4 py-3 bg-muted/40 border-b border-border/60">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-muted-foreground">Module Progress</span>
                    <span className="text-brand-teal font-bold">{stagePct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                      style={{ width: `${stagePct}%` }}
                    />
                  </div>
                </div>

                {/* List of problems in this stage */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2 space-y-1">
                  {stageProblems.map((p) => {
                    const isCurrent = p.slug === problem.slug
                    const isSolvedItem = p.isSolved || (isCurrent && isSolvedLocal)
                    const isMcqItem = p.type === "MCQ"

                    return (
                      <Link
                        key={p.id}
                        href={`/student/arena/${p.slug}`}
                        onClick={() => setShowCurriculumDrawer(false)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl text-xs font-medium transition-all group",
                          isCurrent
                            ? "bg-teal-500/15 text-foreground border border-teal-500/40 font-semibold"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {/* Solved check */}
                        <div className="shrink-0">
                          {isSolvedItem ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Icon */}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-mono",
                            isMcqItem
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-teal-500/10 text-brand-teal"
                          )}
                        >
                          {isMcqItem ? <HelpCircle className="w-3.5 h-3.5" /> : <CodeIcon className="w-3.5 h-3.5" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="truncate leading-tight">{p.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                            <span>{p.difficulty}</span>
                            <span>•</span>
                            <span className="text-amber-500">+{p.xpReward} XP</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] font-bold text-brand-teal bg-teal-500/15 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ─── Center View: MCQ vs Coding ─────────────────────────── */}
        {isMcq ? (
          <div className="flex-1 flex flex-col overflow-y-auto bg-background">
            <McqQuestionView
              problem={problem}
              isSolvedInitially={isSolvedLocal}
              onSubmitted={(res) => {
                if (res.isCorrect) setIsSolvedLocal(true)
              }}
              onNext={
                nextProblem
                  ? () => {
                      window.location.href = `/student/arena/${nextProblem.slug}`
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          /* Split View for Coding Questions */
          <div ref={containerRef} className="flex flex-1 min-h-0 relative">
            {/* Left panel — problem statement & hints OR Solution tab */}
            <div
              className="flex flex-col border-r border-border/80 bg-card/40 min-h-0 overflow-hidden"
              style={{ width: `${leftPanelWidth}%` }}
            >
              {/* Header Tabs: Description vs Solution 🔒 */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/80 bg-card/80 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveLeftTab("description")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      activeLeftTab === "description"
                        ? "bg-foreground text-background font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Description</span>
                  </button>

                  <button
                    onClick={() => setActiveLeftTab("solution")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      activeLeftTab === "solution"
                        ? "bg-foreground text-background font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {isSolvedLocal || isSolutionUnlocked ? (
                      <Unlock className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    <span>Solution</span>
                    {!isSolvedLocal && !isSolutionUnlocked && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-500 font-bold ml-0.5">
                        Locked
                      </span>
                    )}
                  </button>
                </div>

                {/* Status indicator on tab right */}
                {isSolvedLocal ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                ) : isSolutionUnlocked ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Forfeited (0 XP)
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Lock className="w-3 h-3 text-amber-500" /> Locked Solution
                  </span>
                )}
              </div>

              {/* Scrollable Tab Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {activeLeftTab === "description" ? (
                  <>
                    {/* Meta info */}
                    <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {problem.timeLimitMs}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> {(problem.memoryLimitKb / 1024).toFixed(0)} MB
                      </span>
                      <span>{acceptanceRate}% acceptance</span>
                      <span>{problem.totalTestCases} test cases</span>
                    </div>

                    {/* Topics */}
                    <div className="flex gap-1.5 flex-wrap">
                      {problem.topics.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium"
                        >
                          {TOPIC_LABELS[t] || t}
                        </span>
                      ))}
                    </div>

                    {/* Statement */}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: formatStatement(problem.statement) }} />
                    </div>

                    {/* Sample tests */}
                    {problem.sampleTests.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Examples</h3>
                        {problem.sampleTests.map((tc, i) => (
                          <div
                            key={tc.id}
                            className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2 text-xs"
                          >
                            <p className="font-semibold text-muted-foreground">Example {i + 1}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <p className="text-muted-foreground text-[10px] mb-0.5 font-medium">Input:</p>
                                <pre className="p-2 rounded-lg bg-muted font-mono text-[11px] overflow-x-auto">
                                  {tc.input}
                                </pre>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-[10px] mb-0.5 font-medium">Output:</p>
                                <pre className="p-2 rounded-lg bg-muted font-mono text-[11px] overflow-x-auto">
                                  {tc.expectedOutput}
                                </pre>
                              </div>
                            </div>
                            {tc.explanation && (
                              <p className="text-muted-foreground text-[11px]">
                                <strong>Explanation:</strong> {tc.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hints */}
                    {problem.hints.length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowHints(!showHints)}
                          className="flex items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-4 h-4" />
                          Hints ({problem.hints.length})
                          {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {showHints && (
                          <div className="mt-2 space-y-2">
                            {problem.hints.map((h, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-foreground"
                              >
                                <span className="font-semibold text-amber-500">Hint {i + 1}:</span> {h}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* Solution Tab */
                  <div className="space-y-4">
                    {!isSolvedLocal && !isSolutionUnlocked ? (
                      /* Locked State Card */
                      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card to-card p-6 text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                          <Lock className="w-7 h-7" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-foreground">Official Solution is Locked</h3>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            Solve this challenge independently to earn{" "}
                            <span className="text-amber-500 font-bold">+{problem.xpReward} XP</span> and build genuine
                            problem-solving skills!
                          </p>
                        </div>

                        {/* Critical Forfeiture Warning */}
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-left space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                            <span>Important XP Forfeiture Warning:</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] leading-relaxed pl-5">
                            If you unlock the solution, you will{" "}
                            <strong className="text-foreground">permanently forfeit all XP (+{problem.xpReward} XP)</strong>{" "}
                            for this question. Even if you submit an accepted code later, 0 XP will be added to your score.
                          </p>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                          <button
                            onClick={() => setShowUnlockModal(true)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                          >
                            Unlock Solution (Forfeit XP)
                          </button>
                          <button
                            onClick={() => setActiveLeftTab("description")}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Keep Trying
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Unlocked Solution View */
                      <div className="space-y-4">
                        {/* Status banner */}
                        {isSolvedLocal ? (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Official Solution Unlocked — Challenge Solved! (+{problem.xpReward} XP Earned)</span>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>Solution Unlocked — Points Forfeited (0 XP will be awarded for this problem)</span>
                          </div>
                        )}

                        {/* Approach & Explanation */}
                        {solutionEditorial ? (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Approach & Logic Explanation
                            </h4>
                            <div className="p-4 rounded-2xl bg-card border border-border/80 text-xs leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                              <div dangerouslySetInnerHTML={{ __html: formatStatement(solutionEditorial) }} />
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No written editorial is provided for this problem.</p>
                        )}

                        {/* Reference Solution Code if available */}
                        {solutionCode && Object.keys(solutionCode).length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Reference Implementation
                              </h4>

                              {/* Language selector for solution */}
                              <div className="flex items-center gap-1.5">
                                {Object.keys(solutionCode).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => setSelectedSolutionLang(lang)}
                                    className={cn(
                                      "px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer",
                                      selectedSolutionLang === lang
                                        ? "bg-foreground text-background font-bold"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {solutionCode[selectedSolutionLang] ? (
                              <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-[#121214]">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-[#18181b] border-b border-white/10 text-[11px] text-white/60">
                                  <span>{selectedSolutionLang} solution</span>
                                  <button
                                    onClick={async () => {
                                      await navigator.clipboard.writeText(solutionCode[selectedSolutionLang] || "")
                                      setSolutionCopied(true)
                                      setTimeout(() => setSolutionCopied(false), 2000)
                                    }}
                                    className="flex items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer"
                                  >
                                    {solutionCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    <span>{solutionCopied ? "Copied" : "Copy"}</span>
                                  </button>
                                </div>
                                <pre className="p-3 text-xs font-mono text-white/90 overflow-x-auto whitespace-pre">
                                  {solutionCode[selectedSolutionLang]}
                                </pre>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Drag handle */}
            <div
              onMouseDown={handleMouseDown}
              className="w-1.5 cursor-col-resize bg-border/60 hover:bg-teal-500/50 transition-colors shrink-0 hidden md:block"
            />

            {/* Right panel — editor + console drawer */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#1e1e1e]">
              {/* Code editor */}
              <div className="flex-1 min-h-0 p-1">
                <CodeEditor
                  language={language}
                  onLanguageChange={setLanguage}
                  code={code}
                  onCodeChange={setCode}
                  starterCode={problem.starterCode}
                  problemSlug={problem.slug}
                  initialDraftCode={progress?.lastCode}
                  initialDraftLanguage={progress?.lastLanguage}
                  saveStatus={saveStatus}
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                  onManualSave={handleManualSave}
                />
              </div>

              {/* Bottom collapsible console drawer */}
              {showConsole && (
                <div className="shrink-0 border-t border-white/10 max-h-[45%] min-h-[190px] flex flex-col bg-[#18181b] text-white">
                  {/* Tabs header */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#252526]">
                    <div className="flex items-center gap-1">
                      {(["testcases", "results", "submissions"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setBottomTab(tab)}
                          className={cn(
                            "px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
                            bottomTab === tab
                              ? "bg-white/20 text-white font-bold"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {tab === "testcases" ? "Test Cases" : tab === "results" ? "Results" : "Submissions"}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {bottomTab === "testcases" && (
                        <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useCustomInput}
                            onChange={(e) => setUseCustomInput(e.target.checked)}
                            className="rounded"
                          />
                          Custom Input
                        </label>
                      )}
                      <button
                        onClick={() => setShowConsole(false)}
                        className="p-1 rounded text-white/60 hover:text-white cursor-pointer"
                        title="Close Console"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto p-3">
                    {bottomTab === "testcases" &&
                      (useCustomInput ? (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-white/70 flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5" /> Custom Input Stdin
                          </label>
                          <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            className="w-full h-24 p-3 rounded-xl bg-[#1e1e1e] border border-white/10 text-xs font-mono text-white resize-none focus:outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="Type input here..."
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {problem.sampleTests.map((tc, i) => (
                            <div
                              key={tc.id}
                              className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-[11px]"
                            >
                              <p className="font-semibold text-white/60 mb-1">Case {i + 1}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-white/40 text-[10px]">Input</p>
                                  <pre className="p-1.5 rounded bg-[#1e1e1e] font-mono overflow-x-auto text-white/90">
                                    {tc.input}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-white/40 text-[10px]">Expected</p>
                                  <pre className="p-1.5 rounded bg-[#1e1e1e] font-mono overflow-x-auto text-white/90">
                                    {tc.expectedOutput}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                    {bottomTab === "results" && (
                      <TestResultsPanel
                        runResult={runResult}
                        submitResult={submitResult}
                        isLoading={isRunning || isSubmitting}
                        error={error}
                      />
                    )}

                    {bottomTab === "submissions" && (
                      <SubmissionHistory
                        submissions={recentSubmissions}
                        onLoadCode={handleLoadCode}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Persistent Bottom Bar (Coding Ninjas Screenshot 3) ──── */}
      <div className="h-13 px-4 border-t border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
        {/* Left: Previous Problem */}
        <div>
          {prevProblem ? (
            <Link
              href={`/student/arena/${prevProblem.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev: {prevProblem.title}</span>
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground/40 font-medium px-2">First problem</span>
          )}
        </div>

        {/* Center: Action Buttons for Coding */}
        {!isMcq ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Submit Code"}</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-medium hidden sm:block">
            Select an option above and click Submit MCQ
          </div>
        )}

        {/* Right: Console Toggle + Next Problem */}
        <div className="flex items-center gap-3">
          {!isMcq && (
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                showConsole
                  ? "bg-teal-500/15 text-brand-teal"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
              {showConsole ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}

          {nextProblem ? (
            <Link
              href={`/student/arena/${nextProblem.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-teal/15 text-brand-teal hover:bg-brand-teal hover:text-white transition-all cursor-pointer font-bold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="text-xs text-emerald-500 font-semibold px-2">Stage Complete!</span>
          )}
        </div>
      </div>

      {/* ─── Unlock Solution Confirmation Modal ───────────────────── */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-card p-6 text-foreground shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Unlock Solution & Forfeit XP?</h3>
                <p className="text-xs text-muted-foreground">Permanent action for this challenge</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              If you unlock the solution now, you will{" "}
              <strong className="text-rose-500">permanently receive 0 XP</strong> for this problem. You will not gain any points or streak bonuses even after submitting an accepted code.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
              💡 <strong>Tip:</strong> Have you checked all the <strong>Hints</strong> yet? Give it another try before forfeiting your points!
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnlockModal(false)}
                disabled={isUnlocking}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Keep Trying (Recommended)
              </button>
              <button
                onClick={handleUnlockSolution}
                disabled={isUnlocking}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                {isUnlocking ? "Unlocking..." : "Unlock Solution (Forfeit XP)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Accepted Solution Victory Celebration Modal ─────────── */}
      <AcceptedCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        problemTitle={problem.title}
        xpEarned={submitResult?.xp?.amount || (submitResult?.xp?.awarded ? problem.xpReward : 0)}
        totalXp={submitResult?.xp?.totalXp || 0}
        forfeited={Boolean(submitResult?.xp?.forfeited)}
        runtimeMs={submitResult?.maxTimeMs ?? null}
        memoryKb={submitResult?.maxMemoryKb ?? null}
        nextProblem={nextProblem}
      />
    </div>
  )
}

/** Simple markdown-ish formatting: convert newlines to <br/>, bold, code blocks */
function formatStatement(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /```(\w*)\n([\s\S]*?)```/g,
      '<pre class="p-3 rounded-lg bg-muted font-mono text-[11px] overflow-x-auto my-2"><code>$2</code></pre>'
    )
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted font-mono text-[11px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, "<br/>")
}
