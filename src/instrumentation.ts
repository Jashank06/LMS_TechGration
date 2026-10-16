/**
 * Next.js instrumentation hook — starts the in-process live-class reminder scheduler.
 *
 * `register()` must return quickly (server waits for it), so we only arm a timer here.
 * For serverless hosting (e.g. Vercel) set REMINDER_SCHEDULER=off and point a 1-minute cron at
 * GET /api/cron/reminders with `Authorization: Bearer $CRON_SECRET`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  if (process.env.REMINDER_SCHEDULER === "off") return

  const g = globalThis as unknown as { __tgReminderTimer?: ReturnType<typeof setInterval>; __tgSweepRunning?: boolean }
  if (g.__tgReminderTimer) return // HMR / double-register guard

  g.__tgReminderTimer = setInterval(async () => {
    if (g.__tgSweepRunning) return
    g.__tgSweepRunning = true
    try {
      const { runReminderSweep } = await import("@/server/services/reminder-engine")
      const res = await runReminderSweep()
      if (res.sent.length) {
        console.log(`[reminders] dispatched ${res.sent.length} reminder batch(es)`, res.sent)
      }
    } catch (error) {
      console.error("[reminders] sweep failed:", error)
    } finally {
      g.__tgSweepRunning = false
    }
  }, 60_000)

  // Do not keep the Node process alive just for the timer.
  g.__tgReminderTimer.unref?.()
  console.log("[reminders] in-process scheduler armed (every 60s)")
}
