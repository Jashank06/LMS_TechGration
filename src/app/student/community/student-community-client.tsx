"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  Megaphone,
  Search,
  Filter,
  CalendarClock,
  PartyPopper,
  Rocket,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Bell,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommunityPostCard,
  CommunityPostData,
} from "@/components/community/community-post-card"
import {
  PinnedAnnouncementBanner,
  PinnedPost,
} from "@/components/community/pinned-announcement-banner"

interface StudentCommunityClientProps {
  currentUser: {
    id: string
    name: string
    role: string
  }
  initialPosts: CommunityPostData[]
  pinnedPosts: PinnedPost[]
  enrolledCourses: { id: string; title: string }[]
}

const CATEGORY_TABS = [
  { id: "ALL", label: "All Updates", icon: Megaphone },
  { id: "CLASS_RESCHEDULE", label: "Class Reschedules", icon: CalendarClock },
  { id: "IMPORTANT_NOTICE", label: "Urgent Notices", icon: Bell },
  { id: "OCCASION_CELEBRATION", label: "Celebrations", icon: PartyPopper },
  { id: "OPPORTUNITY_RESOURCE", label: "Resources", icon: Rocket },
  { id: "GENERAL_UPDATE", label: "General", icon: Lightbulb },
]

export function StudentCommunityClient({
  currentUser,
  initialPosts,
  pinnedPosts,
  enrolledCourses,
}: StudentCommunityClientProps) {
  const [posts, setPosts] = React.useState<CommunityPostData[]>(initialPosts)
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL")
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("")
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
      console.error("Failed to refresh posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId)
    fetchPosts(catId, selectedCourseId, searchQuery)
  }

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId)
    fetchPosts(selectedCategory, courseId, searchQuery)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts(selectedCategory, selectedCourseId, searchQuery)
  }

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId))
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Header Hero */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-rose-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  <Megaphone className="w-3.5 h-3.5" />
                  TechGration Cohort Bulletin
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  Live Instructor Updates
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                Community Feed & Notice Board
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Real-time lecture rescheduling notices, festive greetings, milestone alerts, and exclusive learning resources directly from your instructors.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPosts()}
              disabled={isLoading}
              className="self-start sm:self-center rounded-xl text-xs gap-2 border-border/80 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Feed</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Pinned Bulletins Banner */}
        <PinnedAnnouncementBanner initialPosts={pinnedPosts} />

        {/* Filter Controls Bar */}
        <div className="space-y-4 mb-8">
          {/* Search + Course Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search announcements, schedule changes, or guidelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2.5 rounded-xl bg-card border border-border/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </form>

            {enrolledCourses.length > 0 && (
              <div className="sm:w-72">
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">All My Enrolled Courses & Global</option>
                  {enrolledCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const TabIcon = tab.icon
              const isSelected = selectedCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleCategoryChange(tab.id)}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 px-4 rounded-2xl border border-dashed border-border/80 bg-card/50 backdrop-blur-sm"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              No Announcements Found
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              There are no notices published in this category yet. When instructors reschedule a session or broadcast updates, they will appear right here.
            </p>
            {(selectedCategory !== "ALL" || selectedCourseId || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory("ALL")
                  setSelectedCourseId("")
                  setSearchQuery("")
                  fetchPosts("ALL", "", "")
                }}
                className="mt-4 text-xs rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
