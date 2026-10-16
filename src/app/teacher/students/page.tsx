"use client"

import * as React from "react"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StudentProfileDrawer } from "@/components/teacher/student-profile-drawer"
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Send,
} from "lucide-react"
import { type EnrolledStudentItem } from "@/server/services/teacher-mock-data"

export default function TeacherStudentsPage() {
  const [students, setStudents] = React.useState<EnrolledStudentItem[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [healthFilter, setHealthFilter] = React.useState("ALL")
  const [selectedStudent, setSelectedStudent] = React.useState<EnrolledStudentItem | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("/api/teacher/students")
        const json = await res.json()
        setStudents(json.students || [])
        setStats(json.stats)
      } catch (err) {
        console.error("Failed to load students:", err)
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchesHealth = healthFilter === "ALL" || s.academicHealth === healthFilter
    return matchesSearch && matchesHealth
  })

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Management & Support</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Track enrolled student progress, monitor factual academic indicators, and proactively intervene.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 shadow-card text-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Total Learners</span>
          <div className="text-2xl font-bold text-foreground mt-0.5">{stats?.total || students.length}</div>
          <span className="text-[10px] text-muted-foreground">Active enrollments</span>
        </Card>

        <Card className="p-4 shadow-card text-center border-success/30 bg-success/5">
          <span className="text-[10px] font-semibold text-success uppercase">Good Standing</span>
          <div className="text-2xl font-bold text-success mt-0.5">
            {stats?.healthy || students.filter((s) => s.academicHealth === "HEALTHY").length}
          </div>
          <span className="text-[10px] text-muted-foreground">On-track learners</span>
        </Card>

        <Card className="p-4 shadow-card text-center border-warning/30 bg-warning/5">
          <span className="text-[10px] font-semibold text-warning uppercase">Support Needed</span>
          <div className="text-2xl font-bold text-warning mt-0.5">
            {stats?.needsSupport || students.filter((s) => s.academicHealth === "NEEDS_SUPPORT").length}
          </div>
          <span className="text-[10px] text-muted-foreground">Minor academic delays</span>
        </Card>

        <Card className="p-4 shadow-card text-center border-destructive/30 bg-destructive/5">
          <span className="text-[10px] font-semibold text-destructive uppercase">At Risk</span>
          <div className="text-2xl font-bold text-destructive mt-0.5">
            {stats?.atRisk || students.filter((s) => s.academicHealth === "AT_RISK").length}
          </div>
          <span className="text-[10px] text-muted-foreground">Intervention priority</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by full name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All Students" },
            { key: "HEALTHY", label: "Good Standing" },
            { key: "NEEDS_SUPPORT", label: "Needs Support" },
            { key: "AT_RISK", label: "At Risk (Inactive)" },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setHealthFilter(st.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                healthFilter === st.key
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student Roster Table */}
      <Card className="shadow-card overflow-hidden">
        <div className="divide-y divide-border/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading enrolled learners...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-8 h-8 text-muted-foreground mx-auto opacity-70" />
              <p className="text-sm font-semibold text-foreground">No students enrolled yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Once learners enroll in your published courses, their real attendance and progress will be tracked here.
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isAtRisk = student.academicHealth === "AT_RISK"
              const needsSupport = student.academicHealth === "NEEDS_SUPPORT"

              return (
                <div
                  key={student.id}
                  className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/30 transition-colors ${
                    isAtRisk ? "bg-destructive/5" : ""
                  }`}
                >
                  {/* Student Identity */}
                  <div className="flex items-center gap-3 min-w-0 lg:w-72">
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={student.avatarUrl} alt={student.name} />
                      <AvatarFallback className="text-xs font-bold bg-muted">
                        {student.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">{student.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{student.email}</div>
                    </div>
                  </div>

                  {/* Progress & Attendance */}
                  <div className="grid grid-cols-2 gap-4 lg:w-64 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{student.overallProgressPct}%</span>
                      </div>
                      <Progress value={student.overallProgressPct} className="h-1.5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-bold text-foreground">{student.attendancePct}%</span>
                      </div>
                      <Progress value={student.attendancePct} className="h-1.5" />
                    </div>
                  </div>

                  {/* Factual Academic Support Indicators */}
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {student.supportFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          flag.includes("Inactive") || flag.includes("Risk")
                            ? "bg-destructive/10 text-destructive border-destructive/25 font-semibold"
                            : flag.includes("Late") || flag.includes("Leave")
                            ? "bg-warning/10 text-warning border-warning/25"
                            : "bg-success/10 text-success border-success/25"
                        }`}
                      >
                        {flag.includes("Inactive") && <AlertTriangle className="w-2.5 h-2.5" />}
                        <span>{flag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStudent(student)
                        setDrawerOpen(true)
                      }}
                      className="gap-1.5"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      {/* Student Profile Drawer */}
      <StudentProfileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        student={selectedStudent}
      />
    </PageTransition>
  )
}
