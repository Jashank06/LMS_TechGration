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
  ArrowRight,
  Share2,
  Loader2,
  Sparkles,
} from "lucide-react"
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

      // Celebrate with confetti
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0D9488", "#14B8A6", "#2DD4BF", "#065F46", "#F59E0B"],
      })

      setIsUnlocked(true)
      toast.success("Welcome! Workshop session unlocked.")

      // Auto-play video after unlock
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {})
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

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🐍 *TechGration Python Fundamentals Workshop Recording*\n\nWatch the full session covering core Python programming, dynamic typing, data structures, and practical coding.\n\n👉 *Watch here:* https://campus.techgration.live/workshop`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  if (!hasCheckedStorage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Subtle Ambient Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-teal-200/35 via-teal-100/15 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* MINIMAL NAVBAR */}
      <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-teal-600/30">
              TG
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              TechGration
            </span>
          </div>

          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {!isUnlocked ? (
          /* ========================================================
             GATE / REGISTRATION CARD (Light & Teal Minimal Theme)
             ======================================================== */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            {/* Header / Title */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Workshop Recording
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Python Fundamentals Workshop
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Enter your details below to unlock and watch the full session.
              </p>
            </div>

            {/* Clean White Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50">
              <form onSubmit={handleJoinNow} className="space-y-4">
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* 2. Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 bg-slate-50/70 transition-all">
                    <span className="inline-flex items-center px-3 text-xs font-medium text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      required
                      className="flex-1 h-10 px-3 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  {phone.length > 0 && !isPhoneValid && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      Enter 10-digit number ({10 - phone.length} digits left)
                    </p>
                  )}
                </div>

                {/* 3. College / Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    College / Institution <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Medicaps University, Indore"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* 4. Interested Domain (18 Domains Dropdown) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Interested Domain <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={interestedDomain}
                      onChange={(e) => setInterestedDomain(e.target.value)}
                      required
                      className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all cursor-pointer appearance-none pr-8"
                    >
                      <option value="" disabled className="text-slate-400">
                        -- Select Domain --
                      </option>
                      {WORKSHOP_DOMAINS.map((domain, idx) => (
                        <option key={domain} value={domain} className="text-slate-900 py-1">
                          {idx + 1}. {domain}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* JOIN NOW BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full h-11 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      isFormValid && !isSubmitting
                        ? "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 cursor-pointer"
                        : "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Unlocking...</span>
                      </>
                    ) : isFormValid ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Join Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Fill all fields to Join</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400 pt-1">
                  Free instant access · Your details will be saved to continue
                </p>
              </form>
            </div>
          </motion.div>
        ) : (
          /* ========================================================
             UNLOCKED VIDEO THEATER (Clean, Light & Teal Aesthetic)
             ======================================================== */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-4"
          >
            {/* Minimal Unlocked Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200/80 rounded-full px-2.5 py-0.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Unlocked for {name}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Python Fundamentals Workshop
                </h1>
              </div>

              <button
                type="button"
                onClick={handleShareOnWhatsApp}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/70 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share with Friends</span>
              </button>
            </div>

            {/* Video Container */}
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-black shadow-xl aspect-video group"
            >
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
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain bg-black"
              />

              {/* VIDEO CONTROLS OVERLAY */}
              <AnimatePresence>
                {controlsVisible && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 sm:p-5 pointer-events-none"
                  >
                    {/* Big Center Play/Pause button when paused */}
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
                    >
                      {!isPlaying && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-500/90 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                          <Play className="w-7 h-7 fill-current translate-x-0.5" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Controls Bar */}
                    <div className="space-y-2 pointer-events-auto bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                      {/* Timeline Slider with Hover Preview */}
                      <div
                        ref={progressBarRef}
                        onClick={handleTimelineClick}
                        onMouseMove={handleTimelineHover}
                        onMouseLeave={() => setHoverTime(null)}
                        className="relative h-1.5 sm:h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer transition-all group/timeline"
                      >
                        {/* Played Progress */}
                        <div
                          style={{ width: `${progressPct}%` }}
                          className="h-full bg-teal-400 rounded-full relative"
                        >
                          <div className="w-3 h-3 rounded-full bg-white shadow absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
                        </div>

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
                      <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                        {/* Left: Play/Pause, Rewind, Forward, Time */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={togglePlay}
                            className="text-white hover:text-teal-400 transition-colors p-1"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSkip(-10)}
                            className="text-slate-300 hover:text-white transition-colors"
                            title="Rewind 10s"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSkip(10)}
                            className="text-slate-300 hover:text-white transition-colors"
                            title="Forward 10s"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-[11px] font-mono text-slate-300 pl-1">
                            <span>{formatTime(currentTime)}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        {/* Right: Volume, Speed, Fullscreen */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          {/* Volume */}
                          <div className="hidden xs:flex items-center gap-1.5">
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
                              className="w-14 h-1 bg-white/30 rounded-lg accent-teal-400 cursor-pointer"
                            />
                          </div>

                          {/* Speed Selector */}
                          <div className="flex items-center bg-white/10 rounded-md p-0.5">
                            {[1.0, 1.25, 1.5, 2.0].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => changePlaybackSpeed(s)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                  playbackSpeed === s
                                    ? "bg-teal-400 text-slate-900"
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
            </div>
          </motion.div>
        )}
      </main>

      {/* CLEAN MINIMAL FOOTER */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        <p>© 2026 TechGration. All rights reserved.</p>
      </footer>
    </div>
  )
}
