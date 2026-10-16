import { NextResponse } from "next/server"
import { getTeacherSession } from "@/server/services/teacher-auth"

export async function GET() {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
    }
    return NextResponse.json({ authenticated: true, user: session.user })
  } catch (error) {
    console.error("Teacher session API error:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}
