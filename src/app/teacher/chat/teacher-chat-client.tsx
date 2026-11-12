"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  MessageSquareText,
  Search,
  BookOpen,
  Users,
  CheckCheck,
  Send,
  Sparkles,
  Filter,
} from "lucide-react"
import { ChatWindow, ChatConversationData } from "@/components/chat/chat-window"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TeacherChatClientProps {
  currentUserId: string
  initialConversations: ChatConversationData[]
  initialUnreadCount: number
}

const CANNED_REPLIES = [
  "Great question! Let's cover this in detail during our next live session.",
  "Please check the lecture recording for Class 3 where we explained this step-by-step.",
  "Can you share the complete error traceback and terminal output?",
  "Awesome job debugging this! You are ready for the next challenge.",
]

export function TeacherChatClient({
  currentUserId,
  initialConversations,
  initialUnreadCount,
}: TeacherChatClientProps) {
  const [conversations, setConversations] = React.useState<ChatConversationData[]>(initialConversations)
  const [activeId, setActiveId] = React.useState<string>(initialConversations[0]?.id || "")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterMode, setFilterMode] = React.useState<"ALL" | "UNREAD">("ALL")

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0]

  const filteredConversations = React.useMemo(() => {
    let list = conversations
    if (filterMode === "UNREAD") {
      list = list.filter((c) => c.unreadCountTeacher > 0)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.student.name.toLowerCase().includes(q) ||
          c.course?.title.toLowerCase().includes(q) ||
          (c.lastMessageText && c.lastMessageText.toLowerCase().includes(q))
      )
    }
    return list
  }, [conversations, filterMode, searchQuery])

  // Periodic polling for new student messages
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
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-7 shadow-xs">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-70" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs">
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Instructor Doubt Resolution Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Student Messages & Doubts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              1-on-1 direct channels with students across your enrolled courses. Guide them through code problems and assignments.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-secondary/40 p-1.5 rounded-2xl border border-border/80 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === "ALL"
                  ? "bg-brand-teal text-brand-charcoal shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("UNREAD")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                filterMode === "UNREAD"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Unread</span>
              {conversations.filter((c) => c.unreadCountTeacher > 0).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {conversations.filter((c) => c.unreadCountTeacher > 0).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
        {/* Left Pane: Student Threads */}
        <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-4 flex flex-col shadow-xs overflow-hidden">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or course..."
              className="w-full text-xs bg-secondary/50 border border-border/80 rounded-xl pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No conversations found.
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
                        {c.student.avatarUrl && <AvatarImage src={c.student.avatarUrl} alt={c.student.name} />}
                        <AvatarFallback className="text-xs font-bold bg-secondary">
                          {c.student.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {c.unreadCountTeacher > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 px-1.5 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center ring-2 ring-card">
                          {c.unreadCountTeacher}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground truncate">{c.student.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(c.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {c.course && (
                        <p className="text-[11px] font-semibold text-brand-teal truncate">
                          {c.course.title}
                        </p>
                      )}

                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {c.lastMessageText || "New conversation initiated"}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window & Canned Quick Replies */}
        <div className="lg:col-span-8 flex flex-col h-full gap-3">
          {activeConversation ? (
            <div className="flex-1 h-full min-h-0 flex flex-col">
              <ChatWindow
                conversation={activeConversation}
                currentUserId={currentUserId}
                isTeacher={true}
              />
            </div>
          ) : (
            <div className="h-full rounded-3xl border border-dashed border-border/80 flex flex-col items-center justify-center p-8 text-center bg-card/60">
              <MessageSquareText className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-bold text-foreground">Select a student thread</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a student conversation from the left to start answering doubts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
