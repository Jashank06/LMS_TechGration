import { NextResponse } from "next/server"
import { logoutTeacher } from "@/server/services/teacher-auth"

export async function POST() {
  try {
    await logoutTeacher()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Teacher logout API error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
