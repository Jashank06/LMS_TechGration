"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { enrollCourseAction } from "@/actions/courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Video,
  PlayCircle,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Search,
  Download,
  CheckCircle2,
  Radio,
  FileCode,
  FolderArchive,
  Users,
  ShieldCheck,
  ChevronRight,
  FileCheck2,
  HelpCircle,
  Award,
  ArrowRight,
} from "lucide-react"
import { QuickSubmitAssignmentModal } from "@/components/student/quick-submit-assignment-modal"

export interface CourseHubData {
  id: string
  title: string
  subtitle: string | null
  description: string
  thumbnailUrl: string
  category: string
  level: string
  format: string
  durationHours: number
  instructorName: string
  instructorTitle: string | null
  isEnrolled: boolean
  progressPct: number
  firstLessonId?: string
  lastLessonId?: string
  liveClasses: Array<{
    id: string
    title: string
    description: string | null
    instructorName: string
    startsAt: string
    endsAt: string
    timezone: string
    meetingUrl: string | null
    recordingUrl: string | null
    platform: string
    status: string
  }>
  recordings: Array<{
    id: string
    title: string
    description: string | null
    durationSec: number
    durationMinutes: number
    videoUrl: string | null
    position: number
    isCompleted: boolean
    resourcesCount: number
  }>
  studyMaterials: Array<{
    id: string
    title: string
    fileUrl: string
    fileSize: string
    fileType: string
    lessonTitle: string
    lessonId: string
  }>
  assignments: Array<{
    id: string
    title: string
    instructions: string
    maxMarks: number
    dueAt: string
    attachments: string[]
    submissionStatus: "PENDING" | "SUBMITTED" | "GRADED"
    marksAwarded: number | null
    feedback: string | null
    submittedAt: string | null
    studentNotes: string | null
    fileUrl: string | null
  }>
  quizzes: Array<{
    id: string
    title: string
    description: string | null
    timeLimitMinutes: number
    passingPct: number
    questionCount: number
    bestScorePct: number | null
    hasPassed: boolean
    totalAttempts: number
  }>
}

interface CourseHubClientProps {
  course: CourseHubData
}

