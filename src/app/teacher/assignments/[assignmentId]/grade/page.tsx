"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  CheckCircle2,
  FileCode,
  FileText,
  Download,
  Clock,
  AlertTriangle,
  Copy,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { type TeacherSubmission } from "@/server/services/teacher-mock-data"

function SplitScreenGradingContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const assignmentId = params?.assignmentId as string
  const currentSubmissionId = searchParams.get("submissionId")

  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [submission, setSubmission] = React.useState<TeacherSubmission | null>(null)
  const [rubricScores, setRubricScores] = React.useState<{ criterion: string; score: number; maxScore: number }[]>([])
  const [feedback, setFeedback] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const loadData = async (subId?: string) => {
    try {
      const url = `/api/teacher/assignments/${assignmentId}/grade${subId ? `?submissionId=${subId}` : ""}`
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
      if (json.currentSubmission) {
        setSubmission(json.currentSubmission)
        setRubricScores(json.currentSubmission.rubricScores || [])
        setFeedback(json.currentSubmission.feedback || "")
      }
    } catch (err) {
      console.error("Failed to load grading data:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (assignmentId) {
      loadData(currentSubmissionId || undefined)
    }
  }, [assignmentId, currentSubmissionId])

  // Keyboard navigation for submissions
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
        e.preventDefault()
        handleNavigate("prev")
      } else if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
        e.preventDefault()
        handleNavigate("next")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [data])

  const handleNavigate = (direction: "prev" | "next") => {
    if (!data?.submissionsList) return
    const currentIndex = data.currentIndex
    const targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex >= 0 && targetIndex < data.submissionsList.length) {
      const targetSub = data.submissionsList[targetIndex]
      router.push(`/teacher/assignments/${assignmentId}/grade?submissionId=${targetSub.id}`)
    }
  }

  // Calculate total marks from rubric scores
  const totalScore = rubricScores.reduce((acc, r) => acc + (Number(r.score) || 0), 0)
  const maxMarks = data?.assignment?.maxMarks || 100
  const isScoreOverLimit = totalScore > maxMarks

  const handleRubricScoreChange = (index: number, score: number) => {
    setRubricScores((prev) =>
      prev.map((r, i) => (i === index ? { ...r, score: Math.max(0, score) } : r))
    )
  }

  const applyFeedbackSnippet = (snippet: string) => {
    setFeedback((prev) => (prev ? `${prev}\n${snippet}` : snippet))
    toast.info("Feedback macro inserted")
  }

  const handleSaveGrade = async (isDraft: boolean) => {
    if (!submission) return

    if (totalScore > maxMarks) {
      toast.error(`Total score (${totalScore}) cannot exceed maximum allowed (${maxMarks})`)
      return
    }

    if (!isDraft && !feedback.trim()) {
      toast.error("Please provide qualitative evaluation feedback before publishing")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/teacher/assignments/${assignmentId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          marksAwarded: totalScore,
          feedback: feedback || "Draft evaluated",
          rubricScores,
          isDraft,
        }),
      })

      const resData = await res.json()
      if (res.ok) {
        if (!isDraft) {
          triggerBrandCelebration()
          toast.success("Grade published! Student has been notified.")
        } else {
          toast.success("Draft saved successfully.")
        }
        setSubmission((prev) => (prev ? { ...prev, status: isDraft ? "IN_REVIEW" : "GRADED" } : null))
      } else {
        toast.error(resData.error || "Failed to save evaluation")
      }
    } catch {
      toast.error("Network error while submitting grade")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-16 rounded-xl bg-muted/60" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          <div className="lg:col-span-7 rounded-2xl bg-muted/40" />
          <div className="lg:col-span-5 rounded-2xl bg-muted/40" />
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-base font-bold">No submissions found for this assignment</h2>
        <Button asChild size="sm">
          <Link href="/teacher/assignments">Return to Assignments</Link>
        </Button>
      </div>
    )
  }

  return (
    <PageTransition className="space-y-4 pb-8 max-w-7xl mx-auto">
      {/* Top Navigation & Carousel Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 min-w-0">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/teacher/assignments">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">
              {data.assignment.title}
            </h2>
            <div className="text-[11px] text-muted-foreground truncate">
              {data.assignment.courseTitle} • Max Marks: {maxMarks} pts
            </div>
          </div>
        </div>

        {/* Previous & Next Carousel */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-mono font-semibold text-muted-foreground">
            Submission {(data.currentIndex ?? 0) + 1} of {data.totalSubmissions}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={data.currentIndex === 0}
              onClick={() => handleNavigate("prev")}
              title="Previous Submission (Cmd+Left)"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={data.currentIndex === data.totalSubmissions - 1}
              onClick={() => handleNavigate("next")}
              title="Next Submission (Cmd+Right)"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Split-Screen Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT PANEL (60% / 7 cols): Student Submission & Files Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-card border-border/80">
            {/* Student Header */}
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={submission.studentAvatar} alt={submission.studentName} />
                  <AvatarFallback className="text-xs font-bold">
                    {submission.studentName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-foreground truncate">
                    {submission.studentName}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {submission.studentEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {submission.isLate ? (
                  <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px]">
                    Late Submission (-{submission.latePenaltyPct}%)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-success border-success/30 bg-success/10 text-[10px]">
                    On-Time Submission
                  </Badge>
                )}

                <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                  {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            <CardContent className="p-5 space-y-5 text-xs">
              {/* Student Written Notes */}
              {submission.studentNotes && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Student Submission Notes
                  </span>
                  <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-foreground leading-relaxed">
                    {submission.studentNotes}
                  </div>
                </div>
              )}

              {/* Code Snippet Box */}
              {submission.submittedCodeSnippet && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Code Solution ({submission.codeLanguage || "yaml"})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(submission.submittedCodeSnippet || "")
                        toast.info("Code copied to clipboard")
                      }}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-border bg-[#0B0F12] text-[#D7DCE2] p-4 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                    <pre>{submission.submittedCodeSnippet}</pre>
                  </div>
                </div>
              )}

              {/* Attached Files Cards */}
              {submission.attachedFiles && submission.attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Attached Artifacts & Files
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {submission.attachedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-brand-teal/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-brand-teal shrink-0" />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs truncate">{file.name}</div>
                            <div className="text-[10px] text-muted-foreground">{file.size}</div>
                          </div>
                        </div>
                        <Button size="icon-sm" variant="ghost" title="Download submission file">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL (40% / 5 cols): Evaluation, Rubrics & Feedback */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-card border-border/80 sticky top-20">
            <CardHeader className="pb-3 border-b border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Grading Evaluation Panel</CardTitle>
                <div className="text-right">
                  <div className={`text-xl font-extrabold ${isScoreOverLimit ? "text-destructive" : "text-brand-ink dark:text-brand-cyan"}`}>
                    {totalScore} <span className="text-xs font-normal text-muted-foreground">/ {maxMarks}</span>
                  </div>
                  {isScoreOverLimit && (
                    <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 justify-end">
                      <AlertTriangle className="w-3 h-3" /> Exceeds max marks!
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Multi-Criteria Rubric Scoring */}
              <div className="space-y-2.5">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Rubric Assessment Criteria
                </span>
                <div className="space-y-2">
                  {rubricScores.map((rubric, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs text-foreground truncate">{rubric.criterion}</div>
                        <div className="text-[10px] text-muted-foreground">Max score: {rubric.maxScore} pts</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Input
                          type="number"
                          value={rubric.score}
                          onChange={(e) => handleRubricScoreChange(idx, Number(e.target.value))}
                          min={0}
                          max={rubric.maxScore}
                          className="w-16 h-8 text-center text-xs font-bold"
                        />
                        <span className="text-muted-foreground font-mono">/ {rubric.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Feedback Macros */}
              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  1-Click Feedback Macros
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Clean modular architecture & robust security context.",
                    "Excellent pod security adherence. Verification logs verified.",
                    "Please review least-privilege principles on RoleBindings.",
                    "Missing test assertions in verification script.",
                  ].map((snip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyFeedbackSnippet(snip)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground/90 transition-colors text-left line-clamp-1"
                    >
                      + {snip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teacher Feedback Textarea */}
              <div className="space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Instructor Qualitative Feedback *
                </span>
                <Textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide structured feedback and suggestions for improvement..."
                  className="text-xs leading-relaxed"
                />
              </div>

              {/* Dual Action Buttons: Save Draft vs Publish Grade */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={saving}
                  onClick={() => handleSaveGrade(true)}
                  className="gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={saving || isScoreOverLimit}
                  onClick={() => handleSaveGrade(false)}
                  className="shadow-teal-glow gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Grade</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

export default function SplitScreenGradingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading grading studio...
        </div>
      }
    >
      <SplitScreenGradingContent />
    </React.Suspense>
  )
}
