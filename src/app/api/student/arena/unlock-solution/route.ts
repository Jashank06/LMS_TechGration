import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { problemSlug } = await req.json()
    if (!problemSlug) {
      return NextResponse.json({ error: "Missing problemSlug" }, { status: 400 })
    }

    const problem = await db.codingProblem.findUnique({
      where: { slug: problemSlug },
      select: {
        id: true,
        slug: true,
        editorial: true,
        solutionCode: true,
        isPublished: true,
      },
    })

    if (!problem || !problem.isPublished) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Persist solution unlock state in MongoDB Atlas
    await db.codingProgress.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId: problem.id,
        },
      },
      create: {
        userId: user.id,
        problemId: problem.id,
        isSolutionUnlocked: true,
        solutionUnlockedAt: new Date(),
      },
      update: {
        isSolutionUnlocked: true,
        solutionUnlockedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      isSolutionUnlocked: true,
      editorial: problem.editorial,
      solutionCode: problem.solutionCode,
    })
  } catch (error) {
    console.error("Unlock solution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
