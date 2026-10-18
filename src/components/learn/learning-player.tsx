"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import { completeLessonAction, saveNoteAction, createDiscussionAction } from "@/actions/learn"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  FileText,
  Download,
  Bookmark,
  Share2,
  Clock,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Loader2,
} from "lucide-react"

export interface LearnLessonData {
  id: string
  title: string
  description: string
  type: string
  videoUrl: string | null
  durationMinutes: number
  isCompleted: boolean
  moduleTitle: string
  courseTitle: string
  courseId: string
  prevLessonId?: string | null
  nextLessonId?: string | null
  curriculum: Array<{
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      type: string
      durationMinutes: number
      isCompleted: boolean
    }>
  }>
  initialNotes: Array<{
    id: string
    content: string
    timestampSeconds: number
    createdAt: string
  }>
  initialDiscussions: Array<{
    id: string
    userName: string
    avatarUrl?: string | null
    content: string
    createdAt: string
    repliesCount: number
  }>
  resources?: Array<{
    id: string
    title: string
    fileUrl: string
    fileSize: string
    fileType: string
  }>
}

export function LearningPlayer({ lesson }: { lesson: LearnLessonData }) {
  const router = useRouter()
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Player states
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(lesson.durationMinutes * 60)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0)
  const [isCompleted, setIsCompleted] = React.useState(lesson.isCompleted)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  // Interactive Tab states
  const [notes, setNotes] = React.useState(lesson.initialNotes)
  const [newNote, setNewNote] = React.useState("")
  const [isSavingNote, setIsSavingNote] = React.useState(false)

  const [discussions, setDiscussions] = React.useState(lesson.initialDiscussions)
  const [newQuestion, setNewQuestion] = React.useState("")
  const [isSubmittingQuestion, setIsSubmittingQuestion] = React.useState(false)

  // Hotkeys
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.code === "Space") {
        e.preventDefault()
        togglePlay()
      } else if (e.code === "ArrowRight") {
        e.preventDefault()
        seekRelative(5)
      } else if (e.code === "ArrowLeft") {
        e.preventDefault()
        seekRelative(-5)
      } else if (e.code === "KeyM") {
        e.preventDefault()
        toggleMute()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, isMuted])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || duration, videoRef.current.currentTime + seconds)
    )
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleSpeedChange = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen?.()
    }
  }

  const handleMarkComplete = async () => {
    setIsCompleted(true)
    triggerBrandCelebration()
    await completeLessonAction(lesson.id)

    // If next lesson exists, prompt or auto-navigate
    if (lesson.nextLessonId) {
      setTimeout(() => {
        router.push(`/student/learn/${lesson.nextLessonId}`)
      }, 1200)
    }
  }

  const handleSaveNote = async () => {
    if (!newNote.trim()) return
    setIsSavingNote(true)
    const result = await saveNoteAction(lesson.id, newNote, Math.floor(currentTime))
    if (result.success && result.note) {
      setNotes((prev) => [
        {
          id: result.note.id,
          content: result.note.content,
          timestampSeconds: result.note.timestampSeconds,
          createdAt: "Just now",
        },
        ...prev,
      ])
      setNewNote("")
    }
    setIsSavingNote(false)
  }

  const handlePostQuestion = async () => {
    if (!newQuestion.trim()) return
    setIsSubmittingQuestion(true)
    const result = await createDiscussionAction(lesson.id, newQuestion)
    if (result.success && result.discussion) {
      setDiscussions((prev) => [
        {
          id: result.discussion.id,
          userName: "You",
          content: result.discussion.content,
          createdAt: "Just now",
          repliesCount: 0,
        },
        ...prev,
      ])
      setNewQuestion("")
    }
    setIsSubmittingQuestion(false)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = Math.floor(secs % 60)
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)] bg-background">
      {/* Main Video & Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Navigation & Status Header */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate w-full sm:w-auto">
            <Link
              href={`/student/courses/${lesson.courseId}`}
              className="text-muted-foreground hover:text-foreground truncate transition-colors font-medium"
            >
              {lesson.courseTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground font-semibold truncate">{lesson.title}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
            {lesson.prevLessonId && (
              <Button asChild variant="outline" size="sm" className="h-8 sm:h-7 text-xs font-semibold px-2.5 sm:px-3">
                <Link href={`/student/learn/${lesson.prevLessonId}`}>
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Prev</span>
                </Link>
              </Button>
            )}

            <Button
              onClick={handleMarkComplete}
              size="sm"
              className={`h-8 sm:h-7 text-xs font-semibold transition-all px-3 ${
                isCompleted
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>{isCompleted ? "Completed ✓" : "Complete"}</span>
            </Button>

            {lesson.nextLessonId && (
              <Button asChild variant="outline" size="sm" className="h-8 sm:h-7 text-xs font-semibold px-2.5 sm:px-3">
                <Link href={`/student/learn/${lesson.nextLessonId}`}>
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground lg:block hidden ml-1"
              title="Toggle Curriculum Sidebar"
            >
              {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Video Player Canvas */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden select-none">
          {lesson.videoUrl ? (
            <video
              ref={videoRef}
              src={lesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleMarkComplete}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />
          ) : (
            <div className="text-neutral-400 text-xs flex flex-col items-center gap-2">
              <Play className="w-12 h-12 text-brand-teal animate-pulse" />
              <span>Interactive architectural lesson stream</span>
            </div>
          )}

          {/* Big Center Play Icon when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors"
              aria-label="Play video"
            >
              <div className="w-16 h-16 rounded-full bg-brand-teal/90 text-brand-charcoal flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                <Play className="w-8 h-8 ml-1 fill-current" />
              </div>
            </button>
          )}

          {/* Custom Controls Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Timeline Scrub bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-brand-teal"
            />

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="hover:text-brand-teal transition-colors">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button onClick={() => seekRelative(-5)} title="Rewind 5s" className="hover:text-brand-teal transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button onClick={toggleMute} className="hover:text-brand-teal transition-colors">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="font-mono text-[11px] text-white/80">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSpeedChange}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {playbackSpeed}x
                </button>
                <button onClick={toggleFullscreen} className="hover:text-brand-teal transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Learning Workspace */}
        <div className="p-4 sm:p-6 flex-1">
          <Tabs defaultValue="overview" className="w-full space-y-4">
            <TabsList className="bg-muted/60 p-1 border border-border flex items-center overflow-x-auto no-scrollbar touch-pan-x w-full justify-start sm:justify-center">
              <TabsTrigger value="overview" className="text-xs whitespace-nowrap shrink-0 min-h-[40px] px-3 sm:px-4">
                Overview & Architecture
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs whitespace-nowrap shrink-0 min-h-[40px] px-3 sm:px-4">
                My Notes ({notes.length})
              </TabsTrigger>
              <TabsTrigger value="discussions" className="text-xs whitespace-nowrap shrink-0 min-h-[40px] px-3 sm:px-4">
                Q&A Discussions ({discussions.length})
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs whitespace-nowrap shrink-0 min-h-[40px] px-3 sm:px-4">
                Resources & Code
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 pt-2">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {lesson.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Module: {lesson.moduleTitle} • {lesson.durationMinutes} Minutes Lecture & Lab
                </p>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-xs sm:text-sm leading-relaxed">
                <p className="whitespace-pre-line">{lesson.description || "Lecture content and interactive instructions."}</p>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Add a private note at current time ({formatTime(currentTime)}):</label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Take notes, record architectural tips, or jot down questions..."
                    className="w-full text-xs p-3 rounded-lg border border-border bg-card text-foreground focus:outline-brand-teal resize-none"
                  />
                  <Button
                    onClick={handleSaveNote}
                    disabled={isSavingNote || !newNote.trim()}
                    className="shrink-0 bg-brand-teal text-brand-charcoal font-semibold text-xs self-end h-10 px-4"
                  >
                    {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Note"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">No notes recorded yet. Write your thoughts above.</p>
                ) : (
                  notes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-mono text-brand-ink dark:text-brand-teal font-semibold">
                          Timestamp: {formatTime(n.timestampSeconds)}
                        </span>
                        <span>{n.createdAt}</span>
                      </div>
                      <p className="text-foreground">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Q&A Discussions Tab */}
            <TabsContent value="discussions" className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Ask Instructor or Classmates:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a technical question about this lesson..."
                    className="w-full text-xs px-3 h-10 rounded-lg border border-border bg-card text-foreground focus:outline-brand-teal"
                  />
                  <Button
                    onClick={handlePostQuestion}
                    disabled={isSubmittingQuestion || !newQuestion.trim()}
                    className="shrink-0 bg-brand-teal text-brand-charcoal font-semibold text-xs h-10 px-4"
                  >
                    {isSubmittingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {discussions.map((d) => {
                  const authorInitials = (d.userName || "TG")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()

                  return (
                    <div key={d.id} className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-6 w-6 rounded-full border border-brand-teal/30 ring-1 ring-brand-teal/10">
                            {d.avatarUrl && (
                              <AvatarImage src={d.avatarUrl} alt={d.userName} className="object-cover" />
                            )}
                            <AvatarFallback className="bg-brand-teal/15 text-brand-charcoal dark:text-brand-teal text-[10px] font-bold">
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-foreground">{d.userName}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{d.createdAt}</span>
                      </div>
                      <p className="text-muted-foreground pl-8">{d.content}</p>
                      <div className="pt-0.5 pl-8 flex items-center gap-1 text-[11px] text-brand-ink dark:text-brand-teal font-medium">
                        <MessageSquare className="w-3 h-3" />
                        <span>{d.repliesCount} Instructor Replies</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            {/* Resources & Study Materials Tab */}
            <TabsContent value="resources" className="space-y-3 pt-2">
              {lesson.resources && lesson.resources.length > 0 ? (
                <div className="space-y-2.5">
                  {lesson.resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between hover:border-brand-teal/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{res.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {res.fileType} • {res.fileSize}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs shrink-0 ml-3">
                        <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-3.5 h-3.5 mr-1" />
                          <span>Download</span>
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-border bg-secondary/20 text-center space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-semibold text-foreground">Lecture Slides & Study Materials</p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Instructor Jay Kumar will share accompanying slides, notebooks, and reference code for this class session.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Class Session Recordings Sidebar */}
      {sidebarOpen && (
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/40 flex flex-col shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="p-4 border-b border-border bg-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Class Recordings
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {lesson.curriculum.reduce((acc, m) => acc + m.lessons.length, 0)} Live Recorded Sessions
              </p>
            </div>
          </div>

          <div className="p-3 space-y-1.5 divide-y divide-border/40">
            {lesson.curriculum.flatMap((mod) => mod.lessons).map((l, idx) => {
              const isCurrent = l.id === lesson.id
              return (
                <Link
                  key={l.id}
                  href={`/student/learn/${l.id}`}
                  className={`pt-2 p-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                    isCurrent
                      ? "bg-brand-teal/15 text-brand-ink dark:text-brand-teal font-semibold border border-brand-teal/30 shadow-xs"
                      : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {l.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Play className="w-4 h-4 text-brand-teal shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block">
                        Session {idx + 1}
                      </span>
                      <p className="truncate text-foreground font-medium">
                        {l.title.replace(/^Session \d+:\s*/i, "")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono ml-2 shrink-0 bg-secondary/80 px-1.5 py-0.5 rounded">
                    {l.durationMinutes}m
                  </span>
                </Link>
              )
            })}
          </div>
        </aside>
      )}
    </div>
  )
}
