import { NextResponse } from "next/server"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { getTeacherNavCounts } from "@/server/services/nav-counts"

export async function GET() {
  try {
    const session = await getTeacherSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const counts = await getTeacherNavCounts(session.user)
    return NextResponse.json(counts)
  } catch (error) {
    console.error("Teacher nav counts failed:", error)
    return NextResponse.json({ error: "Failed to load counts" }, { status: 500 })
  }
}
