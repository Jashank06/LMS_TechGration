"use client"

import * as React from "react"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnalyticsCharts } from "@/components/teacher/analytics-charts"
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

export default function TeacherAnalyticsPage() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState("90D")

  React.useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/teacher/analytics")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Failed to load analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  const handleExportReport = () => {
    window.print()
    toast.success("Printing analytics report summary...")
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-20 rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-muted/30" />
      </div>
    )
  }

  const summary = data?.summary || {
    totalEnrollments: 342,
    enrollmentGrowthPct: 18.4,
    avgCompletionRate: 73.2,
    avgAttendanceRate: 92.4,
    avgGradingTurnaroundHours: 16.5,
  }

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Teacher Analytics & Performance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time visual telemetry on learner progression, attendance fidelity, and grading workload.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl border border-border bg-muted/40 text-xs">
            {["30D", "90D", "YEAR"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  timeRange === t
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "30D" ? "Last 30 Days" : t === "90D" ? "Quarter" : "Academic Year"}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleExportReport} className="gap-1.5">
            <Download className="w-4 h-4" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Enrolled Learners</span>
            <span className="text-success font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{summary.enrollmentGrowthPct}%
            </span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{summary.totalEnrollments}</div>
          <span className="text-[10px] text-muted-foreground">Across 4 active curriculums</span>
        </Card>

        <Card className="shadow-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Completion Rate</span>
            <Badge variant="outline" className="text-[10px] bg-brand-teal/10 text-brand-ink dark:text-brand-cyan border-brand-teal/30">
              Benchmark: 65%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{summary.avgCompletionRate}%</div>
          <span className="text-[10px] text-success font-medium">+8.2% above department target</span>
        </Card>

        <Card className="shadow-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Live Class Attendance</span>
            <Badge variant="outline" className="text-[10px] text-success border-success/30">
              High Fidelity
            </Badge>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{summary.avgAttendanceRate}%</div>
          <span className="text-[10px] text-muted-foreground">Average across 12 live labs</span>
        </Card>

        <Card className="shadow-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Grading Turnaround</span>
            <Clock className="w-3.5 h-3.5 text-warning" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {summary.avgGradingTurnaroundHours} <span className="text-sm font-normal text-muted-foreground">hrs</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Target: &lt; 24h per submission</span>
        </Card>
      </div>

      {/* 5 Recharts Visualizations */}
      {data?.analytics && <AnalyticsCharts analytics={data.analytics} />}
    </PageTransition>
  )
}
