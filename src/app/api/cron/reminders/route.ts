import { NextResponse } from "next/server"
import { runReminderSweep } from "@/server/services/reminder-engine"

export const dynamic = "force-dynamic"

/**
 * Secured cron endpoint (Vercel Cron / external pinger, every minute):
 *   GET /api/cron/reminders   Authorization: Bearer $CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await runReminderSweep()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Cron reminders error:", error)
    return NextResponse.json({ error: "Sweep failed" }, { status: 500 })
  }
}
