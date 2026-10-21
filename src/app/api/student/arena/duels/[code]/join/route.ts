import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { joinDuel } from "@/server/services/duel-service"

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

    const duel = await joinDuel(code, user.id)

    return NextResponse.json({
      success: true,
      duelCode: duel.code,
      status: duel.status,
    })
  } catch (error: any) {
    console.error("Join duel API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to join duel" },
      { status: 400 }
    )
  }
}
