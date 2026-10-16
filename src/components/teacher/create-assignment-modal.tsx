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
  Sparkles,
  Link as LinkIcon,
  Award,
  Loader2,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

interface CreateAssignmentModalProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateAssignmentModal({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: CreateAssignmentModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [instructions, setInstructions] = React.useState("")
  const [maxMarks, setMaxMarks] = React.useState("100")
  const [dueDate, setDueDate] = React.useState("")
  const [dueTime, setDueTime] = React.useState("23:59")
  const [starterRepo, setStarterRepo] = React.useState("")

  // Quick preset templates for assignments
  const handleApplyTemplate = (type: "PROJECT" | "LAB" | "DESIGN") => {
    if (type === "PROJECT") {
      setTitle("Full-Stack Microservices Architecture Capstone")
      setInstructions(
        "Design and deploy an asynchronous event-driven system with Kafka, Next.js, and Redis caching. Ensure end-to-end integration tests pass and document your architectural decisions in a README.md file.\n\nEvaluation Rubric:\n- Service Isolation & Docker Compose (30 pts)\n- Message Broker Reliability & Idempotency (30 pts)\n- API Security & JWT Authentication (20 pts)\n- Clean Code, Linting & Documentation (20 pts)"
      )
      setMaxMarks("100")
    } else if (type === "LAB") {
      setTitle("Hands-on PyTorch Pipeline & Model Optimization")
      setInstructions(
        "Implement a modular PyTorch training pipeline with data augmentation, learning rate warmup, and FP16 mixed precision. Log loss curves and achieve validation accuracy > 90%.\n\nEvaluation Rubric:\n- Architecture & Custom DataLoader (35 pts)\n- Hyperparameter Tuning & Warmup (35 pts)\n- Accuracy Threshold & Benchmark Report (30 pts)"
      )
      setMaxMarks("100")
    } else {
      setTitle("Cloud Security & Zero-Trust IAM Policy Design")
      setInstructions(
        "Author least-privilege IAM policies, VPC service controls, and audit logging configurations for a financial transaction cluster. Provide Terraform or CloudFormation manifests."
      )
      setMaxMarks("100")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      const res = await fetch(`/api/teacher/courses/${courseId}/assignments`, {
        method: "POST",
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
        toast.success("Assignment created and published to students!")
        setTitle("")
        setInstructions("")
        setStarterRepo("")
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to create assignment")
      }
    } catch (err) {
      console.error("Assignment create error:", err)
      toast.error("Network error while creating assignment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Create Course Assignment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Publish a hands-on milestone, code project, or architectural deliverable for enrolled students.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Starter Templates */}
        <div className="py-2 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate("PROJECT")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all"
            >
              + Capstone Project
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate("LAB")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all"
            >
              + Hands-on Lab
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate("DESIGN")}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-all"
            >
              + Architecture Design
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Assignment Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-foreground">
              Assignment Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Queue Implementation with Redis"
              className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              required
            />
          </div>

          {/* Instructions & Rubric */}
          <div className="space-y-1.5">
            <Label htmlFor="instructions" className="text-xs font-bold text-foreground">
              Instructions & Evaluation Rubric <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe requirements, deliverables, evaluation criteria, and submission format..."
              rows={5}
              className="rounded-xl text-xs sm:text-sm bg-background border-border/80 resize-y"
              required
            />
          </div>

          {/* Due Date & Max Marks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="maxMarks" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-teal" />
                <span>Max Points</span>
              </Label>
              <Input
                id="maxMarks"
                type="number"
                min="10"
                max="1000"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                <span>Due Date</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueTime" className="text-xs font-bold text-foreground">
                Cutoff Time
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>
          </div>

          {/* Starter Repo or Resource Link */}
          <div className="space-y-1.5">
            <Label htmlFor="starterRepo" className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Starter Repository or Resource Link (Optional)</span>
            </Label>
            <Input
              id="starterRepo"
              value={starterRepo}
              onChange={(e) => setStarterRepo(e.target.value)}
              placeholder="https://github.com/techgration/starter-repo"
              className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
            />
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
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
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish Assignment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
