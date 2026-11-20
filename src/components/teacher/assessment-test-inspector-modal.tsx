"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  Clock,
  BookOpen,
  RotateCcw,
  Sparkles,
  Save,
  Loader2,
  Check,
  AlertCircle,
  User,
  ExternalLink,
} from "lucide-react"

interface TestInspectorModalProps {
  assessmentId: string
  attemptId: string
  onClose: () => void
  onReattemptAllowed?: () => void
}

export function AssessmentTestInspectorModal({
  assessmentId,
  attemptId,
  onClose,
  onReattemptAllowed,
}: TestInspectorModalProps) {
  const [loading, setLoading] = React.useState(true)
  const [report, setReport] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<"mcq" | "coding">("mcq")
  const [mcqFilter, setMcqFilter] = React.useState<"all" | "incorrect" | "correct">("all")

  // State for mark adjustment
  const [codingMarksAdjustment, setCodingMarksAdjustment] = React.useState<number>(0)
  const [savingGrades, setSavingGrades] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  // Reattempt action state
  const [enablingReattempt, setEnablingReattempt] = React.useState(false)
  const [reattemptSuccessMsg, setReattemptSuccessMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/teacher/assessments/${assessmentId}/attempts/${attemptId}`)
        const json = await res.json()
        if (json.success && json.report) {
          setReport(json.report)
          setCodingMarksAdjustment(json.report.scores.codingMarks || 0)
        } else {
          setError(json.error || "Failed to load test report.")
        }
      } catch (err: any) {
        setError(err.message || "Failed to load attempt report.")
      } finally {
        setLoading(false)
      }
    }
    loadReport()
  }, [assessmentId, attemptId])

  const handleSaveGrades = async () => {
    if (!report) return
    setSavingGrades(true)
    setSaveSuccess(false)
    try {
      const res = await fetch(`/api/teacher/assessments/${assessmentId}/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codingMarks: codingMarksAdjustment,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setSaveSuccess(true)
        setReport((prev: any) => ({
          ...prev,
          scores: {
            ...prev.scores,
            codingMarks: json.updated.codingMarks,
            earnedMarks: json.updated.earnedMarks,
            scorePct: json.updated.scorePct,
          },
        }))
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Save grades error:", err)
    } finally {
      setSavingGrades(false)
    }
  }

  const handleAllowReattempt = async () => {
    if (!report) return
    if (!confirm(`Are you sure you want to authorize a reattempt for ${report.student.name}? The student will be allowed to retake this assessment.`)) {
      return
    }

    setEnablingReattempt(true)
    try {
      const res = await fetch(`/api/teacher/assessments/${assessmentId}/reattempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          allowReattempt: true,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setReattemptSuccessMsg(json.message)
        setReport((prev: any) => ({ ...prev, allowReattempt: true }))
        if (onReattemptAllowed) onReattemptAllowed()
      }
    } catch (err) {
      console.error("Allow reattempt error:", err)
    } finally {
      setEnablingReattempt(false)
    }
  }

  // Filtered MCQs
  const filteredQuestions = React.useMemo(() => {
    if (!report?.mcqQuestions) return []
    if (mcqFilter === "correct") {
      return report.mcqQuestions.filter((q: any) => q.isCorrect)
    }
    if (mcqFilter === "incorrect") {
      return report.mcqQuestions.filter((q: any) => !q.isCorrect)
    }
    return report.mcqQuestions
  }, [report, mcqFilter])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/80 bg-secondary/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-base shrink-0">
              {report?.student.name?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {report ? `${report.student.name}'s Test Report` : "Loading Test Report..."}
                </h3>
                {report && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    {report.student.email}
                  </span>
                )}
                {report?.allowReattempt && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Reattempt Authorized
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {report?.assessmentTitle} · {report?.courseTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            <p className="text-xs text-muted-foreground">Loading student diagnostic data...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <Button size="sm" onClick={onClose}>Close</Button>
          </div>
        ) : report ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Score Summary KPI Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Total Marks
                </span>
                <span className="text-xl font-black text-foreground">
                  {report.scores.earnedMarks} / {report.scores.totalMarks}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  {report.scores.scorePct}% Score
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Section A: MCQs
                </span>
                <span className="text-xl font-black text-brand-teal">
                  {report.scores.mcqMarks} / 40
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  1 Mark Each
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Section B: Coding
                </span>
                <span className="text-xl font-black text-purple-500">
                  {report.scores.codingMarks} / 10
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  2 Problems
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 text-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Status
                </span>
                <span
                  className={`text-sm font-black block mt-1 ${
                    report.scores.passed ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {report.scores.passed ? "PASSED 🎉" : "NEEDS REVIEW"}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {new Date(report.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Notification message if reattempt was just enabled */}
            {reattemptSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reattemptSuccessMsg}</span>
              </div>
            )}

            {/* Segmented Section Switcher */}
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 flex-wrap">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/60 border border-border/60">
                <button
                  onClick={() => setActiveTab("mcq")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "mcq"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Section A: 40 MCQs ({report.scores.mcqMarks}/40)
                </button>
                <button
                  onClick={() => setActiveTab("coding")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "coding"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Section B: Coding Solutions ({report.scores.codingMarks}/10)
                </button>
              </div>

              {activeTab === "mcq" && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-muted-foreground font-semibold">Filter:</span>
                  <button
                    onClick={() => setMcqFilter("all")}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      mcqFilter === "all" ? "bg-purple-600 text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    All ({report.mcqQuestions?.length || 0})
                  </button>
                  <button
                    onClick={() => setMcqFilter("incorrect")}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      mcqFilter === "incorrect"
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-red-500"
                    }`}
                  >
                    Incorrect ({report.mcqQuestions?.filter((q: any) => !q.isCorrect).length || 0})
                  </button>
                  <button
                    onClick={() => setMcqFilter("correct")}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      mcqFilter === "correct"
                        ? "bg-emerald-500 text-white"
                        : "bg-secondary text-emerald-500"
                    }`}
                  >
                    Correct ({report.mcqQuestions?.filter((q: any) => q.isCorrect).length || 0})
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: MCQ DIAGNOSTIC QUESTIONS */}
            {activeTab === "mcq" && (
              <div className="space-y-4">
                {filteredQuestions.map((q: any) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      q.isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                        : "border-red-500/30 bg-red-500/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            q.isCorrect ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        >
                          {q.isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </span>
                        <span className="font-bold text-xs text-foreground">
                          Q{q.position}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                            {q.topic}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-bold ${
                          q.isCorrect ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {q.isCorrect ? "+1 Mark" : "0 Marks"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-foreground mt-2.5">
                      {q.prompt}
                    </p>

                    {/* Options list */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt: any, optIdx: number) => {
                        const letter = String.fromCharCode(65 + optIdx)
                        const isStudentChoice = opt.isSelected
                        const isCorrectOption = opt.isCorrect

                        let borderStyle = "border-border/70 bg-secondary/20"
                        let badgeStyle = "bg-secondary text-muted-foreground"

                        if (isCorrectOption) {
                          borderStyle = "border-emerald-500/50 bg-emerald-500/10 font-bold"
                          badgeStyle = "bg-emerald-500 text-white"
                        } else if (isStudentChoice && !isCorrectOption) {
                          borderStyle = "border-red-500/50 bg-red-500/10 font-bold"
                          badgeStyle = "bg-red-500 text-white"
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${borderStyle}`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${badgeStyle}`}
                            >
                              {letter}
                            </span>
                            <span className="flex-1 text-[11px] leading-relaxed">
                              {opt.label}
                            </span>
                            {isStudentChoice && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-foreground/10 text-foreground shrink-0">
                                Student Pick
                              </span>
                            )}
                            {isCorrectOption && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border/60 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-foreground font-semibold">Teacher Explanation: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: CODING SOLUTIONS & TEST CASE REVIEW */}
            {activeTab === "coding" && (
              <div className="space-y-6">
                {/* Grade Adjustment Bar */}
                <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Teacher Marks Adjustment for Section B
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Review the student&apos;s Python code below and adjust marks (0 to 10 marks total).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Coding Marks:</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={codingMarksAdjustment}
                      onChange={(e) => setCodingMarksAdjustment(Math.min(10, Math.max(0, Number(e.target.value))))}
                      className="w-16 h-8 px-2 text-xs font-bold rounded-lg border border-border bg-card text-center"
                    />
                    <span className="text-xs text-muted-foreground">/ 10</span>
                    <Button
                      size="sm"
                      disabled={savingGrades}
                      onClick={handleSaveGrades}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 px-3 rounded-xl"
                    >
                      {savingGrades ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : saveSuccess ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Save className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>{saveSuccess ? "Saved!" : "Save"}</span>
                    </Button>
                  </div>
                </div>

                {/* Problems Display */}
                {report.codingResponses && report.codingResponses.length > 0 ? (
                  report.codingResponses.map((prob: any, idx: number) => (
                    <div
                      key={prob.problemSlug || idx}
                      className="p-5 rounded-2xl border border-border/80 bg-card/80 space-y-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
                            Problem {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-foreground">
                            {prob.title || prob.problemSlug}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          Max 5 Marks
                        </span>
                      </div>

                      {/* Student's Code */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Student Submitted Code (Python)
                        </span>
                        <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 max-h-60">
                          {prob.code || "# No code submitted"}
                        </pre>
                      </div>

                      {/* Student's Output */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Student Submitted Execution Output
                        </span>
                        <pre className="p-3.5 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800">
                          {prob.output || "# No output submitted"}
                        </pre>
                      </div>

                      {/* Official Model Solution */}
                      {prob.solutionCode && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                            Official Model Solution (For Teacher Reference)
                          </span>
                          <pre className="p-3.5 rounded-xl bg-purple-950/20 text-purple-300 font-mono text-xs overflow-x-auto border border-purple-500/30">
                            {typeof prob.solutionCode === "object"
                              ? prob.solutionCode?.python || JSON.stringify(prob.solutionCode)
                              : prob.solutionCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-dashed border-border">
                    No coding responses submitted for this attempt.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-secondary/30 flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={enablingReattempt || report?.allowReattempt}
            onClick={handleAllowReattempt}
            className={`text-xs font-bold h-9 px-4 rounded-xl ${
              report?.allowReattempt
                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 cursor-not-allowed"
                : "border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            {enablingReattempt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span>
              {report?.allowReattempt ? "Reattempt Already Enabled" : "Authorize Student Reattempt"}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold h-9 px-5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80"
          >
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  )
}
