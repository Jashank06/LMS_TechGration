import { dispatchReminder530Pm } from "./dispatch_ai_class_5_today_reminder"

async function runDaemon() {
  const targetIso = "2026-11-13T12:00:00.000Z" // 5:30:00 PM IST
  const targetTime = new Date(targetIso).getTime()
  const now = Date.now()
  const waitMs = targetTime - now

  console.log("==================================================")
  console.log("⏰ AI CLASS 5 REMINDER DAEMON INITIALIZED")
  console.log("==================================================")
  console.log("Current Time (UTC):", new Date().toISOString())
  console.log("Target Time  (UTC):", new Date(targetTime).toISOString(), "(5:30 PM IST)")

  if (waitMs <= 0) {
    console.log("Target time reached or already past! Executing reminder dispatch immediately...")
    await dispatchReminder530Pm()
    return
  }

  const waitMinutes = (waitMs / (1000 * 60)).toFixed(1)
  console.log(`Sleeping for ${waitMinutes} minutes until 5:30:00 PM IST...`)

  setTimeout(async () => {
    console.log("\n⏰ 5:30 PM IST REACHED! Triggering live reminder dispatch...")
    try {
      await dispatchReminder530Pm()
      console.log("Daemon completed successfully.")
      process.exit(0)
    } catch (err) {
      console.error("Daemon dispatch error:", err)
      process.exit(1)
    }
  }, waitMs)
}

runDaemon()
