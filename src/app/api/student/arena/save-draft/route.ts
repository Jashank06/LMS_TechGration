import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { problemSlug, code, language } = body

    if (!problemSlug || typeof code !== "string" || !language) {
      return NextResponse.json(
        { error: "Missing required fields: problemSlug, code, language" },
        { status: 400 }
      )
    }

    const problem = await db.codingProblem.findUnique({
      where: { slug: problemSlug },
      select: { id: true },
    })

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    const progress = await db.codingProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      create: {
        userId: user.id,
        problemId: problem.id,
        lastCode: code,
        lastLanguage: language,
      },
      update: {
        lastCode: code,
        lastLanguage: language,
      },
      select: {
        id: true,
        lastLanguage: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      savedAt: progress.updatedAt?.toISOString() || new Date().toISOString(),
    })
  } catch (error) {
    console.error("Save draft error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
