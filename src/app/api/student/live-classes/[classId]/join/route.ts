import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { recordLiveClassAttendance } from "@/server/services/course-progress"

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
    const result = await recordLiveClassAttendance(user.id, classId)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Join live class error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to join live class" },
      { status: 500 }
    )
  }
}
