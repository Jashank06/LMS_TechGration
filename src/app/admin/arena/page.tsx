"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Code,
  Plus,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  Flame,
  Zap,
  BookOpen,
  Check,
  FileCode,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface TestCaseItem {
  input: string
  expectedOutput: string
  isSample: boolean
  explanation?: string
}

interface AdminProblem {
  id: string
  slug: string
  title: string
  statement: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  topics: string[]
  hints: string[]
  editorial?: string | null
  timeLimitMs: number
  memoryLimitKb: number
  starterCode: Record<string, string>
  solutionCode?: string | null
  xpReward: number
  position: number
  isPublished: boolean
  isDailyChallenge: boolean
  submissionCount: number
  acceptedCount: number
  createdAt: string
  _count?: {
    testCases: number
    submissions: number
  }
}

export default function AdminCodingArenaPage() {
  const [problems, setProblems] = React.useState<AdminProblem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("ALL")
  const [publishedFilter, setPublishedFilter] = React.useState<string>("ALL")

  // Modal / Form state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Fields
  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [difficulty, setDifficulty] = React.useState<"EASY" | "MEDIUM" | "HARD">("EASY")
  const [position, setPosition] = React.useState<number>(0)
  const [xpReward, setXpReward] = React.useState<number>(10)
  const [topicsStr, setTopicsStr] = React.useState("")
  const [statement, setStatement] = React.useState("")
  const [hintsStr, setHintsStr] = React.useState("")
  const [editorial, setEditorial] = React.useState("")
  const [isPublished, setIsPublished] = React.useState(true)
  const [isDailyChallenge, setIsDailyChallenge] = React.useState(false)

  // Code
  const [pyCode, setPyCode] = React.useState("")
  const [jsCode, setJsCode] = React.useState("")
  const [javaCode, setJavaCode] = React.useState("")
  const [cppCode, setCppCode] = React.useState("")

  // Test cases
  const [testCases, setTestCases] = React.useState<TestCaseItem[]>([
    { input: "", expectedOutput: "", isSample: true, explanation: "" },
  ])

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  const fetchProblems = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/arena/problems?search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setProblems(data.problems || [])
      } else {
        toast.error("Failed to load arena problems")
      }
    } catch {
      toast.error("Network error while loading problems")
    } finally {
      setLoading(false)
    }
  }, [search])

  React.useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  const openCreateDialog = () => {
    setEditingId(null)
    setTitle("")
    setSlug("")
    setDifficulty("EASY")
    setPosition(problems.length + 1)
    setXpReward(10)
    setTopicsStr("basics")
    setStatement("# Problem Statement\n\nWrite your problem statement here...")
    setHintsStr("")
    setEditorial("")
    setIsPublished(true)
    setIsDailyChallenge(false)
    setPyCode("# Write Python starter code\nprint('Hello World')")
    setJsCode("// Write JavaScript starter code\nconsole.log('Hello World');")
    setJavaCode("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}")
    setCppCode("#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\" << endl;\n    return 0;\n}")
    setTestCases([
      { input: "", expectedOutput: "Hello World", isSample: true, explanation: "Sample output" },
    ])
    setDialogOpen(true)
  }

  const openEditDialog = (p: AdminProblem) => {
    setEditingId(p.id)
    setTitle(p.title)
    setSlug(p.slug)
    setDifficulty(p.difficulty)
    setPosition(p.position)
    setXpReward(p.xpReward)
    setTopicsStr(p.topics.join(", "))
    setStatement(p.statement)
    setHintsStr(p.hints.join("\n"))
    setEditorial(p.editorial || "")
    setIsPublished(p.isPublished)
    setIsDailyChallenge(p.isDailyChallenge)

    const sc = p.starterCode || {}
    setPyCode(sc.python || "")
    setJsCode(sc.javascript || "")
    setJavaCode(sc.java || "")
    setCppCode(sc.cpp || "")

    setTestCases([
      { input: "", expectedOutput: "", isSample: true, explanation: "" },
    ])
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required")
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        title: title.trim(),
        slug: slug.trim(),
        difficulty,
        position: Number(position) || 0,
        xpReward: Number(xpReward) || 10,
        topics: topicsStr
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        statement,
        hints: hintsStr
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        editorial: editorial.trim() || null,
        isPublished,
        isDailyChallenge,
        starterCode: {
          python: pyCode,
          javascript: jsCode,
          java: javaCode,
          cpp: cppCode,
        },
      }

      // If user added test cases with expected outputs
      const validCases = testCases.filter((tc) => tc.expectedOutput.trim())
      if (validCases.length > 0) {
        payload.testCases = validCases
      }

      if (editingId) {
        payload.id = editingId
        const res = await fetch("/api/admin/arena/problems", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          toast.success("Problem updated successfully")
          setDialogOpen(false)
          fetchProblems()
        } else {
          const err = await res.json()
          toast.error(err.error || "Failed to update problem")
        }
      } else {
        const res = await fetch("/api/admin/arena/problems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          toast.success("Problem created successfully")
          setDialogOpen(false)
          fetchProblems()
        } else {
          const err = await res.json()
          toast.error(err.error || "Failed to create problem")
        }
      }
    } catch {
      toast.error("Failed to save problem")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (p: AdminProblem) => {
    try {
      const res = await fetch("/api/admin/arena/problems", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          isPublished: !p.isPublished,
        }),
      })
      if (res.ok) {
        toast.success(`Problem marked as ${!p.isPublished ? "Published" : "Draft"}`)
        setProblems((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, isPublished: !item.isPublished } : item))
        )
      } else {
        toast.error("Failed to toggle publish status")
      }
    } catch {
      toast.error("Error updating status")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/arena/problems?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Problem deleted")
        setDeleteConfirmId(null)
        setProblems((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error("Failed to delete problem")
      }
    } catch {
      toast.error("Error deleting problem")
    }
  }

  // Filtered list
  const filteredProblems = problems.filter((p) => {
    if (difficultyFilter !== "ALL" && p.difficulty !== difficultyFilter) return false
    if (publishedFilter === "PUBLISHED" && !p.isPublished) return false
    if (publishedFilter === "DRAFT" && p.isPublished) return false
    return true
  })

  const stats = {
    total: problems.length,
    published: problems.filter((p) => p.isPublished).length,
    easy: problems.filter((p) => p.difficulty === "EASY").length,
    medium: problems.filter((p) => p.difficulty === "MEDIUM").length,
    hard: problems.filter((p) => p.difficulty === "HARD").length,
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code className="w-6 h-6 text-brand-teal" />
            Coding Arena Governance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage practice coding problems, test cases, and difficulty tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProblems} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button onClick={openCreateDialog} size="sm" className="gap-1.5 bg-brand-teal hover:bg-brand-teal/90 text-white">
            <Plus className="w-4 h-4" />
            <span>New Problem</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4 border-border/80 bg-card/80">
          <p className="text-xs text-muted-foreground font-medium">Total Questions</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 border-border/80 bg-card/80">
          <p className="text-xs text-muted-foreground font-medium">Published</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.published}</p>
        </Card>
        <Card className="p-4 border-border/80 bg-card/80">
          <p className="text-xs text-muted-foreground font-medium">Easy (10 XP)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.easy}</p>
        </Card>
        <Card className="p-4 border-border/80 bg-card/80">
          <p className="text-xs text-muted-foreground font-medium">Medium (25 XP)</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{stats.medium}</p>
        </Card>
        <Card className="p-4 border-border/80 bg-card/80">
          <p className="text-xs text-muted-foreground font-medium">Hard (50 XP)</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">{stats.hard}</p>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 border-border/80">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex gap-2">
            <Select value={difficultyFilter} onValueChange={(val) => setDifficultyFilter(val || "ALL")}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={publishedFilter} onValueChange={(val) => setPublishedFilter(val || "ALL")}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Problem Listing Table */}
      <Card className="border-border/80 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-teal" />
            <p className="text-sm">Loading arena questions...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="py-20 text-center">
            <Code className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-semibold text-foreground">No questions found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {search || difficultyFilter !== "ALL" || publishedFilter !== "ALL"
                ? "Try clearing filters to see existing questions."
                : "Get started by seeding or adding your first coding question."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4">Problem</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-24">XP</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 w-28">Submissions</th>
                  <th className="py-3 px-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProblems.map((p) => {
                  const diffColors = {
                    EASY: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
                    MEDIUM: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
                    HARD: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
                  }

                  return (
                    <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{p.position}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{p.title}</span>
                          {p.isDailyChallenge && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                              Daily
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 font-mono">
                          <span>/{p.slug}</span>
                          <span>•</span>
                          <span>{p._count?.testCases ?? 0} tests</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-xs ${diffColors[p.difficulty]}`}>
                          {p.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-500 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {p.xpReward}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            p.isPublished
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                          }`}
                        >
                          {p.isPublished ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{p.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {p.submissionCount} total ({p.acceptedCount} AC)
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditDialog(p)}
                            title="Edit Problem"
                          >
                            <Edit3 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Problem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Coding Problem" : "Create Coding Problem"}</DialogTitle>
            <DialogDescription>
              Configure the problem statement, supported starter code templates, and test cases.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title">Problem Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Reverse an Array"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!editingId && !slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")
                      )
                    }
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL identifier) *</Label>
                <Input
                  id="slug"
                  placeholder="e.g. reverse-an-array"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(v: any) => { if (v) setDifficulty(v) }}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="position">Path Order (1..100)</Label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="xpReward">XP Award</Label>
                <Input
                  id="xpReward"
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="topics">Topics (comma-separated)</Label>
                <Input
                  id="topics"
                  placeholder="arrays, two-pointers"
                  value={topicsStr}
                  onChange={(e) => setTopicsStr(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 py-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-border text-brand-teal focus:ring-brand-teal"
                />
                <span className="font-medium text-foreground">Published (visible to students)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={isDailyChallenge}
                  onChange={(e) => setIsDailyChallenge(e.target.checked)}
                  className="rounded border-border text-brand-teal focus:ring-brand-teal"
                />
                <span className="font-medium text-foreground">Featured as Daily Challenge</span>
              </label>
            </div>

            <div>
              <Label htmlFor="statement">Problem Statement (Markdown supported)</Label>
              <Textarea
                id="statement"
                rows={6}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Describe the task, constraints, input and output formats..."
                className="font-mono text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="hints">Hints (one per line)</Label>
              <Textarea
                id="hints"
                rows={2}
                value={hintsStr}
                onChange={(e) => setHintsStr(e.target.value)}
                placeholder="Hint 1&#10;Hint 2"
                className="text-xs"
              />
            </div>

            {/* Starter Code Tabs */}
            <div className="space-y-1.5">
              <Label>Starter Code Templates</Label>
              <Tabs defaultValue="python" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="python">Python 3</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="java">Java</TabsTrigger>
                  <TabsTrigger value="cpp">C++ 17</TabsTrigger>
                </TabsList>
                <TabsContent value="python">
                  <Textarea
                    rows={5}
                    value={pyCode}
                    onChange={(e) => setPyCode(e.target.value)}
                    className="font-mono text-xs bg-[#1e1e1e] text-white"
                  />
                </TabsContent>
                <TabsContent value="javascript">
                  <Textarea
                    rows={5}
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="font-mono text-xs bg-[#1e1e1e] text-white"
                  />
                </TabsContent>
                <TabsContent value="java">
                  <Textarea
                    rows={5}
                    value={javaCode}
                    onChange={(e) => setJavaCode(e.target.value)}
                    className="font-mono text-xs bg-[#1e1e1e] text-white"
                  />
                </TabsContent>
                <TabsContent value="cpp">
                  <Textarea
                    rows={5}
                    value={cppCode}
                    onChange={(e) => setCppCode(e.target.value)}
                    className="font-mono text-xs bg-[#1e1e1e] text-white"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Test Cases */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Test Cases</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTestCases([
                      ...testCases,
                      { input: "", expectedOutput: "", isSample: false, explanation: "" },
                    ])
                  }
                  className="h-7 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Case
                </Button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Test Case #{idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.isSample}
                            onChange={(e) => {
                              const copy = [...testCases]
                              copy[idx].isSample = e.target.checked
                              setTestCases(copy)
                            }}
                          />
                          <span>Sample (visible to student)</span>
                        </label>
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Stdin input"
                        value={tc.input}
                        onChange={(e) => {
                          const copy = [...testCases]
                          copy[idx].input = e.target.value
                          setTestCases(copy)
                        }}
                        className="font-mono text-xs h-8"
                      />
                      <Input
                        placeholder="Expected stdout output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const copy = [...testCases]
                          copy[idx].expectedOutput = e.target.value
                          setTestCases(copy)
                        }}
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-brand-teal hover:bg-brand-teal/90 text-white">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this coding question? All student submissions and progress
              linked to this question will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
