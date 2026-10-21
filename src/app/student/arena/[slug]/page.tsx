import * as React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { ArenaWorkspace } from "./arena-workspace"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const problem = await db.codingProblem.findUnique({
    where: { slug },
    select: { title: true, difficulty: true },
  })

  if (!problem) return { title: "Problem Not Found — TechGration LMS" }

  return {
    title: `${problem.title} — Coding Arena — TechGration LMS`,
    description: `Solve "${problem.title}" (${problem.difficulty}) in the TechGration Coding Arena.`,
  }
}

export default async function ArenaWorkspacePage({ params }: PageProps) {
  const user = await requireStudent()
  const { slug } = await params

  const problem = await db.codingProblem.findUnique({
    where: { slug },
    include: {
      testCases: {
        where: { isSample: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          input: true,
          expectedOutput: true,
          explanation: true,
          position: true,
        },
      },
    },
  })

  if (!problem || !problem.isPublished) {
    notFound()
  }

  // Get user progress
  const progress = await db.codingProgress.findUnique({
    where: { userId_problemId: { userId: user.id, problemId: problem.id } },
  })

  // Get recent submissions
  const recentSubmissions = await db.codingSubmission.findMany({
    where: { userId: user.id, problemId: problem.id, isRunOnly: false },
    orderBy: { submittedAt: "desc" },
    take: 10,
    select: {
      id: true,
      language: true,
      verdict: true,
      passedTests: true,
      totalTests: true,
      executionTimeMs: true,
      memoryUsedKb: true,
      code: true,
      submittedAt: true,
    },
  })

  // Total test cases count (without exposing hidden ones)
  const totalTestCases = await db.codingTestCase.count({ where: { problemId: problem.id } })

  // Sibling stage problems for in-workspace curriculum drawer
  const stageProblems = await db.codingProblem.findMany({
    where: { stage: problem.stage, isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      type: true,
      position: true,
      xpReward: true,
    },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  })

  const stageProblemIds = stageProblems.map((p) => p.id)
  const userProgressForStage = await db.codingProgress.findMany({
    where: { userId: user.id, problemId: { in: stageProblemIds } },
    select: { problemId: true, isSolved: true },
  })
  const solvedMap = new Set(userProgressForStage.filter((p) => p.isSolved).map((p) => p.problemId))

  const enrichedStageProblems = stageProblems.map((p) => ({
    ...p,
    isSolved: solvedMap.has(p.id),
  }))

  const currIdx = stageProblems.findIndex((p) => p.slug === problem.slug)
  const prevProblem = currIdx > 0 ? stageProblems[currIdx - 1] : null
  const nextProblem = currIdx < stageProblems.length - 1 ? stageProblems[currIdx + 1] : null

  // Anti-cheat: only reveal solution/editorial if solved or unlocked
  const isSolved = Boolean(progress?.isSolved)
  const isSolutionUnlocked = Boolean(progress?.isSolutionUnlocked)
  const canViewSolution = isSolved || isSolutionUnlocked

  return (
    <ArenaWorkspace
      problem={{
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        statement: problem.statement,
        type: problem.type,
        stage: problem.stage,
        stageTitle: problem.stageTitle,
        mcqOptions: problem.mcqOptions as any,
        difficulty: problem.difficulty,
        topics: problem.topics,
        hints: problem.hints,
        editorial: canViewSolution ? problem.editorial : null,
        solutionCode: canViewSolution ? (problem.solutionCode as any) : null,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
        starterCode: (problem.starterCode || {}) as Record<string, string>,
        xpReward: problem.xpReward,
        acceptedCount: problem.acceptedCount,
        submissionCount: problem.submissionCount,
        isDailyChallenge: problem.isDailyChallenge,
        sampleTests: problem.testCases,
        totalTestCases,
      }}
      stageProblems={enrichedStageProblems}
      prevProblem={prevProblem ? { slug: prevProblem.slug, title: prevProblem.title } : null}
      nextProblem={nextProblem ? { slug: nextProblem.slug, title: nextProblem.title } : null}
      progress={progress ? {
        isSolved: progress.isSolved,
        xpAwarded: progress.xpAwarded,
        attemptCount: progress.attemptCount,
        solvedAt: progress.solvedAt?.toISOString() || null,
        lastCode: progress.lastCode || null,
        lastLanguage: progress.lastLanguage || null,
        isBookmarked: progress.isBookmarked || false,
        isSolutionUnlocked: progress.isSolutionUnlocked || false,
      } : null}
      recentSubmissions={recentSubmissions.map(s => ({
        ...s,
        submittedAt: s.submittedAt.toISOString(),
        executionTimeMs: s.executionTimeMs ?? null,
        memoryUsedKb: s.memoryUsedKb ?? null,
      }))}
    />
  )
}
