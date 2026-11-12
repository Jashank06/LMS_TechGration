"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Send,
  Code2,
  Paperclip,
  Mic,
  Volume2,
  VolumeX,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Copy,
  X,
  ArrowDown,
  BookOpen,
  BadgeCheck,
  Terminal,
  FileText,
  File,
  Download,
  Archive,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  playMessageSentSound,
  playMessageReceivedSound,
  isSoundEnabled,
  setSoundEnabled,
} from "@/lib/sound-fx"
import { VoiceMessagePlayer } from "./voice-message-player"
import { VoiceRecorderHud } from "./voice-recorder-hud"
import { ImageLightboxModal } from "./image-lightbox-modal"

export interface ChatParticipant {
  id: string
  name: string
  role?: string
  avatarUrl?: string | null
  headline?: string | null
}

export interface ChatAttachmentMetaItem {
  url: string
  name: string
  size: number
  type: string
}

export interface ChatMessageItem {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  text: string
  codeSnippet?: string | null
  codeLanguage?: string | null
  attachments?: string[]
  attachmentMeta?: ChatAttachmentMetaItem[] | any
  voiceNoteUrl?: string | null
  voiceNoteDuration?: number | null
  status: "SENT" | "DELIVERED" | "READ"
  createdAt: string | Date
  readAt?: string | Date | null
  reactions?: Record<string, string[]> | null
  isOptimistic?: boolean
}

export interface ChatConversationData {
  id: string
  studentId: string
  teacherId: string
  courseId?: string | null
  teacher: ChatParticipant
  student: ChatParticipant
  course?: {
    id: string
    title: string
    thumbnailUrl?: string | null
    instructorName?: string | null
    instructorTitle?: string | null
  } | null
  status: "ACTIVE" | "RESOLVED" | "ARCHIVED"
  lastMessageText?: string | null
  lastMessageAt: string | Date
  unreadCountStudent: number
  unreadCountTeacher: number
}

interface ChatWindowProps {
  conversation: ChatConversationData
  currentUserId: string
  isTeacher?: boolean
  onClose?: () => void
  onMessageSent?: (msg: ChatMessageItem) => void
}

interface PendingAttachment {
  id: string
  file: File
  name: string
  size: number
  type: string
  previewUrl?: string
  isUploading: boolean
  uploadedUrl?: string
}

const EMOJI_OPTIONS = ["👍", "❤️", "🚀", "🔥", "💡", "👏"]

const QUICK_DOUBTS = [
  "Doubt regarding Class 4 Deep Learning lecture",
  "Facing an issue in my Python code for Assignment 1",
  "Can you review my solution in the Coding Arena?",
  "When is the next doubt-clearing live session?",
]

