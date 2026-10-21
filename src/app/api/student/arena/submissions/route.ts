import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const problemSlug = searchParams.get("problemSlug")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))

    const where: any = { userId: user.id, isRunOnly: false }

    if (problemSlug) {
      const problem = await db.codingProblem.findUnique({ where: { slug: problemSlug }, select: { id: true } })
      if (!problem) {
        return NextResponse.json({ error: "Problem not found" }, { status: 404 })
      }
      where.problemId = problem.id
    }

    const [submissions, total] = await Promise.all([
      db.codingSubmission.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
          problem: {
            select: { slug: true, title: true, difficulty: true },
          },
        },
      }),
      db.codingSubmission.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      submissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Arena submissions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
