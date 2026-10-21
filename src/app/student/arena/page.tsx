import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { Code, Zap, ArrowRight, BookOpen } from "lucide-react"
import { ArenaCurriculumView } from "@/components/arena/arena-curriculum-view"
import { ProblemStatsBar } from "@/components/arena/problem-stats-bar"
import { DailyChallengeCard } from "@/components/arena/daily-challenge-card"

export const metadata: Metadata = {
  title: "Coding Arena — TechGration LMS",
  description: "Progressive coding learning path from basics to advanced. Practice questions, MCQs, and earn XP.",
}

export default async function ArenaPage() {
  const user = await requireStudent()

  // Fetch all published problems
  const problems = await db.codingProblem.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      topics: true,
      xpReward: true,
      acceptedCount: true,
      submissionCount: true,
      isDailyChallenge: true,
      position: true,
      type: true,
      stage: true,
      stageTitle: true,
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  })

  // Get user progress for solved status
  const progress = await db.codingProgress.findMany({
    where: { userId: user.id },
    select: { problemId: true, isSolved: true, attemptCount: true },
  })
  const progressMap = new Map(progress.map((p) => [p.problemId, p]))

  // Get user stats
  const streak = await db.codingStreak.findUnique({ where: { userId: user.id } })

  const totalSubmissions = await db.codingSubmission.count({
    where: { userId: user.id, isRunOnly: false },
  })
  const acceptedSubmissions = await db.codingSubmission.count({
    where: { userId: user.id, isRunOnly: false, verdict: "ACCEPTED" },
  })

  // Solved by difficulty & topics
  const solvedProgress = await db.codingProgress.findMany({
    where: { userId: user.id, isSolved: true },
    select: {
      problem: { select: { difficulty: true, topics: true } },
    },
  })

  const solvedByDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 }
  const topicProgress: Record<string, number> = {}

  for (const sp of solvedProgress) {
    if (sp.problem?.difficulty) {
      solvedByDifficulty[sp.problem.difficulty] = (solvedByDifficulty[sp.problem.difficulty] || 0) + 1
    }
    if (sp.problem?.topics) {
      for (const t of sp.problem.topics) {
        topicProgress[t] = (topicProgress[t] || 0) + 1
      }
    }
  }

  // Count total published by difficulty
  const totalByDifficulty = {
    EASY: problems.filter((p) => p.difficulty === "EASY").length,
    MEDIUM: problems.filter((p) => p.difficulty === "MEDIUM").length,
    HARD: problems.filter((p) => p.difficulty === "HARD").length,
  }

  // Bookmarked problems
  const bookmarkedProgress = await db.codingProgress.findMany({
    where: { userId: user.id, isBookmarked: true },
    select: {
      isSolved: true,
      problem: {
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          topics: true,
        },
      },
    },
  })

  const bookmarkedProblems = bookmarkedProgress
    .filter((b) => b.problem)
    .map((b) => ({
      id: b.problem.id,
      slug: b.problem.slug,
      title: b.problem.title,
      difficulty: b.problem.difficulty,
      topics: b.problem.topics,
      isSolved: b.isSolved,
    }))

  const stats = {
    totalXp: streak?.totalXp || 0,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || streak?.currentStreak || 0,
    totalSolved: streak?.totalSolved || 0,
    accuracy: totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
    solvedByDifficulty,
    totalByDifficulty,
    topicProgress,
  }

  // Enrich problems with solved status
  const enrichedProblems = problems.map((p) => {
    const prog = progressMap.get(p.id)
    return {
      ...p,
      isSolved: prog?.isSolved || false,
      attemptCount: prog?.attemptCount || 0,
      acceptanceRate: p.submissionCount > 0 ? Math.round((p.acceptedCount / p.submissionCount) * 100) : 0,
    }
  })

  // Find daily challenge
  const dailyChallenge = enrichedProblems.find((p) => p.isDailyChallenge) || null

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-xs backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="tracking-wide">Interactive Coding Learning Path</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Coding Arena
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Step-by-step progressive programming path. Start from absolute fundamentals, solve coding & conceptual MCQ questions, and climb the leaderboard.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <ProblemStatsBar stats={stats} bookmarkedProblems={bookmarkedProblems} />

      {/* Daily Challenge */}
      {dailyChallenge && <DailyChallengeCard problem={dailyChallenge} />}

      {/* Curriculum & Problem List */}
      {enrichedProblems.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card/50 backdrop-blur-xl p-12 text-center">
          <Code className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Problems Available Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The coding arena is being prepared. Questions will appear here shortly.
          </p>
        </div>
      ) : (
        <ArenaCurriculumView problems={enrichedProblems as any} />
      )}
    </div>
  )
}
