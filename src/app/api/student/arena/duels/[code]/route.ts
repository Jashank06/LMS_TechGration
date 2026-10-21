import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { getDuelRoomState } from "@/server/services/duel-service"

export async function GET(
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
      return NextResponse.json({ error: "Duel code is required" }, { status: 400 })
    }

    const room = await getDuelRoomState(code, user.id)

    return NextResponse.json({
      success: true,
      room,
    })
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "Duel room not found" }, { status: 404 })
    }
    console.error("Duel room get error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
