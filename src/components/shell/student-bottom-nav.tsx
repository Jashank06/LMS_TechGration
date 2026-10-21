"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpenCheck,
  Video,
  Code,
  Gift,
} from "lucide-react"
import type { StudentNavCountsProp } from "./student-sidebar"

interface StudentBottomNavProps {
  counts?: StudentNavCountsProp
}

interface BottomNavItem {
  label: string
  href: string
  icon: React.ElementType
  activePattern: (pathname: string) => boolean
  badge?: number
  isLive?: boolean
}

export function StudentBottomNav({ counts }: StudentBottomNavProps) {
  const pathname = usePathname()

  const navItems: BottomNavItem[] = [
    {
      label: "Home",
      href: "/student/dashboard",
      icon: LayoutDashboard,
      activePattern: (p) => p === "/student/dashboard",
    },
    {
      label: "Courses",
      href: "/student/my-courses",
      icon: BookOpenCheck,
      activePattern: (p) => p.startsWith("/student/my-courses") || p.startsWith("/student/courses"),
    },
    {
      label: "Live",
      href: "/student/live-classes",
      icon: Video,
      activePattern: (p) => p.startsWith("/student/live-classes"),
    },
    {
      label: "Quizzes",
      href: "/student/assessments",
      icon: BookOpenCheck,
      activePattern: (p) => p.startsWith("/student/assessments") || p.startsWith("/student/assignments"),
      badge: (counts?.pendingQuizzes ?? 0) + (counts?.pendingAssignments ?? 0),
    },
    {
      label: "Arena",
      href: "/student/arena",
      icon: Code,
      activePattern: (p) => p.startsWith("/student/arena"),
    },
  ]

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(8)
      } catch {
        // Safe fallback if permission restricted
      }
    }
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-3 inset-x-3 z-40 md:hidden bg-card/90 dark:bg-[#111518]/92 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25)] px-1.5 py-1 flex items-center justify-around transition-all"
    >
      {navItems.map((item) => {
        const isActive = item.activePattern(pathname)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={triggerHaptic}
            className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[44px] rounded-xl transition-all ${
              isActive
                ? "text-brand-charcoal dark:text-brand-teal font-bold"
                : "text-muted-foreground hover:text-foreground active:scale-95"
            }`}
          >
            {/* Active pill background highlight */}
            {isActive && (
              <span className="absolute inset-x-1 inset-y-1 rounded-xl bg-brand-teal/15 dark:bg-brand-teal/20 -z-10" />
            )}

            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110 text-brand-ink dark:text-brand-teal" : ""
                }`}
              />

              {/* Badge for pending tasks */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-card shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] tracking-tight mt-0.5 truncate leading-tight">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
