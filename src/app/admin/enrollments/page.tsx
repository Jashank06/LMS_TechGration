"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface EnrollmentItem {
  id: string
  userId: string
  userName: string
  userEmail: string
  courseId: string
  courseTitle: string
  courseSlug: string
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
  progressPct: number
  enrolledAt: string
  completedAt?: string | null
}

interface StudentOption {
  id: string
  name: string
  email: string
}

interface CourseOption {
  id: string
  title: string
  slug: string
}

export default function EnrollmentManagementPage() {
  const [enrollments, setEnrollments] = React.useState<EnrollmentItem[]>([])
  const [students, setStudents] = React.useState<StudentOption[]>([])
  const [courses, setCourses] = React.useState<CourseOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  // Manual Enroll Dialog
  const [manualOpen, setManualOpen] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState("")
  const [selectedCourse, setSelectedCourse] = React.useState("")

  // Bulk Import Dialog
  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [csvText, setCsvText] = React.useState("")
  const [validationResults, setValidationResults] = React.useState<any[] | null>(null)
  const [validCount, setValidCount] = React.useState(0)
  const [bulkLoading, setBulkLoading] = React.useState(false)

  const fetchEnrollments = React.useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({ search, status: statusFilter })
      const res = await fetch(`/api/admin/enrollments?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setEnrollments(data.enrollments)
        setStudents(data.students)
        setCourses(data.courses)
      }
    } catch (err) {
      toast.error("Failed to fetch enrollments")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  React.useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !selectedCourse) {
      toast.error("Select both a student and a course")
      return
    }

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudent,
          courseId: selectedCourse,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Enrollment failed", { description: data.error })
        return
      }

      toast.success("Student enrolled successfully!")
      setManualOpen(false)
      setSelectedStudent("")
      setSelectedCourse("")
      fetchEnrollments()
    } catch (err) {
      toast.error("Network error")
    }
  }

  const handleCancelEnrollment = async (item: EnrollmentItem) => {
    if (!confirm(`Cancel enrollment for ${item.userName} in ${item.courseTitle}?`)) return

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: "ARCHIVED" }),
      })

      if (res.ok) {
        toast.info("Enrollment cancelled and archived")
        fetchEnrollments()
      }
    } catch (err) {
      toast.error("Failed to cancel enrollment")
    }
  }

  const handleValidateCSV = async () => {
    if (!csvText.trim()) {
      toast.error("Please paste CSV data or load template")
      return
    }

    try {
      setBulkLoading(true)
      // Parse CSV rows
      const lines = csvText.trim().split("\n")
      const rows = []
      const startIndex = lines[0].toLowerCase().includes("email") ? 1 : 0

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map((s) => s.trim())
        if (parts.length >= 2) {
          rows.push({ email: parts[0], courseSlug: parts[1] })
        }
      }

      if (rows.length === 0) {
        toast.error("No valid comma-separated rows found")
        setBulkLoading(false)
        return
      }

      const res = await fetch("/api/admin/enrollments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, mode: "validate" }),
      })

      const data = await res.json()
      if (res.ok) {
        setValidationResults(data.rows)
        setValidCount(data.validCount)
        toast.success(`Validated ${rows.length} rows (${data.validCount} valid)`)
      }
    } catch (err) {
      toast.error("CSV validation failed")
    } finally {
      setBulkLoading(false)
    }
  }

  const handleCommitBulk = async () => {
    try {
      setBulkLoading(true)
      const lines = csvText.trim().split("\n")
      const rows = []
      const startIndex = lines[0].toLowerCase().includes("email") ? 1 : 0

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map((s) => s.trim())
        if (parts.length >= 2) {
          rows.push({ email: parts[0], courseSlug: parts[1] })
        }
      }

      const res = await fetch("/api/admin/enrollments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, mode: "commit" }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(`Bulk import committed: ${data.importedCount} enrolled!`, {
          description: `${data.skippedCount} skipped due to validation errors.`,
        })
        setBulkOpen(false)
        setCsvText("")
        setValidationResults(null)
        fetchEnrollments()
      }
    } catch (err) {
      toast.error("Commit failed")
    } finally {
      setBulkLoading(false)
    }
  }

  const handleLoadSampleCSV = () => {
    setCsvText(
      `email,course_slug\n` +
      `priya.singh@techgration.com,generative-ai-autonomous-agents\n` +
      `rahul.mehta@techgration.com,generative-ai-autonomous-agents\n` +
      `sneha.deshmukh@techgration.com,nextjs-fullstack-mastery\n` +
      `arjun.patel@techgration.com,nextjs-fullstack-mastery`
    )
    setValidationResults(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Learner Enrollment Command
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Oversee active course admissions, execute manual student enrollments, or batch import rosters via CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setValidationResults(null)
              setBulkOpen(true)
            }}
            className="gap-2 border-border/80 hover:border-brand-teal/40"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-teal" />
            <span>Bulk CSV Import</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setManualOpen(true)}
            className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, email, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <div className="w-40">
            <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val) }}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="sm" onClick={fetchEnrollments} className="p-2.5 h-10 rounded-xl">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card className="border-border/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name & Email</TableHead>
              <TableHead>Course Enrolled</TableHead>
              <TableHead>Progress Tracking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
                    <span>Loading enrollments from MongoDB...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No active enrollments match your criteria.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-xs">{item.userName}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{item.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-xs line-clamp-1">{item.courseTitle}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.courseSlug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span>{item.progressPct}%</span>
                      </div>
                      <Progress value={item.progressPct} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.status === "ACTIVE" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                        Active
                      </Badge>
                    ) : item.status === "COMPLETED" ? (
                      <Badge className="bg-brand-teal/15 text-brand-cyan border border-brand-teal/30 text-[10px]">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Archived
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.enrolledAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status === "ACTIVE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelEnrollment(item)}
                        className="text-xs text-destructive hover:bg-destructive/10 h-8"
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Manual Enroll Dialog */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Enroll Student into Course</DialogTitle>
            <DialogDescription>Assign a learner immediately to any published course curriculum.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleManualEnroll} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Student</Label>
              <Select value={selectedStudent} onValueChange={(val) => { if (val) setSelectedStudent(val) }}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a registered student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Select Course</Label>
              <Select value={selectedCourse} onValueChange={(val) => { if (val) setSelectedCourse(val) }}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose target course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setManualOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl">
                Confirm Enrollment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk CSV Import Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bulk CSV Enrollment Importer</DialogTitle>
            <DialogDescription>
              Validate and enroll students in batches using comma-separated values (email, course_slug).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">CSV Content (email, course_slug)</span>
              <Button variant="ghost" size="sm" onClick={handleLoadSampleCSV} className="text-xs text-brand-teal gap-1.5 h-7">
                <Upload className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </Button>
            </div>

            <Textarea
              rows={5}
              placeholder="email,course_slug&#10;student@domain.com,nextjs-fullstack-mastery"
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value)
                setValidationResults(null)
              }}
              className="font-mono text-xs rounded-xl"
            />

            {/* Validation Table */}
            {validationResults && (
              <div className="space-y-2 border rounded-xl p-3 bg-muted/30 max-h-56 overflow-y-auto">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Pre-import Validation Results</span>
                  <Badge className="bg-brand-teal/20 text-brand-cyan">
                    {validCount} of {validationResults.length} ready to enroll
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-2">
                  {validationResults.map((row) => (
                    <div
                      key={row.row}
                      className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                        row.status === "VALID" ? "bg-emerald-500/10 text-foreground" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {row.status === "VALID" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive shrink-0" />
                        )}
                        <span className="font-mono">{row.email}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono">{row.courseSlug}</span>
                      </div>
                      <span className="text-[11px] font-medium">
                        {row.status === "VALID" ? "Ready" : row.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)} className="rounded-xl">
                Close
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={bulkLoading || !csvText.trim()}
                onClick={handleValidateCSV}
                className="rounded-xl"
              >
                Validate Rows
              </Button>
              <Button
                type="button"
                disabled={bulkLoading || !validationResults || validCount === 0}
                onClick={handleCommitBulk}
                className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl"
              >
                Commit {validCount} Enrollments
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
