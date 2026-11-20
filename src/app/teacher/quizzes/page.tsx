"use client"

import * as React from "react"
import Link from "next/link"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AssessmentTestInspectorModal } from "@/components/teacher/assessment-test-inspector-modal"
import {
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  Users,
  Award,
  Sparkles,
  Layers,
  Search,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Share2,
  FileText,
  Loader2,
  Code2,
} from "lucide-react"

interface TeacherQuizOverview {
  id: string
  courseId: string
  courseTitle: string
  title: string
  description: string | null
  timeLimitMinutes: number
  passingPct: number
  questionCount: number
  totalAttempts: number
  resultsPublished: boolean
  isPublished: boolean
}

interface StudentSubmissionItem {
  id: string
  attemptId: string
  assessmentId: string
  assessmentTitle: string
  courseId: string
  courseTitle: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAvatar?: string
  submittedAt: string
  mcqMarks: number
  codingMarks: number
  earnedMarks: number
  totalMarks: number
  scorePct: number
  passed: boolean
  allowReattempt: boolean
  resultsPublished: boolean
  status: string
}

export default function TeacherQuizzesPage() {
  const [activeMainTab, setActiveMainTab] = React.useState<"quizzes" | "submissions">("submissions")
  const [quizzes, setQuizzes] = React.useState<TeacherQuizOverview[]>([])
  const [submissions, setSubmissions] = React.useState<StudentSubmissionItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAssessmentId, setSelectedAssessmentId] = React.useState<string>("ALL")

  // Inspector modal state
  const [inspectingAttempt, setInspectingAttempt] = React.useState<{
    assessmentId: string
    attemptId: string
  } | null>(null)

  // Publishing action state
  const [togglingPublishId, setTogglingPublishId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/teacher/quizzes/submissions")
      const json = await res.json()
      if (json.success) {
        setQuizzes(json.assessments || [])
        setSubmissions(json.submissions || [])
      }
    } catch (err) {
      console.error("Failed to load teacher quizzes & submissions:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleTogglePublish = async (assessmentId: string, currentState: boolean) => {
    const actionText = currentState ? "unpublish" : "publish"
    if (
      !confirm(
        `Are you sure you want to ${actionText} results for this assessment? ${
          currentState
            ? "Answers and model solutions will be concealed from students."
            : "All students will immediately be able to view their scores, question review, explanations, and model coding solutions."
        }`
      )
    ) {
      return
    }

    setTogglingPublishId(assessmentId)
    try {
      const res = await fetch(`/api/teacher/assessments/${assessmentId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultsPublished: !currentState }),
      })
      const json = await res.json()
      if (json.success) {
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === assessmentId ? { ...q, resultsPublished: json.resultsPublished } : q
          )
        )
        setSubmissions((prev) =>
          prev.map((s) =>
            s.assessmentId === assessmentId
              ? { ...s, resultsPublished: json.resultsPublished }
              : s
          )
        )
      }
    } catch (err) {
      console.error("Toggle publish error:", err)
    } finally {
      setTogglingPublishId(null)
    }
  }

  const handleAllowReattempt = async (assessmentId: string, attemptId: string, studentName: string) => {
    if (!confirm(`Authorize a new assessment reattempt for ${studentName}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/teacher/assessments/${assessmentId}/reattempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, allowReattempt: true }),
      })
      const json = await res.json()
      if (json.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === attemptId ? { ...s, allowReattempt: true } : s))
        )
      }
    } catch (err) {
      console.error("Reattempt error:", err)
    }
  }

  // Filtered submissions
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((sub) => {
      const matchesAssessment =
        selectedAssessmentId === "ALL" || sub.assessmentId === selectedAssessmentId
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        sub.studentEmail.toLowerCase().includes(q) ||
        sub.assessmentTitle.toLowerCase().includes(q)
      return matchesAssessment && matchesSearch
    })
  }, [submissions, selectedAssessmentId, searchQuery])

  const totalAttemptsCount = submissions.length
  const passedAttemptsCount = submissions.filter((s) => s.passed).length
  const overallPassRate =
    totalAttemptsCount > 0 ? Math.round((passedAttemptsCount / totalAttemptsCount) * 100) : 0

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>Quizzes & Assessments Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Evaluate submitted student tests, inspect MCQ diagnostics &amp; coding solutions, and publish official cohort grades.
          </p>
        </div>

        {quizzes.length > 0 && (
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-purple-600/20 gap-2 shrink-0"
          >
            <Link href={`/teacher/courses/${quizzes[0].courseId}/builder`}>
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Link>
          </Button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Quizzes</span>
            <HelpCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{quizzes.length}</div>
          <div className="text-[11px] text-muted-foreground">Active evaluations</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Student Submissions</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalAttemptsCount}</div>
          <div className="text-[11px] text-emerald-500 font-semibold">Live evaluated submissions</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pass Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{overallPassRate}%</div>
          <div className="text-[11px] text-muted-foreground">Cohort passing benchmark</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Results Status</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-black text-foreground pt-1">
            {quizzes.some((q) => q.resultsPublished) ? "Published to Students" : "Pending Release"}
          </div>
          <div className="text-[11px] text-brand-teal font-medium">Teacher-controlled release</div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2">
        <button
          onClick={() => setActiveMainTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === "submissions"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Student Submissions &amp; Diagnostic Reports</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("quizzes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMainTab === "quizzes"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Configured Quizzes &amp; Tests</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono text-[10px]">
            {quizzes.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS & LIVE EVALUATED ATTEMPTS */}
      {activeMainTab === "submissions" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-[11px] font-bold text-muted-foreground shrink-0">Filter Quiz:</span>
              <button
                onClick={() => setSelectedAssessmentId("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedAssessmentId === "ALL"
                    ? "bg-purple-600 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({submissions.length})
              </button>
              {quizzes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedAssessmentId(q.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedAssessmentId === q.id
                      ? "bg-purple-600 text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {q.title.length > 25 ? `${q.title.slice(0, 25)}...` : q.title}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Table */}
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
              Loading student submissions...
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <Card className="p-12 text-center shadow-card space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 mx-auto flex items-center justify-center text-purple-500">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base">No Student Submissions Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  When students complete and submit their evaluations, their full diagnostic reports and scores will appear here in real time.
                </p>
              </div>
            </Card>
          ) : (
            <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/90 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/60 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Evaluation</th>
                      <th className="p-3.5 text-center">Section A (MCQs)</th>
                      <th className="p-3.5 text-center">Section B (Coding)</th>
                      <th className="p-3.5 text-center">Total Marks</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-secondary/30 transition-colors">
                        {/* Student Details */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {sub.studentName?.charAt(0) || "S"}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block">{sub.studentName}</span>
                              <span className="text-[10px] font-mono text-muted-foreground block">
                                {sub.studentEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Evaluation & Course */}
                        <td className="p-3.5">
                          <span className="font-semibold text-foreground block line-clamp-1">
                            {sub.assessmentTitle}
                          </span>
                          <span className="text-[10px] text-muted-foreground block line-clamp-1">
                            {sub.courseTitle} · {new Date(sub.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>

                        {/* MCQ Marks */}
                        <td className="p-3.5 text-center">
                          <span className="font-bold text-brand-teal text-sm">
                            {sub.mcqMarks} / 40
                          </span>
                        </td>

                        {/* Coding Marks */}
                        <td className="p-3.5 text-center">
                          <span className="font-bold text-purple-500 text-sm">
                            {sub.codingMarks} / 10
                          </span>
                        </td>

                        {/* Total Marks */}
                        <td className="p-3.5 text-center">
                          <span className="font-black text-foreground text-sm block">
                            {sub.earnedMarks} / {sub.totalMarks}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            {sub.scorePct}%
                          </span>
                        </td>

                        {/* Status Badges */}
                        <td className="p-3.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                sub.passed
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                              }`}
                            >
                              {sub.passed ? "Passed" : "Under Review"}
                            </span>
                            {sub.resultsPublished ? (
                              <span className="text-[9px] font-medium text-emerald-500">
                                Results Released
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium text-muted-foreground">
                                Pending Release
                              </span>
                            )}
                            {sub.allowReattempt && (
                              <span className="text-[9px] font-bold text-amber-500">
                                Reattempt Enabled
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() =>
                                setInspectingAttempt({
                                  assessmentId: sub.assessmentId,
                                  attemptId: sub.attemptId,
                                })
                              }
                              className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              <span>Inspect Test</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={sub.allowReattempt}
                              onClick={() =>
                                handleAllowReattempt(sub.assessmentId, sub.attemptId, sub.studentName)
                              }
                              className={`h-8 px-2.5 rounded-xl text-xs font-semibold ${
                                sub.allowReattempt
                                  ? "border-emerald-500/30 text-emerald-600 cursor-not-allowed"
                                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                              }`}
                              title={
                                sub.allowReattempt
                                  ? "Reattempt already authorized"
                                  : "Authorize this student to retake assessment"
                              }
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONFIGURABLE QUIZZES LIST & PUBLISHING CONTROLS */}
      {activeMainTab === "quizzes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                      {quiz.courseTitle}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          quiz.resultsPublished
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {quiz.resultsPublished ? "Results Published" : "Results Hidden"}
                      </span>

                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        <span>{quiz.timeLimitMinutes} mins</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-foreground group-hover:text-purple-500 transition-colors">
                      {quiz.title}
                    </h4>
                    {quiz.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {quiz.description}
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-secondary/50 border border-border/60 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">MCQs</div>
                      <div className="text-xs font-bold text-foreground">{quiz.questionCount} Qs</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Coding Section</div>
                      <div className="text-xs font-bold text-purple-500">2 Problems</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Submissions</div>
                      <div className="text-xs font-bold text-emerald-500">{quiz.totalAttempts}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
                  {/* Results Publishing Master Button */}
                  <Button
                    size="sm"
                    disabled={togglingPublishId === quiz.id}
                    onClick={() => handleTogglePublish(quiz.id, quiz.resultsPublished)}
                    className={`text-xs h-8 px-3 rounded-xl font-bold ${
                      quiz.resultsPublished
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                  >
                    {togglingPublishId === quiz.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>
                      {quiz.resultsPublished ? "Unpublish Results" : "Publish Results to Students"}
                    </span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAssessmentId(quiz.id)
                        setActiveMainTab("submissions")
                      }}
                      className="text-xs h-8 px-3 rounded-xl border-border hover:bg-secondary font-semibold"
                    >
                      <span>View Submissions ({quiz.totalAttempts})</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic Inspector Modal */}
      {inspectingAttempt && (
        <AssessmentTestInspectorModal
          assessmentId={inspectingAttempt.assessmentId}
          attemptId={inspectingAttempt.attemptId}
          onClose={() => setInspectingAttempt(null)}
          onReattemptAllowed={() => loadData()}
        />
      )}
    </PageTransition>
  )
}
