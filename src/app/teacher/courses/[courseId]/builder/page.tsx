"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { PageTransition } from "@/components/motion/page-transition"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Radio,
  Video,
  Calendar,
  FileText,
  PlayCircle,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  Eye,
  FileCode,
  FolderArchive,
  RefreshCw,
  UploadCloud,
  FileUp,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  CheckSquare,
  HelpCircle,
  Award,
  Trophy,
  Edit2,
} from "lucide-react"
import { toast } from "sonner"
import { CreateAssignmentModal } from "@/components/teacher/create-assignment-modal"
import { CreateQuizModal } from "@/components/teacher/create-quiz-modal"
import { EditAssignmentModal } from "@/components/teacher/edit-assignment-modal"
import { EditQuizModal } from "@/components/teacher/edit-quiz-modal"
import { DeleteConfirmDialog } from "@/components/teacher/delete-confirm-dialog"
import { AssignmentSubmissionsDrawer } from "@/components/teacher/assignment-submissions-drawer"

export interface TeacherAssignmentItem {
  id: string
  courseId: string
  title: string
  instructions: string
  maxMarks: number
  dueAt: string
  attachments: string[]
  totalSubmissions: number
  gradedCount: number
  pendingCount: number
  averageScore: number | null
  submissions: Array<{
    id: string
    studentName: string
    studentEmail: string
    submittedAt: string
    status: string
    marksAwarded: number | null
    feedback: string | null
  }>
}

export interface TeacherAssessmentItem {
  id: string
  courseId: string
  title: string
  description: string | null
  timeLimitMinutes: number
  passingPct: number
  questionCount: number
  totalAttempts: number
  passedAttempts: number
  passRate: number
  averageScore: number | null
  questions: Array<{
    id: string
    prompt: string
    points: number
    explanation: string | null
    options: Array<{ id: string; label: string; isCorrect: boolean }>
  }>
  recentAttempts: Array<{
    id: string
    studentName: string
    scorePct: number
    passed: boolean
    submittedAt: string
  }>
}

export interface LiveClassItem {
  id: string
  courseId: string
  title: string
  description: string | null
  instructorName: string
  startsAt: string
  endsAt: string
  timezone: string
  platform: string
  meetingUrl: string | null
  recordingUrl: string | null
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}

export interface MaterialItem {
  id: string
  title: string
  fileUrl: string
  fileSize: string
  fileType: string
  createdAt: string
}

export interface CourseData {
  id: string
  code: string
  title: string
  subtitle: string | null
  category: string
  level: string
  format: string
  description: string
  instructorName: string
  enrolledCount: number
  approvalStatus: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  liveClasses: LiveClassItem[]
  materials: MaterialItem[]
  modules?: any[]
}

