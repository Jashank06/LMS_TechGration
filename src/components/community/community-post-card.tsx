"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import confetti from "canvas-confetti"
import {
  CalendarClock,
  Megaphone,
  PartyPopper,
  Rocket,
  Lightbulb,
  Pin,
  Trash2,
  ExternalLink,
  MessageSquare,
  Send,
  Video,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Clock,
  Calendar,
  Share2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface PostCommentData {
  id: string
  content: string
  authorName: string
  authorRole: string
  authorAvatarUrl?: string | null
  createdAt: string | Date
  author?: {
    id: string
    name: string
    role: string
    profile?: { avatarUrl?: string | null } | null
  }
}

export interface CommunityPostData {
  id: string
  title: string
  content: string
  category: "CLASS_RESCHEDULE" | "IMPORTANT_NOTICE" | "OCCASION_CELEBRATION" | "OPPORTUNITY_RESOURCE" | "GENERAL_UPDATE"
  priority: "NORMAL" | "URGENT" | "CELEBRATION"
  isPinned: boolean
  authorId: string
  authorName: string
  authorRole: string
  bannerUrl?: string | null
  actionUrl?: string | null
  actionLabel?: string | null
  rescheduledStartsAt?: string | Date | null
  meetingUrl?: string | null
  viewsCount?: number
  reactions?: Record<string, string[]> | any
  createdAt: string | Date
  author?: {
    id: string
    name: string
    role: string
    profile?: { avatarUrl?: string | null; headline?: string | null } | null
  }
  course?: {
    id: string
    title: string
    thumbnailUrl?: string | null
  } | null
  comments?: PostCommentData[]
}

interface CommunityPostCardProps {
  post: CommunityPostData
  currentUserId?: string
  currentUserRole?: string
  onPostDeleted?: (postId: string) => void
}

const AVAILABLE_EMOJIS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🎉", label: "Celebrate" },
  { emoji: "🚀", label: "Rocket" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👍", label: "Thumbs Up" },
  { emoji: "💡", label: "Insight" },
]

export function CommunityPostCard({
  post,
  currentUserId,
  currentUserRole,
  onPostDeleted,
}: CommunityPostCardProps) {
  const [reactions, setReactions] = React.useState<Record<string, string[]>>(
    (post.reactions as Record<string, string[]>) || {}
  )
  const [comments, setComments] = React.useState<PostCommentData[]>(post.comments || [])
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false)
  const [commentInput, setCommentInput] = React.useState("")
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const isAuthor = currentUserId === post.authorId
  const isStaff = currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN" || currentUserRole === "TEACHER"
  const canDelete = isAuthor || currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN"

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "CLASS_RESCHEDULE":
        return {
          label: "Class Rescheduled",
          icon: CalendarClock,
          badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          gradient: "from-amber-500/10 to-orange-500/10",
          accentColor: "border-amber-500/40",
        }
      case "IMPORTANT_NOTICE":
        return {
          label: "Important Notice",
          icon: Megaphone,
          badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          gradient: "from-rose-500/10 to-red-500/10",
          accentColor: "border-rose-500/40",
        }
      case "OCCASION_CELEBRATION":
        return {
          label: "Occasion & Celebration",
          icon: PartyPopper,
          badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          gradient: "from-amber-400/10 via-emerald-500/10 to-teal-500/10",
          accentColor: "border-emerald-500/40",
        }
      case "OPPORTUNITY_RESOURCE":
        return {
          label: "Opportunity & Resource",
          icon: Rocket,
          badgeColor: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
          gradient: "from-cyan-500/10 to-blue-500/10",
          accentColor: "border-cyan-500/40",
        }
      default:
        return {
          label: "General Update",
          icon: Lightbulb,
          badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
          gradient: "from-indigo-500/10 to-purple-500/10",
          accentColor: "border-indigo-500/40",
        }
    }
  }

  const catConfig = getCategoryConfig(post.category)
  const CategoryIcon = catConfig.icon

  const handleToggleReaction = async (emoji: string) => {
    if (!currentUserId) {
      toast.error("Please sign in to react to posts")
      return
    }

    // Festive confetti if celebration emoji
    if (emoji === "🎉" || emoji === "🚀") {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
      })
    }

    // Optimistic state
    const currentUsers = reactions[emoji] || []
    const hasReacted = currentUsers.includes(currentUserId)
    const newReactions = { ...reactions }

    if (hasReacted) {
      newReactions[emoji] = currentUsers.filter((id) => id !== currentUserId)
      if (newReactions[emoji].length === 0) delete newReactions[emoji]
    } else {
      newReactions[emoji] = [...currentUsers, currentUserId]
    }
    setReactions(newReactions)

    try {
      const res = await fetch(`/api/community/posts/${post.id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })
      if (!res.ok) {
        throw new Error("Failed to save reaction")
      }
      const data = await res.json()
      if (data.reactions) {
        setReactions(data.reactions)
      }
    } catch {
      // Revert on error
      setReactions(reactions)
      toast.error("Could not update reaction")
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput }),
      })

      if (!res.ok) throw new Error("Failed to post comment")
      const data = await res.json()
      if (data.comment) {
        setComments((prev) => [...prev, data.comment])
        setCommentInput("")
        toast.success("Comment added")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this community post?")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete post")
      toast.success("Post deleted")
      if (onPostDeleted) onPostDeleted(post.id)
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post")
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  // Format rescheduled date if available
  let rescheduledText: string | null = null
  if (post.rescheduledStartsAt) {
    const d = new Date(post.rescheduledStartsAt)
    rescheduledText = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })
  }

  const isCelebration = post.priority === "CELEBRATION" || post.category === "OCCASION_CELEBRATION"
  const isUrgent = post.priority === "URGENT"

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-sm hover:shadow-md ${
        isUrgent
          ? "border-rose-500/40 bg-gradient-to-br from-rose-500/5 via-card/90 to-card ring-1 ring-rose-500/20"
          : isCelebration
          ? "border-amber-400/40 bg-gradient-to-br from-amber-500/5 via-card/90 to-card ring-1 ring-amber-400/20"
          : "border-border/60 bg-card/90 hover:border-border"
      }`}
    >
      {/* Top Banner Stripe for Pinned */}
      {post.isPinned && (
        <div className="absolute top-0 left-6 right-6 -translate-y-1/2 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm pointer-events-auto">
            <Pin className="w-3 h-3 rotate-45" /> Pinned Announcement
          </span>
        </div>
      )}

      <div className="p-6 sm:p-7">
        {/* Header: Author + Meta + Category Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-2 ring-primary/20 shadow-sm">
              <AvatarImage
                src={post.author?.profile?.avatarUrl || ""}
                alt={post.authorName}
              />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-indigo-600 text-white font-bold text-sm">
                {post.authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {post.authorName}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                  {post.authorRole}
                </span>
                {post.course ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border">
                    {post.course.title}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border">
                    Campus-Wide
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${catConfig.badgeColor}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" />
              {catConfig.label}
            </span>

            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-full"
                title="Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Post Title */}
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-snug tracking-tight">
          {post.title}
        </h3>

        {/* Reschedule HUD (Highlight Box) */}
        {post.category === "CLASS_RESCHEDULE" && (
          <div className="my-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Rescheduled Lecture Timing
                  </div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {rescheduledText || "Updated Schedule Announced"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Please mark your calendar. Session link is updated below.
                  </div>
                </div>
              </div>

              {post.meetingUrl && (
                <a
                  href={post.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Live Room
                </a>
              )}
            </div>
          </div>
        )}

        {/* Occasion / Celebration Highlight Banner */}
        {post.category === "OCCASION_CELEBRATION" && (
          <div className="my-4 p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                Wishing our TechGration community a joyous & inspiring celebration!
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                confetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.6 },
                })
              }}
              className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg gap-1.5"
            >
              🎉 Burst Confetti
            </Button>
          </div>
        )}

        {/* Content Body */}
        <div className="text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-4">
          {post.content}
        </div>

        {/* Optional Banner Image */}
        {post.bannerUrl && (
          <div className="my-4 rounded-2xl overflow-hidden border border-border/60 bg-black/5 dark:bg-black/40 flex items-center justify-center relative group/img shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.bannerUrl}
              alt={post.title}
              className="w-full h-auto object-contain rounded-2xl transition-transform duration-300 group-hover/img:scale-[1.01]"
            />
          </div>
        )}

        {/* Action Link Button if provided */}
        {post.actionUrl && post.actionLabel && (
          <div className="my-4">
            <a
              href={post.actionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              <span>{post.actionLabel}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border/40 my-4" />

        {/* Footer: Reactions Bar + Comments Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Reaction Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {AVAILABLE_EMOJIS.map(({ emoji, label }) => {
              const users = reactions[emoji] || []
              const count = users.length
              const hasReacted = currentUserId ? users.includes(currentUserId) : false

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleToggleReaction(emoji)}
                  title={label}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    hasReacted
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-xs scale-105"
                      : "bg-muted/60 hover:bg-muted text-muted-foreground border border-transparent"
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  {count > 0 && <span className="font-semibold">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Comment Count / Drawer Button */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-lg hover:bg-muted"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {comments.length === 0
                ? "Discussion"
                : `${comments.length} ${comments.length === 1 ? "Comment" : "Comments"}`}
            </span>
            {isCommentsOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Comments Section Drawer */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-4 pt-4 border-t border-border/40 space-y-4"
            >
              {/* Existing comments list */}
              {comments.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/30 text-xs"
                    >
                      <Avatar className="h-7 w-7 ring-1 ring-border">
                        <AvatarImage
                          src={comment.author?.profile?.avatarUrl || comment.authorAvatarUrl || ""}
                        />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-[10px]">
                          {comment.authorName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {comment.authorName}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground border">
                            {comment.authorRole}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-foreground/90 mt-1 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/40">
                  No doubts or comments yet. Be the first to start the discussion!
                </div>
              )}

              {/* Add comment input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Ask a question or leave a note..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  disabled={isSubmittingComment}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentInput.trim() || isSubmittingComment}
                  className="h-8 px-3 text-xs gap-1.5 rounded-xl bg-primary text-primary-foreground shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
