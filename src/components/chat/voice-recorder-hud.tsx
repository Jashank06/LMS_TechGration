"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Trash2, Send, Loader2, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface VoiceRecorderHudProps {
  conversationId: string
  onCancel: () => void
  onVoiceNoteReady: (voiceData: { url: string; duration: number }) => void
}

export function VoiceRecorderHud({
  conversationId,
  onCancel,
  onVoiceNoteReady,
}: VoiceRecorderHudProps) {
  const [seconds, setSeconds] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const streamRef = React.useRef<MediaStream | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Start recording on mount
  React.useEffect(() => {
    let isCancelled = false

    async function startRecording() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Audio recording is not supported in this browser.")
          onCancel()
          return
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        audioChunksRef.current = []

        // Determine supported audio MIME type
        const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
        let selectedMimeType = ""
        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type
            break
          }
        }

        const recorder = selectedMimeType
          ? new MediaRecorder(stream, { mimeType: selectedMimeType })
          : new MediaRecorder(stream)

        mediaRecorderRef.current = recorder

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data)
          }
        }

        recorder.start(200) // Collect data every 200ms

        // Start timer
        timerRef.current = setInterval(() => {
          setSeconds((prev) => prev + 1)
        }, 1000)
      } catch (err: any) {
        console.error("Microphone access error:", err)
        toast.error("Microphone access denied. Please allow microphone permissions to send voice notes.")
        onCancel()
      }
    }

    startRecording()

    return () => {
      isCancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [onCancel])

  const handleStopAndSend = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === "inactive" || isUploading) return

    setIsUploading(true)
    if (timerRef.current) clearInterval(timerRef.current)

    recorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })

        // Clean up tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
        }

        if (audioBlob.size < 100) {
          toast.error("Voice recording was too short.")
          onCancel()
          return
        }

        const finalDuration = Math.max(1, seconds)

        // Upload to Cloudinary
        const formData = new FormData()
        formData.append("file", audioBlob, `voice_note_${Date.now()}.webm`)
        formData.append("type", "voice")
        formData.append("conversationId", conversationId)
        formData.append("duration", finalDuration.toString())

        const res = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to upload voice note.")
        }

        const data = await res.json()
        if (data.success && data.url) {
          onVoiceNoteReady({ url: data.url, duration: finalDuration })
        } else {
          throw new Error("Invalid response from server.")
        }
      } catch (err: any) {
        toast.error(err.message || "Could not upload voice note.")
        onCancel()
      } finally {
        setIsUploading(false)
      }
    }

    recorder.stop()
  }

  const handleDiscard = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    onCancel()
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center justify-between gap-3 p-2 bg-card/95 backdrop-blur-xl rounded-2xl border border-rose-500/30 ring-1 ring-rose-500/20 shadow-lg w-full"
    >
      {/* Recording Status & Wave */}
      <div className="flex items-center gap-3 pl-2 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
          </span>
          <span className="text-xs font-mono font-bold text-foreground">
            {formatTimer(seconds)}
          </span>
        </div>

        {/* Dynamic Frequency Bars */}
        <div className="flex items-center gap-1 h-5 overflow-hidden">
          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75].map((h, i) => (
            <motion.span
              key={i}
              animate={{
                scaleY: [0.3, 1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5 + (i % 4) * 0.15,
                ease: "easeInOut",
              }}
              style={{ height: `${h}%` }}
              className="w-[2.5px] bg-rose-500/70 rounded-full"
            />
          ))}
        </div>

        <span className="text-xs text-muted-foreground hidden sm:inline truncate">
          Recording voice note...
        </span>
      </div>

      {/* Action Buttons: Discard & Send */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDiscard}
          disabled={isUploading}
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          title="Discard recording"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          onClick={handleStopAndSend}
          disabled={isUploading}
          className="h-8 px-3 rounded-xl font-bold bg-brand-teal text-brand-charcoal hover:bg-brand-teal/90 text-xs shadow-md shadow-brand-teal/20 gap-1.5 transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Note</span>
              <Send className="w-3 h-3" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
