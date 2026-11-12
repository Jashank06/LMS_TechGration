"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { MessageSquareText, X, Sparkles, ChevronDown } from "lucide-react"
import { ChatWindow, ChatConversationData } from "@/components/chat/chat-window"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FloatingChatWidgetProps {
  currentUserId: string
}

export function FloatingChatWidget({ currentUserId }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [conversation, setConversation] = React.useState<ChatConversationData | null>(null)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  // Fetch or ensure active conversation with Vineet Sir
  const loadConversation = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/chat/conversations")
      const data = await res.json()
      if (data.success && Array.isArray(data.conversations) && data.conversations.length > 0) {
        setConversation(data.conversations[0])
        setUnreadCount(data.unreadCount || 0)
      } else {
        // Create initial conversation with Vineet Sir
        const createRes = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        const createData = await createRes.json()
        if (createData.success && createData.conversation) {
          setConversation(createData.conversation)
        }
      }
    } catch (err) {
      console.error("Floating chat fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadConversation()

    // Periodic check for unread count
    const interval = setInterval(async () => {
      if (document.hidden) return
      try {
        const res = await fetch("/api/chat/conversations")
        const data = await res.json()
        if (data.success) {
          setUnreadCount(data.unreadCount || 0)
          if (!conversation && data.conversations?.length > 0) {
            setConversation(data.conversations[0])
          }
        }
      } catch {}
    }, 5000)

    return () => clearInterval(interval)
  }, [conversation, loadConversation])

  const toggleOpen = () => {
    if (!isOpen && !conversation) {
      loadConversation()
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          type="button"
          onClick={toggleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative group h-14 w-14 rounded-full bg-gradient-to-r from-brand-teal via-cyan-400 to-teal-400 text-brand-charcoal shadow-xl shadow-brand-teal/30 flex items-center justify-center border-2 border-white/30 cursor-pointer"
          title="Chat with Vineet Sir (Instructor)"
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <>
              <MessageSquareText className="w-6 h-6 stroke-[2.2]" />
              {/* Unread badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-card shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </>
          )}

          {/* Tooltip on hover if closed */}
          {!isOpen && (
            <div className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card/95 border border-border px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold text-foreground whitespace-nowrap backdrop-blur-md hidden sm:block">
              <span>Ask Vineet Sir</span>
              <span className="text-[10px] text-emerald-500 block font-normal">• Online now</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal Popover */}
      <AnimatePresence>
        {isOpen && conversation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-8rem)] shadow-2xl rounded-3xl overflow-hidden"
          >
            <ChatWindow
              conversation={conversation}
              currentUserId={currentUserId}
              isTeacher={false}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
