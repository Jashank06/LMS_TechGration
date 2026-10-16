"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Trophy, RotateCcw, EyeOff, Eye, Download, Users, Target, BarChart3, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setLeaderboardAnonymousAction } from "@/actions/leaderboard"
import type { CourseLeaderboard } from "@/server/services/leaderboard"
import { PodiumStage } from "./podium-stage"
import { MyRankCard } from "./my-rank-card"
import { LeaderboardTable } from "./leaderboard-table"
import { CourseSwitcher, LeaderboardEmpty, HowRankingWorks } from "./leaderboard-extras"
import { RankAvatar } from "./rank-avatar"

interface LeaderboardClientProps {
  data: CourseLeaderboard
  courses: Array<{ id: string; title: string }>
  variant: "student" | "teacher"
  basePath: string
  anonymousSelf?: boolean
}

const REFRESH_MS = 60_000

export function LeaderboardClient({ data, courses, variant, basePath, anonymousSelf = false }: LeaderboardClientProps) {
  const router = useRouter()
  const staff = variant === "teacher"
  const hasRanked = data.ranked.length > 0

  const [phase, setPhase] = React.useState<"intro" | "board">(hasRanked ? "intro" : "board")
  const [runKey, setRunKey] = React.useState(0)
  const [pending, startTransition] = React.useTransition()

  const handleIntroDone = React.useCallback(() => setPhase("board"), [])

  // Live feel: refresh server data every minute and when the tab becomes visible again
  React.useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh()
    }
    const id = setInterval(refresh, REFRESH_MS)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [router])

  const replay = () => {
    setRunKey((k) => k + 1)
    setPhase("intro")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleAnonymous = () => {
    startTransition(async () => {
      const res = await setLeaderboardAnonymousAction(!anonymousSelf)
      if (res.success) {
        toast.success(res.anonymous ? "Your name is now hidden from classmates" : "Your name is visible on the leaderboard")
        router.refresh()
      }
    })
  }

  const stats = [
    { label: "Enrolled", value: data.stats.enrolled, icon: Users, tone: "text-sky-500" },
    { label: "On the board", value: data.stats.ranked, icon: Trophy, tone: "text-amber-500" },
    { label: "Top marks", value: data.stats.topMarks, icon: Target, tone: "text-emerald-500" },
    { label: "Average", value: data.stats.averageMarks, icon: BarChart3, tone: "text-purple-500" },
  ]

  const boardVisible = phase === "board"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>{staff ? "Class Performance" : "Course Leaderboard"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Leaderboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ranked by marks from evaluated assignments and quizzes{staff ? "" : " · only your classmates are shown"}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasRanked && (
            <Button type="button" variant="outline" size="sm" onClick={replay} className="rounded-xl text-xs font-semibold">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Replay</span>
            </Button>
          )}
          {!staff && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAnonymous}
              disabled={pending}
              className="rounded-xl text-xs font-semibold"
              title="Control whether classmates can see your name"
            >
              {pending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : anonymousSelf ? (
                <Eye className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span>{anonymousSelf ? "Show my name" : "Hide my name"}</span>
            </Button>
          )}
          {staff && hasRanked && (
            <Button asChild size="sm" className="rounded-xl text-xs font-bold">
              <a href={`/api/teacher/leaderboard/export?courseId=${data.course.id}`}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>Export CSV</span>
              </a>
            </Button>
          )}
        </div>
      </div>

      <CourseSwitcher courses={courses} activeId={data.course.id} basePath={basePath} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">{s.label}</span>
                <Icon className={`w-4 h-4 ${s.tone}`} />
              </div>
              <p className="mt-1 text-2xl font-black tabular-nums text-foreground">{s.value}</p>
            </div>
          )
        })}
      </div>

      {hasRanked ? (
        <>
          <PodiumStage
            key={`${data.course.id}-${runKey}`}
            top={data.ranked.slice(0, 3)}
            courseTitle={data.course.title}
            compact={boardVisible}
            intro={phase === "intro"}
            onIntroDone={handleIntroDone}
          />

          {boardVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {!staff && <MyRankCard data={data} />}
              <LeaderboardTable rows={data.ranked} show={boardVisible} staff={staff} />
              <HowRankingWorks />
            </motion.div>
          )}
        </>
      ) : (
        <>
          {!staff && <MyRankCard data={data} />}
          <LeaderboardEmpty kind="no-scores" />
        </>
      )}

      {/* Enrolled but not yet scored */}
      {boardVisible && data.waiting.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs font-bold text-foreground">
            Waiting for first score <span className="text-muted-foreground font-semibold">({data.waiting.length})</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.waiting.map((w) => (
              <div key={w.userId} className="flex items-center gap-2 rounded-full bg-secondary/70 border border-border/60 pl-1 pr-3 py-1">
                <RankAvatar name={w.displayName} src={w.avatarUrl} seed={w.userId} size={22} />
                <span className="text-[11px] font-semibold text-foreground">
                  {w.displayName}
                  {w.isSelf ? " (You)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
