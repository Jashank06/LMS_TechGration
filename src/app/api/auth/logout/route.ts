import { NextResponse } from "next/server"
import { destroySession, getCurrentUser } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"

    if (user) {
      await logAuditEvent({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "AUTH_LOGOUT",
        resource: "AUTH",
        ipAddress,
      })
    }

    await destroySession()
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout route error:", error)
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 })
  }
}
