import { spawn } from "child_process"
import path from "path"

const TARGET_TIME = new Date("2026-10-30T12:00:00.000Z").getTime() // 5:30:00 PM IST
const now = Date.now()
const waitMs = Math.max(0, TARGET_TIME - now)

console.log(`[Reminder Daemon] Current time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`)
console.log(`[Reminder Daemon] Target trigger time: 5:30:00 PM IST (${new Date(TARGET_TIME).toISOString()})`)
console.log(`[Reminder Daemon] Sleeping for ${Math.round(waitMs / 1000)} seconds (~${Math.round(waitMs / 60000)} minutes)...`)

setTimeout(() => {
  console.log(`\n[Reminder Daemon] ⏰ WAKE UP! Current time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`)
  console.log(`[Reminder Daemon] Executing 5:30 PM Reminder Dispatch Script...`)

  const scriptPath = path.resolve(__dirname, "dispatch_ai_class_3_reminder.ts")
  const child = spawn("npx", ["tsx", scriptPath], {
    stdio: "inherit",
    shell: true,
  })

  child.on("exit", (code) => {
    console.log(`[Reminder Daemon] Dispatch completed with exit code: ${code}`)
    process.exit(code || 0)
  })
}, waitMs)
