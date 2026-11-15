"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import confetti from "canvas-confetti"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  Clock,
  BookOpen,
  GraduationCap,
  Phone,
  User,
  ArrowRight,
  Code2,
  Share2,
  MessageCircle,
  Laptop,
  Check,
  ChevronRight,
  Loader2,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export const WORKSHOP_DOMAINS = [
  "Artificial Intelligence & Gen AI",
  "Machine Learning",
  "Cyber Security & Ethical Hacking",
  "Data Analytics",
  "Cloud and DevOps",
  "UI/UX Developer",
  "Full Stack Developer",
  "Data Science",
  "DSA in Python",
  "DSA in Java",
  "DSA in C++",
  "App Development",
  "VLSI Design",
  "IoT & Robotics",
  "AutoCAD & MATLAB",
  "HR & Finance",
  "Leadership & Management",
  "Digital Marketing and Growth",
] as const

interface WorkshopBookmark {
  id: string
  timeSeconds: number
  label: string
}

const SMART_MILESTONES: WorkshopBookmark[] = [
  { id: "1", timeSeconds: 30, label: "Welcome & Python Ecosystem Overview" },
  { id: "2", timeSeconds: 360, label: "Variables, Dynamic Typing & Memory Architecture" },
  { id: "3", timeSeconds: 960, label: "Control Flow, Conditional Logic & Loop Optimization" },
  { id: "4", timeSeconds: 1680, label: "Core Data Structures: Lists, Tuples & Dictionaries" },
  { id: "5", timeSeconds: 2280, label: "Object-Oriented Programming (OOP) in Python" },
  { id: "6", timeSeconds: 2700, label: "Live Hands-on Coding Project & Career Roadmap" },
]