export function ChatWindow({
  conversation,
  currentUserId,
  isTeacher = false,
  onClose,
  onMessageSent,
}: ChatWindowProps) {
  const [messages, setMessages] = React.useState<ChatMessageItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [inputText, setInputText] = React.useState("")
  const [soundOn, setSoundOn] = React.useState(true)
  const [isTypingRemote, setIsTypingRemote] = React.useState(false)
  const [showCodeModal, setShowCodeModal] = React.useState(false)
  const [codeSnippet, setCodeSnippet] = React.useState("")
  const [codeLanguage, setCodeLanguage] = React.useState("python")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = React.useState<string | null>(null)
  const [showScrollBottom, setShowScrollBottom] = React.useState(false)

  // Voice recording & attachment states
  const [isRecordingVoice, setIsRecordingVoice] = React.useState(false)
  const [pendingAttachments, setPendingAttachments] = React.useState<PendingAttachment[]>([])
  const [lightboxImage, setLightboxImage] = React.useState<string | null>(null)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const isFirstLoadRef = React.useRef(true)

  const otherUser = isTeacher ? conversation.student : conversation.teacher

  // Sync sound settings
  React.useEffect(() => {
    setSoundOn(isSoundEnabled())
  }, [])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    toast.success(next ? "Chat sound enabled" : "Chat sound muted")
  }

  // Scroll helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Handle scroll detection
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    setShowScrollBottom(distanceToBottom > 150)
  }

  // Fetch initial messages and mark conversation as read
  const fetchMessages = React.useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      try {
        const res = await fetch(`/api/chat/conversations/${conversation.id}/messages`)
        const data = await res.json()
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (
              !isFirstLoadRef.current &&
              data.messages.length > prev.length &&
              data.messages[data.messages.length - 1].senderId !== currentUserId
            ) {
              playMessageReceivedSound()
            }
            return data.messages
          })

          if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false
            setTimeout(() => scrollToBottom("auto"), 60)
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [conversation.id, currentUserId]
  )

  // Mark as read
  React.useEffect(() => {
    fetchMessages()
    fetch(`/api/chat/conversations/${conversation.id}/read`, { method: "POST" }).catch(() => {})
  }, [conversation.id, fetchMessages])

  // Heartbeat polling for new messages & typing indicator (2.5s)
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return
      await fetchMessages(true)

      try {
        const typingRes = await fetch(`/api/chat/typing?conversationId=${conversation.id}`)
        const typingData = await typingRes.json()
        if (typingData.success) {
          setIsTypingRemote(Boolean(typingData.isTyping))
        }
      } catch {}
    }, 2500)

    return () => clearInterval(interval)
  }, [conversation.id, fetchMessages])

  // Broadcast typing status (debounced)
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, isTyping: true }),
    }).catch(() => {})

    typingTimeoutRef.current = setTimeout(() => {
      fetch("/api/chat/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, isTyping: false }),
      }).catch(() => {})
    }, 2000)
  }

  // Handle file attachment selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newAttachments: PendingAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const id = `att_${Date.now()}_${i}`
      const isImg = file.type.startsWith("image/")
      const previewUrl = isImg ? URL.createObjectURL(file) : undefined

      newAttachments.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        isUploading: true,
      })
    }

    setPendingAttachments((prev) => [...prev, ...newAttachments])

    // Reset input value so same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = ""

    // Upload each file to Cloudinary via /api/chat/upload
    for (const item of newAttachments) {
      try {
        const formData = new FormData()
        formData.append("file", item.file)
        formData.append("type", "file")
        formData.append("conversationId", conversation.id)

        const res = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || "Failed to upload file")
        }

        const data = await res.json()
        if (data.success && data.url) {
          setPendingAttachments((prev) =>
            prev.map((att) =>
              att.id === item.id
                ? { ...att, isUploading: false, uploadedUrl: data.url }
                : att
            )
          )
        }
      } catch (err: any) {
        toast.error(`Failed to upload ${item.name}: ${err.message}`)
        setPendingAttachments((prev) => prev.filter((att) => att.id !== item.id))
      }
    }
  }

  const handleRemovePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  // Send message handler (supports text, code, voice, and attachments)
  const handleSendMessage = async (options?: {
    textToSend?: string
    voiceNoteUrl?: string
    voiceNoteDuration?: number
  }) => {
    const text = (options?.textToSend ?? inputText).trim()
    const hasCode = Boolean(codeSnippet.trim())
    const voiceUrl = options?.voiceNoteUrl
    const voiceDuration = options?.voiceNoteDuration

    // Collect ready attachments
    const readyAttachments = pendingAttachments.filter((a) => a.uploadedUrl)
    const attachmentUrls = readyAttachments.map((a) => a.uploadedUrl!)
    const attachmentMeta: ChatAttachmentMetaItem[] = readyAttachments.map((a) => ({
      url: a.uploadedUrl!,
      name: a.name,
      size: a.size,
      type: a.type,
    }))

    const hasAnyContent =
      text || hasCode || voiceUrl || attachmentUrls.length > 0

    if (!hasAnyContent) return

    // Optimistic message
    const optimisticId = `opt_${Date.now()}`
    const optimisticMsg: ChatMessageItem = {
      id: optimisticId,
      conversationId: conversation.id,
      senderId: currentUserId,
      receiverId: otherUser.id,
      text: text || (voiceUrl ? "" : hasCode ? "Shared a code snippet:" : ""),
      codeSnippet: hasCode ? codeSnippet.trim() : null,
      codeLanguage: hasCode ? codeLanguage : null,
      attachments: attachmentUrls,
      attachmentMeta: attachmentMeta.length > 0 ? attachmentMeta : undefined,
      voiceNoteUrl: voiceUrl || null,
      voiceNoteDuration: voiceDuration || null,
      status: "SENT",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    }

    setMessages((prev) => [...prev, optimisticMsg])
    if (!options?.textToSend && !options?.voiceNoteUrl) {
      setInputText("")
    }
    setCodeSnippet("")
    setShowCodeModal(false)
    setPendingAttachments([])
    setTimeout(() => scrollToBottom(), 50)
    playMessageSentSound()

    try {
      const res = await fetch(`/api/chat/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: optimisticMsg.text,
          codeSnippet: optimisticMsg.codeSnippet,
          codeLanguage: optimisticMsg.codeLanguage,
          attachments: optimisticMsg.attachments,
          attachmentMeta: optimisticMsg.attachmentMeta,
          voiceNoteUrl: optimisticMsg.voiceNoteUrl,
          voiceNoteDuration: optimisticMsg.voiceNoteDuration,
        }),
      })

      const data = await res.json()
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? data.message : m))
        )
        if (onMessageSent) onMessageSent(data.message)
      } else {
        throw new Error(data.error || "Message delivery failed")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
    }
  }

  // Voice note recorded callback from VoiceRecorderHud
  const handleVoiceNoteReady = ({ url, duration }: { url: string; duration: number }) => {
    setIsRecordingVoice(false)
    handleSendMessage({ voiceNoteUrl: url, voiceNoteDuration: duration })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      const data = await res.json()
      if (data.success && data.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: data.reactions } : m))
        )
      }
    } catch {
      toast.error("Failed to add reaction")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (fileName: string, type: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase() || ""
    if (["pdf"].includes(ext) || type.includes("pdf")) {
      return <FileText className="w-4 h-4 text-rose-500" />
    }
    if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) {
      return <Archive className="w-4 h-4 text-amber-500" />
    }
    if (["py", "js", "ts", "cpp", "c", "ipynb", "html", "css", "json", "sql"].includes(ext)) {
      return <Code2 className="w-4 h-4 text-emerald-400" />
    }
    if (type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4 text-brand-teal" />
    }
    return <File className="w-4 h-4 text-cyan-400" />
  }

  const hasUploadingAttachments = pendingAttachments.some((a) => a.isUploading)

  return (
    <div className="flex flex-col h-full bg-card/95 rounded-3xl border border-border/80 shadow-2xl overflow-hidden relative backdrop-blur-2xl">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/80 bg-muted/30 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10 rounded-2xl border-2 border-brand-teal/40 ring-2 ring-brand-teal/15 shadow-sm">
              {otherUser.avatarUrl && <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />}
              <AvatarFallback className="bg-gradient-to-br from-brand-teal/25 via-cyan-500/20 to-teal-800/30 text-brand-charcoal dark:text-brand-teal font-extrabold text-xs">
                {otherUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-card" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-foreground truncate">{otherUser.name}</h3>
              {!isTeacher && (
                <span title="Verified Course Instructor">
                  <BadgeCheck className="w-4 h-4 text-brand-teal shrink-0" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Active Now
              </span>
              <span>•</span>
              <span className="truncate">
                {otherUser.headline || (isTeacher ? "Enrolled Student" : "Lead AI & Cloud Architect")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {conversation.course && (
            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] py-1 px-2.5 rounded-xl border-border bg-card/60 text-muted-foreground max-w-[200px] truncate"
            >
              <BookOpen className="w-3 h-3 text-brand-teal shrink-0" />
              <span className="truncate">{conversation.course.title}</span>
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
            title={soundOn ? "Mute chimes" : "Enable chimes"}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-brand-teal" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 relative select-text"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3 opacity-60">
            <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground">Connecting with {otherUser.name}...</p>
          </div>
        ) : messages.length === 0 ? (
          /* Empty Chat Welcome Card */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-4 py-8">
            <div className="w-16 h-16 rounded-3xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-xl shadow-brand-teal/10">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">
                {isTeacher ? `Student Consultation Room` : `Direct Line to ${otherUser.name}`}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isTeacher
                  ? `Answer doubts, inspect code errors, listen to voice notes, and review attached documents for ${otherUser.name}.`
                  : `Ask any technical doubt, attach error screenshots/code files, or send a voice message for feedback.`}
              </p>
            </div>

            {/* Quick Starters for Students */}
            {!isTeacher && (
              <div className="w-full space-y-2 pt-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Quick Doubt Starters:
                </span>
                <div className="flex flex-col gap-1.5">
                  {QUICK_DOUBTS.map((doubt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage({ textToSend: doubt })}
                      className="text-left text-xs p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 hover:border-brand-teal/40 text-foreground transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{doubt}</span>
                      <Send className="w-3 h-3 text-muted-foreground group-hover:text-brand-teal transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            const dateStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })

            // Separate attachments by image vs document
            const attachmentsList = msg.attachments || []
            const metaList: ChatAttachmentMetaItem[] = msg.attachmentMeta || []

            const imageAttachments = attachmentsList.filter((url) =>
              url.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i)
            )
            const docAttachments = attachmentsList.filter(
              (url) => !url.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i)
            )

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}
              >
                {/* Floating Emoji Reaction Bar on Hover */}
                <AnimatePresence>
                  {hoveredMessageId === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`absolute -top-7 ${
                        isMe ? "right-2" : "left-2"
                      } z-20 flex items-center gap-1 bg-card/95 border border-border shadow-lg rounded-full px-2 py-0.5 backdrop-blur-md`}
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform text-xs p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`flex items-end gap-2 max-w-[88%] sm:max-w-[78%]`}>
                  {!isMe && (
                    <Avatar className="h-7 w-7 rounded-xl border border-border shrink-0 mb-1">
                      {otherUser.avatarUrl && <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />}
                      <AvatarFallback className="text-[10px] bg-secondary font-bold">
                        {otherUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all relative ${
                      isMe
                        ? "bg-gradient-to-r from-brand-teal via-cyan-400 to-teal-400 text-brand-charcoal font-medium rounded-br-xs shadow-teal-glow"
                        : "bg-secondary/70 border border-border/80 text-foreground rounded-bl-xs"
                    }`}
                  >
                    {/* 1. Voice Note Player if present */}
                    {msg.voiceNoteUrl && (
                      <div className="mb-2">
                        <VoiceMessagePlayer
                          audioUrl={msg.voiceNoteUrl}
                          duration={msg.voiceNoteDuration}
                          isSender={isMe}
                        />
                      </div>
                    )}

                    {/* 2. Image Attachments Grid */}
                    {imageAttachments.length > 0 && (
                      <div className="mb-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {imageAttachments.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="relative rounded-xl overflow-hidden cursor-pointer group/img border border-black/10 dark:border-white/10 bg-black/5"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt="Attached screenshot"
                              className="w-full h-auto max-h-48 object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <span>View Full Size</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Document / Code File Attachments */}
                    {docAttachments.length > 0 && (
                      <div className="mb-2 space-y-1.5">
                        {docAttachments.map((fileUrl, idx) => {
                          const meta = metaList.find((m) => m.url === fileUrl)
                          const fileName = meta?.name || fileUrl.split("/").pop() || "Document"
                          const fileSize = meta?.size ? formatFileSize(meta.size) : ""

                          return (
                            <a
                              key={idx}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-colors border ${
                                isMe
                                  ? "bg-brand-charcoal/15 hover:bg-brand-charcoal/25 border-brand-charcoal/20 text-brand-charcoal"
                                  : "bg-background/80 hover:bg-background border-border text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1.5 rounded-lg bg-card/60 shadow-xs shrink-0">
                                  {getFileIcon(fileName, meta?.type || "")}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate max-w-[160px] sm:max-w-[220px]">
                                    {fileName}
                                  </p>
                                  {fileSize && (
                                    <span className="text-[10px] opacity-75">{fileSize}</span>
                                  )}
                                </div>
                              </div>
                              <Download className="w-4 h-4 opacity-70 hover:opacity-100 shrink-0 ml-1" />
                            </a>
                          )
                        })}
                      </div>
                    )}

                    {/* 4. Message Text */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    )}

                    {/* 5. Code Snippet Box if present */}
                    {msg.codeSnippet && (
                      <div className="mt-2 rounded-xl bg-black/90 border border-white/10 overflow-hidden text-left shadow-md">
                        <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px] font-mono text-white/70">
                          <span className="flex items-center gap-1.5 text-brand-teal">
                            <Terminal className="w-3.5 h-3.5" />
                            {msg.codeLanguage || "code"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-normal">
                          <code>{msg.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* 6. Message Meta Info: Timestamp & Status Ticks */}
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMe ? "text-brand-charcoal/70" : "text-muted-foreground"
                      }`}
                    >
                      <span>{dateStr}</span>
                      {isMe && (
                        <span>
                          {msg.isOptimistic ? (
                            <Clock className="w-3 h-3 animate-spin" />
                          ) : msg.status === "READ" ? (
                            <span title="Read by recipient">
                              <CheckCheck className="w-3.5 h-3.5 text-blue-900 dark:text-blue-950 font-bold" />
                            </span>
                          ) : msg.status === "DELIVERED" ? (
                            <span title="Delivered">
                              <CheckCheck className="w-3.5 h-3.5 opacity-80" />
                            </span>
                          ) : (
                            <span title="Sent">
                              <Check className="w-3 h-3 opacity-70" />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Emoji Reaction Badges */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start pl-9"}`}>
                    {Object.entries(msg.reactions).map(([emoji, users]) => {
                      const hasReacted = users.includes(currentUserId)
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                            hasReacted
                              ? "bg-brand-teal/20 border-brand-teal/50 text-foreground font-bold shadow-xs scale-105"
                              : "bg-secondary/70 border-border/60 text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px]">{users.length}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })
        )}

        {/* Typing indicator wave */}
        <AnimatePresence>
          {isTypingRemote && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center gap-2 text-xs text-muted-foreground pl-1"
            >
              <Avatar className="h-6 w-6 rounded-lg border">
                {otherUser.avatarUrl && <AvatarImage src={otherUser.avatarUrl} />}
                <AvatarFallback className="text-[9px] bg-secondary font-bold">
                  {otherUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-secondary/70 border border-border/80">
                <span className="text-[11px] text-muted-foreground font-medium mr-1">
                  {otherUser.name} is typing
                </span>
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block"
                />
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.15, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block"
                />
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.3, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 z-20 h-8 w-8 rounded-full bg-brand-teal text-brand-charcoal shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title="Scroll to latest messages"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 3. Staged Attachments Preview Bar */}
      <AnimatePresence>
        {pendingAttachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-t border-border/60 bg-muted/40 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none"
          >
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-card border border-border/80 shadow-xs shrink-0 max-w-[200px]"
              >
                {att.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    {getFileIcon(att.name, att.type)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-foreground truncate">{att.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {att.isUploading ? (
                      <span className="flex items-center gap-1 text-brand-teal">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Uploading...
                      </span>
                    ) : (
                      formatFileSize(att.size)
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePendingAttachment(att.id)}
                  className="p-1 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-muted transition-colors shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Code Snippet Drawer */}
      <AnimatePresence>
        {showCodeModal && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-4 border-t border-border bg-card/95 backdrop-blur-xl space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-brand-teal" />
                Attach Code Snippet
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="text-xs bg-secondary rounded-lg px-2.5 py-1 border border-border text-foreground font-mono focus:outline-none"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="cpp">C++</option>
                  <option value="sql">SQL</option>
                  <option value="json">JSON</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="# Paste error or function here..."
              rows={4}
              className="w-full text-xs font-mono p-3 rounded-xl bg-black/90 text-emerald-400 border border-white/10 focus:outline-none focus:ring-1 focus:ring-brand-teal resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Footer Input Bar / Voice Recorder HUD */}
      <div className="p-3 sm:p-4 border-t border-border/80 bg-secondary/30 shrink-0">
        {isRecordingVoice ? (
          <VoiceRecorderHud
            conversationId={conversation.id}
            onCancel={() => setIsRecordingVoice(false)}
            onVoiceNoteReady={handleVoiceNoteReady}
          />
        ) : (
          <div className="flex items-end gap-2 bg-card/90 rounded-2xl border border-border/80 p-2 shadow-xs focus-within:border-brand-teal/50 focus-within:ring-2 focus-within:ring-brand-teal/15 transition-all">
            {/* Hidden Multi-file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.tar.gz,.py,.ipynb,.js,.ts,.cpp,.json,.csv"
            />

            {/* Code Snippet Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowCodeModal(!showCodeModal)}
              className={`h-9 w-9 rounded-xl shrink-0 transition-colors ${
                showCodeModal || codeSnippet.trim()
                  ? "bg-brand-teal/20 text-brand-teal"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Attach Code Snippet"
            >
              <Code2 className="w-4 h-4" />
            </Button>

            {/* Paperclip / File Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Attach Images, Documents, or Code Files"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Text Message Area */}
            <textarea
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherUser.name}... (Press Enter to send)`}
              rows={1}
              className="flex-1 max-h-28 min-h-[38px] py-2 px-1 text-xs sm:text-sm bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground leading-normal"
            />

            {/* Voice Recording Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsRecordingVoice(true)}
              className="h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Record Voice Message"
            >
              <Mic className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={
                (!inputText.trim() && !codeSnippet.trim() && pendingAttachments.length === 0) ||
                hasUploadingAttachments
              }
              className="h-9 px-4 rounded-xl font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs shadow-md shadow-brand-teal/25 shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] gap-1.5"
            >
              {hasUploadingAttachments ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Lightbox for attached images */}
      <ImageLightboxModal
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  )
}
