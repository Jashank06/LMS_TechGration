"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Video,
  Code2,
  Trophy,
  Award,
} from "lucide-react"

export interface LandingHeroProps {
  user?: {
    name: string
    role: string
  } | null
}

export function LandingHero({ user }: LandingHeroProps) {
  const [currentUser, setCurrentUser] = React.useState(user ?? null)

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
            name: data.user.name,
            role: data.user.role,
          })
        } else {
          setCurrentUser(null)
        }
      })
      .catch(() => {})
  }, [user])

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"
  const isTeacher = currentUser?.role === "TEACHER"
  const dashboardHref = isAdmin
    ? "/admin/dashboard"
    : isTeacher
    ? "/teacher/dashboard"
    : "/student/dashboard"

  const primaryBtnLabel = currentUser
    ? isAdmin
      ? "Open Admin Console"
      : isTeacher
      ? "Open Teacher Console"
      : "Go to Student Dashboard"
    : "Start Learning Now"
  const handleScrollToCourses = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.querySelector("#courses")
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32 border-b border-border/80">
      {/* Apple-style Ambient Illumination Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-brand-teal/20 via-cyan-500/10 to-transparent rounded-full blur-3xl opacity-75 dark:opacity-40" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[420px] h-[420px] bg-brand-cyan/15 rounded-full blur-3xl opacity-60 dark:opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Official LMS Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-brand-teal/10 dark:bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30 shadow-xs backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-teal animate-pulse" />
          <span>TechGration Technologies • Official Learning Management System</span>
        </motion.div>

        {/* Colossal Apple Headline for Students */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
            Where Next-Gen Engineers{" "}
            <span className="block mt-1 bg-gradient-to-r from-brand-ink via-brand-teal to-brand-cyan bg-clip-text text-transparent dark:from-brand-teal dark:via-cyan-300 dark:to-teal-200">
              Learn, Build & Lead.
            </span>
          </h1>
          <p className="pt-2 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            Welcome to the flagship Learning Management System of <strong>TechGration Technologies</strong>.
            Master full-stack architecture, cloud microservices, and modern AI through live mentor-led cohorts,
            hands-on labs, interactive quizzes, and verified credentials.
          </p>
        </motion.div>

        {/* Student-Focused Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 py-6 text-sm font-bold bg-brand-teal text-brand-charcoal hover:bg-brand-cyan shadow-lg shadow-brand-teal/25 hover:shadow-brand-teal/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Link href={dashboardHref} className="gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>{primaryBtnLabel}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full px-8 py-6 text-sm font-semibold border-border hover:bg-muted/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
          >
            <a href="#courses" onClick={handleScrollToCourses} className="gap-2">
              <BookOpen className="w-4 h-4 text-brand-teal" />
              <span>Explore Live Courses</span>
            </a>
          </Button>
        </motion.div>

        {/* Student-Centric Value Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 text-xs text-muted-foreground font-medium"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-foreground">Daily Live Classes & Recordings</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-teal" />
            <span className="font-semibold text-foreground">Hands-on Cloud Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-foreground">Course Leaderboards & Podium</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-teal" />
            <span className="font-semibold text-foreground">Verified TechGration Certificates</span>
          </div>
        </motion.div>

        {/* Subtle Instructor & Admin Access Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-2 text-xs text-muted-foreground/80"
        >
          Instructor or Administrator?{" "}
          <Link href="/teacher/login" className="text-brand-ink dark:text-brand-teal hover:underline font-semibold">
            Sign in to Console &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
