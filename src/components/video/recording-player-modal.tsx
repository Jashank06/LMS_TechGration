"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Download,
  Bookmark,
  Plus,
  Clock,
  Sparkles,
  X,
  Video,
  Check,
  CheckCircle2,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export interface RecordingModalData {
  id: string
  title: string
  videoUrl: string
  courseTitle?: string
  instructorName?: string
  conductedDate?: string
  description?: string | null
  durationMinutes?: number
}

interface RecordingPlayerModalProps {
  recording: RecordingModalData | null
  onClose: () => void
}

interface VideoBookmark {
  id: string
  timeSeconds: number
  label: string
}

export function RecordingPlayerModal({ recording, onClose }: RecordingPlayerModalProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const progressBarRef = React.useRef<HTMLDivElement>(null)

  // Player state
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [bufferedEnd, setBufferedEnd] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [controlsVisible, setControlsVisible] = React.useState(true)
  const [hoverTime, setHoverTime] = React.useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = React.useState<number>(0)
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false)
  const [resumePromptTime, setResumePromptTime] = React.useState<number | null>(null)

  // Interactive Bookmarks
  const [bookmarks, setBookmarks] = React.useState<VideoBookmark[]>([])
  const [newBookmarkLabel, setNewBookmarkLabel] = React.useState("")
  const [showBookmarkInput, setShowBookmarkInput] = React.useState(false)

  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Formatting helper MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const pad = (n: number) => n.toString().padStart(2, "0")
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
    return `${pad(m)}:${pad(s)}`
  }

  // Load saved position & bookmarks from localStorage
  React.useEffect(() => {
    if (!recording) return

    const storageKey = `tg_rec_pos_${recording.id}`
    const bookmarkKey = `tg_rec_bookmarks_${recording.id}`

    // Check bookmarks
    try {
      const savedBms = localStorage.getItem(bookmarkKey)
      if (savedBms) {
        setBookmarks(JSON.parse(savedBms))
      } else {
        // Default smart milestones based on session
        if (recording.title?.includes("Class 4")) {
          setBookmarks([
            { id: "1", timeSeconds: 30, label: "Welcome & Class 3 Recap" },
            { id: "2", timeSeconds: 300, label: "Sequence Models & Attention" },
            { id: "3", timeSeconds: 1080, label: "Transformer Mathematics (Q, K, V)" },
            { id: "4", timeSeconds: 2280, label: "Hands-on Code Walkthrough" },
            { id: "5", timeSeconds: 3240, label: "Q&A, Doubt Clearing & Next Steps" },
          ])
        } else if (recording.title?.includes("Class 3")) {
          setBookmarks([
            { id: "1", timeSeconds: 30, label: "Welcome & Architecture Review" },
            { id: "2", timeSeconds: 300, label: "Multi-Head Attention & Math" },
            { id: "3", timeSeconds: 900, label: "Transformer Coding & PyTorch Setup" },
            { id: "4", timeSeconds: 2100, label: "Live Doubt Clearing & Project Guidance" },
          ])
        } else {
          setBookmarks([
            { id: "1", timeSeconds: 30, label: "Welcome & Cohort Kickoff" },
            { id: "2", timeSeconds: 300, label: "Foundations & Landscape" },
            { id: "3", timeSeconds: 900, label: "Core Concepts Walkthrough" },
          ])
        }
      }
    } catch {}

    // Check resume position
    try {
      const savedPos = localStorage.getItem(storageKey)
      if (savedPos) {
        const sec = parseFloat(savedPos)
        if (sec > 15) {
          setResumePromptTime(sec)
        }
      }
    } catch {}
  }, [recording])

  // Save current position periodically
  React.useEffect(() => {
    if (!recording || currentTime < 5) return
    const storageKey = `tg_rec_pos_${recording.id}`
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, currentTime.toString())
      } catch {}
    }, 1500)
    return () => clearTimeout(timer)
  }, [recording, currentTime])

  // Controls auto-hide
  const triggerControlsActivity = React.useCallback(() => {
    setControlsVisible(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false)
        setShowSpeedMenu(false)
      }, 2600)
    }
  }, [isPlaying])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setIsPlaying(true)
      setResumePromptTime(null)
    } else {
      video.pause()
      setIsPlaying(false)
      setControlsVisible(true)
    }
  }

  const handleSeek = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, duration))
    setCurrentTime(video.currentTime)
  }

  const handleSkip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration))
    triggerControlsActivity()
  }

  const handleSpeedSelect = (speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
    toast.success(`Speed set to ${speed}x`)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    if (isMuted) {
      video.muted = false
      video.volume = volume || 1
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = newVol
    video.muted = newVol === 0
    setVolume(newVol)
    setIsMuted(newVol === 0)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return
    const doc = document as any
    const isFull = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    )

    if (!isFull) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {})
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen()
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen()
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {})
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Fullscreen change listener across all browsers
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any
      const isFull = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      )
      setIsFullscreen(isFull)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  const togglePiP = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
      }
    } catch (err: any) {
      toast.error("Picture-in-Picture not supported in this browser.")
    }
  }

  // Keyboard Shortcuts
  React.useEffect(() => {
    if (!recording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if typing in bookmark input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
        case "j":
          e.preventDefault()
          handleSkip(-10)
          break
        case "ArrowRight":
        case "l":
          e.preventDefault()
          handleSkip(10)
          break
        case "ArrowUp":
          e.preventDefault()
          handleVolumeChange(Math.min(1, volume + 0.1))
          break
        case "ArrowDown":
          e.preventDefault()
          handleVolumeChange(Math.max(0, volume - 0.1))
          break
        case "m":
        case "M":
          e.preventDefault()
          toggleMute()
          break
        case "f":
        case "F":
          e.preventDefault()
          toggleFullscreen()
          break
        case "Escape":
          if (!document.fullscreenElement) {
            onClose()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [recording, isPlaying, volume, isMuted, duration])

  // Progress scrubbing calculation
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current
    if (!bar || duration === 0) return
    const rect = bar.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverPosition(e.clientX - rect.left)
    setHoverTime(pos * duration)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current
    if (!bar || duration === 0) return
    const rect = bar.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    handleSeek(pos * duration)
  }

  // Add bookmark
  const handleAddBookmark = () => {
    if (!recording) return
    const label = newBookmarkLabel.trim() || `Bookmark at ${formatTime(currentTime)}`
    const updated = [
      ...bookmarks,
      {
        id: Date.now().toString(),
        timeSeconds: Math.floor(currentTime),
        label,
      },
    ].sort((a, b) => a.timeSeconds - b.timeSeconds)

    setBookmarks(updated)
    setNewBookmarkLabel("")
    setShowBookmarkInput(false)
    try {
      localStorage.setItem(`tg_rec_bookmarks_${recording.id}`, JSON.stringify(updated))
    } catch {}
    toast.success(`Bookmark saved at ${formatTime(currentTime)}!`)
  }

  if (!recording) return null

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration > 0 ? (bufferedEnd / duration) * 100 : 0

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all ${
          isFullscreen ? "p-0 m-0 overflow-hidden" : "p-2 sm:p-4 md:p-6 overflow-y-auto"
        }`}
      >
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative w-full bg-neutral-950 flex flex-col group select-none transition-all ${
            isFullscreen
              ? "fixed inset-0 w-screen h-screen max-w-none rounded-none border-none m-0 p-0 overflow-hidden z-50"
              : "max-w-6xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto"
          }`}
          onMouseMove={triggerControlsActivity}
          onMouseLeave={() => {
            if (isPlaying) setControlsVisible(false)
          }}
        >
          {/* Top Cinema Header Bar - ONLY in windowed/modal mode */}
          {!isFullscreen && (
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-gradient-to-b from-neutral-900/90 to-neutral-950/40 backdrop-blur-md z-30">
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-teal/20 text-brand-teal border border-brand-teal/40 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                    <span>TechGration Interactive Player</span>
                  </span>

                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold">
                    1080p Full HD
                  </Badge>

                  {recording.conductedDate && (
                    <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline-block">
                      • {recording.conductedDate}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                  {recording.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Download Video Button */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs font-semibold rounded-xl border-white/15 bg-white/5 hover:bg-white/15 text-white/90 gap-1.5"
                  title="Download video for offline viewing"
                >
                  <a href={recording.videoUrl} download>
                    <Download className="w-3.5 h-3.5 text-brand-teal" />
                    <span className="hidden sm:inline">Offline MP4</span>
                  </a>
                </Button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all border border-white/10"
                  title="Close player (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Video Player Canvas - in fullscreen it takes 100% of display */}
          <div
            className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${
              isFullscreen ? "w-screen h-screen flex-1 aspect-auto" : "aspect-video"
            }`}
          >
            <video
              ref={videoRef}
              src={recording.videoUrl}
              className={`w-full h-full object-contain cursor-pointer ${
                isFullscreen ? "max-h-screen max-w-screen" : ""
              }`}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime)
                  if (videoRef.current.buffered.length > 0) {
                    setBufferedEnd(videoRef.current.buffered.end(videoRef.current.buffered.length - 1))
                  }
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration)
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false)
                setControlsVisible(true)
                toast.success("Recording session finished! Great learning work.")
              }}
            />

            {/* Fullscreen Floating Header - appears on mouse move, auto-hides just like YouTube */}
            {isFullscreen && (
              <div
                className={`absolute top-0 inset-x-0 p-5 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-30 pointer-events-none ${
                  controlsVisible || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="pointer-events-auto space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-brand-teal font-extrabold">
                      TechGration Cinema Mode
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-xs text-white/70 font-mono">1080p Full HD</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white tracking-tight drop-shadow-md">
                    {recording.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="pointer-events-auto px-3.5 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/20 text-xs text-white font-semibold flex items-center gap-2 transition-all shadow-xl hover:scale-105 backdrop-blur-md cursor-pointer"
                  title="Exit Fullscreen (Esc or F)"
                >
                  <Minimize className="w-4 h-4 text-brand-teal" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            )}

            {/* Resume Prompt Overlay */}
            {resumePromptTime !== null && !isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-4 z-20 flex items-center gap-3 p-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-brand-teal/40 text-xs text-white shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-teal" />
                  <span>Resume from <strong>{formatTime(resumePromptTime)}</strong>?</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => {
                      handleSeek(resumePromptTime)
                      togglePlay()
                      setResumePromptTime(null)
                    }}
                    className="h-7 px-2.5 text-xs font-bold bg-brand-teal text-brand-charcoal hover:bg-brand-teal/90"
                  >
                    Resume
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setResumePromptTime(null)}
                    className="h-7 px-2 text-xs text-white/70 hover:text-white"
                  >
                    Start Over
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Big Animated Center Play Button */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors z-10"
                aria-label="Play recording"
              >
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 rounded-full bg-brand-teal text-brand-charcoal flex items-center justify-center shadow-2xl shadow-brand-teal/40"
                >
                  <Play className="w-9 h-9 ml-1.5 fill-current" />
                </motion.div>
              </button>
            )}

            {/* Custom Interactive HUD Controls Bar */}
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 sm:p-5 pt-8 flex flex-col gap-3 transition-opacity duration-300 z-20 ${
                controlsVisible || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Timeline Scrubbing Bar */}
              <div
                ref={progressBarRef}
                className="relative w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all flex items-center group/scrub"
                onMouseMove={handleProgressMouseMove}
                onMouseLeave={() => setHoverTime(null)}
                onClick={handleProgressClick}
              >
                {/* Buffered Progress */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full transition-all"
                  style={{ width: `${bufferedPct}%` }}
                />

                {/* Played Progress */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-brand-teal rounded-full shadow-lg shadow-brand-teal/50"
                  style={{ width: `${progressPct}%` }}
                />

                {/* Scrub Knob */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-white border-2 border-brand-teal shadow-md -translate-x-1/2 opacity-0 group-hover/scrub:opacity-100 transition-opacity"
                  style={{ left: `${progressPct}%` }}
                />

                {/* Hover Timestamp Tooltip */}
                {hoverTime !== null && (
                  <div
                    className="absolute -top-8 px-2 py-0.5 rounded-md bg-neutral-900 border border-white/20 text-[10px] font-mono text-white shadow-xl pointer-events-none -translate-x-1/2"
                    style={{ left: `${hoverPosition}px` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between text-white text-xs gap-2">
                {/* Left: Play/Pause, Skips, Volume, Timer */}
                <div className="flex items-center gap-2 sm:gap-3.5">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white hover:text-brand-teal transition-colors"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(-10)}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-brand-teal transition-colors group/rew"
                    title="Rewind 10s (←)"
                  >
                    <RotateCcw className="w-4 h-4 group-hover/rew:-rotate-45 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSkip(10)}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-brand-teal transition-colors group/fwd"
                    title="Skip 10s (→)"
                  >
                    <RotateCw className="w-4 h-4 group-hover/fwd:rotate-45 transition-transform" />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-brand-teal transition-colors"
                      title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : volume < 0.5 ? (
                        <Volume1 className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-14 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-brand-teal"
                      title="Volume (↑/↓)"
                    />
                  </div>

                  {/* Time Indicator */}
                  <div className="font-mono text-[11px] text-white/80 tracking-wide pl-1">
                    <span className="text-white font-bold">{formatTime(currentTime)}</span>
                    <span className="text-white/40 mx-1">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right: Speed, PiP, Fullscreen */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Playback Speed Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1"
                      title="Playback Speed"
                    >
                      <span>{playbackSpeed}x</span>
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 py-1.5 px-1 bg-neutral-900 border border-white/20 rounded-xl shadow-2xl flex flex-col gap-0.5 z-40 min-w-[70px]">
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleSpeedSelect(s)}
                            className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg text-left transition-colors flex items-center justify-between ${
                              playbackSpeed === s
                                ? "bg-brand-teal text-brand-charcoal font-bold"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span>{s}x</span>
                            {playbackSpeed === s && <Check className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Picture in Picture */}
                  <button
                    type="button"
                    onClick={togglePiP}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-brand-teal transition-colors"
                    title="Picture in Picture"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-brand-teal transition-colors"
                    title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Learning Drawer (Bookmarks & Info) - ONLY in windowed/modal mode */}
          {!isFullscreen && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-neutral-900/60 backdrop-blur-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-brand-teal" />
                    <h4 className="text-xs font-extrabold text-white tracking-wide uppercase">
                      Interactive Timestamp Milestones ({bookmarks.length})
                    </h4>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Tap any timestamp milestone to jump directly to that part of the lecture.
                  </p>
                </div>

                {!showBookmarkInput ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowBookmarkInput(true)}
                    className="h-8 text-xs font-semibold rounded-xl border-white/15 bg-white/5 hover:bg-white/15 text-white gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Bookmark at {formatTime(currentTime)}</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <input
                      type="text"
                      placeholder="Bookmark note..."
                      value={newBookmarkLabel}
                      onChange={(e) => setNewBookmarkLabel(e.target.value)}
                      className="h-8 px-3 text-xs bg-black/60 border border-white/20 rounded-xl text-white outline-none focus:border-brand-teal w-44"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddBookmark()
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddBookmark}
                      className="h-8 px-3 text-xs font-bold bg-brand-teal text-brand-charcoal hover:bg-brand-teal/90"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowBookmarkInput(false)}
                      className="h-8 px-2 text-xs text-white/60 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Bookmarks List Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {bookmarks.map((bm) => (
                  <button
                    key={bm.id}
                    type="button"
                    onClick={() => handleSeek(bm.timeSeconds)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-brand-teal/15 border border-white/10 hover:border-brand-teal/40 text-white/90 hover:text-brand-teal transition-all flex items-center gap-2 shadow-xs group/bm"
                  >
                    <span className="font-mono font-bold text-brand-teal group-hover/bm:underline">
                      {formatTime(bm.timeSeconds)}
                    </span>
                    <span className="text-white/80">{bm.label}</span>
                  </button>
                ))}
              </div>

              {/* Bottom Keyboard Tips */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>Hotkeys: [Space] Play/Pause • [←/→] ±10s • [M] Mute • [F] Fullscreen • [Esc] Close</span>
                <span className="text-brand-teal/80">TechGration Adaptive Video Engine</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
