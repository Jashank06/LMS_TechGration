"use client"

import * as React from "react"
import { Play, Pause, Volume2, Sparkles } from "lucide-react"

interface VoiceMessagePlayerProps {
  audioUrl: string
  duration?: number | null
  isSender: boolean
}

// Fixed pseudo-random waveform bar heights to render a realistic voice spectrum
const WAVEFORM_BARS = [
  35, 60, 45, 80, 50, 95, 65, 40, 85, 100, 70, 45, 90, 75, 55, 80, 60, 95, 40,
  85, 65, 50, 90, 100, 70, 45, 80, 60, 40, 75, 50, 30,
]

export function VoiceMessagePlayer({
  audioUrl,
  duration: initialDuration,
  isSender,
}: VoiceMessagePlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState<number>(initialDuration || 0)
  const [playbackRate, setPlaybackRate] = React.useState<number>(1)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Initialize Audio
  React.useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const onLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration))
      }
      setIsLoaded(true)
    }

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err))
    }
  }

  const toggleSpeed = () => {
    if (!audioRef.current) return
    const rates = [1, 1.5, 2]
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length
    const nextRate = rates[nextIdx]
    audioRef.current.playbackRate = nextRate
    setPlaybackRate(nextRate)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = pct * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-2xl select-none transition-all ${
        isSender
          ? "bg-brand-charcoal/15 text-brand-charcoal dark:text-white"
          : "bg-secondary/70 text-foreground border border-border/40"
      }`}
    >
      {/* Circular Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 ${
          isSender
            ? "bg-brand-charcoal text-brand-teal dark:bg-brand-teal dark:text-brand-charcoal"
            : "bg-brand-teal text-brand-charcoal"
        }`}
        title={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 min-w-[140px] sm:min-w-[180px]">
        {/* Clickable Waveform Bars */}
        <div
          onClick={handleSeek}
          className="flex items-center gap-[2.5px] h-7 cursor-pointer group py-1"
          title="Click to seek"
        >
          {WAVEFORM_BARS.map((heightPct, idx) => {
            const barPct = (idx / WAVEFORM_BARS.length) * 100
            const isPlayed = barPct <= progressPct

            return (
              <span
                key={idx}
                style={{ height: `${Math.max(20, heightPct)}%` }}
                className={`w-[3px] rounded-full transition-all duration-150 ${
                  isPlayed
                    ? isSender
                      ? "bg-brand-charcoal dark:bg-brand-teal"
                      : "bg-brand-teal"
                    : isSender
                    ? "bg-brand-charcoal/30 dark:bg-white/25 group-hover:bg-brand-charcoal/50"
                    : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                } ${isPlaying && isPlayed ? "scale-y-110" : ""}`}
              />
            )
          })}
        </div>

        {/* Timestamp & Duration */}
        <div className="flex items-center justify-between text-[10px] font-mono mt-0.5 opacity-80 font-medium">
          <span>{formatSeconds(isPlaying ? currentTime : duration)}</span>
          <span className="text-[9px] uppercase tracking-wider flex items-center gap-1 opacity-75">
            <Volume2 className="w-2.5 h-2.5" /> Voice Note
          </span>
        </div>
      </div>

      {/* Playback Speed Multiplier */}
      <button
        type="button"
        onClick={toggleSpeed}
        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-colors shrink-0 ${
          isSender
            ? "bg-brand-charcoal/20 hover:bg-brand-charcoal/30 text-brand-charcoal dark:text-brand-teal dark:bg-white/10 dark:hover:bg-white/20"
            : "bg-muted hover:bg-muted/80 text-foreground"
        }`}
        title="Toggle playback speed"
      >
        {playbackRate}x
      </button>
    </div>
  )
}
