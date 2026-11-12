"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  Megaphone,
  Plus,
  CalendarClock,
  PartyPopper,
  Rocket,
  Lightbulb,
  Search,
  Filter,
  Pin,
  Sparkles,
  BarChart2,
  RefreshCw,
  BellRing,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommunityPostCard,
  CommunityPostData,
} from "@/components/community/community-post-card"
import { CreatePostModal } from "@/components/community/create-post-modal"

interface TeacherCommunityClientProps {
  currentUser: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string | null
    headline?: string | null
  }
  initialPosts: CommunityPostData[]
  courses: { id: string; title: string }[]
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All Posts", icon: Megaphone },
  { id: "CLASS_RESCHEDULE", label: "Class Reschedules", icon: CalendarClock },
  { id: "IMPORTANT_NOTICE", label: "Notices & Circulars", icon: BellRing },
  { id: "OCCASION_CELEBRATION", label: "Festivals & Wishes", icon: PartyPopper },
  { id: "OPPORTUNITY_RESOURCE", label: "Opportunities", icon: Rocket },
  { id: "GENERAL_UPDATE", label: "General", icon: Lightbulb },
]

export function TeacherCommunityClient({
  currentUser,
  initialPosts,
  courses,
}: TeacherCommunityClientProps) {
  const [posts, setPosts] = React.useState<CommunityPostData[]>(initialPosts)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState("ALL")
  const [selectedCourseId, setSelectedCourseId] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const fetchPosts = async (cat = selectedCategory, course = selectedCourseId, search = searchQuery) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (cat !== "ALL") params.set("category", cat)
      if (course) params.set("courseId", course)
      if (search.trim()) params.set("search", search.trim())

      const res = await fetch(`/api/community/posts?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.posts) {
          setPosts(data.posts)
        }
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostCreated = (newPost: CommunityPostData) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId))
  }

  // Analytics computation
  const totalPosts = posts.length
  const pinnedCount = posts.filter((p) => p.isPinned).length
  const rescheduleCount = posts.filter((p) => p.category === "CLASS_RESCHEDULE").length
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Bar */}
      <div className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-rose-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  <Megaphone className="w-3.5 h-3.5" />
                  Instructor Broadcast Center
                </span>
                <span className="text-xs text-muted-foreground">
                  Logged in as <strong className="text-foreground">{currentUser.name}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Community & Notice Broadcaster
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Publish live lecture reschedule alerts, festival greetings, evaluation circulars, and engineering assets directly to student cohort dashboards.
              </p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="self-start sm:self-center rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white shadow-md gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </Button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm">
              <div className="text-[11px] font-medium text-muted-foreground">Total Broadcasts</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{totalPosts}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/5 backdrop-blur-sm">
              <div className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Pinned Bulletins</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{pinnedCount}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm">
              <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Class Reschedules</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{rescheduleCount}</div>
            </div>
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 backdrop-blur-sm">
              <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Student Doubts/Notes</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{totalComments}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search announcements by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchPosts()
                }}
                className="w-full pl-9.5 pr-4 py-2.5 rounded-xl bg-card border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="sm:w-72">
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value)
                  fetchPosts(selectedCategory, e.target.value, searchQuery)
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Courses & Campus-Wide</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts()}
              disabled={isLoading}
              className="rounded-xl text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const TabIcon = tab.icon
              const isSelected = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id)
                    fetchPosts(tab.id, selectedCourseId, searchQuery)
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Posts Feed */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/50">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              No Announcements Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Broadcast your first community notice, class rescheduling, or holiday greeting to keep all enrolled students informed.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-xs rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
        courses={courses}
        authorName={currentUser.name}
      />
    </div>
  )
}
