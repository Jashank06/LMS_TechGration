import { NextResponse } from "next/server"
import { requireAdmin } from "@/server/auth/session"
import { db } from "@/server/db"
import { CodingDifficulty } from "@prisma/client"

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    const problems = await db.codingProblem.findMany({
      where,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { testCases: true, submissions: true } },
      },
    })

    return NextResponse.json({ success: true, problems })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("Admin arena list error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const {
      title, slug, statement, difficulty, topics, hints, editorial,
      timeLimitMs, memoryLimitKb, starterCode, solutionCode, xpReward,
      position, isPublished, testCases,
    } = body

    if (!title || !slug || !statement || !starterCode) {
      return NextResponse.json({ error: "Missing required fields: title, slug, statement, starterCode" }, { status: 400 })
    }

    // Check slug uniqueness
    const existing = await db.codingProblem.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "A problem with this slug already exists" }, { status: 409 })
    }

    const problem = await db.codingProblem.create({
      data: {
        title,
        slug,
        statement,
        difficulty: difficulty || "EASY",
        topics: topics || [],
        hints: hints || [],
        editorial: editorial || null,
        timeLimitMs: timeLimitMs || 2000,
        memoryLimitKb: memoryLimitKb || 256000,
        starterCode,
        solutionCode: solutionCode || null,
        xpReward: xpReward || 10,
        position: position || 0,
        isPublished: isPublished ?? false,
        testCases: testCases?.length ? {
          create: testCases.map((tc: any, i: number) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample ?? false,
            position: tc.position ?? i,
            explanation: tc.explanation || null,
          })),
        } : undefined,
      },
      include: { _count: { select: { testCases: true } } },
    })

    return NextResponse.json({ success: true, problem }, { status: 201 })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("Admin arena create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Missing problem id" }, { status: 400 })
    }

    const existing = await db.codingProblem.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Handle test cases separately if provided
    const { testCases, ...problemData } = updateData

    const problem = await db.codingProblem.update({
      where: { id },
      data: problemData,
      include: { _count: { select: { testCases: true } } },
    })

    // If test cases provided, replace them
    if (testCases && Array.isArray(testCases)) {
      await db.codingTestCase.deleteMany({ where: { problemId: id } })
      await db.codingTestCase.createMany({
        data: testCases.map((tc: any, i: number) => ({
          problemId: id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample ?? false,
          position: tc.position ?? i,
          explanation: tc.explanation || null,
        })),
      })
    }

    return NextResponse.json({ success: true, problem })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("Admin arena update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing problem id" }, { status: 400 })
    }

    await db.codingProblem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    console.error("Admin arena delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
