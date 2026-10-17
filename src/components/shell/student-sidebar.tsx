"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logoutAction } from "@/actions/auth"
import {
  LayoutDashboard,
  BookOpenCheck,
  Compass,
  Video,
  FileCheck2,
  HelpCircle,
  Award,
  Trophy,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Lock,
  Sparkles,
  Gift,
} from "lucide-react"

export interface StudentNavCountsProp {
  pendingAssignments: number
  pendingQuizzes: number
}

interface AppleNavItem {
  title: string
  href: string
  icon: React.ElementType
  iconGradient: string
  /** Real (database-driven) count shown as a pill. Hidden when 0. */
  countKey?: keyof StudentNavCountsProp
  isNew?: boolean
  isLocked?: boolean
}

const mainNavItems: AppleNavItem[] = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    iconGradient: "from-cyan-400 to-teal-500",
  },
  {
    title: "My Courses",
    href: "/student/my-courses",
    icon: BookOpenCheck,
    iconGradient: "from-blue-500 to-indigo-600",
  },
  {
    title: "Live Classes",
    href: "/student/live-classes",
    icon: Video,
    iconGradient: "from-rose-500 to-red-600",
  },
  // {
  //   title: "Explore Courses",
  //   href: "/student/catalog",
  //   icon: Compass,
  //   iconGradient: "from-emerald-400 to-teal-600",
  // },
]

const academicNavItems: AppleNavItem[] = [
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: FileCheck2,
    iconGradient: "from-amber-400 to-orange-500",
    countKey: "pendingAssignments",
  },
  {
    title: "Quizzes",
    href: "/student/assessments",
    icon: HelpCircle,
    iconGradient: "from-purple-500 to-violet-600",
    countKey: "pendingQuizzes",
  },
  {
    title: "Leaderboard",
    href: "/student/leaderboard",
    icon: Trophy,
    iconGradient: "from-yellow-300 via-amber-500 to-orange-500",
    isNew: true,
  },
  {
    title: "Rewards & Swag",
    href: "/student/rewards",
    icon: Gift,
    iconGradient: "from-amber-400 via-orange-500 to-rose-500",
    isNew: true,
  },
  {
    title: "Certificates",
    href: "/student/certificates",
    icon: Award,
    iconGradient: "from-yellow-400 to-amber-500",
  },
  {
    title: "Interview Prep",
    href: "/student/interview",
    icon: Sparkles,
    iconGradient: "from-cyan-400 to-blue-600",
    isLocked: true,
  },
]

const accountNavItems: AppleNavItem[] = [
  {
    title: "Profile & Settings",
    href: "/student/settings",
    icon: Settings,
    iconGradient: "from-slate-400 to-slate-600",
  },
]

const LEADERBOARD_SEEN_KEY = "tg:leaderboard-seen"

interface StudentSidebarProps {
  user?: {
    name: string
    email: string
    avatarUrl?: string | null
    headline?: string | null
  }
  counts?: StudentNavCountsProp
  onCloseMobile?: () => void
}

export function StudentSidebar({ user, counts, onCloseMobile }: StudentSidebarProps) {
  const pathname = usePathname()

  // One-time "NEW" pill for the Leaderboard feature (dismissed after first visit)
  const [leaderboardSeen, setLeaderboardSeen] = React.useState(true)
  React.useEffect(() => {
    try {
      if (pathname.startsWith("/student/leaderboard")) {
        localStorage.setItem(LEADERBOARD_SEEN_KEY, "1")
        setLeaderboardSeen(true)
      } else {
        setLeaderboardSeen(localStorage.getItem(LEADERBOARD_SEEN_KEY) === "1")
      }
    } catch {
      setLeaderboardSeen(true)
    }
  }, [pathname])

  const userName = user?.name || "Student"
  const userEmail = user?.email || "student@techgration.com"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const renderNavGroup = (title: string, items: AppleNavItem[]) => (
    <div className="space-y-1 mb-5">
      <div className="px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/70">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/student/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          const count = item.countKey ? counts?.[item.countKey] ?? 0 : 0
          const showNew = item.isNew && !leaderboardSeen && !isActive

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-black/[0.08] dark:bg-white/[0.12] text-foreground font-semibold shadow-xs ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]"
                  : "text-foreground/80 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Apple SF Symbols-style colorful rounded squircle */}
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.iconGradient} flex items-center justify-center text-white shrink-0 shadow-xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="truncate">{item.title}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                      isActive
                        ? "bg-foreground/15 text-foreground"
                        : item.countKey === "pendingAssignments"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {showNew && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black tracking-wider rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white animate-pulse">
                    NEW
                  </span>
                )}
                {item.isLocked && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <aside className="w-64 h-full flex flex-col justify-between bg-[#F8F9FA]/80 dark:bg-[#111518]/80 backdrop-blur-2xl border-r border-black/[0.06] dark:border-white/[0.08] select-none overflow-y-auto">
      {/* Top Header & Brand */}
      <div>
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06]">
          <BrandLogo variant="sidebar" href="/student/dashboard" />
        </div>

        {/* Apple-style Navigation Groups */}
        <div className="p-3 pt-4">
          {renderNavGroup("Learning", mainNavItems)}
          {renderNavGroup("Academics", academicNavItems)}
          {renderNavGroup("Account", accountNavItems)}
        </div>
      </div>

      {/* Bottom User Card & Actions (Apple ID / Account Card Style) */}
      <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.06] space-y-2">
        <div className="px-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-medium">Student Portal</span>
          <Link
            href="/login"
            className="flex items-center gap-1 hover:text-foreground text-brand-ink dark:text-brand-teal font-medium"
            title="Switch account"
          >
            <span>Switch</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* User profile row */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] shadow-xs hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-all">
          <Link
            href="/student/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <Avatar className="h-8 w-8 rounded-full border border-brand-teal/30 ring-1 ring-brand-teal/20">
                {user?.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={userName} className="object-cover" />
                )}
                <AvatarFallback className="bg-gradient-to-br from-brand-teal/20 to-cyan-500/10 text-brand-ink dark:text-brand-teal text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[13px] font-semibold text-foreground truncate leading-tight">{userName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
