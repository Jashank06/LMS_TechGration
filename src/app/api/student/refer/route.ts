import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { getStudentReferralStats } from "@/server/services/referrals"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await getStudentReferralStats(user.id)

    return NextResponse.json({
      success: true,
      stats,
      studentName: user.name || "Student",
    })
  } catch (error: any) {
    console.error("Student refer API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load referral stats" },
      { status: 500 }
    )
  }
}
