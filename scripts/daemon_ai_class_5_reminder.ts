import { spawn } from "child_process"
import path from "path"

// Target: 5:45:00 PM IST on Saturday, 7 Nov 2026
const TARGET_TIME = new Date("2026-11-07T12:15:00.000Z").getTime()
const now = Date.now()
const waitMs = Math.max(0, TARGET_TIME - now)

console.log("==================================================")
console.log("⏰ AI CLASS 5 REMINDER DAEMON INITIALIZED")
console.log("==================================================")
console.log(`[Reminder Daemon] Current time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`)
console.log(`[Reminder Daemon] Target trigger time: 05:45:00 PM IST (${new Date(TARGET_TIME).toISOString()})`)
console.log(`[Reminder Daemon] Waiting for ${Math.round(waitMs / 1000)}s (~${Math.round(waitMs / 60000)} minutes)...`)

setTimeout(() => {
  console.log(`\n[Reminder Daemon] ⏰ WAKE UP! Current time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`)
  console.log(`[Reminder Daemon] Triggering 5:45 PM Reminder Dispatch Script...`)

  const scriptPath = path.resolve(__dirname, "dispatch_ai_class_5_reminder.ts")
  const child = spawn("npx", ["tsx", scriptPath], {
    stdio: "inherit",
    shell: true,
  })

  child.on("exit", (code) => {
    console.log(`[Reminder Daemon] Reminder dispatch finished with exit code: ${code}`)
    process.exit(code || 0)
  })
}, waitMs)
