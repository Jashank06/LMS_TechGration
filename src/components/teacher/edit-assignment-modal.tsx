"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  FileCheck2,
  Calendar,
  Link as LinkIcon,
  Award,
  Loader2,
  Save,
} from "lucide-react"
import { toast } from "sonner"

interface EditAssignmentModalProps {
  assignmentId: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditAssignmentModal({
  assignmentId,
  isOpen,
  onClose,
  onSuccess,
}: EditAssignmentModalProps) {
  const [fetching, setFetching] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [instructions, setInstructions] = React.useState("")
  const [maxMarks, setMaxMarks] = React.useState("100")
  const [dueDate, setDueDate] = React.useState("")
  const [dueTime, setDueTime] = React.useState("23:59")
  const [starterRepo, setStarterRepo] = React.useState("")

  React.useEffect(() => {
    if (!isOpen || !assignmentId) return

    let cancelled = false
    setFetching(true)

    async function loadAssignment() {
      try {
        const res = await fetch(`/api/teacher/assignments/${assignmentId}`)
        const data = await res.json()

        if (!res.ok || !data.assignment) {
          throw new Error(data.error || "Failed to load assignment")
        }

        if (cancelled) return
        const a = data.assignment
        setTitle(a.title || "")
        setInstructions(a.instructions || "")
        setMaxMarks(String(a.maxMarks || 100))

        if (a.dueAt) {
          const d = new Date(a.dueAt)
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, "0")
          const dd = String(d.getDate()).padStart(2, "0")
          const hh = String(d.getHours()).padStart(2, "0")
          const min = String(d.getMinutes()).padStart(2, "0")
          setDueDate(`${yyyy}-${mm}-${dd}`)
          setDueTime(`${hh}:${min}`)
        }

        if (a.attachments && a.attachments.length > 0) {
          setStarterRepo(a.attachments[0])
        } else {
          setStarterRepo("")
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load assignment:", err)
          toast.error("Failed to load assignment details")
          onClose()
        }
      } finally {
        if (!cancelled) setFetching(false)
      }
    }

    loadAssignment()
    return () => {
      cancelled = true
    }
  }, [isOpen, assignmentId, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignmentId) return

    if (!title.trim()) {
      toast.error("Please enter an assignment title")
      return
    }
    if (!instructions.trim()) {
      toast.error("Please enter assignment instructions or evaluation rubric")
      return
    }
    if (!dueDate) {
      toast.error("Please pick a due date")
      return
    }

    setLoading(true)
    try {
      const combinedDateTime = new Date(`${dueDate}T${dueTime || "23:59"}:00`)

      const res = await fetch(`/api/teacher/assignments/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          instructions: instructions.trim(),
          maxMarks: Number(maxMarks) || 100,
          dueAt: combinedDateTime.toISOString(),
          attachments: starterRepo.trim() ? [starterRepo.trim()] : [],
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Assignment updated successfully!")
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to update assignment")
      }
    } catch (err) {
      console.error("Assignment update error:", err)
      toast.error("Network error while updating assignment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Edit Course Assignment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Update evaluation instructions, due date, maximum marks, or starter links for this task.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs text-muted-foreground">Loading assignment details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="editAsgnTitle" className="text-xs font-bold text-foreground">
                Assignment Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editAsgnTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Consensus Engine"
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editAsgnInstructions" className="text-xs font-bold text-foreground">
                Instructions & Rubric <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="editAsgnInstructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={5}
                placeholder="Detail technical requirements and grading criteria..."
                className="rounded-xl text-xs sm:text-sm bg-background border-border/80 resize-none font-mono text-xs leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="editDueDate" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Due Date</span> <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editDueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded-xl h-10 text-xs bg-background border-border/80"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editDueTime" className="text-xs font-bold text-foreground">
                  Time (IST)
                </Label>
                <Input
                  id="editDueTime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="rounded-xl h-10 text-xs bg-background border-border/80"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editMaxMarks" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Max Marks</span>
                </Label>
                <Input
                  id="editMaxMarks"
                  type="number"
                  min="10"
                  max="1000"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="rounded-xl h-10 text-xs bg-background border-border/80"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editStarterRepo" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Starter Repository / Documentation Link</span>
              </Label>
              <Input
                id="editStarterRepo"
                value={starterRepo}
                onChange={(e) => setStarterRepo(e.target.value)}
                placeholder="https://github.com/techgration/starter-template"
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>

            <DialogFooter className="pt-3 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl text-xs h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl text-xs h-10 px-5 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
