import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { matchHappyHourQueue } from "@/server/services/duel-service"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await matchHappyHourQueue(user.id)

    return NextResponse.json({
      success: true,
      matched: result.matched,
      duelCode: result.duelCode,
      status: result.status,
    })
  } catch (error: any) {
    console.error("Happy hour queue error:", error)
    return NextResponse.json(
      { error: error.message || "Matchmaking failed" },
      { status: 500 }
    )
  }
}
