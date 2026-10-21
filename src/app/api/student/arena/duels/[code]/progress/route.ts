import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { updateDuelProgress } from "@/server/services/duel-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await params
    if (!code) {
      return NextResponse.json({ error: "Missing duel code" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { passedTests, totalTests, tabSwitched, suspiciousPaste, codeSnippet } = body

    await updateDuelProgress({
      duelCode: code,
      userId: user.id,
      passedTests,
      totalTests,
      tabSwitched,
      suspiciousPaste,
      codeSnippet,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Progress update API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 400 }
    )
  }
}
