"use client"

import * as React from "react"
import Link from "next/link"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ConflictWarningBanner } from "@/components/teacher/conflict-warning-banner"
import { detectScheduleConflict } from "@/server/services/conflict-detector"
import {
  Video,
  Plus,
  Calendar,
  List,
  Clock,
  PlayCircle,
  AlertTriangle,
  RotateCcw,
  Ban,
  Users,
  ExternalLink,
  CheckCircle2,
  Lock,
  CalendarClock,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { type TeacherLiveClass } from "@/server/services/teacher-mock-data"

export default function TeacherLiveClassesPage() {
  const [classes, setClasses] = React.useState<TeacherLiveClass[]>([])
  const [courses, setCourses] = React.useState<{ id: string; title: string; code: string }[]>([])
  const [loading, setLoading] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<"LIST" | "CALENDAR">("LIST")

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false)
  const [selectedCourseId, setSelectedCourseId] = React.useState("")
  const [sessionTitle, setSessionTitle] = React.useState("")
  const [sessionDesc, setSessionDesc] = React.useState("")
  const [startDate, setStartDate] = React.useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  )
  const [startTime, setStartTime] = React.useState("16:30")
  const [durationMinutes, setDurationMinutes] = React.useState(90)
  const [platform, setPlatform] = React.useState<"ZOOM" | "GOOGLE_MEET" | "TEAMS" | "CUSTOM">("ZOOM")
  const [meetingUrl, setMeetingUrl] = React.useState("https://zoom.us/j/98421092842")
  const [passcode, setPasscode] = React.useState("TECH-2026")
  const [conflictState, setConflictState] = React.useState<any>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Reschedule Modal
  const [rescheduleTarget, setRescheduleTarget] = React.useState<TeacherLiveClass | null>(null)
  const [rescheduleDate, setRescheduleDate] = React.useState("")
  const [rescheduleTime, setRescheduleTime] = React.useState("18:00")
  const [rescheduleDuration, setRescheduleDuration] = React.useState(60)
  const [rescheduleReason, setRescheduleReason] = React.useState("Timing adjusted by instructor.")
  const [notifyStudents, setNotifyStudents] = React.useState(true)
  const [isRescheduling, setIsRescheduling] = React.useState(false)

  // Recording Modal
  const [recordingTarget, setRecordingTarget] = React.useState<TeacherLiveClass | null>(null)
  const [recordingUrlInput, setRecordingUrlInput] = React.useState("")
  const [savingRecording, setSavingRecording] = React.useState(false)

  const handleOpenRecordingModal = (cls: TeacherLiveClass) => {
    setRecordingTarget(cls)
    setRecordingUrlInput(cls.recordingUrl || "")
  }

  const handleSaveRecording = async () => {
    if (!recordingTarget) return
    setSavingRecording(true)
    try {
      const res = await fetch(`/api/teacher/live-classes/${recordingTarget.id}/recording`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingUrl: recordingUrlInput }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update recording")

      toast.success(recordingUrlInput.trim() ? "Recording published! Students can now watch." : "Recording removed.")
      setClasses((prev) =>
        prev.map((c) =>
          c.id === recordingTarget.id
            ? { ...c, recordingUrl: json.liveClass.recordingUrl, status: json.liveClass.status }
            : c
        )
      )
      setRecordingTarget(null)
    } catch (err: any) {
      toast.error(err.message || "Failed to save recording")
    } finally {
      setSavingRecording(false)
    }
  }

  const handleOpenReschedule = (cls: TeacherLiveClass) => {
    const start = new Date(cls.startsAt)
    const end = new Date(cls.endsAt)
    const pad = (n: number) => n.toString().padStart(2, "0")

    const localDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
    const localTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`
    const durationMin = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000)) || 60

    setRescheduleTarget(cls)
    setRescheduleDate(localDate)
    setRescheduleTime(localTime)
    setRescheduleDuration(durationMin)
    setRescheduleReason("Timing adjusted by instructor.")
    setNotifyStudents(true)
  }

  // Cancel Modal
  const [cancelTarget, setCancelTarget] = React.useState<TeacherLiveClass | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")

  const loadLiveClasses = async () => {
    try {
      const res = await fetch("/api/teacher/live-classes")
      const json = await res.json()
      setClasses(json.classes || [])
      setCourses(json.courses || [])
      if (json.courses?.length > 0 && !selectedCourseId) {
        setSelectedCourseId(json.courses[0].id)
      }
    } catch (err) {
      console.error("Failed to load live classes:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadLiveClasses()
  }, [])

  // Live client-side conflict check while filling the schedule modal
  React.useEffect(() => {
    if (!scheduleModalOpen || !startDate || !startTime) return

    const startsAt = new Date(`${startDate}T${startTime}:00`)
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000)

    const result = detectScheduleConflict({
      sessions: classes as any,
      proposedStartsAt: startsAt.toISOString(),
      proposedEndsAt: endsAt.toISOString(),
      courseId: selectedCourseId,
    })

    if (result.hasConflict) {
      setConflictState(result)
    } else {
      setConflictState(null)
    }
  }, [scheduleModalOpen, startDate, startTime, durationMinutes, selectedCourseId, classes])

  const handleCreateSession = async () => {
    if (!sessionTitle.trim() || !selectedCourseId) {
      toast.error("Please provide title and course")
      return
    }

    const startsAt = new Date(`${startDate}T${startTime}:00`).toISOString()
    const endsAt = new Date(
      new Date(`${startDate}T${startTime}:00`).getTime() + durationMinutes * 60000
    ).toISOString()

    setSubmitting(true)
    try {
      const res = await fetch("/api/teacher/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          title: sessionTitle,
          description: sessionDesc,
          startsAt,
          endsAt,
          platform,
          meetingUrl,
          meetingPasscode: passcode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setConflictState(data)
          toast.error("Schedule clash detected! Please resolve before saving.")
        } else {
          toast.error(data.error || "Failed to schedule class")
        }
        setSubmitting(false)
        return
      }

      toast.success("Live class scheduled successfully!")
      setScheduleModalOpen(false)
      setSessionTitle("")
      loadLiveClasses()
    } catch {
      toast.error("Network error while scheduling class")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      toast.error("Please pick a valid date and time")
      return
    }

    const startDateTime = new Date(`${rescheduleDate}T${rescheduleTime}:00`)
    if (isNaN(startDateTime.getTime())) {
      toast.error("Invalid date or time selected")
      return
    }

    if (startDateTime.getTime() <= Date.now()) {
      toast.error("New start time must be in the future")
      return
    }

    const startsAt = startDateTime.toISOString()
    const endsAt = new Date(startDateTime.getTime() + rescheduleDuration * 60000).toISOString()

    setIsRescheduling(true)
    try {
      const res = await fetch(`/api/teacher/live-classes/${rescheduleTarget.id}/reschedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt,
          endsAt,
          reason: rescheduleReason?.trim() || "Timing adjusted by instructor.",
          notifyStudents,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Class rescheduled successfully!")
        setRescheduleTarget(null)
        loadLiveClasses()
      } else {
        toast.error(data.error || "Failed to reschedule")
      }
    } catch {
      toast.error("Network error during reschedule")
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancelSubmit = async () => {
    if (!cancelTarget) return

    try {
      const res = await fetch(`/api/teacher/live-classes/${cancelTarget.id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: cancelReason || "Instructor emergency",
          notifyStudents: true,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        setCancelTarget(null)
        loadLiveClasses()
      } else {
        toast.error(data.error || "Failed to cancel session")
      }
    } catch {
      toast.error("Network error during cancellation")
    }
  }

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Live-Class Scheduler</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Host live interactive lectures, detect schedule collisions, and manage student attendance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl border border-border bg-muted/40">
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                viewMode === "LIST"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
            <button
              onClick={() => setViewMode("CALENDAR")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
                viewMode === "CALENDAR"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setScheduleModalOpen(true)}
            className="shadow-teal-glow gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </Button>
        </div>
      </div>

      {/* Main Agenda List View */}
      {viewMode === "LIST" ? (
        <div className="space-y-3.5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-bold text-sm">No live sessions scheduled</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Schedule Session&quot; to plan your first live interactive class.
              </p>
            </Card>
          ) : (
            classes.map((cls) => {
              const starts = new Date(cls.startsAt)
              const ends = new Date(cls.endsAt)
              const isLive = cls.status === "LIVE"
              const isCancelled = cls.status === "CANCELLED"
              const isCompleted = cls.status === "COMPLETED"

              return (
                <Card
                  key={cls.id}
                  className={`border-border/80 shadow-card hover:shadow-hover transition-all ${
                    isCancelled ? "opacity-60 bg-muted/20" : ""
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isLive ? (
                          <Badge className="bg-destructive text-white animate-pulse">
                            ● LIVE NOW
                          </Badge>
                        ) : isCancelled ? (
                          <Badge variant="outline" className="text-destructive border-destructive/30">
                            Cancelled
                          </Badge>
                        ) : isCompleted ? (
                          <Badge variant="outline" className="text-success border-success/30 bg-success/5">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-brand-ink dark:text-brand-cyan border-brand-teal/30 bg-brand-teal/10">
                            Scheduled
                          </Badge>
                        )}

                        <span className="text-xs font-mono font-semibold text-foreground">
                          {starts.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>

                        <span className="text-xs font-mono text-muted-foreground">
                          {starts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {ends.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>

                        <span className="text-xs text-muted-foreground">• Platform: {cls.platform}</span>
                      </div>

                      <h3 className="text-base font-bold text-foreground truncate">{cls.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{cls.courseTitle} ({cls.courseCode})</p>

                      {cls.meetingPasscode && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          <span>Passcode: {cls.meetingPasscode}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!isCancelled && (
                        <>
                          {!isCompleted ? (
                            <Button asChild size="sm" className="gap-1.5 shadow-sm">
                              <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer">
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>{isLive ? "Host Live Room" : "Open Room"}</span>
                              </a>
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-border bg-muted/40 py-1.5 px-2.5 font-medium">
                              Session Concluded
                            </Badge>
                          )}

                          <Button asChild variant="outline" size="sm">
                            <Link href={`/teacher/attendance?classId=${cls.id}`}>
                              <Users className="w-3.5 h-3.5 mr-1" />
                              <span>Roster</span>
                            </Link>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRecordingModal(cls)}
                            className={`gap-1.5 font-semibold text-xs ${
                              cls.recordingUrl
                                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                : "border-brand-teal/40 text-brand-charcoal dark:text-brand-teal hover:bg-brand-teal/10"
                            }`}
                            title="Attach or update class recording link"
                          >
                            <Video className="w-3.5 h-3.5 text-brand-teal" />
                            <span>{cls.recordingUrl ? "Edit Recording" : "Attach Recording"}</span>
                          </Button>

                          {cls.recordingUrl && (
                            <Button asChild variant="ghost" size="sm" className="text-xs text-brand-teal hover:bg-brand-teal/10">
                              <a href={cls.recordingUrl} target="_blank" rel="noopener noreferrer" title="Preview recording in new tab">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </Button>
                          )}

                          {!isCompleted && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReschedule(cls)}
                                className="gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 font-semibold shadow-xs"
                                title="Reschedule Class Timing"
                              >
                                <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Reschedule</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCancelTarget(cls)}
                                className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
                                title="Cancel Class"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      ) : (
        /* Calendar Grid View */
        <Card className="shadow-card p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-muted-foreground border-b border-border pb-3 mb-3">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
          <div className="grid grid-cols-7 gap-2 min-h-[360px]">
            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1
              const dayClasses = classes.filter((c) => {
                const day = new Date(c.startsAt).getDate()
                return day === dayNum
              })

              return (
                <div
                  key={i}
                  className="p-2 rounded-xl border border-border/60 bg-muted/20 min-h-[90px] flex flex-col justify-between"
                >
                  <span className="font-mono text-xs text-muted-foreground">{dayNum}</span>
                  <div className="space-y-1">
                    {dayClasses.map((c) => (
                      <div
                        key={c.id}
                        className="p-1 rounded bg-brand-teal/15 text-[10px] font-semibold text-brand-ink dark:text-brand-cyan truncate"
                        title={c.title}
                      >
                        {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Schedule Live Class Modal with Real-Time Conflict Detection */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-xl p-6 space-y-4 shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Video className="w-4 h-4 text-brand-teal" />
              <span>Schedule Live Interactive Class</span>
            </DialogTitle>
          </DialogHeader>

          {/* Conflict Warning Banner rendered immediately if conflict occurs */}
          {conflictState && (
            <ConflictWarningBanner
              conflictType={conflictState.conflictType}
              message={conflictState.message}
              conflictingSessions={conflictState.conflictingSessions}
            />
          )}

          <div className="space-y-4 text-xs">
            {/* Course Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Course Association *</Label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-xs focus:ring-2 focus:ring-ring"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-popover text-popover-foreground">
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Session Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Class Title *</Label>
              <Input
                placeholder="e.g. Live Q&A: Service Mesh Architecture & Istio Debugging"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="text-xs sm:text-sm h-9"
                required
              />
            </div>

            {/* Date, Time & Duration */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Duration (Minutes)</Label>
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  min={15}
                  step={15}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Meeting Platform & Link */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Platform</Label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-xs focus:ring-2 focus:ring-ring"
                >
                  <option value="ZOOM" className="bg-popover text-popover-foreground">Zoom Meeting</option>
                  <option value="GOOGLE_MEET" className="bg-popover text-popover-foreground">Google Meet</option>
                  <option value="TEAMS" className="bg-popover text-popover-foreground">Microsoft Teams</option>
                  <option value="CUSTOM" className="bg-popover text-popover-foreground">Custom WebRTC Link</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Meeting Passcode</Label>
                <Input
                  placeholder="Optional Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Meeting Room URL *</Label>
              <Input
                placeholder="https://zoom.us/j/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateSession}
              disabled={submitting || Boolean(conflictState)}
              className="shadow-teal-glow gap-1.5"
            >
              {submitting ? "Checking & Scheduling..." : "Schedule Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={Boolean(rescheduleTarget)} onOpenChange={() => !isRescheduling && setRescheduleTarget(null)}>
        <DialogContent className="max-w-lg p-6 space-y-4 shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-500" />
              <span>Reschedule Live Session</span>
            </DialogTitle>
          </DialogHeader>

          {rescheduleTarget && (
            <div className="space-y-4 text-xs">
              {/* Current vs New preview card */}
              <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground truncate">{rescheduleTarget.title}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-brand-teal border-brand-teal/30">
                    {rescheduleTarget.courseCode}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                  <span>
                    Currently Scheduled:{" "}
                    <strong className="text-foreground">
                      {new Date(rescheduleTarget.startsAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(rescheduleTarget.startsAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">New Date</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="h-10 text-xs font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">New Start Time</Label>
                  <Input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="h-10 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Session Duration</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setRescheduleDuration(mins)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all border ${
                        rescheduleDuration === mins
                          ? "bg-brand-teal text-brand-charcoal border-brand-teal shadow-xs"
                          : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Reschedule Reason (Sent to Students)</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. Schedule shifted to accommodate student requests..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded-xl border border-brand-teal/20 bg-brand-teal/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📧</span>
                  <span className="text-[11px] text-muted-foreground">
                    Email all enrolled learners & update calendar invites (.ics)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
                />
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border pt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setRescheduleTarget(null)} disabled={isRescheduling}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRescheduleSubmit}
              disabled={isRescheduling}
              className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal/90 font-bold gap-1.5 shadow-md shadow-brand-teal/20"
            >
              {isRescheduling ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rescheduling & Sending Emails...</span>
                </>
              ) : (
                <>
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Confirm Reschedule</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={Boolean(cancelTarget)} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent className="max-w-md p-6 space-y-4 shadow-2xl border-destructive/30">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <Ban className="w-4 h-4" />
              <span>Cancel Live Session</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Are you sure you want to cancel &quot;{cancelTarget?.title}&quot;? Enrolled students will receive email and portal cancellation notifications.
            </p>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reason for Cancellation</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Instructor health emergency. Makeup session will be announced shortly."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>
              Keep Session
            </Button>
            <Button variant="destructive" size="sm" onClick={handleCancelSubmit}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attach / Edit Recording Dialog */}
      <Dialog open={Boolean(recordingTarget)} onOpenChange={(open) => !open && setRecordingTarget(null)}>
        <DialogContent className="sm:max-w-md shadow-2xl">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-brand-teal" />
              <span>Attach Class Recording</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
              <h4 className="text-xs font-bold text-foreground truncate">{recordingTarget?.title}</h4>
              <p className="text-[11px] text-muted-foreground">
                Platform: <span className="font-semibold text-foreground">{recordingTarget?.platform}</span>
                {recordingTarget?.meetingId ? ` • ID: ${recordingTarget.meetingId}` : ""}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recording-url" className="text-xs font-semibold">
                Recording Shareable Link (Zoom, YouTube, Drive, or MP4)
              </Label>
              <Input
                id="recording-url"
                placeholder="https://us05web.zoom.us/rec/share/..."
                value={recordingUrlInput}
                onChange={(e) => setRecordingUrlInput(e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Zoom recording page par <strong>&quot;Copy shareable link&quot;</strong> button par click karke link yahan paste karein. Save karte hi student portal par <strong>&quot;Watch Recording&quot;</strong> button activate ho jayega.
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-3 flex items-center justify-between gap-2">
            <div>
              {recordingTarget?.recordingUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecordingUrlInput("")}
                  className="text-xs text-destructive hover:bg-destructive/10"
                  disabled={savingRecording}
                >
                  Clear Link
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRecordingTarget(null)}
                disabled={savingRecording}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSaveRecording}
                disabled={savingRecording}
                className="text-xs font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal gap-1.5"
              >
                {savingRecording ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Publish</span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
