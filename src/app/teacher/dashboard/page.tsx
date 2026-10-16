"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  Video,
  CheckSquare,
  Clock,
  ArrowRight,
  Plus,
  Calendar,
  ExternalLink,
  Sparkles,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  FileCheck2,
  CheckCircle2,
} from "lucide-react"

export default function TeacherDashboardPage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/teacher/dashboard")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Failed to load dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted/40" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-muted/30" />
      </div>
    )
  }

  const stats = data?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    upcomingClasses: 0,
    pendingGrading: 0,
    weeklyHours: 0,
    avgAttendanceRate: 0,
  }

  const schedule = data?.schedule || []
  const urgentSubmissions = data?.urgentSubmissions || []
  const teacherName = data?.profile?.name || "Instructor"
  const teacherHeadline = data?.profile?.headline || "Faculty Instructor"

  return (
    <PageTransition className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-teal/20 bg-gradient-teal-glow p-6 sm:p-8 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Faculty Console • {teacherHeadline}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome, {teacherName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              You have <span className="font-semibold text-foreground">{stats.upcomingClasses} live classes</span> scheduled this week and{" "}
              <span className="font-semibold text-warning">{stats.pendingGrading} pending submissions</span> ready for evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="sm" className="shadow-teal-glow gap-1.5">
              <Link href="/teacher/courses/new">
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/teacher/live-classes">
                <Video className="w-4 h-4 text-brand-cyan" />
                <span>Schedule Session</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Primary KPI Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned Courses */}
        <Card className="shadow-card hover:shadow-hover transition-all border-border/80">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Assigned Courses
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-ink dark:text-brand-cyan">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.totalCourses}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="text-success font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +1
              </span>
              <span>active this quarter</span>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Students */}
        <Card className="shadow-card hover:shadow-hover transition-all border-border/80">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Enrolled Students
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.totalStudents}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="text-success font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
              </span>
              <span>learner growth</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Live Classes */}
        <Card className="shadow-card hover:shadow-hover transition-all border-border/80">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Upcoming Classes
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-ink dark:text-brand-cyan">
              <Video className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground">{stats.upcomingClasses}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Badge variant="outline" className="h-4 px-1 text-[10px] bg-brand-teal/10 text-brand-ink dark:text-brand-cyan border-brand-teal/30">
                Next: Today 4:30 PM
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Grading Counter */}
        <Card className="shadow-card hover:shadow-hover transition-all border-warning/30 bg-warning/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-warning uppercase tracking-wider">
              Pending Grading
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-warning/20 flex items-center justify-center text-warning">
              <CheckSquare className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-warning">{stats.pendingGrading}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="text-destructive font-semibold">6 urgent</span>
              <span>due within 24h</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Grid: Weekly Schedule + Urgent Grading Queue */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Teaching Schedule Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
              <h2 className="text-lg font-bold tracking-tight">Teaching Schedule & Upcoming Sessions</h2>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher/live-classes">View All Calendar</Link>
            </Button>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-0 divide-y divide-border/60">
              {schedule.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 mx-auto flex items-center justify-center text-muted-foreground">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">No upcoming live classes</p>
                    <p className="text-xs text-muted-foreground">Schedule your first interactive lecture or office hours.</p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <Link href="/teacher/live-classes">Schedule Class</Link>
                  </Button>
                </div>
              ) : (
                schedule.map((item: any) => {
                const isToday = new Date(item.startsAt).toDateString() === new Date().toDateString()
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            isToday
                              ? "bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border-brand-teal/40 font-semibold"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {isToday ? "Today" : new Date(item.startsAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {new Date(item.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                          {new Date(item.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs text-muted-foreground">• {item.platform}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.courseTitle}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button asChild size="sm" className="gap-1.5">
                        <a href={item.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Launch Session</span>
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/teacher/attendance?classId=${item.id}`}>Roster</Link>
                      </Button>
                    </div>
                  </div>
                )
              }))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Urgent Grading Workspace Widget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-bold tracking-tight">Grading Priority Queue</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/teacher/assignments">Full Queue</Link>
            </Button>
          </div>

          <Card className="shadow-card border-warning/20">
            <CardHeader className="pb-3 bg-muted/20">
              <CardTitle className="text-sm">Submissions Awaiting Evaluation</CardTitle>
              <CardDescription className="text-xs">
                Students receive instant alerts upon grade publishing.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border/60">
              {urgentSubmissions.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-brand-teal mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-foreground">All caught up!</p>
                  <p className="text-[11px] text-muted-foreground">No submissions awaiting evaluation.</p>
                </div>
              ) : (
                urgentSubmissions.map((sub: any) => (
                <div key={sub.id} className="p-3.5 hover:bg-muted/40 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate">{sub.studentName}</span>
                    <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                      Pending Review
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{sub.assignmentTitle}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground font-mono">Max: {sub.maxMarks} pts</span>
                    <Button asChild size="xs" variant="outline" className="gap-1 text-xs">
                      <Link href={`/teacher/assignments/${sub.assignmentId}/grade?submissionId=${sub.id}`}>
                        <span>Grade Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )))}
            </CardContent>
            <CardFooter className="p-3 bg-muted/10 border-t border-border">
              <Button asChild size="sm" variant="default" className="w-full">
                <Link href="/teacher/assignments">Open Split-Screen Workspace</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Quick Actions & Recent Activity Strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions Panel */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Teaching Command Shortcuts</CardTitle>
            <CardDescription className="text-xs">Frequent instructor tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link
              href="/teacher/courses/new"
              className="p-3.5 rounded-xl border border-border bg-card hover:border-brand-teal/50 hover:bg-muted/40 transition-all flex flex-col gap-1.5 group"
            >
              <BookOpen className="w-4 h-4 text-brand-teal group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">Course Builder</span>
              <span className="text-[10px] text-muted-foreground">New curriculum wizard</span>
            </Link>

            <Link
              href="/teacher/live-classes"
              className="p-3.5 rounded-xl border border-border bg-card hover:border-brand-cyan/50 hover:bg-muted/40 transition-all flex flex-col gap-1.5 group"
            >
              <Video className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">Schedule Class</span>
              <span className="text-[10px] text-muted-foreground">With clash detection</span>
            </Link>

            <Link
              href="/teacher/attendance"
              className="p-3.5 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:bg-muted/40 transition-all flex flex-col gap-1.5 group"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">Take Attendance</span>
              <span className="text-[10px] text-muted-foreground">Audit logs & CSV export</span>
            </Link>

            <Link
              href="/teacher/analytics"
              className="p-3.5 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:bg-muted/40 transition-all flex flex-col gap-1.5 group"
            >
              <TrendingUp className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">View Analytics</span>
              <span className="text-[10px] text-muted-foreground">Recharts performance</span>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity & Audit</CardTitle>
            <CardDescription className="text-xs">Live stream of student interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data?.recentActivity || []).map((act: any) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-teal mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{act.title}</div>
                  <div className="text-[11px] text-muted-foreground">{act.course} • {act.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </PageTransition>
  )
}
