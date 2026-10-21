"use client"

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { logoutAction } from "@/actions/auth"
import {
  Menu,
  X,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Radio,
  Trophy,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from "lucide-react"

export interface LandingNavUser {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
}

interface LandingNavProps {
  user?: LandingNavUser | null
}

export function LandingNav({ user }: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<LandingNavUser | null>(user ?? null)

  // Sync with prop and provide client-side fallback if session state changes
  React.useEffect(() => {
    if (user !== undefined) {
      setCurrentUser(user)
      return
    }

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            avatarUrl: data.user.avatarUrl ?? data.user.profile?.avatarUrl ?? null,
          })
        } else {
          setCurrentUser(null)
        }
      })
      .catch(() => {})
  }, [user])

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "Why TechGration", href: "#why-us" },
  ]

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        setMobileMenuOpen(false)
      }
    }
  }

  // Determine role-based links
  const isStudent = currentUser?.role === "STUDENT" || !currentUser?.role
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"
  const isTeacher = currentUser?.role === "TEACHER"

  const dashboardHref = isAdmin
    ? "/admin/dashboard"
    : isTeacher
    ? "/teacher/dashboard"
    : "/student/dashboard"

  const dashboardName = isAdmin
    ? "Admin Dashboard"
    : isTeacher
    ? "Teacher Console"
    : "Student Dashboard"

  const roleBadgeLabel = isAdmin
    ? "Administrator"
    : isTeacher
    ? "Instructor"
    : "Student"

  const userName = currentUser?.name || "Student"
  const firstName = userName.split(" ")[0] || "User"
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-background/80 dark:bg-[#070A0D]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <BrandLogo variant="sidebar" portalName="LMS" href="/" priority />

        {/* Center: Apple-style Desktop Section Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-secondary/50 dark:bg-white/[0.03] backdrop-blur-md shadow-xs">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Controls & User Profile / CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <ThemeToggle variant="button" />

          {currentUser ? (
            /* Logged-In User Profile Popover */
            <Popover>
              <PopoverTrigger
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-border/80 hover:border-brand-teal/50 bg-secondary/40 hover:bg-secondary/70 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-teal/30 cursor-pointer shadow-xs"
                aria-label="User account menu"
              >
                <Avatar className="h-7 w-7 rounded-full border border-brand-teal/40 ring-1 ring-brand-teal/20">
                  {currentUser.avatarUrl && (
                    <AvatarImage src={currentUser.avatarUrl} alt={userName} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-brand-teal/30 to-cyan-500/20 text-brand-charcoal dark:text-brand-teal text-[11px] font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-foreground max-w-[110px] truncate">
                  {firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-[calc(100vw-2rem)] max-w-xs sm:w-72 p-2.5 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl rounded-2xl overscroll-contain animate-in fade-in-0 zoom-in-95"
              >
                {/* User Header Card */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 rounded-xl border border-brand-teal/40 ring-2 ring-brand-teal/15 shrink-0">
                    {currentUser.avatarUrl && (
                      <AvatarImage src={currentUser.avatarUrl} alt={userName} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-brand-teal/30 to-cyan-500/20 text-brand-charcoal dark:text-brand-teal text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-teal/15 text-brand-ink dark:text-brand-teal mt-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {roleBadgeLabel}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mb-2">
                  <Button
                    asChild
                    size="sm"
                    className="w-full justify-center rounded-xl bg-brand-teal text-brand-charcoal hover:bg-brand-cyan font-bold text-xs shadow-xs"
                  >
                    <Link href={dashboardHref} className="gap-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Open {dashboardName}</span>
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                  </Button>
                </div>

                {/* Quick Navigation Links */}
                <div className="py-1 space-y-0.5 text-xs border-t border-border/60">
                  {isStudent ? (
                    <>
                      <Link
                        href="/student/my-courses"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                        <span>My Enrolled Courses</span>
                      </Link>
                      <Link
                        href="/student/live-classes"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Scheduled Live Classes</span>
                      </Link>
                      <Link
                        href="/student/leaderboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Trophy className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Leaderboard & Podium</span>
                      </Link>
                      <Link
                        href="/student/settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Profile & Settings</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={dashboardHref}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Console Overview</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Sign Out Action */}
                <div className="pt-1.5 border-t border-border/60">
                  <form action={logoutAction}>
                    <input type="hidden" name="redirectTo" value="/" />
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            /* Guest CTAs */
            <>
              <Button asChild size="sm" variant="ghost" className="text-xs font-semibold rounded-full px-3.5">
                <Link href="/login">Sign In</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="text-xs font-semibold rounded-full px-4 bg-brand-teal text-brand-charcoal hover:bg-brand-cyan shadow-xs hover:shadow-[0_0_20px_rgba(0,214,214,0.35)] transition-all"
              >
                <Link href="/student/dashboard" className="gap-1.5">
                  <span>Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle variant="button" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-card/95 backdrop-blur-xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-border/80 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-xl border border-brand-teal/40 ring-1 ring-brand-teal/20 shrink-0">
                    {currentUser.avatarUrl && (
                      <AvatarImage src={currentUser.avatarUrl} alt={userName} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-brand-teal/30 to-cyan-500/20 text-brand-charcoal dark:text-brand-teal text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-teal/15 text-brand-ink dark:text-brand-teal mt-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {roleBadgeLabel}
                    </span>
                  </div>
                </div>

                <Button asChild size="sm" className="w-full justify-center rounded-xl bg-brand-teal text-brand-charcoal font-bold">
                  <Link href={dashboardHref} className="gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Open {dashboardName}</span>
                  </Link>
                </Button>

                <form action={logoutAction}>
                  <input type="hidden" name="redirectTo" value="/" />
                  <Button
                    variant="outline"
                    size="sm"
                    type="submit"
                    className="w-full justify-center rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="w-full justify-center rounded-xl">
                  <Link href="/login">Sign In to Account</Link>
                </Button>
                <Button asChild size="sm" className="w-full justify-center rounded-xl bg-brand-teal text-brand-charcoal font-semibold">
                  <Link href="/student/dashboard">Launch Student Workspace</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
