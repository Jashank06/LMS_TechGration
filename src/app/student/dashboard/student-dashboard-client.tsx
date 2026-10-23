"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, type Variants } from "motion/react"
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  Video,
  FileCheck2,
  ArrowRight,
  PlayCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { computeClassWindowStatus } from "@/lib/live-class-utils"

interface StudentDashboardClientProps {
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  enrollmentsCount: number
  activeEnrollmentsCount: number
  avgProgress: number
  completedLessonsCount: number
  hoursInvested: string
  passedQuizzesCount: number
  certificatesCount: number
  activeEnrollment: {
    id: string
    progressPct: number
    course: {
      id: string
      title: string
      category: string
      thumbnailUrl: string
    }
  } | null
  resumeLesson: {
    id: string
    title: string
    position: number
  } | null
  past7DaysData: {
    day: string
    minutes: number
    label: string
  }[]
  weeklyHoursText: string
  daysGoalReached: number
  upcomingLiveClasses: {
    id: string
    title: string
    status: string
    instructorName: string
    startsAt: string | Date
    endsAt?: string | Date
    meetingUrl?: string | null
    joinOpensMinBefore?: number
    course?: {
      title: string
    } | null
  }[]
  assignments: {
    id: string
    title: string
    maxMarks: number
    dueAt: string | Date
    course: {
      title: string
    }
    submissions: {
      status: string
      marksAwarded: number | null
    }[]
  }[]
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function StudentDashboardClient({
  user,
  enrollmentsCount,
  activeEnrollmentsCount,
  avgProgress,
  completedLessonsCount,
  hoursInvested,
  passedQuizzesCount,
  certificatesCount,
  activeEnrollment,
  resumeLesson,
  past7DaysData,
  weeklyHoursText,
  daysGoalReached,
  upcomingLiveClasses,
  assignments,
}: StudentDashboardClientProps) {
  // Friendly time-of-day greeting
  const [greeting, setGreeting] = React.useState("Welcome back")

  React.useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const userInitials = React.useMemo(() => {
    if (!user.name) return "TG"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [user.name])

  const kpis = [
    {
      title: "Courses",
      value: enrollmentsCount.toString(),
      icon: BookOpen,
      color: "text-[#00D6D6]",
      bg: "bg-[#00D6D6]/10",
      glowBg: "bg-[#00D6D6]",
      borderHover: "hover:border-[#00D6D6]/50",
    },
    {
      title: "Completion",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      glowBg: "bg-emerald-500",
      borderHover: "hover:border-emerald-500/50",
    },
    {
      title: "Lessons",
      value: completedLessonsCount.toString(),
      icon: CheckCircle,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      glowBg: "bg-sky-500",
      borderHover: "hover:border-sky-500/50",
    },
    {
      title: "Study Time",
      value: hoursInvested,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      glowBg: "bg-amber-500",
      borderHover: "hover:border-amber-500/50",
    },
    {
      title: "Quizzes",
      value: passedQuizzesCount.toString(),
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      glowBg: "bg-purple-500",
      borderHover: "hover:border-purple-500/50",
    },
    {
      title: "Certificates",
      value: certificatesCount.toString(),
      icon: Award,
      color: "text-[#00D6D6]",
      bg: "bg-[#00D6D6]/10",
      glowBg: "bg-[#00D6D6]",
      borderHover: "hover:border-[#00D6D6]/50",
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Welcome Greeting Banner */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-3xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] bg-card/85 backdrop-blur-2xl p-6 sm:p-8 shadow-sm transition-all"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-60 dark:opacity-40" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5 max-w-xl">
            <Link
              href="/student/settings"
              className="relative group shrink-0"
              title="Go to Profile & Settings"
            >
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-brand-teal/40 ring-4 ring-brand-teal/15 shadow-md shadow-brand-teal/15 group-hover:ring-brand-teal/30 group-hover:scale-[1.02] transition-all">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                )}
                <AvatarFallback className="bg-gradient-to-br from-brand-teal/25 via-cyan-500/20 to-teal-800/30 text-brand-charcoal dark:text-brand-teal text-xl sm:text-2xl font-extrabold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs" />
            </Link>

            <div className="space-y-1.5 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight truncate">
                {greeting},{" "}
                <span className="bg-gradient-to-r from-brand-teal via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {user.name}
                </span>{" "}
                👋
              </h1>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {enrollmentsCount > 0 ? "Enrolled Student • Active Learner" : "Registered Student • Welcome"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            {resumeLesson ? (
              <Button
                asChild
                className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold shadow-md shadow-brand-teal/20 px-6 h-11 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href={`/student/learn/${resumeLesson.id}`}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  <span>Resume Learning</span>
                </Link>
              </Button>
            ) : activeEnrollment ? (
              <Button
                asChild
                className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold shadow-md shadow-brand-teal/20 px-6 h-11 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href={`/student/courses/${activeEnrollment.course.id}`}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  <span>Start Learning</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold shadow-md shadow-brand-teal/20 px-6 h-11 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <a href="https://techgration.live/" target="_blank" rel="noopener noreferrer">
                  <Compass className="w-4 h-4 mr-2" />
                  <span>Enroll Now</span>
                </a>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-2xl border-black/[0.08] dark:border-white/[0.1] font-semibold transition-all hover:bg-secondary/70 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/student/my-courses">
                <span>My Courses</span>
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. 6 Clean KPI Metric Cards (Apple SF Pro Typography, Animated Counter, No Subtitle Clutter) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4.5"
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] bg-card/85 backdrop-blur-xl shadow-xs transition-all duration-300 ${kpi.borderHover} hover:shadow-lg flex flex-col justify-between group`}
            >
              {/* Subtle Ambient Radial Glow on Hover */}
              <div
                className={`pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${kpi.bg}`}
              />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs sm:text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center border border-white/20 dark:border-white/10 shadow-xs group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              <div className="relative z-10 pt-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-mono leading-none">
                  <AnimatedCounter value={kpi.value} />
                </div>
                {/* Micro accent glow bar */}
                <div
                  className={`mt-3 h-1 w-7 rounded-full ${kpi.bg} group-hover:w-full transition-all duration-300`}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* 3. Main Split Section: Continue Learning & Weekly Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Continue Learning Card (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 sm:p-7 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-brand-teal" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Continue Learning
                </h2>
              </div>
              <Link
                href="/student/my-courses"
                className="text-xs text-brand-teal hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>My Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeEnrollment ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4 items-start p-3 rounded-2xl bg-secondary/30 border border-border/60">
                  <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden border border-border/60 shrink-0 bg-muted">
                    <Image
                      src={activeEnrollment.course.thumbnailUrl}
                      alt={activeEnrollment.course.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 176px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <PlayCircle className="w-9 h-9 text-brand-teal" />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-brand-teal">
                      {activeEnrollment.course.category}
                    </span>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">
                      {activeEnrollment.course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {resumeLesson ? (
                        <>
                          Current Lesson:{" "}
                          <strong className="text-foreground font-semibold">
                            {resumeLesson.title}
                          </strong>
                        </>
                      ) : (
                        <span>Ready to begin your study journey</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="font-bold text-foreground">
                      {Math.round(activeEnrollment.progressPct)}%
                    </span>
                  </div>
                  <Progress value={activeEnrollment.progressPct} className="h-2" />
                </div>

                <div className="pt-1">
                  {resumeLesson ? (
                    <Button
                      asChild
                      className="w-full sm:w-auto font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal px-5 rounded-xl h-11 sm:h-10 text-xs sm:text-sm shadow-xs"
                    >
                      <Link href={`/student/learn/${resumeLesson.id}`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        <span>Resume &quot;{resumeLesson.title}&quot;</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="w-full sm:w-auto font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal px-5 rounded-xl h-11 sm:h-10 text-xs sm:text-sm shadow-xs"
                    >
                      <Link href={`/student/courses/${activeEnrollment.course.id}`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        <span>Start Learning</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Clean, friendly, simple empty state when really not enrolled */
              <div className="py-12 px-6 rounded-2xl border border-dashed border-border/80 bg-secondary/15 flex flex-col items-center justify-center text-center space-y-4 my-2">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-xs">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold text-foreground">
                    No courses enrolled yet
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    You have not enrolled in any courses yet. Browse our catalog to find a course and start learning today.
                  </p>
                </div>
                <Button
                  asChild
                  className="bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs h-9 px-5 rounded-xl shadow-xs"
                >
                  <a href="https://techgration.live/" target="_blank" rel="noopener noreferrer">
                    <Compass className="w-3.5 h-3.5 mr-1.5" />
                    <span>Enroll Now</span>
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Study Time Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-teal" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Weekly Study Time
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                {weeklyHoursText}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Time spent learning over the last 7 days.
            </p>

            <div className="py-2">
              <WeeklyActivityChart data={past7DaysData} />
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Daily target: 45 mins</span>
            <span
              className={`font-semibold flex items-center gap-1.5 ${
                daysGoalReached > 0 ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Goal reached {daysGoalReached}/7 days</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* 4. Bottom Grid: Upcoming Live Sessions & Assignments */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Live Sessions Card */}
        <div className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Upcoming Live Classes
              </h2>
            </div>
            <Link
              href="/student/live-classes"
              className="text-xs text-brand-teal hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>Full schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {upcomingLiveClasses.length === 0 ? (
              <div className="py-8 text-center space-y-1.5 border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                <Calendar className="w-7 h-7 text-muted-foreground/60 mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">
                  No live classes scheduled for today.
                </p>
              </div>
            ) : (
              upcomingLiveClasses.map((cls) => {
                const windowStatus = computeClassWindowStatus(
                  {
                    startsAt: cls.startsAt,
                    endsAt: cls.endsAt || new Date(new Date(cls.startsAt).getTime() + 60 * 60 * 1000),
                    status: cls.status,
                    joinOpensMinBefore: cls.joinOpensMinBefore,
                  },
                  new Date()
                )

                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-2xl border border-border/60 bg-secondary/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 hover:border-brand-teal/40 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            windowStatus.isLive
                              ? "bg-amber-500 text-black animate-pulse"
                              : windowStatus.isJoinable
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                          }`}
                        >
                          {windowStatus.isLive
                            ? "LIVE NOW"
                            : windowStatus.isJoinable
                            ? "DOORS OPEN"
                            : "SCHEDULED"}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {cls.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Instructor: {cls.instructorName}</span>
                      </div>
                    </div>

                    {windowStatus.isJoinable ? (
                      <Button
                        asChild
                        size="sm"
                        className="w-full sm:w-auto shrink-0 bg-brand-teal text-brand-charcoal hover:bg-brand-teal/90 font-bold text-xs h-10 sm:h-9 px-4 rounded-xl"
                      >
                        {cls.meetingUrl ? (
                          <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer">
                            Join Live
                          </a>
                        ) : (
                          <Link href="/student/live-classes">Join Live</Link>
                        )}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto shrink-0 border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-semibold text-xs h-10 sm:h-9 px-3 rounded-xl hover:bg-amber-500/10"
                      >
                        <Link href="/student/live-classes">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
                          <span>Opens at {windowStatus.formattedOpenTime}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Assignments & Tasks Card */}
        <div className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Assignments & Tasks
              </h2>
            </div>
            <Link
              href="/student/assignments"
              className="text-xs text-brand-teal hover:underline font-semibold inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {assignments.length === 0 ? (
              <div className="py-8 text-center space-y-1.5 border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                <CheckCircle className="w-7 h-7 text-emerald-500/60 mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">
                  No assignments due right now.
                </p>
              </div>
            ) : (
              assignments.map((asgn) => {
                const submission = asgn.submissions[0]
                const isGraded = submission?.status === "GRADED"
                const isSubmitted = submission?.status === "SUBMITTED"

                return (
                  <div
                    key={asgn.id}
                    className="p-4 rounded-2xl border border-border/60 bg-secondary/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 hover:border-brand-teal/40 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {asgn.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{asgn.course.title}</span>
                        <span>•</span>
                        <span>Max {asgn.maxMarks} pts</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-between sm:justify-end gap-2">
                      {isGraded ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          {submission.marksAwarded}/{asgn.maxMarks} pts
                        </span>
                      ) : isSubmitted ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400">
                          In Review
                        </span>
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto h-10 sm:h-9 px-4 text-xs font-semibold rounded-xl"
                        >
                          <Link href={`/student/assignments/${asgn.id}`}>Submit</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
