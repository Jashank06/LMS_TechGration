import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    const problem = await db.codingProblem.findUnique({
      where: { slug },
      include: {
        testCases: {
          where: { isSample: true }, // NEVER expose hidden test cases
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
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Get user's progress
    const progress = await db.codingProgress.findUnique({
      where: { userId_problemId: { userId: user.id, problemId: problem.id } },
    })

    // Get user's recent submissions for this problem (last 10)
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

    // Count total test cases (without exposing them)
    const totalTestCases = await db.codingTestCase.count({
      where: { problemId: problem.id },
    })

    // Fetch sibling problems in the same stage for curriculum navigation
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

    // Get user's progress for these stage problems
    const stageProblemIds = stageProblems.map((p) => p.id)
    const stageProgress = await db.codingProgress.findMany({
      where: { userId: user.id, problemId: { in: stageProblemIds } },
      select: { problemId: true, isSolved: true },
    })
    const solvedSet = new Set(stageProgress.filter((p) => p.isSolved).map((p) => p.problemId))

    const enrichedStageProblems = stageProblems.map((p) => ({
      ...p,
      isSolved: solvedSet.has(p.id),
    }))

    // Sibling problems logic
    const currentIndex = stageProblems.findIndex((p) => p.slug === problem.slug)
    const prevProblem = currentIndex > 0 ? stageProblems[currentIndex - 1] : null
    const nextProblem = currentIndex < stageProblems.length - 1 ? stageProblems[currentIndex + 1] : null

    // Anti-cheat: only reveal solution/editorial if solved or unlocked
    const isSolved = Boolean(progress?.isSolved)
    const isSolutionUnlocked = Boolean(progress?.isSolutionUnlocked)
    const canViewSolution = isSolved || isSolutionUnlocked

    return NextResponse.json({
      success: true,
      problem: {
        id: problem.id,
        slug: problem.slug,
        title: problem.title,
        statement: problem.statement,
        type: problem.type,
        stage: problem.stage,
        stageTitle: problem.stageTitle,
        mcqOptions: problem.mcqOptions,
        difficulty: problem.difficulty,
        topics: problem.topics,
        hints: problem.hints,
        editorial: canViewSolution ? problem.editorial : null,
        solutionCode: canViewSolution ? problem.solutionCode : null,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
        starterCode: problem.starterCode,
        xpReward: problem.xpReward,
        acceptedCount: problem.acceptedCount,
        submissionCount: problem.submissionCount,
        isDailyChallenge: problem.isDailyChallenge,
        sampleTests: problem.testCases,
        totalTestCases,
      },
      stageProblems: enrichedStageProblems,
      prevProblem: prevProblem ? { slug: prevProblem.slug, title: prevProblem.title } : null,
      nextProblem: nextProblem ? { slug: nextProblem.slug, title: nextProblem.title } : null,
      progress: progress
        ? {
            isSolved: progress.isSolved,
            xpAwarded: progress.xpAwarded,
            attemptCount: progress.attemptCount,
            solvedAt: progress.solvedAt,
            lastCode: progress.lastCode,
            lastLanguage: progress.lastLanguage,
            isBookmarked: progress.isBookmarked,
            isSolutionUnlocked: progress.isSolutionUnlocked,
          }
        : null,
      recentSubmissions,
    })
  } catch (error) {
    console.error("Arena problem detail error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
