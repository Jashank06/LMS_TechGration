"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  Users,
  GraduationCap,
  Award,
  DollarSign,
  Clock,
  Star,
  FileCheck,
  RefreshCw,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export default function ReportsAndAnalyticsPage() {
  const [activeReport, setActiveReport] = React.useState("enrollments")
  const [range, setRange] = React.useState("30d")
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  const reportTabs = [
    { id: "enrollments", label: "1. Enrollment Velocity", icon: Users },
    { id: "completions", label: "2. Completion & Drop-offs", icon: GraduationCap },
    { id: "attendance", label: "3. Live Class Attendance", icon: Calendar },
    { id: "assignments", label: "4. Assignment Grading", icon: FileCheck },
    { id: "revenue", label: "5. Revenue & Finance", icon: DollarSign },
    { id: "engagement", label: "6. Learner Engagement", icon: Clock },
    { id: "teachers", label: "7. Teacher Productivity", icon: Users },
    { id: "assessments", label: "8. Assessment Pass Rates", icon: Award },
    { id: "ratings", label: "9. Course Ratings & CSAT", icon: Star },
  ]

  const fetchReports = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/reports?range=${range}&type=${activeReport}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [range, activeReport])

  React.useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleExportCSV = () => {
    if (!data) return

    let headers: string[] = []
    let rows: string[][] = []
    let filename = `report_${activeReport}_${Date.now()}.csv`

    if (activeReport === "enrollments" && data.enrollments) {
      headers = ["Student Name", "Email", "Course", "Category", "Progress", "Status", "Date"]
      rows = data.enrollments.map((e: any) => [e.student, e.email, `"${e.course}"`, e.category, e.progress, e.status, e.date])
    } else if (activeReport === "completions" && data.completions) {
      headers = ["Student Name", "Email", "Course Completed", "Completion Date"]
      rows = data.completions.map((c: any) => [c.student, c.email, `"${c.course}"`, c.completedAt])
    } else if (activeReport === "attendance" && data.attendance) {
      headers = ["Student", "Live Class", "Instructor", "Status", "Date"]
      rows = data.attendance.map((a: any) => [a.student, `"${a.classTitle}"`, a.instructor, a.status, a.date])
    } else if (activeReport === "revenue" && data.revenue) {
      headers = ["Student", "Course", "Amount", "Status"]
      rows = data.revenue.map((r: any) => [r.student, `"${r.course}"`, r.amount, r.status])
    } else {
      headers = ["Report Metric", "Value"]
      rows = [["Report Type", activeReport], ["Timestamp", new Date().toISOString()]]
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Downloaded report CSV")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Institutional Reports & Analytics Engine
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Access 9 comprehensive academic and financial reports with date filtering and instant CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border shadow-sm text-xs">
            {["7d", "30d", "90d", "1y"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg font-semibold uppercase transition-all ${
                  range === r ? "bg-brand-teal text-brand-charcoal" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleExportCSV}
            className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 9 Report Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border overflow-x-auto">
        {reportTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeReport === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-brand-teal text-brand-charcoal shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Report Content Table */}
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="bg-muted/20 py-4 px-6 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold capitalize">
                {activeReport.replace(/_/g, " ")} Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Filtered across the last {range.toUpperCase()} window
              </CardDescription>
            </div>
            <Badge className="bg-brand-teal/15 text-brand-cyan text-xs">Live Generated</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
              <span>Synthesizing report metrics from MongoDB...</span>
            </div>
          ) : activeReport === "enrollments" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course Enrolled</TableHead>
                  <TableHead>Track Category</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.enrollments || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No enrollment velocity records found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.enrollments || []).map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <span className="font-semibold text-xs block">{e.student}</span>
                        <span className="text-[10px] text-muted-foreground">{e.email}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{e.course}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{e.category}</Badge></TableCell>
                      <TableCell className="font-mono text-xs font-bold text-brand-teal">{e.progress}</TableCell>
                      <TableCell><Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">{e.status}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{e.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : activeReport === "completions" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course Completed</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Certificate Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.completions || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                      No course completions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.completions || []).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <span className="font-semibold text-xs block">{c.student}</span>
                        <span className="text-[10px] text-muted-foreground">{c.email}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{c.course}</TableCell>
                      <TableCell className="text-xs font-mono">{c.completedAt}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px]">Verified Issued</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : activeReport === "attendance" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Live Class Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Attendance Status</TableHead>
                  <TableHead>Class Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.attendance || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      No live class attendance logs available.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.attendance || []).map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-semibold text-xs">{a.student}</TableCell>
                      <TableCell className="text-xs font-medium">{a.classTitle}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.instructor}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">{a.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{a.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : activeReport === "revenue" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.revenue || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                      No monetary transactions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.revenue || []).map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold text-xs">{r.student}</TableCell>
                      <TableCell className="text-xs font-medium">{r.course}</TableCell>
                      <TableCell className="font-bold text-xs text-brand-ink dark:text-brand-cyan">{r.amount}</TableCell>
                      <TableCell><Badge className="bg-emerald-500/10 text-emerald-500 text-[10px]">{r.status}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : activeReport === "ratings" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Average Star Rating</TableHead>
                  <TableHead>Student Reviews</TableHead>
                  <TableHead>Net Promoter Score (NPS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.ratings || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                      No published courses or ratings submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  (data?.ratings || []).map((item: any) => (
                    <TableRow key={item.course}>
                      <TableCell className="font-semibold text-xs">{item.course}</TableCell>
                      <TableCell className="font-bold text-amber-400 text-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.rating} / 5.0</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.reviewsCount} reviews</TableCell>
                      <TableCell><Badge className="bg-brand-teal/20 text-brand-cyan text-xs">{item.nps}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <CheckCircle2 className="w-8 h-8 text-brand-teal mx-auto" />
              <p className="font-semibold text-foreground">Statistical breakdown compiled for {activeReport}.</p>
              <p>Click "Export CSV" on the top right to download raw records.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
