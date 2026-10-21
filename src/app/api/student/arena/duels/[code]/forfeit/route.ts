import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { forfeitDuel } from "@/server/services/duel-service"

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

    const result = await forfeitDuel({
      duelCode: code,
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("Duel forfeit API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to forfeit duel" },
      { status: 400 }
    )
  }
}
