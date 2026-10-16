"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BrandLogo } from "@/components/brand/brand-logo"
import {
  LayoutDashboard,
  BookOpen,
  Video,
  UserCheck,
  CheckSquare,
  HelpCircle,
  Trophy,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import type { TeacherNavCounts } from "@/server/services/nav-counts"

export interface TeacherSidebarProps {
  user?: {
    name: string
    email: string
    avatarUrl?: string | null
    headline?: string | null
  } | null
  counts?: TeacherNavCounts | null
}

export function TeacherSidebar({ user, counts: initialCounts }: TeacherSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = React.useState(false)
  const [counts, setCounts] = React.useState<TeacherNavCounts | null>(initialCounts ?? null)

  // Fetch or sync dynamic counts
  React.useEffect(() => {
    if (initialCounts) {
      setCounts(initialCounts)
      return
    }
    let cancelled = false
    fetch("/api/teacher/nav-counts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.assignmentsToReview === "number") {
          setCounts(data)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [initialCounts])

  const navItems = [
    {
      label: "Dashboard",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
      iconGradient: "from-cyan-400 to-teal-500",
    },
    {
      label: "Courses & Curriculum",
      href: "/teacher/courses",
      icon: BookOpen,
      iconGradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Course Leaderboard",
      href: "/teacher/leaderboard",
      icon: Trophy,
      iconGradient: "from-amber-400 to-yellow-500",
    },
    {
      label: "Live Classes",
      href: "/teacher/live-classes",
      icon: Video,
      iconGradient: "from-rose-500 to-red-600",
      badge: counts && counts.liveToday > 0 ? `${counts.liveToday} Today` : undefined,
      badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    },
    {
      label: "Attendance",
      href: "/teacher/attendance",
      icon: UserCheck,
      iconGradient: "from-emerald-400 to-teal-600",
    },
    {
      label: "Assignments & Grading",
      href: "/teacher/assignments",
      icon: CheckSquare,
      iconGradient: "from-amber-400 to-orange-500",
      badge:
        counts && counts.assignmentsToReview > 0
          ? `${counts.assignmentsToReview} Pending`
          : undefined,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    },
    {
      label: "Quizzes & Tests",
      href: "/teacher/quizzes",
      icon: HelpCircle,
      iconGradient: "from-purple-500 to-violet-600",
      badge: counts && counts.quizzes > 0 ? String(counts.quizzes) : undefined,
      badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
    },
    {
      label: "Student Roster",
      href: "/teacher/students",
      icon: Users,
      iconGradient: "from-sky-400 to-blue-600",
    },
    {
      label: "Analytics & Reports",
      href: "/teacher/analytics",
      icon: BarChart3,
      iconGradient: "from-slate-400 to-slate-600",
    },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/teacher/logout", { method: "POST" })
      toast.success("Instructor session ended")
      router.push("/teacher/login")
      router.refresh()
    } catch {
      toast.error("Logout failed")
    }
  }

  const teacherName = user?.name || "Course Instructor"
  const teacherHeadline = user?.headline || "Faculty Member"
  const initials = teacherName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TC"

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-200 select-none z-30 ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Brand & Collapse Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {collapsed ? (
          <div className="mx-auto">
            <BrandLogo variant="mark" href="/teacher/dashboard" />
          </div>
        ) : (
          <BrandLogo variant="sidebar" portalName="Teacher" href="/teacher/dashboard" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-black/[0.08] dark:bg-white/[0.12] text-foreground font-semibold shadow-xs ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]"
                  : "text-foreground/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-foreground"
              } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.iconGradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
              >
                <Icon className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-foreground/15 text-foreground" : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Quick LMS Switcher Pill */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-border/60">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Exit to Portal Directory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Teacher Profile & Logout Footer */}
      <div className="p-3 border-t border-border">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-muted/40 ${
            collapsed ? "justify-center p-1" : ""
          }`}
        >
          <Avatar className="w-9 h-9 border border-primary/30">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={teacherName} />}
            <AvatarFallback className="bg-brand-teal text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{teacherName}</div>
              <div className="text-[11px] text-muted-foreground truncate">{teacherHeadline}</div>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
