"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AttendanceAuditDrawer } from "@/components/teacher/attendance-audit-drawer"
import {
  UserCheck,
  Download,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Save,
} from "lucide-react"
import { toast } from "sonner"
import { type StudentAttendanceRecord, type AttendanceAuditLog } from "@/server/services/teacher-mock-data"

function TeacherAttendanceContent() {
  const searchParams = useSearchParams()
  const initialClassId = searchParams.get("classId")

  const [sessions, setSessions] = React.useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = React.useState<string>(initialClassId || "")
  const [roster, setRoster] = React.useState<StudentAttendanceRecord[]>([])
  const [analytics, setAnalytics] = React.useState<any>(null)
  const [audits, setAudits] = React.useState<AttendanceAuditLog[]>([])
  const [auditDrawerOpen, setAuditDrawerOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Load available sessions
  React.useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/teacher/attendance/sessions")
        const json = await res.json()
        setSessions(json.sessions || [])
        if (!selectedClassId && json.sessions?.length > 0) {
          setSelectedClassId(json.sessions[0].id)
        }
      } catch (err) {
        console.error("Failed to load sessions:", err)
      }
    }
    loadSessions()
  }, [])

  // Load roster when selectedClassId changes
  React.useEffect(() => {
    async function loadRoster() {
      if (!selectedClassId) return
      setLoading(true)
      try {
        const [rosterRes, auditRes] = await Promise.all([
          fetch(`/api/teacher/attendance/${selectedClassId}/roster`),
          fetch(`/api/teacher/attendance/${selectedClassId}/audit`),
        ])
        const rosterData = await rosterRes.json()
        const auditData = await auditRes.json()

        setRoster(rosterData.roster || [])
        setAnalytics(rosterData.analytics)
        setAudits(auditData.audits || [])
      } catch (err) {
        console.error("Failed to load roster:", err)
      } finally {
        setLoading(false)
      }
    }
    loadRoster()
  }, [selectedClassId])

  const handleStatusChange = (
    userId: string,
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
    reason?: string
  ) => {
    setRoster((prev) =>
      prev.map((r) =>
        r.userId === userId
          ? { ...r, status, reason: reason ?? r.reason, markedAt: new Date().toISOString() }
          : r
      )
    )
  }

  const handleBulkMark = (status: "PRESENT" | "ABSENT") => {
    setRoster((prev) =>
      prev.map((r) => ({
        ...r,
        status,
        markedAt: new Date().toISOString(),
      }))
    )
    toast.info(`Marked all students as ${status}`)
  }

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/teacher/attendance/${selectedClassId}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: roster.map((r) => ({
            userId: r.userId,
            status: r.status,
            reason: r.reason,
          })),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Attendance saved & audit entries logged!")
        // Refresh audits
        const auditRes = await fetch(`/api/teacher/attendance/${selectedClassId}/audit`)
        const auditData = await auditRes.json()
        setAudits(auditData.audits || [])
      } else {
        toast.error(data.error || "Failed to save attendance")
      }
    } catch {
      toast.error("Network error while saving attendance")
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    if (!selectedClassId) return
    window.location.href = `/api/teacher/attendance/${selectedClassId}/export`
    toast.success("Downloading formatted attendance CSV...")
  }

  const filteredRoster = roster.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  )

  const selectedSession = sessions.find((s) => s.id === selectedClassId)

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Mark live lecture attendance, maintain append-only audit history, and export rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAuditDrawerOpen(true)}
            className="gap-1.5"
          >
            <History className="w-4 h-4 text-brand-teal" />
            <span>Audit History ({audits.length})</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="shadow-teal-glow gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Attendance"}</span>
          </Button>
        </div>
      </div>

      {/* Session Selector & Analytics KPI Ribbon */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Session Dropdown */}
        <Card className="lg:col-span-1 shadow-card p-4 space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select Class Session
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-transparent px-3 text-xs font-medium focus:ring-2 focus:ring-ring"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id} className="bg-popover text-popover-foreground">
                {s.title} ({new Date(s.startsAt).toLocaleDateString([], { month: "short", day: "numeric" })})
              </option>
            ))}
          </select>
          {selectedSession && (
            <div className="text-[11px] text-muted-foreground pt-1 space-y-0.5">
              <div className="font-semibold text-foreground">{selectedSession.courseTitle}</div>
              <div>Code: {selectedSession.courseCode}</div>
            </div>
          )}
        </Card>

        {/* Analytics KPIs */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 shadow-card border-border/80 text-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Present</span>
            <div className="text-xl font-bold text-success mt-0.5">
              {roster.filter((r) => r.status === "PRESENT").length}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {Math.round((roster.filter((r) => r.status === "PRESENT").length / (roster.length || 1)) * 100)}% of roster
            </span>
          </Card>

          <Card className="p-3.5 shadow-card border-border/80 text-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Absent</span>
            <div className="text-xl font-bold text-destructive mt-0.5">
              {roster.filter((r) => r.status === "ABSENT").length}
            </div>
            <span className="text-[10px] text-muted-foreground">Requires follow-up</span>
          </Card>

          <Card className="p-3.5 shadow-card border-border/80 text-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Late</span>
            <div className="text-xl font-bold text-warning mt-0.5">
              {roster.filter((r) => r.status === "LATE").length}
            </div>
            <span className="text-[10px] text-muted-foreground">Partial attendance</span>
          </Card>

          <Card className="p-3.5 shadow-card border-border/80 text-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Excused</span>
            <div className="text-xl font-bold text-info mt-0.5">
              {roster.filter((r) => r.status === "EXCUSED").length}
            </div>
            <span className="text-[10px] text-muted-foreground">Verified leaves</span>
          </Card>
        </div>
      </div>

      {/* Bulk Toolbar & Student Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleBulkMark("PRESENT")}
            className="text-xs h-8 text-success hover:bg-success/10"
          >
            Mark All Present
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleBulkMark("ABSENT")}
            className="text-xs h-8 text-destructive hover:bg-destructive/10"
          >
            Mark All Absent
          </Button>
        </div>
      </div>

      {/* Student Roster Table */}
      <Card className="shadow-card overflow-hidden">
        <div className="divide-y divide-border/60">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading class roster...
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No students found.
            </div>
          ) : (
            filteredRoster.map((student) => (
              <div
                key={student.userId}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
              >
                {/* Student Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={student.avatarUrl} alt={student.name} />
                    <AvatarFallback className="text-xs font-bold bg-muted">
                      {student.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-foreground truncate">
                      {student.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{student.email}</div>
                  </div>
                </div>

                {/* Status Toggle Button Group */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: "PRESENT", label: "Present", activeColor: "bg-success text-white", icon: CheckCircle2 },
                    { key: "ABSENT", label: "Absent", activeColor: "bg-destructive text-white", icon: XCircle },
                    { key: "LATE", label: "Late", activeColor: "bg-warning text-white", icon: Clock },
                    { key: "EXCUSED", label: "Excused", activeColor: "bg-info text-white", icon: ShieldAlert },
                  ].map((btn) => {
                    const isSelected = student.status === btn.key
                    const Icon = btn.icon
                    return (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => handleStatusChange(student.userId, btn.key as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? `${btn.activeColor} shadow-sm`
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{btn.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Append-Only Audit Drawer */}
      <AttendanceAuditDrawer
        open={auditDrawerOpen}
        onOpenChange={setAuditDrawerOpen}
        audits={audits}
      />
    </PageTransition>
  )
}

export default function TeacherAttendancePage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
          Loading attendance workspace...
        </div>
      }
    >
      <TeacherAttendanceContent />
    </React.Suspense>
  )
}