export default function TeacherCourseHubPage() {
  const params = useParams()
  const courseId = params?.courseId as string

  const [course, setCourse] = React.useState<CourseData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"live" | "recordings" | "timetable" | "materials" | "assignments" | "quizzes">("live")
  const [copiedMeetId, setCopiedMeetId] = React.useState<string | null>(null)
  const [submittingApproval, setSubmittingApproval] = React.useState(false)

  // Course Assignments & Quizzes State
  const [assignments, setAssignments] = React.useState<TeacherAssignmentItem[]>([])
  const [assessments, setAssessments] = React.useState<TeacherAssessmentItem[]>([])
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = React.useState(false)
  const [showCreateQuizModal, setShowCreateQuizModal] = React.useState(false)
  const [editingAssignmentId, setEditingAssignmentId] = React.useState<string | null>(null)
  const [submissionsAssignmentId, setSubmissionsAssignmentId] = React.useState<string | null>(null)
  const [editingAssessmentId, setEditingAssessmentId] = React.useState<string | null>(null)

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: "ASSIGNMENT" | "ASSESSMENT"
    id: string
    title: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const endpoint =
        deleteTarget.type === "ASSIGNMENT"
          ? `/api/teacher/assignments/${deleteTarget.id}`
          : `/api/teacher/assessments/${deleteTarget.id}`

      const res = await fetch(endpoint, { method: "DELETE" })
      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(
          data.message ||
            `${deleteTarget.type === "ASSIGNMENT" ? "Assignment" : "Quiz"} deleted`
        )
        if (deleteTarget.type === "ASSIGNMENT") {
          fetchAssignments()
        } else {
          fetchAssessments()
        }
        setDeleteTarget(null)
      } else {
        toast.error(data.error || "Failed to delete item")
      }
    } catch (err) {
      console.error(err)
      toast.error("Network error during delete")
    } finally {
      setIsDeleting(false)
    }
  }

  // Live Class Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = React.useState(false)
  const [isScheduling, setIsScheduling] = React.useState(false)
  const [scheduleForm, setScheduleForm] = React.useState({
    title: "",
    description: "",
    startsAt: "",
    durationMinutes: 90,
    meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
    platform: "GOOGLE_MEET",
  })

  // Timetable Generator State
  const [isGeneratingTimetable, setIsGeneratingTimetable] = React.useState(false)

  // Material Upload Modal State
  const [showUploadModal, setShowUploadModal] = React.useState(false)
  const [uploadTab, setUploadTab] = React.useState<"file" | "link">("file")
  const [isUploadingMaterial, setIsUploadingMaterial] = React.useState(false)
  const [materialForm, setMaterialForm] = React.useState({
    title: "",
    fileUrl: "",
    fileType: "PDF",
    fileSize: "2.5 MB",
  })
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [materialFilter, setMaterialFilter] = React.useState<"ALL" | "PDF" | "IPYNB" | "ZIP">("ALL")
  const [searchMaterial, setSearchMaterial] = React.useState("")

  const fetchAssignments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/assignments`)
      const json = await res.json()
      if (json.assignments) setAssignments(json.assignments)
    } catch (e) {
      console.error("Failed to load course assignments:", e)
    }
  }, [courseId])

  const fetchAssessments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/assessments`)
      const json = await res.json()
      if (json.assessments) setAssessments(json.assessments)
    } catch (e) {
      console.error("Failed to load course assessments:", e)
    }
  }, [courseId])

  // Fetch full course data with liveClasses and materials
  const fetchCourseData = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`)
      const json = await res.json()
      if (json.course) {
        setCourse(json.course)
      }
    } catch (err) {
      console.error("Failed to load course details:", err)
      toast.error("Failed to load course details")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  React.useEffect(() => {
    if (courseId) {
      fetchCourseData()
      fetchAssignments()
      fetchAssessments()
    }
  }, [courseId, fetchCourseData, fetchAssignments, fetchAssessments])

  // Copy Meeting URL helper
  const handleCopyMeetUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedMeetId(id)
    toast.success("Student Google Meet link copied to clipboard!")
    setTimeout(() => setCopiedMeetId(null), 2500)
  }

  // Submit for Admin Approval
  const handleSubmitForApproval = async () => {
    setSubmittingApproval(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/submit`, {
        method: "POST",
      })
      const data = await res.json()
      if (res.ok) {
        triggerBrandCelebration()
        toast.success(data.message || "Course submitted for administrative review!")
        if (course) {
          setCourse({ ...course, approvalStatus: "PENDING_APPROVAL" })
        }
      } else {
        toast.error(data.error || "Submission failed")
      }
    } catch {
      toast.error("Network error during submission")
    } finally {
      setSubmittingApproval(false)
    }
  }

  // Handle Schedule Live Class
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleForm.title.trim() || !scheduleForm.startsAt) {
      toast.error("Please enter a title and start date/time")
      return
    }

    setIsScheduling(true)
    try {
      const startDate = new Date(scheduleForm.startsAt)
      const endDate = new Date(startDate.getTime() + scheduleForm.durationMinutes * 60 * 1000)

      const res = await fetch(`/api/teacher/courses/${courseId}/live-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scheduleForm.title.trim(),
          description: scheduleForm.description.trim() || null,
          startsAt: startDate.toISOString(),
          endsAt: endDate.toISOString(),
          meetingUrl: scheduleForm.meetingUrl.trim(),
          platform: scheduleForm.platform,
        }),
      })

      const data = await res.json()
      if (res.ok && data.liveClass) {
        triggerBrandCelebration()
        toast.success("Live class scheduled successfully!")
        setShowScheduleModal(false)
        setScheduleForm({
          title: "",
          description: "",
          startsAt: "",
          durationMinutes: 90,
          meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
          platform: "GOOGLE_MEET",
        })
        await fetchCourseData()
      } else {
        toast.error(data.error || "Failed to schedule live class")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to connect to server")
    } finally {
      setIsScheduling(false)
    }
  }

  // Handle Delete Live Class
  const handleDeleteLiveClass = async (classId: string) => {
    if (!confirm("Are you sure you want to cancel and remove this live class session?")) return

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/live-classes/${classId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Live class session removed")
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                liveClasses: prev.liveClasses.filter((lc) => lc.id !== classId),
              }
            : null
        )
      } else {
        toast.error("Failed to remove live class")
      }
    } catch {
      toast.error("Error removing live class")
    }
  }

  // Handle Status Update (SCHEDULED -> IN_PROGRESS -> COMPLETED)
  const handleUpdateStatus = async (classId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/live-classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Session status updated to ${newStatus}`)
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                liveClasses: prev.liveClasses.map((lc) =>
                  lc.id === classId ? { ...lc, status: newStatus as any } : lc
                ),
              }
            : null
        )
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  // Handle Generate Weekly Schedule
  const handleGenerateWeeklyTimetable = async () => {
    setIsGeneratingTimetable(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/timetable/generate`, {
        method: "POST",
      })
      const data = await res.json()
      if (res.ok) {
        triggerBrandCelebration()
        toast.success(data.message || "Weekly class schedule generated!")
        await fetchCourseData()
      } else {
        toast.error(data.error || "Failed to generate timetable")
      }
    } catch {
      toast.error("Failed to generate timetable")
    } finally {
      setIsGeneratingTimetable(false)
    }
  }

  // Handle Upload Study Material (Direct File via Cloudinary)
  const handleUploadFileMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    setIsUploadingMaterial(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      if (materialForm.title.trim()) {
        formData.append("title", materialForm.title.trim())
      }

      const res = await fetch(`/api/teacher/courses/${courseId}/materials/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.material) {
        triggerBrandCelebration()
        toast.success("Study material uploaded to Cloudinary & published!")
        setShowUploadModal(false)
        setSelectedFile(null)
        setMaterialForm({
          title: "",
          fileUrl: "",
          fileType: "PDF",
          fileSize: "2.5 MB",
        })
        await fetchCourseData()
      } else {
        toast.error(data.error || "Upload failed")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload file")
    } finally {
      setIsUploadingMaterial(false)
    }
  }

  // Handle Link Study Material (URL)
  const handleUploadLinkMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialForm.title.trim() || !materialForm.fileUrl.trim()) {
      toast.error("Please enter a title and file link")
      return
    }

    setIsUploadingMaterial(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: materialForm.title.trim(),
          fileUrl: materialForm.fileUrl.trim(),
          fileType: materialForm.fileType,
          fileSize: materialForm.fileSize.trim() || "2.5 MB",
        }),
      })
      const data = await res.json()

      if (res.ok && data.material) {
        triggerBrandCelebration()
        toast.success("Study material published to students!")
        setShowUploadModal(false)
        setMaterialForm({
          title: "",
          fileUrl: "",
          fileType: "PDF",
          fileSize: "2.5 MB",
        })
        await fetchCourseData()
      } else {
        toast.error(data.error || "Failed to publish material")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to publish material")
    } finally {
      setIsUploadingMaterial(false)
    }
  }

  // Handle Delete Material
  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Delete this study material from the course?")) return

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/materials/${materialId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Study material removed")
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                materials: prev.materials.filter((m) => m.id !== materialId),
              }
            : null
        )
      } else {
        toast.error("Failed to delete material")
      }
    } catch {
      toast.error("Failed to delete material")
    }
  }

  // Find next upcoming or ongoing live class
  const activeOrUpcomingClass = React.useMemo(() => {
    if (!course?.liveClasses?.length) return null
    const now = new Date()
    const liveNow = course.liveClasses.find((lc) => {
      if (lc.status === "IN_PROGRESS") return true
      const start = new Date(lc.startsAt)
      const end = new Date(lc.endsAt)
      return now >= start && now <= end
    })
    if (liveNow) return { ...liveNow, isLiveNow: true }

    const upcoming = course.liveClasses
      .filter((lc) => new Date(lc.startsAt) > now && lc.status !== "COMPLETED")
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]

    return upcoming ? { ...upcoming, isLiveNow: false } : null
  }, [course?.liveClasses])

  // Filtered Study Materials
  const filteredMaterials = React.useMemo(() => {
    if (!course?.materials) return []
    return course.materials.filter((m) => {
      const matchesType =
        materialFilter === "ALL" || m.fileType.toUpperCase().includes(materialFilter)
      const matchesSearch =
        !searchMaterial.trim() ||
        m.title.toLowerCase().includes(searchMaterial.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [course?.materials, materialFilter, searchMaterial])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="h-24 rounded-3xl bg-muted/60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40" />
          ))}
        </div>
        <div className="h-96 rounded-3xl bg-muted/30" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested course could not be found or you do not have permission to manage it.
        </p>
        <Button asChild size="sm" className="mt-4">
          <Link href="/teacher/courses">Return to Courses</Link>
        </Button>
      </div>
    )
  }

  const statusConfig = {
    APPROVED: { label: "Published & Active", color: "bg-success/15 text-success border-success/30" },
    PENDING_APPROVAL: { label: "Pending Admin Approval", color: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
    DRAFT: { label: "Draft Workspace", color: "bg-muted text-muted-foreground border-border" },
    REJECTED: { label: "Revision Requested", color: "bg-destructive/15 text-destructive border-destructive/30" },
  }[course.approvalStatus] || { label: course.approvalStatus, color: "bg-muted text-muted-foreground" }

  return (
    <PageTransition className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* 1. TOP BAR: Back Link, Course Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="icon-sm" className="-ml-1">
              <Link href="/teacher/courses">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Badge variant="outline" className={`text-[10px] font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-md">
              {course.code}
            </span>
            <span className="text-xs font-semibold text-brand-teal bg-brand-teal/10 px-2.5 py-0.5 rounded-md">
              Instructor: {course.instructorName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {course.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {course.subtitle || course.category} • Course Management & Live Classes Hub
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Course Leaderboard */}
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
            <Link href={`/teacher/leaderboard?courseId=${course.id}`}>
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Course Leaderboard</span>
            </Link>
          </Button>

          {/* Preview Student Portal Experience */}
          <Button asChild variant="outline" size="sm" className="gap-1.5 shadow-xs">
            <a href={`/student/courses/${course.id}`} target="_blank" rel="noopener noreferrer">
              <Eye className="w-3.5 h-3.5 text-brand-teal" />
              <span>Preview Student View</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
            </a>
          </Button>

          {course.approvalStatus !== "APPROVED" && (
            <Button
              size="sm"
              onClick={handleSubmitForApproval}
              disabled={submittingApproval || course.approvalStatus === "PENDING_APPROVAL"}
              className="shadow-teal-glow gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {course.approvalStatus === "PENDING_APPROVAL"
                  ? "In Review by Admin"
                  : "Submit for Admin Approval"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Enrolled Students</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-2xl font-black text-foreground">{course.enrolledCount}</div>
          <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Real-time active batch
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Live Classes</span>
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground">{course.liveClasses?.length || 0}</div>
          <div className="text-[11px] text-muted-foreground">Scheduled or completed</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Batch Timetable</span>
            <Calendar className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-foreground">Tue / Thu / Sat</div>
          <div className="text-[11px] text-muted-foreground">8:00 PM – 9:30 PM IST</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Study Materials</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{course.materials?.length || 0}</div>
          <div className="text-[11px] text-brand-teal font-medium">PDFs, Notebooks & Code</div>
        </div>
      </div>

      {/* 3. THE 4 CORE SECTIONS — PURE ENGLISH TAB NAVIGATION BAR */}
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
            {activeOrUpcomingClass?.isLiveNow && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                LIVE
              </span>
            )}
            {course.liveClasses?.length > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/80 font-mono">
                {course.liveClasses.length}
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
            {course.materials?.length > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/80 font-mono">
                {course.materials.length}
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
            <CheckSquare className="w-4 h-4" />
            <span>Assignments</span>
            {assignments.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                  activeTab === "assignments"
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {assignments.length}
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
            <span>Quizzes & Tests</span>
            {assessments.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                  activeTab === "quizzes"
                    ? "bg-white/20 text-white"
                    : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                }`}
              >
                {assessments.length}
              </span>
            )}
          </button>
        </div>

        {/* 4. ACTIVE SECTION CONTENT PANELS */}
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* SECTION 1: LIVE CLASS (TEACHER MANAGEMENT)                */}
          {/* ======================================================== */}
          {activeTab === "live" && (
            <motion.div
              key="live-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Radio className="w-5 h-5 text-brand-teal" />
                    <span>Live Classes</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Schedule, manage, and launch live interactive video sessions for your enrolled students.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowScheduleModal(true)}
                    className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal shadow-teal-glow gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Live Class</span>
                  </Button>
                </div>
              </div>

              {/* Spotlight: Active or Next Scheduled Session */}
              {activeOrUpcomingClass ? (
                <div className="rounded-3xl border border-brand-teal/40 bg-gradient-to-br from-card via-card to-brand-teal/10 p-6 sm:p-8 shadow-md relative overflow-hidden">
                  <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl" />

                  <div className="relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {activeOrUpcomingClass.isLiveNow ? (
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse shadow-md">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            <span>LIVE NOW — STUDENTS WAITING</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Next Upcoming Session</span>
                          </span>
                        )}
                        <span className="text-xs font-mono text-muted-foreground">
                          {activeOrUpcomingClass.platform}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={activeOrUpcomingClass.status}
                          onChange={(e) => handleUpdateStatus(activeOrUpcomingClass.id, e.target.value)}
                          className="text-xs font-semibold bg-secondary border border-border rounded-lg px-2.5 py-1 text-foreground"
                        >
                          <option value="SCHEDULED">Status: SCHEDULED</option>
                          <option value="IN_PROGRESS">Status: IN PROGRESS</option>
                          <option value="COMPLETED">Status: COMPLETED</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-foreground">
                        {activeOrUpcomingClass.title}
                      </h3>
                      {activeOrUpcomingClass.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {activeOrUpcomingClass.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Date & Start Time</div>
                        <div className="text-sm font-bold text-foreground">
                          {new Date(activeOrUpcomingClass.startsAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} • {new Date(activeOrUpcomingClass.startsAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })} IST
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] text-muted-foreground">Host Instructor</div>
                        <div className="text-sm font-bold text-foreground">
                          {activeOrUpcomingClass.instructorName}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] text-muted-foreground">Meeting Room</div>
                        <div className="text-sm font-mono text-brand-teal truncate">
                          {activeOrUpcomingClass.meetingUrl || "https://meet.google.com/jan-hnzk-nhf"}
                        </div>
                      </div>
                    </div>

                    {/* Teacher Action Controls */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        asChild
                        className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-11 px-6 rounded-xl shadow-teal-glow gap-2 text-sm"
                      >
                        <a
                          href={activeOrUpcomingClass.meetingUrl || "https://meet.google.com/jan-hnzk-nhf"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="w-4 h-4" />
                          <span>Launch as Host (Google Meet)</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-1" />
                        </a>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          handleCopyMeetUrl(
                            activeOrUpcomingClass.meetingUrl || "https://meet.google.com/jan-hnzk-nhf",
                            activeOrUpcomingClass.id
                          )
                        }
                        className="h-11 rounded-xl text-xs font-semibold gap-1.5"
                      >
                        {copiedMeetId === activeOrUpcomingClass.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-muted-foreground" />
                            <span>Copy Student Meet Link</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLiveClass(activeOrUpcomingClass.id)}
                        className="text-destructive hover:bg-destructive/10 h-11 rounded-xl text-xs ml-auto gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Cancel Session</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-4 bg-card/40">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto">
                    <Radio className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">No Live Classes Scheduled Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Schedule a live Google Meet class for your students. They will immediately see it on their course portal with countdown and join buttons.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold shadow-teal-glow gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule First Live Class</span>
                  </Button>
                </div>
              )}

              {/* All Live Classes Registry Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    All Scheduled Live Sessions ({course.liveClasses?.length || 0})
                  </h3>
                </div>

                {course.liveClasses && course.liveClasses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.liveClasses.map((lc) => (
                      <div
                        key={lc.id}
                        className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                lc.status === "COMPLETED"
                                  ? "bg-secondary text-muted-foreground"
                                  : lc.status === "IN_PROGRESS"
                                  ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                                  : "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                              }`}
                            >
                              {lc.status}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {lc.platform}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-foreground line-clamp-1">{lc.title}</h4>
                          {lc.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{lc.description}</p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-border/60 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              <Clock className="w-3.5 h-3.5 text-brand-teal" />
                              <span>
                                {new Date(lc.startsAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })} • {new Date(lc.startsAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </span>
                            <span className="font-mono text-[11px]">{lc.timezone}</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 gap-1.5 font-semibold text-brand-teal hover:text-brand-teal"
                            >
                              <a
                                href={lc.meetingUrl || "https://meet.google.com/jan-hnzk-nhf"}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Room</span>
                              </a>
                            </Button>

                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleCopyMeetUrl(
                                    lc.meetingUrl || "https://meet.google.com/jan-hnzk-nhf",
                                    lc.id
                                  )
                                }
                                className="h-8 px-2 text-xs text-muted-foreground"
                                title="Copy Student Link"
                              >
                                {copiedMeetId === lc.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteLiveClass(lc.id)}
                                className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                                title="Delete Session"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: RECORDINGS HUB (TEACHER VIEW)                  */}
          {/* ======================================================== */}
          {activeTab === "recordings" && (
            <motion.div
              key="recordings-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-cyan-500/5 p-8 sm:p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-xl mx-auto">
                  <h3 className="text-xl font-extrabold text-foreground">Class Video Recordings</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    TechGration records and archives live class sessions. Once a live class is completed, the recorded video stream is cataloged here and automatically synchronized with the student portal.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Real-time Student Video Streaming Sync Active</span>
                </div>
              </div>

              {/* List of past classes where recordings can be linked */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Recorded Live Sessions</h3>
                <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">
                    No session recordings are currently published. Completed Google Meet sessions will be attached here.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: TIME TABLE (SCHEDULE HUB)                      */}
          {/* ======================================================== */}
          {activeTab === "timetable" && (
            <motion.div
              key="timetable-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-teal" />
                    <span>Class Time Table & Weekly Schedule</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure recurring class time slots and live session agendas for students.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleGenerateWeeklyTimetable}
                    disabled={isGeneratingTimetable}
                    variant="outline"
                    className="text-xs font-bold gap-1.5 border-brand-teal/40 hover:bg-brand-teal/10"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTimetable ? "animate-spin" : ""}`} />
                    <span>Generate Weekly Schedule (Tue / Thu / Sat 8:00 PM IST)</span>
                  </Button>

                  <Button
                    onClick={() => setShowScheduleModal(true)}
                    className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs shadow-teal-glow gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Session</span>
                  </Button>
                </div>
              </div>

              {/* Weekly Recurring Time Table Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-brand-teal/30 bg-card/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-teal">Every Tuesday</span>
                    <Badge variant="outline" className="text-[10px] bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                      Live Lecture
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-foreground">Theory, Math & Foundations</div>
                    <div className="text-xs text-muted-foreground">8:00 PM – 9:30 PM IST (90 Mins)</div>
                  </div>
                  <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Google Meet Live Class</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-cyan-500/30 bg-card/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-500">Every Thursday</span>
                    <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                      Hands-on Lab
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-foreground">Code Mechanics & PyTorch</div>
                    <div className="text-xs text-muted-foreground">8:00 PM – 9:30 PM IST (90 Mins)</div>
                  </div>
                  <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Jupyter Notebooks & Live Coding</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-purple-500/30 bg-card/80 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400">Every Saturday</span>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                      Production Review
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-foreground">Deployments & Capstone QA</div>
                    <div className="text-xs text-muted-foreground">8:00 PM – 9:30 PM IST (90 Mins)</div>
                  </div>
                  <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Student Code Review & Guidance</span>
                  </div>
                </div>
              </div>

              {/* Chronological Scheduled Timetable Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Scheduled Classes Timeline
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {course.liveClasses?.length || 0} Scheduled Sessions
                  </span>
                </div>

                {course.liveClasses && course.liveClasses.length > 0 ? (
                  <div className="space-y-2.5">
                    {course.liveClasses.map((lc, idx) => (
                      <div
                        key={lc.id}
                        className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-teal/40 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-mono font-bold text-xs text-brand-teal shrink-0">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-foreground">{lc.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-foreground">
                                {new Date(lc.startsAt).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(lc.startsAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}{" "}
                                IST
                              </span>
                              <span>•</span>
                              <span className="text-brand-teal font-medium">{lc.platform}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 font-semibold"
                          >
                            <a
                              href={lc.meetingUrl || "https://meet.google.com/jan-hnzk-nhf"}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video className="w-3.5 h-3.5 mr-1 text-brand-teal" />
                              <span>Join</span>
                            </a>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteLiveClass(lc.id)}
                            className="text-destructive hover:bg-destructive/10 h-8 px-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No timetable dates added yet. Click &quot;Generate Weekly Schedule&quot; above to auto-create standard weekly class sessions.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 4: STUDY MATERIALS (STUDY MATERIALS HUB)          */}
          {/* ======================================================== */}
          {activeTab === "materials" && (
            <motion.div
              key="materials-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-teal" />
                    <span>Study Materials & Code Repository</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upload PDF lecture slides, Jupyter notebooks (.ipynb), code packages (.zip), and handouts for your students.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs shadow-teal-glow gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Study Material</span>
                  </Button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/60 border border-border/60 text-xs">
                  {(["ALL", "PDF", "IPYNB", "ZIP"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMaterialFilter(type)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        materialFilter === type
                          ? "bg-brand-teal text-brand-charcoal shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type === "ALL" ? "All Formats" : type}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-72">
                  <Input
                    placeholder="Search materials by title..."
                    value={searchMaterial}
                    onChange={(e) => setSearchMaterial(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Materials Grid */}
              {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((m) => {
                    const isPdf = m.fileType.toUpperCase().includes("PDF")
                    const isNotebook = m.fileType.toUpperCase().includes("IPYNB")
                    const isZip = m.fileType.toUpperCase().includes("ZIP")

                    return (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-3 flex flex-col justify-between hover:border-brand-teal/40 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                              {isPdf ? (
                                <FileText className="w-5 h-5 text-rose-500" />
                              ) : isNotebook ? (
                                <FileCode className="w-5 h-5 text-amber-500" />
                              ) : isZip ? (
                                <FolderArchive className="w-5 h-5 text-purple-400" />
                              ) : (
                                <FileText className="w-5 h-5 text-brand-teal" />
                              )}
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {m.fileType.toUpperCase()}
                            </Badge>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                              {m.title}
                            </h4>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-1">
                              <span>{m.fileSize}</span>
                              <span>•</span>
                              <span>
                                {new Date(m.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 font-semibold flex-1"
                          >
                            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              <span>Download / View</span>
                            </a>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMaterial(m.id)}
                            className="h-8 px-2 text-destructive hover:bg-destructive/10"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-4 bg-card/40">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <FileUp className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">No Study Materials Uploaded Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Upload PDFs, lecture slides, Jupyter notebooks, or code packages. They will instantly appear on enrolled students&apos; portals with 1-click download access.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold shadow-teal-glow gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload First Material</span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 5: COURSE ASSIGNMENTS (TEACHER MANAGEMENT)       */}
          {/* ======================================================== */}
          {activeTab === "assignments" && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header with Metrics & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Course Practical Deliverables</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Assignments & Projects Management
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Author practical engineering deliverables, set due dates, evaluation rubrics, and grade student submissions.
                  </p>
                </div>

                <Button
                  onClick={() => setShowCreateAssignmentModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-amber-500/20 gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </Button>
              </div>

              {/* Assignments List */}
              {assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((asgn) => {
                    const dueDate = new Date(asgn.dueAt)
                    const formattedDue = dueDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })

                    return (
                      <div
                        key={asgn.id}
                        className="p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-amber-500/40 transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 group"
                      >
                        <div className="space-y-2.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Max {asgn.maxMarks} Points
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              <span>Due: {formattedDue}</span>
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">
                            {asgn.title}
                          </h4>

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
                        </div>

                        {/* Submission Stats & Action */}
                        <div className="shrink-0 flex flex-col items-end gap-3 justify-between border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                          <div className="flex items-center gap-2 text-right">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-secondary text-foreground">
                              {asgn.totalSubmissions} Submissions
                            </span>
                            {asgn.pendingCount > 0 ? (
                              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {asgn.pendingCount} Needs Review
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                All Graded
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setSubmissionsAssignmentId(asgn.id)}
                              className="text-xs h-9 px-3.5 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs"
                            >
                              <span>View & Grade</span>
                              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAssignmentId(asgn.id)}
                              className="text-xs h-9 px-3 rounded-xl border-border/80 hover:bg-secondary text-foreground"
                              title="Edit Assignment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "ASSIGNMENT",
                                  id: asgn.id,
                                  title: asgn.title,
                                })
                              }
                              className="text-xs h-9 px-3 rounded-xl border-border/80 hover:bg-destructive/10 text-destructive hover:border-destructive/30"
                              title="Delete Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card/40">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-md">
                    <CheckSquare className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">No Course Assignments Published</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Publish capstone deliverables, code repos, and architecture diagrams for students enrolled in this course.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateAssignmentModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20 gap-1.5 rounded-xl text-xs h-10 px-5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Assignment</span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SECTION 6: COURSE QUIZZES (TEACHER MANAGEMENT)           */}
          {/* ======================================================== */}
          {activeTab === "quizzes" && (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header with Metrics & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Knowledge Verification & Tests</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Quizzes & Assessments Management
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Build timed scenario evaluations, configure passing scores, author question options, and monitor student pass rates.
                  </p>
                </div>

                <Button
                  onClick={() => setShowCreateQuizModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-purple-600/20 gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Quiz</span>
                </Button>
              </div>

              {/* Quizzes Grid */}
              {assessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {assessments.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                            {quiz.questionCount} Questions
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            <span>{quiz.timeLimitMinutes} mins</span>
                          </span>
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
                            <div className="text-[10px] text-muted-foreground font-medium">Pass Threshold</div>
                            <div className="text-xs font-bold text-foreground">{quiz.passingPct}%</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground font-medium">Total Attempts</div>
                            <div className="text-xs font-bold text-foreground">{quiz.totalAttempts}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground font-medium">Pass Rate</div>
                            <div className="text-xs font-bold text-emerald-500">{quiz.passRate}%</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground truncate">
                          {quiz.totalAttempts > 0 ? `${quiz.totalAttempts} attempts recorded` : "Zero attempts yet"}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 px-2.5 rounded-xl border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-bold"
                          >
                            <Link href={`/student/assessments/${quiz.id}`} target="_blank">
                              <span>Preview</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAssessmentId(quiz.id)}
                            className="text-xs h-8 px-2.5 rounded-xl border-border/80 hover:bg-secondary text-foreground"
                            title="Edit Quiz"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setDeleteTarget({
                                type: "ASSESSMENT",
                                id: quiz.id,
                                title: quiz.title,
                              })
                            }
                            className="text-xs h-8 px-2.5 rounded-xl border-border/80 hover:bg-destructive/10 text-destructive hover:border-destructive/30"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card/40">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center mx-auto shadow-md">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">No Course Quizzes Configured</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Build scenario-based MCQs with instant feedback and grading for students enrolled in this course.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateQuizModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 gap-1.5 rounded-xl text-xs h-10 px-5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Quiz</span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SCHEDULE LIVE CLASS MODAL                       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-brand-teal" />
                  <h3 className="text-lg font-bold text-foreground">Schedule Live Class</h3>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Session Title *</label>
                  <Input
                    placeholder="e.g. Live Class: High-Performance Neural Architectures"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Agenda / Topics Covered</label>
                  <textarea
                    placeholder="Detailed agenda or topics for students..."
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-input p-3 text-xs outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Date & Start Time *</label>
                    <Input
                      type="datetime-local"
                      value={scheduleForm.startsAt}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startsAt: e.target.value })}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Duration (Minutes)</label>
                    <select
                      value={scheduleForm.durationMinutes}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, durationMinutes: Number(e.target.value) })
                      }
                      className="w-full h-9 rounded-lg border border-border bg-input px-3 text-xs outline-none"
                    >
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes (1 Hour)</option>
                      <option value={90}>90 Minutes (1.5 Hours)</option>
                      <option value={120}>120 Minutes (2 Hours)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Google Meet Link</label>
                  <Input
                    placeholder="https://meet.google.com/jan-hnzk-nhf"
                    value={scheduleForm.meetingUrl}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingUrl: e.target.value })}
                    required
                    className="text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Students will receive this Google Meet room link with 1-click launch.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowScheduleModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isScheduling}
                    className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs shadow-teal-glow"
                  >
                    {isScheduling ? "Scheduling..." : "Schedule Live Class"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: UPLOAD STUDY MATERIAL MODAL                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-brand-teal" />
                  <h3 className="text-lg font-bold text-foreground">Publish Study Material</h3>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Method Switch */}
              <div className="flex rounded-xl bg-secondary/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadTab("file")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    uploadTab === "file"
                      ? "bg-brand-teal text-brand-charcoal shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Direct File Upload (Cloudinary)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab("link")}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    uploadTab === "link"
                      ? "bg-brand-teal text-brand-charcoal shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cloud Resource Link / URL
                </button>
              </div>

              {uploadTab === "file" ? (
                <form onSubmit={handleUploadFileMaterial} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Material Title (Optional)</label>
                    <Input
                      placeholder="e.g. Lecture 01 Slides — Neural Network Foundations"
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                      className="text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      If left empty, original file name will be used automatically.
                    </p>
                  </div>

                  {/* Dropzone File Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Select File *</label>
                    <div className="border-2 border-dashed border-border/80 hover:border-brand-teal/60 rounded-2xl p-6 text-center space-y-2 bg-muted/20 cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept=".pdf,.ipynb,.zip,.docx,.py,.json"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0])
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-10 h-10 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {selectedFile ? (
                          <span className="text-brand-teal font-bold">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                        ) : (
                          <span>Click to browse or drop PDF, IPYNB, ZIP file</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Maximum file size: 40MB • Uploads securely to Cloudinary storage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowUploadModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploadingMaterial || !selectedFile}
                      className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs shadow-teal-glow"
                    >
                      {isUploadingMaterial ? "Uploading to Cloudinary..." : "Upload & Publish"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleUploadLinkMaterial} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Material Title *</label>
                    <Input
                      placeholder="e.g. Capstone Project Starter Code Repository"
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Direct Resource / Download URL *</label>
                    <Input
                      placeholder="https://drive.google.com/... or https://github.com/..."
                      value={materialForm.fileUrl}
                      onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                      required
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">File Format</label>
                      <select
                        value={materialForm.fileType}
                        onChange={(e) => setMaterialForm({ ...materialForm, fileType: e.target.value })}
                        className="w-full h-9 rounded-lg border border-border bg-input px-3 text-xs outline-none"
                      >
                        <option value="PDF">PDF Document</option>
                        <option value="IPYNB">Jupyter Notebook (.ipynb)</option>
                        <option value="ZIP">ZIP Code Package (.zip)</option>
                        <option value="DOC">Word / Notes (.docx)</option>
                        <option value="CODE">Source Code (.py/.ts)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">File Size Label</label>
                      <Input
                        placeholder="e.g. 4.2 MB"
                        value={materialForm.fileSize}
                        onChange={(e) => setMaterialForm({ ...materialForm, fileSize: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowUploadModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploadingMaterial}
                      className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs shadow-teal-glow"
                    >
                      {isUploadingMaterial ? "Publishing..." : "Publish Material Link"}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. STICKY BOTTOM SUMMARY BAR */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-border bg-background/90 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <Layers className="w-4 h-4 text-brand-teal" />
              <span>{course.liveClasses?.length || 0} Live Sessions</span>
            </span>
            <span>•</span>
            <span>{course.materials?.length || 0} Study Materials</span>
            <span>•</span>
            <span className="text-emerald-500 font-semibold">{course.enrolledCount} Students Enrolled</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium">Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* MODAL 3: CREATE COURSE ASSIGNMENT MODAL */}
      <CreateAssignmentModal
        courseId={course.id}
        isOpen={showCreateAssignmentModal}
        onClose={() => setShowCreateAssignmentModal(false)}
        onSuccess={() => {
          fetchAssignments()
          fetchCourseData()
        }}
      />

      {/* MODAL 4: CREATE COURSE QUIZ MODAL */}
      <CreateQuizModal
        courseId={course.id}
        isOpen={showCreateQuizModal}
        onClose={() => setShowCreateQuizModal(false)}
        onSuccess={() => {
          fetchAssessments()
          fetchCourseData()
        }}
      />

      {/* MODAL 5: EDIT COURSE ASSIGNMENT MODAL */}
      <EditAssignmentModal
        assignmentId={editingAssignmentId}
        isOpen={Boolean(editingAssignmentId)}
        onClose={() => setEditingAssignmentId(null)}
        onSuccess={() => {
          fetchAssignments()
          fetchCourseData()
        }}
      />

      {/* MODAL 6: EDIT COURSE QUIZ MODAL */}
      <EditQuizModal
        assessmentId={editingAssessmentId}
        isOpen={Boolean(editingAssessmentId)}
        onClose={() => setEditingAssessmentId(null)}
        onSuccess={() => {
          fetchAssessments()
          fetchCourseData()
        }}
      />

      {/* MODAL 7: ASSIGNMENT SUBMISSIONS & EVALUATION DRAWER */}
      <AssignmentSubmissionsDrawer
        assignmentId={submissionsAssignmentId}
        isOpen={Boolean(submissionsAssignmentId)}
        onClose={() => setSubmissionsAssignmentId(null)}
        onGraded={() => {
          fetchAssignments()
        }}
      />

      {/* MODAL 8: PERMANENT DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={
          deleteTarget?.type === "ASSIGNMENT"
            ? "Delete Assignment?"
            : "Delete Quiz & Assessments?"
        }
        description={
          deleteTarget?.type === "ASSIGNMENT"
            ? "This will permanently delete this assignment and all student submissions. This action cannot be undone."
            : "This will permanently delete this quiz, its questions, and all student attempt records. This action cannot be undone."
        }
        itemName={deleteTarget?.title}
        loading={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </PageTransition>
  )
}
