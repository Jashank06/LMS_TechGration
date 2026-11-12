"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  Pin,
  CalendarClock,
  Megaphone,
  PartyPopper,
  Rocket,
  Lightbulb,
  Video,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface PinnedPost {
  id: string
  title: string
  content: string
  category: string
  priority: string
  authorName: string
  meetingUrl?: string | null
  rescheduledStartsAt?: string | Date | null
  course?: { id: string; title: string } | null
  author?: { name: string; profile?: { avatarUrl?: string | null } | null } | null
}

interface PinnedAnnouncementBannerProps {
  initialPosts?: PinnedPost[]
}

export function PinnedAnnouncementBanner({ initialPosts = [] }: PinnedAnnouncementBannerProps) {
  const [posts, setPosts] = React.useState<PinnedPost[]>(initialPosts)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isDismissed, setIsDismissed] = React.useState(false)

  React.useEffect(() => {
    if (initialPosts.length > 0) {
      setPosts(initialPosts)
      return
    }

    let isSubscribed = true
    fetch("/api/community/pinned")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isSubscribed && data?.pinnedPosts) {
          setPosts(data.pinnedPosts)
        }
      })
      .catch(() => {})

    return () => {
      isSubscribed = false
    }
  }, [initialPosts])

  if (isDismissed || posts.length === 0) return null

  const currentPost = posts[currentIndex] || posts[0]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "CLASS_RESCHEDULE":
        return CalendarClock
      case "OCCASION_CELEBRATION":
        return PartyPopper
      case "OPPORTUNITY_RESOURCE":
        return Rocket
      default:
        return Megaphone
    }
  }

  const Icon = getCategoryIcon(currentPost.category)
  const isReschedule = currentPost.category === "CLASS_RESCHEDULE"
  const isCelebration =
    currentPost.category === "OCCASION_CELEBRATION" || currentPost.priority === "CELEBRATION"
  const isUrgent = currentPost.priority === "URGENT"

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative rounded-2xl border p-4 sm:p-4.5 mb-6 backdrop-blur-md overflow-hidden shadow-sm transition-all ${
          isUrgent
            ? "border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-card to-card"
            : isCelebration
            ? "border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-card to-card"
            : "border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-card to-card"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isUrgent
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : isCelebration
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  : "bg-teal-500/20 text-teal-600 dark:text-teal-400"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Pin className="w-2.5 h-2.5 rotate-45" /> Pinned Bulletin
                </span>
                {currentPost.course && (
                  <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[200px]">
                    {currentPost.course.title}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  By {currentPost.authorName}
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-foreground mt-1 truncate">
                {currentPost.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {isReschedule && currentPost.meetingUrl && (
              <a
                href={currentPost.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Room</span>
              </a>
            )}

            <Link
              href="/student/community"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1"
            >
              <span>View Notice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {posts.length > 1 && (
              <div className="flex items-center gap-1 pl-2 border-l border-border/50 text-[11px] text-muted-foreground">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1))
                  }
                  className="px-1.5 py-0.5 rounded hover:bg-muted font-bold"
                >
                  ‹
                </button>
                <span>
                  {currentIndex + 1}/{posts.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0))
                  }
                  className="px-1.5 py-0.5 rounded hover:bg-muted font-bold"
                >
                  ›
                </button>
              </div>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1"
              title="Dismiss for this session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
