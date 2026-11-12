import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { recordRecordingCompletion } from "@/server/services/course-progress"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classId } = await params
    const body = await req.json().catch(() => ({}))
    const { positionSec = 0, durationSec = 0, completed = false } = body

    const isFinished = completed || (durationSec > 0 && positionSec / durationSec >= 0.8)

    if (isFinished) {
      const result = await recordRecordingCompletion(user.id, classId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: true, progressTracked: true })
  } catch (error: any) {
    console.error("Recording progress error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to track recording progress" },
      { status: 500 }
    )
  }
}