export function CourseHubClient({ course }: CourseHubClientProps) {
  // 6 Primary Academic Sections
  const [activeTab, setActiveTab] = React.useState<
    "live" | "recordings" | "timetable" | "materials" | "assignments" | "quizzes"
  >("live")
  const [copiedLink, setCopiedLink] = React.useState(false)
  const [materialFilter, setMaterialFilter] = React.useState<"ALL" | "PDF" | "IPYNB" | "ZIP">("ALL")
  const [assignmentFilter, setAssignmentFilter] = React.useState<"ALL" | "PENDING" | "SUBMITTED" | "GRADED">("ALL")
  const [searchMaterial, setSearchMaterial] = React.useState("")
  const [searchRecording, setSearchRecording] = React.useState("")
  const [assignmentsList, setAssignmentsList] = React.useState(course.assignments || [])
  const [submittingAssignment, setSubmittingAssignment] = React.useState<CourseHubData["assignments"][0] | null>(null)

  React.useEffect(() => {
    setAssignmentsList(course.assignments || [])
  }, [course.assignments])

  const handleSubmissionSuccess = (updated: { fileUrl: string; studentNotes: string }) => {
    if (!submittingAssignment) return
    setAssignmentsList((prev) =>
      prev.map((a) =>
        a.id === submittingAssignment.id
          ? {
              ...a,
              submissionStatus: "SUBMITTED",
              fileUrl: updated.fileUrl,
              studentNotes: updated.studentNotes,
              submittedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }

  // Identify Active or Next Upcoming Live Class
  const liveOrUpcomingClass = React.useMemo(() => {
    const now = new Date()
    // 1. First look for an explicitly LIVE class or one happening right now
    const currentlyLive = course.liveClasses.find((lc) => {
      const start = new Date(lc.startsAt)
      const end = new Date(lc.endsAt)
      return lc.status === "LIVE" || (now >= start && now <= end)
    })
    if (currentlyLive) return { ...currentlyLive, isLiveNow: true }

    // 2. Otherwise look for the next upcoming scheduled class
    const upcoming = course.liveClasses
      .filter((lc) => new Date(lc.startsAt) > now && lc.status === "SCHEDULED")
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]

    if (upcoming) return { ...upcoming, isLiveNow: false }

    // Fallback to any scheduled class if any
    const anyScheduled = course.liveClasses.find((lc) => lc.status === "SCHEDULED")
    if (anyScheduled) return { ...anyScheduled, isLiveNow: false }

    return null
  }, [course.liveClasses])

  // Live Countdown Timer Hook
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  React.useEffect(() => {
    if (!liveOrUpcomingClass || liveOrUpcomingClass.isLiveNow) return

    const targetTime = new Date(liveOrUpcomingClass.startsAt).getTime()

    const updateCountdown = () => {
      const distance = targetTime - new Date().getTime()
      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [liveOrUpcomingClass])

  // Copy Meeting Link Handler
  const handleCopyMeetLink = () => {
    const url = liveOrUpcomingClass?.meetingUrl || "https://meet.google.com/jan-hnzk-nhf"
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Filtered Study Materials
  const filteredMaterials = React.useMemo(() => {
    return course.studyMaterials.filter((m) => {
      const matchesType = materialFilter === "ALL" || m.fileType.toUpperCase() === materialFilter
      const matchesQuery =
        !searchMaterial.trim() ||
        m.title.toLowerCase().includes(searchMaterial.toLowerCase()) ||
        m.lessonTitle.toLowerCase().includes(searchMaterial.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [course.studyMaterials, materialFilter, searchMaterial])

  // Filtered Recordings
  const filteredRecordings = React.useMemo(() => {
    if (!searchRecording.trim()) return course.recordings
    const q = searchRecording.toLowerCase()
    return course.recordings.filter(
      (r) => r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
    )
  }, [course.recordings, searchRecording])

  const defaultMeetUrl = liveOrUpcomingClass?.meetingUrl || "https://meet.google.com/jan-hnzk-nhf"

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/my-courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-brand-teal transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Enrolled Courses</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
            <Radio className="w-3 h-3 text-brand-teal animate-pulse" />
            <span>Live Interactive Course</span>
          </span>
        </div>
      </div>

      {/* 2. Apple/Google Glassmorphism Hero Banner */}
      <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl overflow-hidden shadow-sm">
        {/* Ambient Brand Illumination Orbs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 bg-brand-teal/20 rounded-full blur-3xl opacity-75 dark:opacity-35" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl opacity-60 dark:opacity-25" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
          {/* Left Column: Course Identity */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs">
                {course.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary text-foreground border border-border/60">
                {course.level}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Live Interactive Classes
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              {course.subtitle || course.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-brand-teal" />
                <span>Google Meet Live Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-brand-teal" />
                <span>{course.recordings.length} Recorded Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-teal" />
                <span>{course.studyMaterials.length} Study Materials</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-500" />
                <span>{course.assignments?.length || 0} Practical Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>{course.quizzes?.length || 0} Knowledge Tests</span>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="pt-4 border-t border-border/60 flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border-2 border-brand-teal/30 shadow-xs ring-2 ring-brand-teal/10">
                <AvatarFallback className="bg-brand-teal/20 text-brand-teal font-extrabold text-sm">
                  JK
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Course Instructor</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm sm:text-base font-bold text-foreground">{course.instructorName || "Jay Kumar"}</p>
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                </div>
                <p className="text-xs text-muted-foreground">{course.instructorTitle || "Senior AI & Cloud Architect"}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Course Action Card */}
          <div className="lg:col-span-4 flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-border/80 bg-secondary/30 backdrop-blur-md space-y-6 shadow-xs">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/70 shadow-inner group">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 384px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-white drop-shadow-md">
                    TechGration Live Batch Active
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {course.isEnrolled ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Enrolled in Batch</span>
                      </span>
                      <span className="font-extrabold text-brand-teal">{course.progressPct}% Completed</span>
                    </div>

                    <div className="relative w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-teal via-cyan-400 to-teal-300 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(course.progressPct, 10)}%` }}
                      />
                    </div>
                  </div>

                  {/* Direct Launch Button */}
                  {liveOrUpcomingClass ? (
                    <Button
                      asChild
                      className="w-full font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-12 rounded-2xl shadow-lg shadow-brand-teal/25 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <a href={defaultMeetUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="w-5 h-5 mr-2" />
                        <span>Join Google Meet Room</span>
                      </a>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveTab("timetable")}
                      className="w-full font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-12 rounded-2xl shadow-lg shadow-brand-teal/25 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>View Batch Schedule</span>
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <form action={enrollCourseAction.bind(null, course.id)}>
                    <Button
                      type="submit"
                      className="w-full font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-12 rounded-2xl shadow-lg shadow-brand-teal/25 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      <span>Enroll in Course (Free Access)</span>
                    </Button>
                  </form>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Instant access to live classes, recordings, timetable, and study repository.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 4 Core Sections — Pure English Tab Navigation Bar */}
      <div className="space-y-6">
        <div className="flex rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl p-1.5 text-xs sm:text-sm overflow-x-auto shadow-xs gap-1.5">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "live"
                ? "bg-brand-teal text-brand-charcoal shadow-md shadow-brand-teal/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Radio className={`w-4 h-4 ${activeTab === "live" ? "animate-pulse" : ""}`} />
            <span>Live Class</span>
            {liveOrUpcomingClass?.isLiveNow && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                LIVE
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("recordings")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "recordings"
                ? "bg-brand-teal text-brand-charcoal shadow-md shadow-brand-teal/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Recordings</span>
            {course.recordings.length > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/80 font-mono">
                {course.recordings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("timetable")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "timetable"
                ? "bg-brand-teal text-brand-charcoal shadow-md shadow-brand-teal/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Time Table</span>
          </button>

          <button
            onClick={() => setActiveTab("materials")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "materials"
                ? "bg-brand-teal text-brand-charcoal shadow-md shadow-brand-teal/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Study Materials</span>
            {course.studyMaterials.length > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/80 font-mono">
                {course.studyMaterials.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "assignments"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Assignments</span>
            {(course.assignments?.length || 0) > 0 && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                  activeTab === "assignments"
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {course.assignments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === "quizzes"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quizzes</span>
            {(course.quizzes?.length || 0) > 0 && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                  activeTab === "quizzes"
                    ? "bg-white/20 text-white"
                    : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                }`}
              >
                {course.quizzes.length}
              </span>
            )}
          </button>
        </div>

        {/* 4. Active Section Content Panels */}
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* SECTION 1: LIVE CLASS                                    */}
          {/* ======================================================== */}
          {activeTab === "live" && (
            <motion.div
              key="live-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {liveOrUpcomingClass ? (
                <div className="rounded-3xl border border-brand-teal/30 bg-gradient-to-br from-card via-card to-brand-teal/5 p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl" />

                  <div className="relative z-10 space-y-6">
                    {/* Status Badge & Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {liveOrUpcomingClass.isLiveNow ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 font-extrabold text-xs tracking-wider animate-pulse">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span>LIVE CLASS IN PROGRESS NOW</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal/15 text-brand-teal border border-brand-teal/30 font-bold text-xs tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          <span>NEXT SCHEDULED LIVE CLASS</span>
                        </div>
                      )}

                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 bg-secondary/70 px-3 py-1 rounded-xl">
                        <Users className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Platform: Google Meet</span>
                      </span>
                    </div>

                    {/* Class Title & Description */}
                    <div className="space-y-2">
                      <h2 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                        {liveOrUpcomingClass.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                        {liveOrUpcomingClass.description ||
                          "Join the live session with instructor Jay Kumar. We will cover end-to-end architecture, interactive code demonstrations, and real-time Q&A."}
                      </p>
                    </div>

                    {/* Countdown Clock (when upcoming) */}
                    {!liveOrUpcomingClass.isLiveNow && (
                      <div className="pt-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Live Session Commences In:
                        </p>
                        <div className="grid grid-cols-4 gap-3 max-w-md">
                          {[
                            { label: "Days", val: timeLeft.days },
                            { label: "Hours", val: timeLeft.hours },
                            { label: "Minutes", val: timeLeft.minutes },
                            { label: "Seconds", val: timeLeft.seconds },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="rounded-2xl border border-border/80 bg-secondary/40 backdrop-blur-md p-3 text-center"
                            >
                              <span className="block text-2xl sm:text-3xl font-black font-mono text-brand-teal">
                                {String(item.val).padStart(2, "0")}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Joining Link & Action Controls */}
                    <div className="pt-4 border-t border-border/60 flex flex-wrap items-center gap-4">
                      <Button
                        asChild
                        className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold h-12 px-8 rounded-2xl shadow-lg shadow-brand-teal/25 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <a
                          href={liveOrUpcomingClass.meetingUrl || defaultMeetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="w-5 h-5 mr-2" />
                          <span>Join Live Class (Google Meet)</span>
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>

                      <Button
                        onClick={handleCopyMeetLink}
                        variant="outline"
                        className="h-12 px-5 rounded-2xl text-xs font-semibold"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-emerald-500" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            <span>Copy Google Meet Link</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Helpful Guidelines */}
                    <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">💡 Class Guidelines:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        <li>Please join 5 minutes early to test your audio & video.</li>
                        <li>Keep your microphone muted while the instructor is presenting.</li>
                        <li>Post any immediate questions in the Google Meet chat or raise your hand during Q&A.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center mx-auto">
                    <Radio className="w-7 h-7 text-brand-teal" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">No Live Class In Session Right Now</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      There is currently no live class running. When your instructor starts the live session, the join link and room status will appear here immediately.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("timetable")}
                    variant="outline"
                    className="rounded-xl text-xs font-semibold"
                  >
                    View Batch Time Table
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: RECORDINGS                                    */}
          {/* ======================================================== */}
          {activeTab === "recordings" && (
            <motion.div
              key="recordings-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {course.recordings.length > 0 ? (
                <>
                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Class Session Recordings ({filteredRecordings.length})
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Recordings of live classes conducted by instructor Jay Kumar.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search recordings..."
                        value={searchRecording}
                        onChange={(e) => setSearchRecording(e.target.value)}
                        className="pl-9 h-10 text-xs rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  {/* Recordings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRecordings.map((rec, idx) => (
                      <div
                        key={rec.id}
                        className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl overflow-hidden shadow-xs hover:border-brand-teal/40 transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-4">
                          <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                            <Image
                              src={course.thumbnailUrl}
                              alt={rec.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute top-3 left-3">
                              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-brand-charcoal/90 text-brand-teal border border-brand-teal/30 shadow-md">
                                Session 0{idx + 1}
                              </span>
                            </div>

                            <div className="absolute bottom-3 right-3">
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-black/80 text-white border border-white/10">
                                {rec.durationMinutes} mins
                              </span>
                            </div>

                            <Link
                              href={`/student/learn/${rec.id}`}
                              className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform"
                            >
                              <div className="w-14 h-14 rounded-full bg-brand-teal text-brand-charcoal flex items-center justify-center shadow-xl shadow-brand-teal/30">
                                <PlayCircle className="w-7 h-7 fill-current" />
                              </div>
                            </Link>
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Instructor: {course.instructorName || "Jay Kumar"}</span>
                              {rec.isCompleted && (
                                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Watched</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-foreground leading-snug group-hover:text-brand-teal transition-colors">
                              {rec.title}
                            </h4>

                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {rec.description || "Live class recording."}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-border/40 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {rec.resourcesCount > 0 ? `📁 ${rec.resourcesCount} Files Attached` : "HD Recording"}
                          </span>

                          <Button
                            asChild
                            size="sm"
                            className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold rounded-xl text-xs"
                          >
                            <Link href={`/student/learn/${rec.id}`}>
                              <span>Watch Recording</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center mx-auto">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">No Recordings Available Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      This course is starting fresh. Recordings of live class sessions will be published here automatically once the live sessions conclude.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: TIME TABLE                                    */}
          {/* ======================================================== */}
          {activeTab === "timetable" && (
            <motion.div
              key="timetable-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {course.liveClasses.length > 0 ? (
                <>
                  <div className="p-5 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-brand-teal/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-teal" />
                        <span>Live Class Schedule</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Classes are held via Google Meet. Ensure you join 5 minutes prior to the scheduled time.
                      </p>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-semibold shrink-0"
                    >
                      <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                        <span>Open Google Calendar</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {course.liveClasses.map((session, idx) => {
                      const dateObj = new Date(session.startsAt)
                      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" })
                      const dateFormatted = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      const timeFormatted = dateObj.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })

                      const isPast = session.status === "COMPLETED" || dateObj < new Date()
                      const isNext = !isPast && idx === 0

                      return (
                        <div
                          key={session.id}
                          className={`p-5 rounded-3xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                            isNext
                              ? "border-brand-teal/50 bg-brand-teal/5 shadow-md shadow-brand-teal/5"
                              : "border-border/80 bg-card/80"
                          }`}
                        >
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border/80 flex flex-col items-center justify-center text-center p-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {dayName.slice(0, 3)}
                              </span>
                              <span className="text-xl font-extrabold text-foreground">
                                {dateObj.getDate()}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground">{dayName}</span>
                                {isNext && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-teal text-brand-charcoal animate-pulse">
                                    NEXT CLASS
                                  </span>
                                )}
                                {isPast && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                                    COMPLETED
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                {timeFormatted} IST
                              </p>
                              <span className="text-[11px] text-muted-foreground">{dateFormatted}</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
                              {session.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {session.description || "Live class lecture."}
                            </p>
                            <p className="text-[11px] text-brand-teal font-medium">
                              Mentor: {session.instructorName || "Jay Kumar"}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            <Button
                              asChild
                              size="sm"
                              className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold rounded-xl text-xs shadow-md shadow-brand-teal/20"
                            >
                              <a
                                href={session.meetingUrl || defaultMeetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="w-3.5 h-3.5 mr-1" />
                                <span>Join Meet Room</span>
                              </a>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center mx-auto">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">Batch Schedule To Be Announced</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      The live class schedule is currently being finalized. You will be notified once the session dates and timings are confirmed by your instructor.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: STUDY MATERIALS                               */}
          {/* ======================================================== */}
          {activeTab === "materials" && (
            <motion.div
              key="materials-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {course.studyMaterials.length > 0 ? (
                <>
                  {/* Category Filter & Search Bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                      {[
                        { id: "ALL", label: "All Files" },
                        { id: "PDF", label: "Slides & Docs (PDF)" },
                        { id: "IPYNB", label: "Notebooks (IPYNB)" },
                        { id: "ZIP", label: "Source Code (ZIP)" },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setMaterialFilter(filter.id as any)}
                          className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                            materialFilter === filter.id
                              ? "bg-brand-teal text-brand-charcoal font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search materials..."
                        value={searchMaterial}
                        onChange={(e) => setSearchMaterial(e.target.value)}
                        className="pl-9 h-9 text-xs rounded-xl bg-background"
                      />
                    </div>
                  </div>

                  {/* Materials Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMaterials.map((mat) => {
                      const isPdf = mat.fileType.toUpperCase() === "PDF"
                      const isNotebook = mat.fileType.toUpperCase() === "IPYNB"

                      return (
                        <div
                          key={mat.id}
                          className="p-5 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl flex items-center justify-between gap-4 hover:border-brand-teal/40 transition-all shadow-xs group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                                isPdf
                                  ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                                  : isNotebook
                                  ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                                  : "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                              }`}
                            >
                              {isPdf ? (
                                <FileText className="w-6 h-6" />
                              ) : isNotebook ? (
                                <FileCode className="w-6 h-6" />
                              ) : (
                                <FolderArchive className="w-6 h-6" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-brand-teal transition-colors">
                                {mat.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="font-semibold text-foreground/80">{mat.fileType}</span>
                                <span>•</span>
                                <span>{mat.fileSize}</span>
                              </div>
                            </div>
                          </div>

                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 rounded-xl text-xs font-semibold shrink-0"
                          >
                            <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" download>
                              <Download className="w-3.5 h-3.5 mr-1.5" />
                              <span>Download</span>
                            </a>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">No Study Materials Uploaded Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Course slides, lecture notes, and source code repositories will be shared here by the instructor during the course.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 5: ASSIGNMENTS (STUDENT VIEW)                    */}
          {/* ======================================================== */}
          {activeTab === "assignments" && (
            <motion.div
              key="assignments-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header Banner */}
              <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Practical Course Milestones</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Course Assignments & Projects
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                      Hands-on engineering tasks evaluated directly by your lead mentor. Submit your code repositories, view grading rubrics, and inspect instructor feedback.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {course.assignments?.length || 0} Total Tasks
                    </span>
                  </div>
                </div>

                {/* Filter Pills */}
                {course.assignments && course.assignments.length > 0 && (
                  <div className="flex items-center gap-2 pt-5 border-t border-border/60 mt-5 overflow-x-auto text-xs">
                    <span className="text-muted-foreground font-semibold shrink-0">Filter:</span>
                    {(["ALL", "PENDING", "SUBMITTED", "GRADED"] as const).map((filter) => {
                      const count =
                        filter === "ALL"
                          ? course.assignments.length
                          : course.assignments.filter((a) => a.submissionStatus === filter).length
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setAssignmentFilter(filter)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                            assignmentFilter === filter
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {filter === "ALL"
                            ? "All Tasks"
                            : filter === "PENDING"
                            ? "Pending"
                            : filter === "SUBMITTED"
                            ? "In Review"
                            : "Graded"}{" "}
                          ({count})
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Assignment Cards List */}
              {assignmentsList && assignmentsList.length > 0 ? (
                <div className="space-y-4">
                  {assignmentsList
                    .filter((asgn) => {
                      if (assignmentFilter === "ALL") return true
                      return asgn.submissionStatus === assignmentFilter
                    })
                    .map((asgn) => {
                      const dueDate = new Date(asgn.dueAt)
                      const formattedDue = dueDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      const isGraded = asgn.submissionStatus === "GRADED"
                      const isSubmitted = asgn.submissionStatus === "SUBMITTED"

                      return (
                        <div
                          key={asgn.id}
                          className="group p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-amber-500/40 hover:shadow-[0_8px_25px_-5px_rgba(245,158,11,0.15)] transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6"
                        >
                          <div className="space-y-2.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                Max {asgn.maxMarks} Points
                              </span>
                              <span className="text-muted-foreground text-xs">•</span>
                              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                <span>Due Date: {formattedDue}</span>
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-amber-500 transition-colors">
                              {asgn.title}
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {asgn.instructions}
                            </p>

                            {asgn.attachments.length > 0 && (
                              <div className="pt-1 flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground font-medium">Starter Code:</span>
                                <a
                                  href={asgn.attachments[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-teal hover:underline flex items-center gap-1 font-mono text-[11px]"
                                >
                                  <span>{asgn.attachments[0]}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {/* If Graded, show awarded marks & feedback preview */}
                            {isGraded && asgn.feedback && (
                              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 mt-2">
                                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Instructor Evaluation:</span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                  {asgn.feedback}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Status & Action */}
                          <div className="shrink-0 flex items-center md:flex-col items-end gap-3 justify-between border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                            <div>
                              {isGraded ? (
                                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Score: {asgn.marksAwarded}/{asgn.maxMarks} pts</span>
                                </span>
                              ) : isSubmitted ? (
                                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-xs">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>In Faculty Review</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Pending Submission</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {!isGraded && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => setSubmittingAssignment(asgn)}
                                  className="font-bold bg-amber-500 hover:bg-amber-600 text-white text-xs h-9 px-4 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                  <span>{isSubmitted ? "Edit" : "Quick Submit"}</span>
                                  <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                              )}
                              <Button
                                asChild
                                size="sm"
                                variant={!isGraded ? "outline" : "default"}
                                className={`font-bold text-xs h-9 px-4 rounded-xl transition-all ${
                                  isGraded
                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                    : "border-border/80 hover:bg-secondary text-foreground"
                                }`}
                              >
                                <Link href={`/student/assignments/${asgn.id}`}>
                                  <span>{isGraded ? "View Evaluation" : "Details"}</span>
                                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-md">
                    <FileCheck2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">No Assignments for this Course Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Your course instructor will publish practical engineering deliverables and evaluation milestones as the syllabus progresses.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 6: QUIZZES (STUDENT VIEW)                        */}
          {/* ======================================================== */}
          {activeTab === "quizzes" && (
            <motion.div
              key="quizzes-section"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header Banner */}
              <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-500/5 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Interactive Knowledge Verification</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Course Quizzes & Assessments
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                      Timed scenario-based evaluations designed to test deep conceptual understanding and validate readiness for enterprise certifications.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      {course.quizzes?.length || 0} Quizzes
                    </span>
                  </div>
                </div>
              </div>

              {/* Quizzes Grid */}
              {course.quizzes && course.quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {course.quizzes.map((quiz) => {
                    const isPassed = quiz.hasPassed
                    const hasAttempted = quiz.bestScorePct !== null

                    return (
                      <div
                        key={quiz.id}
                        className="group p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-purple-500/40 hover:shadow-[0_12px_35px_-8px_rgba(168,85,247,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                              {quiz.questionCount} Questions
                            </span>
                            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-secondary/60 px-2 py-0.5 rounded-md">
                              <Clock className="w-3.5 h-3.5 text-purple-500" />
                              <span>{quiz.timeLimitMinutes} mins</span>
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 group-hover:text-purple-500 transition-colors">
                            {quiz.title}
                          </h3>

                          {quiz.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {quiz.description}
                            </p>
                          )}

                          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-medium">Pass threshold: {quiz.passingPct}%</span>
                            {hasAttempted && (
                              <span
                                className={`font-bold ${
                                  isPassed ? "text-emerald-500" : "text-amber-500"
                                }`}
                              >
                                Best: {quiz.bestScorePct}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status & Launch Action */}
                        <div className="pt-4 mt-2 border-t border-border/60 flex items-center justify-between gap-3">
                          <div>
                            {isPassed ? (
                              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Passed</span>
                              </span>
                            ) : hasAttempted ? (
                              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Retry Available</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                Ready to Begin
                              </span>
                            )}
                          </div>

                          <Button
                            asChild
                            size="sm"
                            className={`font-bold text-xs h-9 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
                              isPassed
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                                : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                            }`}
                          >
                            <Link href={`/student/assessments/${quiz.id}`}>
                              <span>{isPassed ? "Retake Quiz" : hasAttempted ? "Retake Quiz" : "Start Quiz"}</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center mx-auto shadow-md">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">No Quizzes Configured Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Scenario-based multiple-choice quizzes will unlock as you progress through this course.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QUICK IN-HUB SUBMISSION MODAL */}
      <QuickSubmitAssignmentModal
        assignment={submittingAssignment}
        isOpen={Boolean(submittingAssignment)}
        onClose={() => setSubmittingAssignment(null)}
        onSuccess={handleSubmissionSuccess}
      />
    </div>
  )
}
