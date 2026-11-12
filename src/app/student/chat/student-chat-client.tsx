"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  MessageSquareText,
  Search,
  BookOpen,
  Sparkles,
  BadgeCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react"
import { ChatWindow, ChatConversationData } from "@/components/chat/chat-window"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface StudentChatClientProps {
  currentUserId: string
  initialConversations: ChatConversationData[]
  initialUnreadCount: number
}

export function StudentChatClient({
  currentUserId,
  initialConversations,
  initialUnreadCount,
}: StudentChatClientProps) {
  const [conversations, setConversations] = React.useState<ChatConversationData[]>(initialConversations)
  const [activeId, setActiveId] = React.useState<string>(
    initialConversations[0]?.id || ""
  )
  const [searchQuery, setSearchQuery] = React.useState("")

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0]

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(
      (c) =>
        c.teacher.name.toLowerCase().includes(q) ||
        c.course?.title.toLowerCase().includes(q) ||
        (c.lastMessageText && c.lastMessageText.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  // Periodic refresh for conversations
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return
      try {
        const res = await fetch("/api/chat/conversations")
        const data = await res.json()
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations)
        }
      } catch {}
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-7 shadow-xs">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs">
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Direct 1-on-1 Instructor Line</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Ask Your Instructor
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Real-time doubt clarification, assignment reviews, and code debugging with your allotted Lead Instructor.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-secondary/50 border border-border/80 px-3.5 py-2 rounded-2xl text-xs text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-brand-teal shrink-0" />
            <span>Peer-to-peer student messaging disabled for academic safety</span>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Chat Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
        {/* Left Pane: Allotted Instructors & Courses */}
        <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-4 flex flex-col shadow-xs overflow-hidden">
          {/* Search box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teacher or course..."
              className="w-full text-xs bg-secondary/50 border border-border/80 rounded-xl pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No matching instructors found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === activeId
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-brand-teal/10 border-brand-teal/40 shadow-xs"
                        : "bg-secondary/25 border-transparent hover:bg-secondary/50 hover:border-border/60"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11 rounded-2xl border border-border">
                        {c.teacher.avatarUrl && <AvatarImage src={c.teacher.avatarUrl} alt={c.teacher.name} />}
                        <AvatarFallback className="text-xs font-bold bg-brand-teal/20 text-brand-teal">
                          {c.teacher.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                          {c.teacher.name}
                          <BadgeCheck className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                        </span>
                        {c.unreadCountStudent > 0 && (
                          <span className="h-4 px-1.5 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center shrink-0">
                            {c.unreadCountStudent}
                          </span>
                        )}
                      </div>

                      {c.course && (
                        <p className="text-[11px] font-semibold text-brand-teal truncate">
                          {c.course.title}
                        </p>
                      )}

                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {c.lastMessageText || "Start your conversation with instructor"}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className="lg:col-span-8 h-full">
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              currentUserId={currentUserId}
              isTeacher={false}
            />
          ) : (
            <div className="h-full rounded-3xl border border-dashed border-border/80 flex flex-col items-center justify-center p-8 text-center bg-card/60">
              <MessageSquareText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-bold text-foreground">Select an instructor</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a course conversation on the left to begin asking questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
