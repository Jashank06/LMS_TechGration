import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { executeCode } from "@/server/services/judge0"
import { awardFirstAcXp, recordAttempt } from "@/server/services/arena-xp"
import { SUPPORTED_LANGUAGES, XP_REWARDS, DAILY_CHALLENGE_BONUS_XP } from "@/lib/arena-constants"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { problemSlug, code, language, selectedOption } = body

    if (!problemSlug) {
      return NextResponse.json({ error: "Missing problemSlug" }, { status: 400 })
    }

    const problem = await db.codingProblem.findUnique({
      where: { slug: problemSlug },
      include: {
        testCases: {
          orderBy: { position: "asc" },
        },
      },
    })

    if (!problem || !problem.isPublished) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // ─── MCQ Flow ──────────────────────────────────────────────────
    if (problem.type === "MCQ") {
      if (!selectedOption) {
        return NextResponse.json({ error: "Please select an option" }, { status: 400 })
      }

      const isCorrect = String(selectedOption).trim().toUpperCase() === String(problem.mcqAnswer).trim().toUpperCase()
      const verdict = isCorrect ? "ACCEPTED" : "WRONG_ANSWER"

      const submission = await db.codingSubmission.create({
        data: {
          userId: user.id,
          problemId: problem.id,
          code: String(selectedOption),
          language: "mcq",
          verdict: verdict as any,
          passedTests: isCorrect ? 1 : 0,
          totalTests: 1,
          isRunOnly: false,
        },
      })

      await db.codingProblem.update({
        where: { id: problem.id },
        data: {
          submissionCount: { increment: 1 },
          ...(isCorrect ? { acceptedCount: { increment: 1 } } : {}),
        },
      })

      let xpResult = { awarded: false, totalXp: 0 }
      if (isCorrect) {
        let xpAmount = XP_REWARDS[problem.difficulty] || 10
        if (problem.isDailyChallenge) xpAmount += DAILY_CHALLENGE_BONUS_XP
        xpResult = await awardFirstAcXp(user.id, problem.id, submission.id, xpAmount)
      } else {
        await recordAttempt(user.id, problem.id)
      }

      return NextResponse.json({
        success: true,
        submissionId: submission.id,
        verdict,
        isCorrect,
        passedTests: isCorrect ? 1 : 0,
        totalTests: 1,
        explanation: isCorrect ? problem.editorial : null,
        xp: {
          awarded: xpResult.awarded,
          amount: xpResult.awarded ? (XP_REWARDS[problem.difficulty] || 10) : 0,
          totalXp: xpResult.totalXp,
          forfeited: Boolean((xpResult as any).forfeited),
        },
      })
    }

    // ─── Coding Flow ───────────────────────────────────────────────
    if (!code || !language) {
      return NextResponse.json({ error: "Missing required fields: code and language" }, { status: 400 })
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 })
    }

    if (problem.testCases.length === 0) {
      return NextResponse.json({ error: "No test cases configured for this problem" }, { status: 400 })
    }

    // Execute against ALL test cases (sample + hidden)
    const testCases = problem.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }))

    const result = await executeCode({
      sourceCode: code,
      language,
      testCases,
      timeLimitSec: Math.ceil(problem.timeLimitMs / 1000),
      memoryLimitKb: problem.memoryLimitKb,
    })

    const isAccepted = result.overallVerdict === "ACCEPTED"

    // Save submission
    const submission = await db.codingSubmission.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        code,
        language,
        verdict: result.overallVerdict as any,
        passedTests: result.passedCount,
        totalTests: result.totalCount,
        executionTimeMs: result.maxTimeMs,
        memoryUsedKb: result.maxMemoryKb ? Math.round(result.maxMemoryKb) : null,
        compileOutput: result.results[0]?.compileOutput || null,
        errorOutput: result.results.find((r) => r.stderr)?.stderr || null,
        isRunOnly: false,
      },
    })

    // Update problem submission counts atomically
    await db.codingProblem.update({
      where: { id: problem.id },
      data: {
        submissionCount: { increment: 1 },
        ...(isAccepted ? { acceptedCount: { increment: 1 } } : {}),
      },
    })

    let xpResult = { awarded: false, totalXp: 0 }

    if (isAccepted) {
      // Calculate XP: base + daily challenge bonus
      let xpAmount = XP_REWARDS[problem.difficulty] || 10
      if (problem.isDailyChallenge) {
        xpAmount += DAILY_CHALLENGE_BONUS_XP
      }
      xpResult = await awardFirstAcXp(user.id, problem.id, submission.id, xpAmount)
    } else {
      await recordAttempt(user.id, problem.id)
    }

    // Find first failing test case index for feedback (but DON'T expose the test data)
    const firstFailIndex = result.results.findIndex((r) => !r.passed)

    // Response — NEVER expose hidden test inputs/expected outputs
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      verdict: result.overallVerdict,
      passedTests: result.passedCount,
      totalTests: result.totalCount,
      maxTimeMs: result.maxTimeMs,
      maxMemoryKb: result.maxMemoryKb,
      // Only show compile/runtime errors — not test data
      compileOutput: result.results[0]?.compileOutput || null,
      errorOutput: result.results.find((r) => r.stderr)?.stderr?.substring(0, 500) || null,
      firstFailingTest: firstFailIndex >= 0 ? firstFailIndex + 1 : null,
      xp: {
        awarded: xpResult.awarded,
        amount: xpResult.awarded ? (XP_REWARDS[problem.difficulty] || 10) + (problem.isDailyChallenge ? DAILY_CHALLENGE_BONUS_XP : 0) : 0,
        totalXp: xpResult.totalXp,
        forfeited: Boolean((xpResult as any).forfeited),
      },
    })
  } catch (error: any) {
    console.error("Arena submit error:", error)
    if (error.message?.includes("JUDGE0_RAPIDAPI_KEY")) {
      return NextResponse.json({
        error: "Code execution service is not configured. Please contact the administrator.",
        configError: true,
      }, { status: 503 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
