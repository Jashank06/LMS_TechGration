"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  GraduationCap,
  Calendar,
  Clock,
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import { type EnrolledStudentItem } from "@/server/services/teacher-mock-data"

interface StudentProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: EnrolledStudentItem | null
}

export function StudentProfileDrawer({
  open,
  onOpenChange,
  student,
}: StudentProfileDrawerProps) {
  const [nudgeModalOpen, setNudgeModalOpen] = React.useState(false)
  const [nudgeSubject, setNudgeSubject] = React.useState("Academic Support & Course Check-in")
  const [nudgeMessage, setNudgeMessage] = React.useState(
    "Hi there! I noticed you haven't been active in our Kubernetes modules over the past two weeks. Let me know if you need any 1-on-1 guidance or assistance with the recent labs!"
  )
  const [sending, setSending] = React.useState(false)

  if (!student) return null

  const handleSendNudge = async () => {
    setSending(true)
    try {
      const res = await fetch(`/api/teacher/students/${student.id}/nudge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: nudgeSubject,
          message: nudgeMessage,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setNudgeModalOpen(false)
      } else {
        toast.error(data.error || "Failed to send nudge")
      }
    } catch {
      toast.error("Network error while sending nudge")
    } finally {
      setSending(false)
    }
  }

  const healthConfig = {
    HEALTHY: { label: "Good Academic Standing", color: "bg-success/15 text-success border-success/30" },
    NEEDS_SUPPORT: { label: "Academic Support Recommended", color: "bg-warning/15 text-warning border-warning/30" },
    AT_RISK: { label: "At Risk of Incompletion", color: "bg-destructive/15 text-destructive border-destructive/30" },
  }[student.academicHealth] || { label: "Active", color: "bg-muted text-muted-foreground" }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-6 space-y-5 shadow-2xl">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border border-border">
                <AvatarImage src={student.avatarUrl} alt={student.name} />
                <AvatarFallback className="text-sm font-bold bg-muted">
                  {student.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  {student.name}
                </DialogTitle>
                <div className="text-xs text-muted-foreground truncate">{student.email}</div>
              </div>
              <Badge variant="outline" className={`text-[10px] font-semibold ${healthConfig.color}`}>
                {healthConfig.label}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            {/* Progress & Attendance Metrics */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Curriculum Progress</span>
                  <span className="font-bold text-foreground">{student.overallProgressPct}%</span>
                </div>
                <Progress value={student.overallProgressPct} className="h-2" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Attendance Rate</span>
                  <span className="font-bold text-foreground">{student.attendancePct}%</span>
                </div>
                <Progress value={student.attendancePct} className="h-2" />
              </div>
            </div>

            {/* Factual Academic Support Indicators */}
            <div className="space-y-2">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                Factual Academic Flags & Status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {student.supportFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-medium text-foreground"
                  >
                    {flag.includes("Inactive") || flag.includes("Risk") ? (
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-brand-teal" />
                    )}
                    <span>{flag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="space-y-2">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                Enrolled Curriculum
              </span>
              <div className="space-y-1.5">
                {student.enrolledCourses.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-border bg-muted/30 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-foreground truncate">{c}</span>
                    <Badge variant="outline" className="text-[10px]">Active</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Activity */}
            <div className="p-3 rounded-lg border border-border bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Last active session:</span>
              <span className="font-semibold text-foreground">{student.lastActive}</span>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => setNudgeModalOpen(true)}
              className="shadow-teal-glow gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Academic Nudge</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nudge Confirmation Dialog */}
      <Dialog open={nudgeModalOpen} onOpenChange={setNudgeModalOpen}>
        <DialogContent className="max-w-md p-6 space-y-4 shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-teal" />
              <span>Send Academic Encouragement Nudge</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subject</Label>
              <Input
                value={nudgeSubject}
                onChange={(e) => setNudgeSubject(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Message Body</Label>
              <Textarea
                rows={4}
                value={nudgeMessage}
                onChange={(e) => setNudgeMessage(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setNudgeModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendNudge} disabled={sending} className="gap-1.5">
              <span>{sending ? "Sending..." : "Dispatch Alert"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
