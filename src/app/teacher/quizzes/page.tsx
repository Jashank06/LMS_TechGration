"use client"

import * as React from "react"
import Link from "next/link"
import { PageTransition } from "@/components/motion/page-transition"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Layers,
} from "lucide-react"

interface TeacherQuizOverview {
  id: string
  courseId: string
  courseTitle: string
  title: string
  description: string | null
  timeLimitMinutes: number
  passingPct: number
  questionCount: number
  totalAttempts: number
  passedAttempts: number
  passRate: number
  averageScore: number | null
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = React.useState<TeacherQuizOverview[]>([])
  const [courses, setCourses] = React.useState<Array<{ id: string; title: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("ALL")

  React.useEffect(() => {
    async function loadData() {
      try {
        // Fetch courses taught
        const courseRes = await fetch("/api/teacher/courses")
        const courseJson = await courseRes.json()
        const fetchedCourses = courseJson.courses || []
        setCourses(fetchedCourses)

        // Fetch quizzes across courses
        const allQuizzes: TeacherQuizOverview[] = []
        for (const c of fetchedCourses) {
          try {
            const qRes = await fetch(`/api/teacher/courses/${c.id}/assessments`)
            const qJson = await qRes.json()
            if (qJson.assessments) {
              for (const a of qJson.assessments) {
                allQuizzes.push({
                  ...a,
                  courseTitle: c.title,
                })
              }
            }
          } catch (e) {
            console.error(`Failed to load quizzes for ${c.id}:`, e)
          }
        }
        setQuizzes(allQuizzes)
      } catch (err) {
        console.error("Failed to load teacher quizzes:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredQuizzes =
    selectedCourseId === "ALL"
      ? quizzes
      : quizzes.filter((q) => q.courseId === selectedCourseId)

  const totalAttemptsAcross = quizzes.reduce((acc, q) => acc + q.totalAttempts, 0)
  const averagePassRate =
    quizzes.length > 0
      ? Math.round(quizzes.reduce((acc, q) => acc + q.passRate, 0) / quizzes.length)
      : 0

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Quizzes & Assessments Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Design timed knowledge evaluations, author scenario questions, and analyze student attempt benchmarks.
          </p>
        </div>

        {courses.length > 0 && (
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md shadow-purple-600/20 gap-2 shrink-0"
          >
            <Link href={`/teacher/courses/${courses[0].id}/builder`}>
              <Plus className="w-4 h-4" />
              <span>Create New Quiz</span>
            </Link>
          </Button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Quizzes</span>
            <HelpCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{quizzes.length}</div>
          <div className="text-[11px] text-muted-foreground">Active scenario tests</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Student Attempts</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalAttemptsAcross}</div>
          <div className="text-[11px] text-emerald-500 font-semibold">Live evaluated submissions</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Avg Pass Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{averagePassRate}%</div>
          <div className="text-[11px] text-muted-foreground">Class passing benchmark</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Grading Engine</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">Automated</div>
          <div className="text-[11px] text-brand-teal font-medium">Instant score & explanations</div>
        </div>
      </div>

      {/* Course Filter Pills */}
      {courses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-semibold shrink-0">Filter by Course:</span>
          <button
            onClick={() => setSelectedCourseId("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              selectedCourseId === "ALL"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All Courses ({quizzes.length})
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                selectedCourseId === c.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 mx-auto flex items-center justify-center text-purple-500">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">No Quizzes Configured Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Create curriculum assessments with multiple-choice questions to evaluate student knowledge.
            </p>
          </div>
          {courses.length > 0 && (
            <Button asChild size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold">
              <Link href={`/teacher/courses/${courses[0].id}/builder`}>
                Open Course Builder & Add Quiz
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                    {quiz.courseTitle}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    <span>{quiz.timeLimitMinutes} mins</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-foreground group-hover:text-purple-500 transition-colors">
                    {quiz.title}
                  </h4>
                  {quiz.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-secondary/50 border border-border/60 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">Questions</div>
                    <div className="text-xs font-bold text-foreground">{quiz.questionCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">Attempts</div>
                    <div className="text-xs font-bold text-foreground">{quiz.totalAttempts}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">Pass Rate</div>
                    <div className="text-xs font-bold text-emerald-500">{quiz.passRate}%</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 px-3 rounded-xl border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-bold"
                >
                  <Link href={`/student/assessments/${quiz.id}`} target="_blank">
                    <span>Preview Student Experience</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  className="text-xs h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  <Link href={`/teacher/courses/${quiz.courseId}/builder`}>
                    <span>Manage in Course Builder</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  )
}
