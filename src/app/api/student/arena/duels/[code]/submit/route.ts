import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { submitDuelCode } from "@/server/services/duel-service"
import { SUPPORTED_LANGUAGES } from "@/lib/arena-constants"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code: duelCode } = await params
    if (!duelCode) {
      return NextResponse.json({ error: "Missing duel code" }, { status: 400 })
    }

    const body = await req.json()
    const { code, language } = body

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Code cannot be empty" }, { status: 400 })
    }

    if (!language || !SUPPORTED_LANGUAGES.includes(language as any)) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 })
    }

    const result = await submitDuelCode({
      duelCode,
      userId: user.id,
      code,
      language,
    })

    return NextResponse.json({
      success: true,
      verdict: result.verdict,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      isWinner: result.isWinner,
      xpReward: result.xpReward,
      isFinished: result.isFinished || false,
    })
  } catch (error: any) {
    console.error("Duel submission API error:", error)
    return NextResponse.json(
      { error: error.message || "Execution failed" },
      { status: 500 }
    )
  }
}