export function WorkshopClient() {
  // Gate / Lead State
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [hasCheckedStorage, setHasCheckedStorage] = React.useState(false)

  // Form Fields
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [college, setCollege] = React.useState("")
  const [interestedDomain, setInterestedDomain] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Video Player State
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const progressBarRef = React.useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(3077) // 51m 17s default fallback
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [controlsVisible, setControlsVisible] = React.useState(true)
  const [hoverTime, setHoverTime] = React.useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = React.useState<number>(0)
  const [activeBookmarkId, setActiveBookmarkId] = React.useState<string>("1")

  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Check localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("tg_workshop_unlocked_lead")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.name && parsed?.phone) {
          setName(parsed.name)
          setPhone(parsed.phone)
          setCollege(parsed.college || "")
          setInterestedDomain(parsed.interestedDomain || "")
          setIsUnlocked(true)
        }
      }
    } catch {}
    setHasCheckedStorage(true)
  }, [])

  // Validation: Name min 2 chars, Phone exactly 10 digits, College min 2 chars, Domain selected
  const cleanedPhone = phone.replace(/[^0-9]/g, "")
  const isPhoneValid = cleanedPhone.length === 10
  const isFormValid =
    name.trim().length >= 2 &&
    isPhoneValid &&
    college.trim().length >= 2 &&
    interestedDomain.trim().length > 0

  // Format Time MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const pad = (n: number) => n.toString().padStart(2, "0")
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
    return `${pad(m)}:${pad(s)}`
  }

  // Handle Join Now Form Submission
  const handleJoinNow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/workshop/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanedPhone,
          college: college.trim(),
          interestedDomain,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to register. Please try again.")
      }

      // Save unlock state locally
      try {
        localStorage.setItem(
          "tg_workshop_unlocked_lead",
          JSON.stringify({
            name: name.trim(),
            phone: cleanedPhone,
            college: college.trim(),
            interestedDomain,
            unlockedAt: new Date().toISOString(),
          })
        )
      } catch {}

      // Celebrate
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00D6D6", "#38BDF8", "#34D399", "#FBBF24"],
      })

      setIsUnlocked(true)
      toast.success("Welcome to TechGration Workshop! Session unlocked.")

      // Auto start video after unlock
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {
            // Autoplay might need user interaction in some browsers
          })
        }
      }, 500)
    } catch (err: any) {
      toast.error(err.message || "Could not register. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Video Player Controls
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const seekToTime = (timeInSec: number, bookmarkId?: string) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = timeInSec
    setCurrentTime(timeInSec)
    if (!isPlaying) {
      videoRef.current.play()
    }
    if (bookmarkId) {
      setActiveBookmarkId(bookmarkId)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMuted = !isMuted
    videoRef.current.muted = newMuted
    setIsMuted(newMuted)
  }

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = newVol
    setVolume(newVol)
    setIsMuted(newVol === 0)
  }

  const changePlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = speed
    setPlaybackSpeed(speed)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const targetTime = Math.min(Math.max(pos * duration, 0), duration)
    videoRef.current.currentTime = targetTime
    setCurrentTime(targetTime)
  }

  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    setHoverPosition(pos * 100)
    setHoverTime(pos * duration)
  }

  const handleMouseMove = () => {
    setControlsVisible(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false)
    }, 3500)
  }

  // Update active bookmark as video plays
  React.useEffect(() => {
    const currentBm = [...SMART_MILESTONES]
      .reverse()
      .find((bm) => currentTime >= bm.timeSeconds)
    if (currentBm) {
      setActiveBookmarkId(currentBm.id)
    }
  }, [currentTime])

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🚀 *TechGration Python Fundamentals Workshop Recording is Live!*\n\nWatch the comprehensive 51-min masterclass covering Python syntax, memory architecture, data structures, and practical coding with mentors.\n\n👉 *Watch Full Recording Here:* https://campus.techgration.live/workshop`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  if (!hasCheckedStorage) {
    return (
      <div className="min-h-screen bg-[#080B0E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080B0E] text-slate-100 flex flex-col selection:bg-brand-teal selection:text-brand-charcoal">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#080B0E]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-teal to-cyan-400 flex items-center justify-center text-brand-charcoal font-black text-lg shadow-md shadow-brand-teal/20">
              TG
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                TechGration
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                  Masterclass Series
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden xs:block">
                Exclusive Technical Workshop
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareOnWhatsApp}
              className="h-9 px-3 rounded-xl border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share on WhatsApp</span>
            </Button>

            <a
              href="https://chat.whatsapp.com/invite"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-brand-charcoal font-bold text-xs shadow-md shadow-brand-teal/20 transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* HERO TITLE & HIGHLIGHT BADGES */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-brand-teal/20 text-brand-teal border border-brand-teal/40 font-semibold px-3 py-1">
              🐍 Python Fundamentals Masterclass
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold px-3 py-1">
              HD Video Recording
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold px-3 py-1">
              ⏱️ 51 Mins Duration
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Python Fundamentals & Practical Engineering Workshop
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Master the core concepts of Python programming from scratch. This complete session
            covers language architecture, memory management, data structures, and practical coding
            patterns led by TechGration engineering mentors.
          </p>
        </div>

        {/* 3. VIDEO THEATER CONTAINER */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-black/80 aspect-video group"
        >
          {/* THE ACTUAL HTML5 VIDEO (Plays once unlocked) */}
          <video
            ref={videoRef}
            src="/Recordings/Workshops/Python_Fundamentals_Workshop.mp4"
            playsInline
            preload="metadata"
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime)
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration) {
                setDuration(videoRef.current.duration)
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false)
              confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } })
            }}
            className={`w-full h-full object-contain bg-black ${
              isUnlocked ? "block" : "filter blur-md brightness-50 pointer-events-none"
            }`}
          />

          {/* GATED REGISTRATION OVERLAY (If not unlocked) */}
          <AnimatePresence>
            {!isUnlocked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
              >
                <div className="w-full max-w-md bg-[#0F141A]/95 border border-white/15 rounded-2xl p-5 sm:p-7 shadow-2xl relative my-auto">
                  {/* Glowing Accent Top Bar */}
                  <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-brand-teal to-transparent rounded-full" />

                  {/* Header */}
                  <div className="text-center space-y-1.5 mb-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/15 text-brand-teal text-xs font-bold border border-brand-teal/30 mb-1">
                      <Lock className="w-3 h-3" />
                      Free Access Gate
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      Enter Details to Watch Recording
                    </h2>
                    <p className="text-xs text-slate-400">
                      Fill out the form below to immediately unlock and play the 51-min Python
                      Workshop.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleJoinNow} className="space-y-3.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-brand-teal" />
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Aarav Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-10 text-xs sm:text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>

                    {/* WhatsApp / Phone */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-brand-teal" />
                        WhatsApp / Mobile Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal bg-white/5">
                        <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-400 border-r border-white/10 bg-white/5">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                          required
                          className="flex-1 h-10 px-3 text-xs sm:text-sm bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                      {phone.length > 0 && !isPhoneValid && (
                        <p className="text-[10px] text-amber-400">
                          Please enter a valid 10-digit mobile number ({10 - phone.length} digits
                          remaining)
                        </p>
                      )}
                    </div>

                    {/* College */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-brand-teal" />
                        College / Institution Name <span className="text-rose-400">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. Medicaps University, Indore"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        required
                        className="h-10 text-xs sm:text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                      />
                    </div>

                    {/* Interested Domain Dropdown (18 Domains) */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-brand-teal" />
                        Interested Domain / Program <span className="text-rose-400">*</span>
                      </label>
                      <select
                        value={interestedDomain}
                        onChange={(e) => setInterestedDomain(e.target.value)}
                        required
                        className="w-full h-10 px-3 text-xs sm:text-sm bg-[#161F26] border border-white/10 text-white rounded-xl focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-500 bg-[#0F141A]">
                          -- Select Your Interested Domain --
                        </option>
                        {WORKSHOP_DOMAINS.map((domain, idx) => (
                          <option key={domain} value={domain} className="bg-[#0F141A] text-slate-100 py-1">
                            {idx + 1}. {domain}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* JOIN NOW BUTTON */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full h-11 rounded-xl font-bold text-xs sm:text-sm transition-all gap-2 ${
                          isFormValid && !isSubmitting
                            ? "bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-brand-charcoal shadow-lg shadow-brand-teal/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            : "bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Unlocking Session...</span>
                          </>
                        ) : isFormValid ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            <span>Join Now · Unlock Recording</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Complete All Fields to Join</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-[10px] text-center text-slate-500 pt-1">
                      🔒 Your details are securely recorded. By clicking Join Now, you receive free
                      portal access.
                    </p>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* UNLOCKED CUSTOM VIDEO PLAYER CONTROLS */}
          {isUnlocked && (
            <AnimatePresence>
              {controlsVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-3 sm:p-5 pointer-events-none"
                >
                  {/* Top Bar inside Video */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-brand-teal border border-brand-teal/30 text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Unlocked for {name.split(" ")[0]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShareOnWhatsApp}
                        className="h-8 text-xs bg-black/60 hover:bg-black/80 text-white rounded-lg gap-1.5"
                      >
                        <Share2 className="w-3 h-3 text-emerald-400" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>

                  {/* Center Play/Pause Watermark Tap (Click anywhere in theater) */}
                  <div
                    onClick={togglePlay}
                    className="flex-1 flex items-center justify-center pointer-events-auto cursor-pointer"
                  >
                    {!isPlaying && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-teal/90 text-brand-charcoal flex items-center justify-center shadow-2xl shadow-brand-teal/50 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" />
                      </motion.div>
                    )}
                  </div>

                  {/* Bottom Controls Bar */}
                  <div className="space-y-2 pointer-events-auto bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
                    {/* Timeline Slider with Hover Preview */}
                    <div
                      ref={progressBarRef}
                      onClick={handleTimelineClick}
                      onMouseMove={handleTimelineHover}
                      onMouseLeave={() => setHoverTime(null)}
                      className="relative h-2 sm:h-2.5 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all group/timeline"
                    >
                      {/* Played Progress */}
                      <div
                        style={{ width: `${progressPct}%` }}
                        className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full relative"
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
                      </div>

                      {/* Milestone Markers */}
                      {SMART_MILESTONES.map((bm) => {
                        const markerPct = duration > 0 ? (bm.timeSeconds / duration) * 100 : 0
                        return (
                          <div
                            key={bm.id}
                            style={{ left: `${markerPct}%` }}
                            className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 shadow-xs pointer-events-none"
                            title={bm.label}
                          />
                        )
                      })}

                      {/* Hover Tooltip */}
                      {hoverTime !== null && (
                        <div
                          style={{ left: `${hoverPosition}%` }}
                          className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-white text-[10px] font-mono pointer-events-none whitespace-nowrap border border-white/20 shadow-md"
                        >
                          {formatTime(hoverTime)}
                        </div>
                      )}
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                      {/* Left: Play/Pause, Rewind, Forward, Time */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={togglePlay}
                          className="h-8 w-8 text-white hover:text-brand-teal hover:bg-white/10 rounded-lg"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleSkip(-10)}
                          className="text-slate-300 hover:text-white transition-colors"
                          title="Rewind 10s"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSkip(10)}
                          className="text-slate-300 hover:text-white transition-colors"
                          title="Forward 10s"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>

                        <div className="text-[11px] font-mono text-slate-300 pl-1">
                          <span>{formatTime(currentTime)}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Right: Volume, Speed, Fullscreen */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Volume Control */}
                        <div className="hidden xs:flex items-center gap-1.5 group/vol">
                          <button
                            type="button"
                            onClick={toggleMute}
                            className="text-slate-300 hover:text-white"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-white/30 rounded-lg accent-brand-teal cursor-pointer"
                          />
                        </div>

                        {/* Speed Selector */}
                        <div className="flex items-center bg-white/10 rounded-lg p-0.5">
                          {[1.0, 1.25, 1.5, 2.0].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => changePlaybackSpeed(s)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                playbackSpeed === s
                                  ? "bg-brand-teal text-brand-charcoal"
                                  : "text-slate-300 hover:text-white"
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>

                        {/* Fullscreen */}
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="text-slate-300 hover:text-white p-1"
                          title="Fullscreen"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-4 h-4" />
                          ) : (
                            <Maximize className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* 4. SMART CHAPTERS & TIMESTAMPS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-teal" />
              Workshop Chapters & Topics
            </h3>
            <span className="text-xs text-slate-400">Click any topic to jump instantly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SMART_MILESTONES.map((bm, index) => {
              const isActive = isUnlocked && activeBookmarkId === bm.id
              return (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => {
                    if (!isUnlocked) {
                      toast.info("Please complete the quick registration form above to unlock chapters.")
                      return
                    }
                    seekToTime(bm.timeSeconds, bm.id)
                  }}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                    isActive
                      ? "bg-brand-teal/15 border-brand-teal/50 shadow-md shadow-brand-teal/10 scale-[1.01]"
                      : "bg-[#0F141A] border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? "bg-brand-teal text-brand-charcoal"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {formatTime(bm.timeSeconds)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold leading-snug line-clamp-2 ${
                        isActive ? "text-brand-teal" : "text-white"
                      }`}
                    >
                      {bm.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Chapter {index + 1}</p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                      isActive ? "text-brand-teal translate-x-0.5" : "text-slate-500"
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. WHAT YOU LEARN & CURRICULUM HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
          <div className="p-5 rounded-2xl border border-white/10 bg-[#0F141A] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Core Language Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand Python interpreter internals, dynamic typing, bytecode compilation, and
              memory allocation.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-[#0F141A] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Real-world Problem Solving</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Write clean, pythonic code using list comprehensions, functional programming, and
              modular functions.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-[#0F141A] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Industry Domain Alignment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct pathways into AI & GenAI, Machine Learning, Data Analytics, Cybersecurity, and
              Full Stack Development.
            </p>
          </div>
        </div>

        {/* 6. WHATSAPP COMMUNITY CTA BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0F141A] to-teal-950/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <MessageCircle className="w-4 h-4" />
              Community & Mentor Support
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Have doubts while watching the workshop?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Connect directly with our Lead Engineering Mentors and fellow learners in the
              official TechGration WhatsApp community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              onClick={handleShareOnWhatsApp}
              variant="outline"
              className="w-full sm:w-auto border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs rounded-xl h-11 px-5 gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link with Friends</span>
            </Button>

            <a
              href="https://chat.whatsapp.com/invite"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-brand-charcoal font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>
        </div>
      </main>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/10 bg-[#080B0E] py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 TechGration Technologies. All rights reserved.</p>
          <p>
            Learn, Build & Innovate with Enterprise Industry Engineering Mentorship.
          </p>
        </div>
      </footer>
    </div>
  )
}
