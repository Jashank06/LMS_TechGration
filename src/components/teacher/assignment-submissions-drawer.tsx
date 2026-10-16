"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileCheck2,
  Calendar,
  ExternalLink,
  Award,
  Loader2,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
} from "lucide-react"
import { toast } from "sonner"

interface SubmissionItem {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  submittedAt: string
  status: string
  studentNotes?: string | null
  fileUrl?: string | null
  marksAwarded?: number | null
  feedback?: string | null
  gradedAt?: string | null
}

interface AssignmentData {
  id: string
  title: string
  instructions: string
  maxMarks: number
  dueAt: string
  submissions: SubmissionItem[]
}

interface AssignmentSubmissionsDrawerProps {
  assignmentId: string | null
  isOpen: boolean
  onClose: () => void
  onGraded?: () => void
}

export function AssignmentSubmissionsDrawer({
  assignmentId,
  isOpen,
  onClose,
  onGraded,
}: AssignmentSubmissionsDrawerProps) {
  const [loading, setLoading] = React.useState(false)
  const [assignment, setAssignment] = React.useState<AssignmentData | null>(null)
  const [gradingSubmissionId, setGradingSubmissionId] = React.useState<string | null>(null)

  // In-line grade state
  const [marksAwarded, setMarksAwarded] = React.useState<Record<string, string>>({})
  const [feedback, setFeedback] = React.useState<Record<string, string>>({})
  const [savingGradeId, setSavingGradeId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isOpen || !assignmentId) return

    let cancelled = false
    setLoading(true)

    async function loadData() {
      try {
        const res = await fetch(`/api/teacher/assignments/${assignmentId}`)
        const data = await res.json()

        if (!res.ok || !data.assignment) {
          throw new Error(data.error || "Failed to load submissions")
        }

        if (cancelled) return
        const asgn = data.assignment

        const formattedSubmissions: SubmissionItem[] = (asgn.submissions || []).map(
          (s: any) => ({
            id: s.id,
            studentId: s.userId,
            studentName: s.user?.name || "Student",
            studentEmail: s.user?.email || "",
            submittedAt: s.submittedAt,
            status: s.status,
            studentNotes: s.studentNotes,
            fileUrl: s.fileUrl,
            marksAwarded: s.marksAwarded,
            feedback: s.feedback,
            gradedAt: s.gradedAt,
          })
        )

        setAssignment({
          id: asgn.id,
          title: asgn.title,
          instructions: asgn.instructions,
          maxMarks: asgn.maxMarks || 100,
          dueAt: asgn.dueAt,
          submissions: formattedSubmissions,
        })

        // Prepopulate grading states
        const initialMarks: Record<string, string> = {}
        const initialFeedback: Record<string, string> = {}
        formattedSubmissions.forEach((s) => {
          if (s.marksAwarded !== null && s.marksAwarded !== undefined) {
            initialMarks[s.id] = String(s.marksAwarded)
          }
          if (s.feedback) {
            initialFeedback[s.id] = s.feedback
          }
        })
        setMarksAwarded(initialMarks)
        setFeedback(initialFeedback)
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load submissions:", err)
          toast.error("Failed to load submissions")
          onClose()
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [isOpen, assignmentId, onClose])

  const handleSaveGrade = async (sub: SubmissionItem) => {
    const rawMark = marksAwarded[sub.id]
    const markNum = Number(rawMark)
    const fbText = (feedback[sub.id] || "").trim()

    if (isNaN(markNum) || markNum < 0) {
      toast.error("Please enter a valid non-negative mark")
      return
    }

    if (assignment && markNum > assignment.maxMarks) {
      toast.error(`Marks cannot exceed ${assignment.maxMarks}`)
      return
    }

    if (!fbText) {
      toast.error("Please enter evaluation feedback for the student")
      return
    }

    setSavingGradeId(sub.id)
    try {
      const res = await fetch(`/api/teacher/assignments/${assignmentId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: sub.id,
          marksAwarded: markNum,
          feedback: fbText,
          isDraft: false,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Grade and feedback published to student!")
        // Update local state
        setAssignment((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            submissions: prev.submissions.map((item) =>
              item.id === sub.id
                ? {
                    ...item,
                    marksAwarded: markNum,
                    feedback: fbText,
                    status: "GRADED",
                    gradedAt: new Date().toISOString(),
                  }
                : item
            ),
          }
        })
        setGradingSubmissionId(null)
        onGraded?.()
      } else {
        toast.error(data.error || "Failed to save grade")
      }
    } catch (err) {
      console.error("Grade submit error:", err)
      toast.error("Network error while submitting grade")
    } finally {
      setSavingGradeId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {assignment?.title || "Assignment Submissions"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Max Marks: {assignment?.maxMarks ?? 100}</span>
                </span>
                {assignment?.dueAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Due: {new Date(assignment.dueAt).toLocaleDateString()}</span>
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs text-muted-foreground">Fetching student submissions...</p>
          </div>
        ) : !assignment || assignment.submissions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
              <UserCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">No Submissions Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No students have submitted this assignment yet. Submissions will appear here in real time as students upload their deliverables.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
              <span>
                Total Deliverables: <strong className="text-foreground">{assignment.submissions.length}</strong>
              </span>
              <span>
                Graded:{" "}
                <strong className="text-emerald-500">
                  {assignment.submissions.filter((s) => s.status === "GRADED").length}
                </strong>{" "}
                / {assignment.submissions.length}
              </span>
            </div>

            <div className="space-y-3">
              {assignment.submissions.map((sub) => {
                const isGraded = sub.status === "GRADED"
                const isEditingThis = gradingSubmissionId === sub.id

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl border border-border/80 bg-background/70 space-y-4 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {sub.studentName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isGraded
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {isGraded ? "GRADED" : "PENDING EVALUATION"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{sub.studentEmail}</p>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                          </p>
                          {isGraded && (
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              Score: {sub.marksAwarded} / {assignment.maxMarks}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student Deliverable Link & Notes */}
                    <div className="space-y-2">
                      {sub.fileUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-muted-foreground">Deliverable:</span>
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span className="truncate max-w-md">{sub.fileUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      )}

                      {sub.studentNotes && (
                        <div className="p-3 rounded-xl bg-card border border-border/60">
                          <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                            Student Notes:
                          </p>
                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {sub.studentNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Evaluation Form / View */}
                    {isGraded && !isEditingThis ? (
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Awarded Marks: {sub.marksAwarded} / {assignment.maxMarks}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGradingSubmissionId(sub.id)}
                            className="text-[11px] font-semibold text-blue-600 hover:underline"
                          >
                            Re-grade / Edit Feedback
                          </button>
                        </div>
                        {sub.feedback && (
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground">
                              Instructor Feedback:
                            </p>
                            <p className="text-xs text-foreground/80 mt-0.5 whitespace-pre-wrap">
                              {sub.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>Evaluate Submission</span>
                          </h5>
                          {isEditingThis && (
                            <button
                              type="button"
                              onClick={() => setGradingSubmissionId(null)}
                              className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`mark-${sub.id}`} className="text-[11px] font-bold text-foreground">
                              Marks (out of {assignment.maxMarks})
                            </Label>
                            <Input
                              id={`mark-${sub.id}`}
                              type="number"
                              min="0"
                              max={assignment.maxMarks}
                              value={marksAwarded[sub.id] ?? ""}
                              onChange={(e) =>
                                setMarksAwarded({
                                  ...marksAwarded,
                                  [sub.id]: e.target.value,
                                })
                              }
                              placeholder={`0 - ${assignment.maxMarks}`}
                              className="rounded-xl h-9 text-xs font-bold bg-background border-border"
                            />
                          </div>

                          <div className="sm:col-span-3 space-y-1">
                            <Label htmlFor={`fb-${sub.id}`} className="text-[11px] font-bold text-foreground">
                              Evaluation Remarks & Constructive Feedback
                            </Label>
                            <Textarea
                              id={`fb-${sub.id}`}
                              rows={2}
                              value={feedback[sub.id] ?? ""}
                              onChange={(e) =>
                                setFeedback({
                                  ...feedback,
                                  [sub.id]: e.target.value,
                                })
                              }
                              placeholder="Provide feedback on code quality, architecture, and correctness..."
                              className="rounded-xl text-xs bg-background border-border resize-none leading-relaxed"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <Button
                            type="button"
                            size="sm"
                            disabled={savingGradeId === sub.id}
                            onClick={() => handleSaveGrade(sub)}
                            className="rounded-xl text-xs h-8 px-4 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            {savingGradeId === sub.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                <span>Publishing...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 mr-1.5" />
                                <span>Publish Grade & Feedback</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
