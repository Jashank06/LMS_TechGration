"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { CommandPalette } from "./command-palette"
import {
  Bell,
  Search,
  Menu,
  Sparkles,
  CheckCircle2,
  Clock,
  Video,
  ChevronRight,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logoutAction } from "@/actions/auth"
import {
  User as UserIcon,
  Settings,
  BookOpen,
  LogOut,
  BadgeCheck,
} from "lucide-react"

interface StudentTopbarProps {
  user?: {
    id?: string
    name: string
    email: string
    avatarUrl?: string | null
    headline?: string | null
  }
  onToggleMobileSidebar: () => void
}

export function StudentTopbar({ user, onToggleMobileSidebar }: StudentTopbarProps) {
  const pathname = usePathname()
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<
    {
      id: string
      title: string
      message: string
      time: string
      href: string
      type: "live" | "grade" | "cert"
      unread: boolean
    }[]
  >([])

  React.useEffect(() => {
    let active = true
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/student/notifications")
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.notifications)) {
          setNotifications(
            data.notifications.map((n: any) => {
              const isLive = n.title.includes("Live Class") || n.message.includes("Live")
              const isGrade = n.title.includes("Grade") || n.title.includes("Assignment")
              const createdDate = new Date(n.createdAt)
              const timeStr = createdDate.toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })

              return {
                id: n.id,
                title: n.title,
                message: n.message,
                href: n.href || "/student/dashboard",
                time: timeStr,
                type: isLive ? "live" : isGrade ? "grade" : "cert",
                unread: Boolean(n.unread),
              }
            })
          )
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err)
      }
    }

    fetchNotifications()
    const timer = setInterval(fetchNotifications, 15000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  const userName = user?.name || "Student User"
  const userEmail = user?.email || "student@techgration.com"
  const userInitials = React.useMemo(() => {
    return userName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [userName])

  // Generate dynamic breadcrumb segments
  const pathSegments = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => {
      const formatted = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
      return { raw: seg, formatted }
    })

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    await fetch("/api/student/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {})
  }

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Left: Mobile hamburger + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link
              href="/student/dashboard"
              className="hover:text-foreground transition-colors font-medium text-foreground/80"
            >
              Student Portal
            </Link>
            {pathSegments.slice(1).map((segment, idx) => (
              <React.Fragment key={segment.raw}>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span
                  className={
                    idx === pathSegments.length - 2
                      ? "text-foreground font-semibold"
                      : "hover:text-foreground transition-colors"
                  }
                >
                  {segment.formatted}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cmd+K Search Button */}
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs transition-all shadow-2xs group"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="hidden md:inline">Search courses, labs & schedule...</span>
            <span className="md:hidden">Search</span>
            <kbd className="hidden sm:inline-flex h-4 items-center gap-0.5 rounded border border-border bg-background px-1 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-teal ring-2 ring-card animate-pulse" />
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 border-border bg-card shadow-xl">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-teal/15 text-brand-ink dark:text-brand-teal font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-brand-teal/10 text-brand-ink dark:text-brand-teal flex items-center justify-center mx-auto">
                      <Bell className="w-4 h-4 opacity-70" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">All caught up!</p>
                    <p className="text-[11px] text-muted-foreground">You have no unread notifications right now.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`p-3 text-xs flex gap-3 transition-colors block ${
                        item.unread ? "bg-brand-teal/5 dark:bg-brand-teal/10" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="mt-0.5">
                        {item.type === "live" && (
                          <div className="p-1 rounded-md bg-amber-500/15 text-amber-500">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.type === "grade" && (
                          <div className="p-1 rounded-md bg-emerald-500/15 text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {item.type === "cert" && (
                          <div className="p-1 rounded-md bg-brand-teal/15 text-brand-teal">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground leading-snug">{item.title}</p>
                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70 mt-1 inline-block">
                          {item.time}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-border bg-muted/20 text-center">
                <Link
                  href="/student/settings"
                  className="text-[11px] text-brand-ink dark:text-brand-teal font-medium hover:underline"
                >
                  Notification Preferences
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Dual Light/Dark Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar Menu */}
          <Popover>
            <PopoverTrigger
              className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full border border-border/80 hover:border-brand-teal/50 bg-secondary/30 hover:bg-secondary/60 transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal/30 cursor-pointer"
              aria-label="User account menu"
            >
              <Avatar className="h-7 w-7 rounded-full border border-brand-teal/40 ring-1 ring-brand-teal/20">
                {user?.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={userName} className="object-cover" />
                )}
                <AvatarFallback className="bg-gradient-to-br from-brand-teal/25 to-cyan-500/15 text-brand-charcoal dark:text-brand-teal text-[11px] font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-xs font-semibold text-foreground max-w-[90px] truncate">
                {userName.split(" ")[0]}
              </span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2 border-border/80 bg-card/95 backdrop-blur-xl shadow-xl rounded-2xl">
              <div className="p-2.5 border-b border-border/60 flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-xl border border-brand-teal/30 ring-2 ring-brand-teal/10">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={userName} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-brand-teal/20 to-cyan-500/10 text-brand-charcoal dark:text-brand-teal text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-brand-teal/15 text-brand-ink dark:text-brand-teal mt-0.5">
                    <BadgeCheck className="w-2.5 h-2.5" />
                    Student
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5 text-xs">
                <Link
                  href="/student/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Profile & Settings</span>
                </Link>
                <Link
                  href="/student/my-courses"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                  <span>My Enrolled Courses</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-border/60">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Cmd+K Dialog */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
