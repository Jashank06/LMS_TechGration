import fs from "fs"
import path from "path"
import { db } from "@/server/db"
import { transporter } from "@/server/email/mailer"

const ZOOM_URL = "https://us06web.zoom.us/j/83402526743?pwd=2GsWJFuRJB3X6oyIeHWuH8djg306D8.1"
const MEETING_ID = "834 0252 6743"
const POSTER_PATH = path.join(process.cwd(), "public/posters/master-github-workshop-nov18-email.jpg")
const POSTER_CID = "github-workshop-poster@techgration.live"

type DispatchMode = "announce" | "reminder"

function parseMode(): DispatchMode {
  const arg = process.argv.find((a) => a.startsWith("--mode="))
  const val = arg ? arg.split("=")[1] : "announce"
  return val === "reminder" ? "reminder" : "announce"
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildEmailHtml(recipientName: string, mode: DispatchMode, isInstructorCopy: boolean): string {
  const firstName = escapeHtml((recipientName || "Learner").trim().split(/\s+/)[0] || "Learner")
  const isReminder = mode === "reminder"

  const badgeText = isReminder
    ? "Starting in 30 Minutes • Live Zoom Session"
    : "Live Hands-on Workshop • Today 6:00 PM – 7:00 PM IST"

  const headingText = isReminder
    ? "Master GitHub Workshop Starts at 6:00 PM"
    : "You're Invited: Master GitHub Live Workshop"

  const introParagraph = isReminder
    ? `This is a friendly reminder that our <strong>Master GitHub</strong> hands-on workshop begins in <strong>30 minutes at 6:00 PM IST</strong>. Please join on time using the Zoom link below.`
    : `We are hosting a special hands-on workshop on <strong>Master GitHub</strong> today from <strong>6:00 PM to 7:00 PM IST</strong> for all TechGration enrolled learners. We encourage every student to attend live and build practical Git &amp; GitHub skills.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headingText}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
          <!-- Top Header -->
          <tr>
            <td style="background-color:#0F766E;padding:22px 28px;text-align:left;">
              <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#CCFBF1;margin-bottom:6px;">
                TechGration Academy${isInstructorCopy ? " · Instructor Copy" : ""}
              </div>
              <div style="font-size:20px;font-weight:700;color:#FFFFFF;line-height:1.3;">
                ${headingText}
              </div>
              <div style="font-size:12.5px;color:#E6FFFA;margin-top:6px;">
                ${badgeText}
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:26px 28px 20px;">
              <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#0F172A;">
                Hi ${firstName},
              </p>

              <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#334155;">
                ${introParagraph}
              </p>

              <!-- Session Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F0FDFA;border:1px solid #CCFBF1;border-radius:12px;margin:0 0 20px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13.5px;line-height:1.7;color:#134E4A;">
                      <tr>
                        <td style="font-weight:700;width:110px;vertical-align:top;">Topic:</td>
                        <td>Master GitHub — Version Control, Collaboration &amp; Dev Portfolio</td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;vertical-align:top;">Date:</td>
                        <td>Today, Wednesday, 18 November 2026</td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;vertical-align:top;">Time:</td>
                        <td>6:00 PM – 7:00 PM IST</td>
                      </tr>
                      <tr>
                        <td style="font-weight:700;vertical-align:top;">Meeting ID:</td>
                        <td>${MEETING_ID}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Primary Join CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 14px;">
                <tr>
                  <td style="border-radius:10px;background-color:#0D9488;">
                    <a href="${ZOOM_URL}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                      Join Workshop on Zoom &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 22px;font-size:12px;line-height:1.5;color:#64748B;word-break:break-all;">
                Direct Zoom Link: <a href="${ZOOM_URL}" style="color:#0F766E;text-decoration:underline;">${ZOOM_URL}</a>
              </p>

              <!-- Inline Workshop Poster -->
              <div style="margin:0 0 22px;text-align:center;">
                <a href="${ZOOM_URL}" target="_blank" style="text-decoration:none;">
                  <img
                    src="cid:${POSTER_CID}"
                    alt="TechGration Master GitHub Live Workshop — Today 6:00 PM to 7:00 PM IST"
                    width="524"
                    style="display:block;width:100%;max-width:524px;height:auto;border-radius:12px;border:1px solid #E2E8F0;margin:0 auto;"
                  />
                </a>
              </div>

              <!-- Key Takeaways -->
              <p style="margin:0 0 8px;font-size:13.5px;font-weight:700;color:#0F172A;">
                What you will learn in this session:
              </p>
              <ul style="margin:0 0 18px;padding-left:18px;font-size:13.5px;line-height:1.65;color:#334155;">
                <li>Version Control fundamentals with Git &amp; GitHub</li>
                <li>Collaborating with teams using branches and pull requests</li>
                <li>Managing real-world software projects cleanly</li>
                <li>Building a strong developer portfolio on GitHub</li>
              </ul>

              <p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:#334155;">
                Please join at <strong>6:00 PM sharp</strong> so you don't miss the hands-on walkthrough.
              </p>

              <p style="margin:18px 0 0;font-size:14px;line-height:1.5;color:#0F172A;">
                See you in the session,<br />
                <strong>TechGration Academic Team</strong><br />
                <span style="font-size:12px;color:#64748B;">TechGration Technologies Pvt. Ltd.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;border-top:1px solid #E2E8F0;padding:14px 28px;text-align:center;font-size:11.5px;color:#64748B;">
              TechGration Learning Portal · <a href="https://campus.techgration.live" style="color:#0F766E;text-decoration:none;">campus.techgration.live</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildEmailText(recipientName: string, mode: DispatchMode): string {
  const firstName = (recipientName || "Learner").trim().split(/\s+/)[0] || "Learner"
  const isReminder = mode === "reminder"

  return [
    `Hi ${firstName},`,
    "",
    isReminder
      ? "Friendly reminder: Our TechGration Live Workshop on Master GitHub starts in 30 minutes at 6:00 PM IST."
      : "We are hosting a TechGration Live Hands-on Workshop on Master GitHub today from 6:00 PM to 7:00 PM IST for all enrolled students.",
    "",
    "Workshop Details:",
    "- Topic: Master GitHub (Version Control, Team Collaboration, Project Management & Dev Portfolio)",
    "- Date: Today, Wednesday, 18 November 2026",
    "- Time: 6:00 PM - 7:00 PM IST",
    `- Zoom Meeting ID: ${MEETING_ID}`,
    `- Join Link: ${ZOOM_URL}`,
    "",
    "Please join at 6:00 PM sharp and make the most of this hands-on session.",
    "",
    "Best regards,",
    "TechGration Academic Team",
    "https://campus.techgration.live",
  ].join("\n")
}

async function getAllEnrolledStudents(): Promise<{ id: string; name: string; email: string }[]> {
  const enrollments = await db.enrollment.findMany({
    where: { status: "ACTIVE" },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  const uniqueMap = new Map<string, { id: string; name: string; email: string }>()
  for (const e of enrollments) {
    if (!e.user || e.user.role !== "STUDENT" || !e.user.email) continue
    const normalized = e.user.email.trim().toLowerCase()
    if (!normalized || uniqueMap.has(normalized)) continue
    uniqueMap.set(normalized, {
      id: e.user.id,
      name: e.user.name || "Learner",
      email: normalized,
    })
  }

  return Array.from(uniqueMap.values())
}

async function main() {
  const mode = parseMode()
  const isReminder = mode === "reminder"
  const templateKey = isReminder
    ? "github-workshop-nov18-reminder-530pm"
    : "github-workshop-nov18-announce"
  // Gentle anti-spam pacing:
  // - Announcement (3:00 PM): 1 email every 20s (~37 mins total, finishes well before 5:30 PM)
  // - 5:30 PM Reminder: 1 email every 10s (~18.5 mins total, every student gets link by 5:48 PM before 6:00 PM start)
  const pacingMs = isReminder ? 10_000 : 20_000

  console.log("==============================================================")
  console.log(
    isReminder
      ? "⏰ MASTER GITHUB WORKSHOP — 5:30 PM REMINDER DISPATCH"
      : "📣 MASTER GITHUB WORKSHOP — ANNOUNCEMENT DISPATCH"
  )
  console.log("==============================================================")

  if (!fs.existsSync(POSTER_PATH)) {
    throw new Error(`Poster file missing at ${POSTER_PATH}`)
  }
  const posterBuffer = fs.readFileSync(POSTER_PATH)
  console.log(`🖼️  Poster loaded (${Math.round(posterBuffer.length / 1024)} KB)`)

  // 1. Fetch ALL enrolled students across ALL courses
  const students = await getAllEnrolledStudents()
  console.log(`👥 Total unique enrolled students across all courses: ${students.length}`)

  // 2. Create In-App Portal Notifications (idempotent)
  const notifTitle = isReminder
    ? "Master GitHub Workshop starts in 30 mins (6:00 PM)"
    : "Today 6:00 PM: TechGration Live Workshop on Master GitHub"
  const notifMessage = isReminder
    ? "Join our hands-on Master GitHub live workshop at 6:00 PM IST on Zoom. Tap to join directly."
    : "Attend today's TechGration hands-on workshop on Master GitHub (6:00 PM – 7:00 PM IST). Tap to open Zoom link."

  const existingNotif = await db.notification.findFirst({ where: { title: notifTitle } })
  if (!existingNotif && students.length > 0) {
    const res = await db.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: notifTitle,
        message: notifMessage,
        href: ZOOM_URL,
      })),
    })
    console.log(`🔔 Created ${res.count} in-app notifications.`)
  } else if (existingNotif) {
    console.log("ℹ️ In-app notifications already created for this stage.")
  }

  // 3. Build target list (Instructor Copy first so admin sees immediate inbox placement)
  const seen = new Set<string>()
  const targets: { id: string; name: string; email: string; isInstructorCopy: boolean }[] = []

  const addTarget = (t: { id: string; name: string; email: string; isInstructorCopy: boolean }) => {
    const email = t.email.trim().toLowerCase()
    if (!email || seen.has(email)) return
    seen.add(email)
    targets.push({ ...t, email })
  }

  addTarget({
    id: "instructor-copy",
    name: "Jay",
    email: "jaykumar0305@gmail.com",
    isInstructorCopy: true,
  })

  for (const s of students) {
    addTarget({
      id: s.id,
      name: s.name,
      email: s.email,
      isInstructorCopy: false,
    })
  }

  // 4. Skip already-sent emails for idempotency
  const alreadySent = await db.emailLog.findMany({
    where: { template: templateKey, status: "SENT" },
    select: { toEmail: true },
  })
  const sentSet = new Set(alreadySent.map((l) => l.toEmail.trim().toLowerCase()))
  const pending = targets.filter((t) => !sentSet.has(t.email))

  console.log(
    `📧 Dispatch queue (${templateKey}): ${pending.length} pending (${sentSet.size} already sent). Pacing: ${pacingMs / 1000}s per email.`
  )

  let sentCount = 0
  let failedCount = 0

  for (let i = 0; i < pending.length; i++) {
    const target = pending[i]
    const baseSubject = isReminder
      ? "Starting in 30 mins (6:00 PM): Master GitHub Live Workshop Link"
      : "Today at 6:00 PM: TechGration Hands-on Workshop on Master GitHub"
    const subject = target.isInstructorCopy ? `[Instructor Copy] ${baseSubject}` : baseSubject

    let delivered = false
    let lastError = ""

    // Up to 2 attempts in case of a transient Wi-Fi blip
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await transporter.sendMail({
          from: `"TechGration Academy" <welcome@jashank.me>`,
          replyTo: "jaykumar0305@gmail.com",
          to: target.email,
          subject,
          text: buildEmailText(target.name, mode),
          html: buildEmailHtml(target.name, mode, target.isInstructorCopy),
          attachments: [
            {
              filename: "master-github-workshop.jpg",
              content: posterBuffer,
              cid: POSTER_CID,
              contentDisposition: "inline",
              contentType: "image/jpeg",
            },
          ],
        })
        delivered = true
        break
      } catch (err: any) {
        lastError = err?.message || String(err)
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 3000))
        }
      }
    }

    const nowIst = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })
    if (delivered) {
      await db.emailLog
        .create({
          data: {
            toEmail: target.email,
            subject,
            template: templateKey,
            status: "SENT",
          },
        })
        .catch(() => {})
      sentCount++
      console.log(`[${i + 1}/${pending.length}] [${nowIst}] ✅ Sent to ${target.email} (${target.name})`)
    } else {
      await db.emailLog
        .create({
          data: {
            toEmail: target.email,
            subject,
            template: templateKey,
            status: "FAILED",
            error: lastError,
          },
        })
        .catch(() => {})
      failedCount++
      console.error(`[${i + 1}/${pending.length}] [${nowIst}] ❌ Failed to ${target.email}: ${lastError}`)
    }

    if (i < pending.length - 1) {
      await new Promise((r) => setTimeout(r, pacingMs))
    }
  }

  console.log(`\n🎉 ${mode.toUpperCase()} COMPLETE! Sent: ${sentCount}, Failed: ${failedCount}, Total: ${pending.length}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
