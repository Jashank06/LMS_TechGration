"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Search,
  Plus,
  Video,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function TeacherHeader() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(3)

  // Keyboard shortcut Cmd+K or Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const getBreadcrumb = () => {
    if (pathname.includes("/dashboard")) return "Dashboard"
    if (pathname.includes("/courses/new")) return "Courses / New Course Wizard"
    if (pathname.includes("/courses") && pathname.includes("/builder")) return "Courses / Curriculum Editor"
    if (pathname.includes("/courses")) return "Courses & Curriculum"
    if (pathname.includes("/leaderboard")) return "Performance / Course Leaderboard"
    if (pathname.includes("/live-classes")) return "Live-Class Scheduler"
    if (pathname.includes("/attendance")) return "Attendance Management"
    if (pathname.includes("/assignments") && pathname.includes("/grade")) return "Assignments / Split-Screen Grading"
    if (pathname.includes("/assignments")) return "Assignments & Grading"
    if (pathname.includes("/quizzes")) return "Assessments / Quizzes & Tests"
    if (pathname.includes("/students")) return "Student Management"
    if (pathname.includes("/analytics")) return "Teacher Analytics"
    return "Teacher Console"
  }

  const notifications = [
    {
      id: 1,
      title: "New Assignment Submitted",
      desc: "Rahul Verma submitted 'Lab 3: Pod Security Standards'",
      time: "15m ago",
      type: "submission",
    },
    {
      id: 2,
      title: "Course Approved",
      desc: "Admin approved 'Next.js 16 Enterprise Full-Stack'",
      time: "2h ago",
      type: "approval",
    },
    {
      id: 3,
      title: "Upcoming Live Session",
      desc: "'Kubernetes Cluster Hardening' begins in 3 hours",
      time: "3h ago",
      type: "reminder",
    },
  ]

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
        <span className="text-muted-foreground">Instructor</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-semibold tracking-tight">{getBreadcrumb()}</span>
      </div>

      {/* Actions & Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="inline-flex items-center h-4 px-1 rounded bg-background border border-border font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        {/* Create Quick Action Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button size="sm" className="gap-1.5 shadow-teal-glow">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={
              <Link href="/teacher/courses/new" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4 text-brand-teal" />
                <span>New Course</span>
              </Link>
            } />
            <DropdownMenuItem render={
              <Link href="/teacher/live-classes" className="flex items-center gap-2 cursor-pointer">
                <Video className="w-4 h-4 text-brand-cyan" />
                <span>Schedule Live Class</span>
              </Link>
            } />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger render={
            <Button variant="outline" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>
          } />
          <PopoverContent align="end" className="w-80 p-0 shadow-card">
            <div className="flex items-center justify-between p-3.5 border-b border-border">
              <span className="font-semibold text-xs">Instructor Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[11px] text-brand-ink dark:text-brand-cyan hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 hover:bg-muted/40 transition-colors text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium text-foreground">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme Toggle */}
        <ThemeToggle variant="button" />
      </div>

      {/* Global Cmd+K Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden shadow-2xl">
          <div className="flex items-center px-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0 mr-2" />
            <Input
              placeholder="Search courses, modules, students, or submissions..."
              className="border-0 shadow-none focus-visible:ring-0 text-sm h-12"
              autoFocus
            />
          </div>
          <div className="p-3 space-y-2 text-xs">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
              Quick Shortcuts
            </div>
            <Link
              href="/teacher/courses"
              onClick={() => setSearchOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-teal" />
                <span>All Courses & Curriculum Builder</span>
              </div>
              <span className="text-muted-foreground text-[10px]">Courses</span>
            </Link>
            <Link
              href="/teacher/assignments"
              onClick={() => setSearchOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-warning" />
                <span>Grading Queue (14 Pending Submissions)</span>
              </div>
              <span className="text-muted-foreground text-[10px]">Grading</span>
            </Link>
            <Link
              href="/teacher/attendance"
              onClick={() => setSearchOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-info" />
                <span>Class Roster & Attendance Tracking</span>
              </div>
              <span className="text-muted-foreground text-[10px]">Attendance</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
