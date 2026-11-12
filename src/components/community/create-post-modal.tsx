"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  X,
  CalendarClock,
  Megaphone,
  PartyPopper,
  Rocket,
  Lightbulb,
  Pin,
  Sparkles,
  Link2,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { CommunityPostData } from "./community-post-card"

interface CourseOption {
  id: string
  title: string
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: (newPost: CommunityPostData) => void
  courses?: CourseOption[]
  authorName?: string
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  courses = [],
  authorName = "Instructor",
}: CreatePostModalProps) {
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [category, setCategory] = React.useState<
    "CLASS_RESCHEDULE" | "IMPORTANT_NOTICE" | "OCCASION_CELEBRATION" | "OPPORTUNITY_RESOURCE" | "GENERAL_UPDATE"
  >("IMPORTANT_NOTICE")
  const [priority, setPriority] = React.useState<"NORMAL" | "URGENT" | "CELEBRATION">("NORMAL")
  const [courseId, setCourseId] = React.useState<string>("")
  const [isPinned, setIsPinned] = React.useState(false)
  const [rescheduledStartsAt, setRescheduledStartsAt] = React.useState("")
  const [meetingUrl, setMeetingUrl] = React.useState("")
  const [bannerUrl, setBannerUrl] = React.useState("")
  const [actionLabel, setActionLabel] = React.useState("")
  const [actionUrl, setActionUrl] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Presets
  const applyTemplate = (type: "RESCHEDULE" | "OCCASION" | "NOTICE" | "RESOURCE") => {
    switch (type) {
      case "RESCHEDULE":
        setCategory("CLASS_RESCHEDULE")
        setPriority("URGENT")
        setTitle("Class Reschedule Notice: Updated Live Session Timing")
        setContent(
          "Dear Students,\n\nPlease note that our upcoming live interactive lecture has been rescheduled. We will be covering essential system design architectures and hands-on implementation.\n\nKindly check the updated schedule and join via the room link below."
        )
        setActionLabel("Join Class Room")
        break
      case "OCCASION":
        setCategory("OCCASION_CELEBRATION")
        setPriority("CELEBRATION")
        setTitle("Heartiest Greetings & Festive Wishes from TechGration! ✨🎉")
        setContent(
          "Wishing our vibrant community of ambitious learners, engineers, and future tech leaders a joyous and blessed celebration! 🌟\n\nMay this season ignite new passion, breakthrough skills, and limitless achievements. Take time to celebrate with family and recharge your engineering spirits!"
        )
        setActionLabel("Explore Community")
        break
      case "NOTICE":
        setCategory("IMPORTANT_NOTICE")
        setPriority("URGENT")
        setTitle("Important Circular: Milestone Submissions & Upcoming Evaluations")
        setContent(
          "Attention All Students,\n\nThis is an essential notice regarding the upcoming project milestone submissions. All repositories and documentation must be submitted by the deadline.\n\nLate submissions will affect final certification scores. Reach out via direct chat if you need clarification."
        )
        break
      case "RESOURCE":
        setCategory("OPPORTUNITY_RESOURCE")
        setPriority("NORMAL")
        setTitle("Exclusive Engineering Guide & Curated Industry Resources Released 🚀")
        setContent(
          "Hi everyone,\n\nWe have compiled state-of-the-art reference materials, architectural whitepapers, and production code repositories to supercharge your domain mastery.\n\nDive in and implement the concepts in your coding arena and projects."
        )
        setActionLabel("Access Resources")
        break
    }
    toast.info("Template applied! You can customize any details before publishing.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter a title and content for the post")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        courseId: courseId || null,
        isPinned,
        bannerUrl: bannerUrl.trim() || null,
        actionLabel: actionLabel.trim() || null,
        actionUrl: actionUrl.trim() || null,
        rescheduledStartsAt: rescheduledStartsAt || null,
        meetingUrl: meetingUrl.trim() || null,
      }

      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to publish post")
      }

      const data = await res.json()
      if (data.post) {
        toast.success("Community post broadcasted successfully!")
        onPostCreated(data.post)
        onClose()
        // Reset form
        setTitle("")
        setContent("")
        setBannerUrl("")
        setMeetingUrl("")
        setRescheduledStartsAt("")
        setActionLabel("")
        setActionUrl("")
        setIsPinned(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish post")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Publish Community Broadcast
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Posting as <span className="font-semibold text-foreground">{authorName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Quick Templates Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Quick Preset Templates:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate("RESCHEDULE")}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all text-left"
                >
                  <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Reschedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("OCCASION")}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all text-left"
                >
                  <PartyPopper className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Festival / Occasion</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("NOTICE")}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-all text-left"
                >
                  <Megaphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Urgent Notice</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate("RESOURCE")}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all text-left"
                >
                  <Rocket className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Resources</span>
                </button>
              </div>
            </div>

            {/* Post Title */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Announcement Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Live Class Rescheduled to 7:00 PM / Happy Diwali Wishes!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
              />
            </div>

            {/* Category & Course Targeting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium"
                >
                  <option value="CLASS_RESCHEDULE">⏰ Class Reschedule</option>
                  <option value="IMPORTANT_NOTICE">📢 Important Notice</option>
                  <option value="OCCASION_CELEBRATION">🎉 Occasion & Celebration</option>
                  <option value="OPPORTUNITY_RESOURCE">🚀 Opportunity & Resource</option>
                  <option value="GENERAL_UPDATE">💡 General Update</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Target Audience / Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium"
                >
                  <option value="">Campus-Wide (All Enrolled Students)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Pinning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Priority Highlighting
                </label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium"
                >
                  <option value="NORMAL">Standard Post</option>
                  <option value="URGENT">🚨 Urgent Alert (Pulsing Glow)</option>
                  <option value="CELEBRATION">✨ Festive / Celebration (Gold Glow)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-6">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/30 border-border"
                />
                <label htmlFor="pinCheck" className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                  <Pin className="w-3.5 h-3.5 text-primary rotate-45" />
                  Pin to Top of Dashboard & Community
                </label>
              </div>
            </div>

            {/* Reschedule Special Details (if category is CLASS_RESCHEDULE) */}
            {category === "CLASS_RESCHEDULE" && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4" />
                  Reschedule Parameters:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-foreground block mb-1">
                      New Session Time:
                    </label>
                    <input
                      type="datetime-local"
                      value={rescheduledStartsAt}
                      onChange={(e) => setRescheduledStartsAt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-foreground block mb-1">
                      Live Meeting URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/... or zoom.us/..."
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Post Content */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Post Content / Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Write your message, guidelines, or greeting here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm leading-relaxed"
              />
            </div>

            {/* Optional Banner & Action Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Action Button Link (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Button Label"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl bg-background border border-border text-xs"
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    className="w-1/2 px-2.5 py-2 rounded-xl bg-background border border-border text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit / Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white shadow-md gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Publish Community Broadcast</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
