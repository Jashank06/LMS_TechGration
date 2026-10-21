import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { executeCode, type TestCaseInput } from "@/server/services/judge0"
import { SUPPORTED_LANGUAGES } from "@/lib/arena-constants"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { problemSlug, code, language, customInput, customTestCases } = body

    if (!problemSlug || !code || !language) {
      return NextResponse.json({ error: "Missing required fields: problemSlug, code, language" }, { status: 400 })
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 })
    }

    const problem = await db.codingProblem.findUnique({
      where: { slug: problemSlug },
      include: {
        testCases: {
          where: { isSample: true },
          orderBy: { position: "asc" },
        },
      },
    })

    if (!problem || !problem.isPublished) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    let testCases: TestCaseInput[]
    let isMultiCustom = false

    if (Array.isArray(customTestCases) && customTestCases.length > 0) {
      isMultiCustom = true
      testCases = customTestCases.map((tc: any) => ({
        input: String(tc.input ?? ""),
        expectedOutput: String(tc.expectedOutput ?? ""),
      }))
    } else if (customInput !== undefined && customInput !== null) {
      // Legacy single custom input mode
      testCases = [{ input: customInput, expectedOutput: "" }]
    } else {
      // Run against sample test cases
      if (problem.testCases.length === 0) {
        return NextResponse.json({ error: "No sample test cases available" }, { status: 400 })
      }
      testCases = problem.testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      }))
    }

    const result = await executeCode({
      sourceCode: code,
      language,
      testCases,
      timeLimitSec: Math.ceil(problem.timeLimitMs / 1000),
      memoryLimitKb: problem.memoryLimitKb,
    })

    // Save run-only submission for history
    await db.codingSubmission.create({
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
        isRunOnly: true,
      },
    })

    // Single custom input mode response
    if (!isMultiCustom && customInput !== undefined && customInput !== null) {
      const r = result.results[0]
      return NextResponse.json({
        success: true,
        isCustomInput: true,
        stdout: r?.stdout || "",
        stderr: r?.stderr || "",
        compileOutput: r?.compileOutput || "",
        statusDescription: r?.statusDescription || "Unknown",
        verdict: r?.verdict || "INTERNAL_ERROR",
        time: r?.time,
        memory: r?.memory,
      })
    }

    // Return sample/multi-custom test results (safe to show expected output for samples/custom)
    return NextResponse.json({
      success: true,
      isCustomInput: false,
      isMultiCustom,
      overallVerdict: result.overallVerdict,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      maxTimeMs: result.maxTimeMs,
      maxMemoryKb: result.maxMemoryKb,
      results: result.results.map((r, i) => ({
        testCase: i + 1,
        passed: r.passed,
        verdict: r.verdict,
        stdout: r.stdout,
        stderr: r.stderr,
        compileOutput: r.compileOutput,
        expectedOutput: testCases[i]?.expectedOutput || "",
        input: testCases[i]?.input || "",
        time: r.time,
        memory: r.memory,
      })),
    })
  } catch (error: any) {
    console.error("Arena run error:", error)
    // Return user-friendly error for Judge0 config issues
    if (error.message?.includes("JUDGE0_RAPIDAPI_KEY")) {
      return NextResponse.json({
        error: "Code execution service is not configured. Please contact the administrator to set up the JUDGE0_RAPIDAPI_KEY.",
        configError: true,
      }, { status: 503 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
