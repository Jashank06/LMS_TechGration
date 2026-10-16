"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileCheck2, Link as LinkIcon, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { quickSubmitAssignmentAction } from "@/actions/assignments"

interface QuickSubmitAssignmentModalProps {
  assignment: {
    id: string
    title: string
    maxMarks: number
    instructions: string
    fileUrl?: string | null
    studentNotes?: string | null
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updated: { fileUrl: string; studentNotes: string }) => void
}

export function QuickSubmitAssignmentModal({
  assignment,
  isOpen,
  onClose,
  onSuccess,
}: QuickSubmitAssignmentModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [fileUrl, setFileUrl] = React.useState("")
  const [content, setContent] = React.useState("")

  React.useEffect(() => {
    if (assignment && isOpen) {
      setFileUrl(assignment.fileUrl || "")
      setContent(assignment.studentNotes || "")
    }
  }, [assignment, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment) return

    if (!fileUrl.trim() && !content.trim()) {
      toast.error("Please provide either a project/repository link or implementation notes.")
      return
    }

    setLoading(true)
    try {
      const res = await quickSubmitAssignmentAction(assignment.id, {
        fileUrl: fileUrl.trim(),
        content: content.trim(),
      })

      if (res.success) {
        toast.success("Assignment submitted successfully for faculty review!")
        onSuccess({ fileUrl: fileUrl.trim(), studentNotes: content.trim() })
        onClose()
      } else {
        toast.error(res.error || "Failed to submit assignment")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network error submitting assignment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-xl p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground truncate">
              {assignment?.title || "Submit Deliverable"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Upload your GitHub repository, live demo link, or summary notes for evaluation (Max {assignment?.maxMarks ?? 100} Points).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="quickFileUrl" className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>GitHub / Project Repository URL</span>
            </Label>
            <Input
              id="quickFileUrl"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://github.com/your-username/project-repo"
              className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80 font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quickContent" className="text-xs font-bold text-foreground">
              Implementation Notes / Architectural Summary
            </Label>
            <Textarea
              id="quickContent"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Summarize key architectural choices, tested edge-cases, and how your code satisfies the evaluation rubric..."
              className="rounded-xl text-xs bg-background border-border/80 resize-none leading-relaxed"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
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
              className="rounded-xl text-xs h-10 px-5 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Submit Deliverable</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
