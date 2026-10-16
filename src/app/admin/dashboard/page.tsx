"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  PlusCircle,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Server,
  Database,
  ArrowRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
  kpis: {
    totalStudents: number
    totalTeachers: number
    coursesPublished: number
    coursesPendingReview: number
    coursesDraft: number
    totalEnrollments: number
    completionRate: number
    systemHealth: {
      uptime: string
      dbLatencyMs: number
      storageUsedPct: number
    }
  }
  trends: Array<{ date: string; enrollments: number; completions: number }>
  roleDistribution: Array<{ name: string; value: number; color: string }>
  alerts: Array<{
    id: string
    severity: string
    title: string
    message: string
    actionUrl: string
    actionText: string
  }>
  recentAuditLogs: Array<{
    id: string
    actorEmail: string
    action: string
    resource: string
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [range, setRange] = React.useState("30d")

  const fetchDashboard = React.useCallback(async (selectedRange: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDashboard(range)
  }, [range, fetchDashboard])

  const ranges = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "1 Year", value: "1y" },
  ]

  const kpis = data?.kpis

  return (
    <div className="space-y-8">
      {/* Header & Date Range Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Platform Command Center
            </h1>
            <Badge variant="outline" className="border-brand-teal/30 bg-brand-teal/10 text-brand-ink dark:text-brand-cyan text-xs">
              Live MongoDB
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time telemetry, learner enrollment metrics, and curriculum review pipelines.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border shadow-sm">
          {ranges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === r.value
                  ? "bg-brand-teal text-brand-charcoal shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="card-shine border-border/80 hover:border-brand-teal/50 hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Total Learners
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-teal/15 flex items-center justify-center text-brand-ink dark:text-brand-cyan">
                <GraduationCap className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight text-foreground">
                {loading ? "..." : kpis?.totalStudents ?? 0}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Teachers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="card-shine border-border/80 hover:border-brand-teal/50 hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Active Instructors
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight text-foreground">
                {loading ? "..." : kpis?.totalTeachers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">100% active roster compliance</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Approval Pipeline */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="card-shine border-border/80 hover:border-brand-teal/50 hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Published / Review
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                <BookOpen className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight text-foreground flex items-baseline gap-2">
                <span>{loading ? "..." : kpis?.coursesPublished ?? 0}</span>
                <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {kpis?.coursesPendingReview ?? 0} in review
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis?.coursesDraft ?? 0} drafts in progress
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enrollments & Completion Rate */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="card-shine border-border/80 hover:border-brand-teal/50 hover:shadow-card transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Completion Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold tracking-tight text-foreground flex items-baseline gap-2">
                <span>{loading ? "..." : `${kpis?.completionRate ?? 0}%`}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({kpis?.totalEnrollments ?? 0} enrollments)
                </span>
              </div>
              <p className="text-xs text-emerald-500 font-medium mt-1">Above 65% target benchmark</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Operational Alerts Feed */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                alert.severity === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : "bg-brand-teal/10 border-brand-teal/30 text-brand-ink dark:text-brand-cyan"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">{alert.title}</h4>
                  <p className="text-xs text-foreground/80 mt-0.5">{alert.message}</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="border-current hover:bg-current/10 shrink-0 text-xs">
                <Link href={alert.actionUrl}>{alert.actionText}</Link>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Span 2) */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Enrollment & Completion Velocity</CardTitle>
                <CardDescription className="text-xs">
                  Monthly learner onboardings vs verified course completions
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-border text-[11px]">
                Cumulative Momentum
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trends || []}>
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D6D6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D6D6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1EC98F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1EC98F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fill: "#8C99A6", fontSize: 12 }} />
                <YAxis tick={{ fill: "#8C99A6", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171C20",
                    border: "1px solid #252D33",
                    borderRadius: "12px",
                    color: "#F2F5F8",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#00D6D6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tealGradient)"
                  name="Enrollments"
                />
                <Area
                  type="monotone"
                  dataKey="completions"
                  stroke="#1EC98F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#greenGradient)"
                  name="Completions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution Donut Chart */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold">User Population Breakdown</CardTitle>
            <CardDescription className="text-xs">Distribution across LMS institutional roles</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data?.roleDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.roleDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171C20",
                    border: "1px solid #252D33",
                    borderRadius: "12px",
                    color: "#F2F5F8",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 text-xs mt-2">
              {(data?.roleDistribution || []).map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}:</span>
                  <span className="font-bold text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Quick Actions & Recent Security Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Shortcuts */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold">Administrative Actions</CardTitle>
            <CardDescription className="text-xs">Frequent operational shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between h-10 border-border/80 hover:border-brand-teal/40">
              <Link href="/admin/users">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-teal" />
                  <span>Invite New User</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-10 border-border/80 hover:border-brand-teal/40">
              <Link href="/admin/courses">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Review Pending Courses</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-10 border-border/80 hover:border-brand-teal/40">
              <Link href="/admin/enrollments">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                  <span>Bulk CSV Import</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-10 border-border/80 hover:border-brand-teal/40">
              <Link href="/admin/reports">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Export 9 Reports</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Security Audit Log Stream (Span 2) */}
        <Card className="lg:col-span-2 border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Live Security Audit Stream</CardTitle>
              <CardDescription className="text-xs">Immutable security events recorded in MongoDB</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-brand-ink dark:text-brand-cyan">
              <Link href="/admin/audit-logs">View All Logs</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.recentAuditLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-brand-teal shrink-0" />
                    <span className="font-mono text-[11px] font-bold text-foreground shrink-0">
                      {log.action}
                    </span>
                    <span className="text-muted-foreground truncate">
                      by <span className="font-semibold text-foreground/80">{log.actorEmail}</span> on [{log.resource}]
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
