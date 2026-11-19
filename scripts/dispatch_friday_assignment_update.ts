import { db } from "@/server/db"
import { getClassRecipients } from "@/server/services/live-class-mailer"
import { transporter } from "@/server/email/mailer"

const COURSE_ID = "6ad283b4e196d0b8fbfb9eae"
const INSTRUCTOR_ID = "6acea351533d6b57ff7c5401"
const TEMPLATE_KEY = "friday-assignment-update-nov20-2026"
const PACING_MS = 36_000 // Strictly 1 email every 36 seconds

const RECORDINGS_URL = `https://campus.techgration.live/student/courses/${COURSE_ID}?tab=recordings`
const COMMUNITY_TITLE = "📝 Important Update: Assignment Scheduled for Friday (During Class Time)"
const COMMUNITY_CONTENT = [
  "Dear Learners,",
  "",
  "Please note that your upcoming Assignment will be conducted this Friday (20 Nov) during our live class time.",
  "",
  "Make sure you come well-prepared — revise all previous class recordings carefully before Friday so you can score your best!",
  "",
  "All recordings are available in your Course Hub → Recordings tab.",
  "",
  "Best regards,",
  "Vineet Sir & TechGration Team",
].join("\n")

function buildEmailHtml(recipientName: string, isInstructorCopy: boolean) {
  const firstName = recipientName.split(" ")[0] || "Learner"
  const safeName = firstName.replace(/[<>&"]/g, "")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Assignment Scheduled for Friday — TechGration AI Academy</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D9488 0%,#0F766E 100%);padding:26px 32px;text-align:left;">
              <div style="font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#CCFBF1;margin-bottom:6px;">
                TechGration AI Academy${isInstructorCopy ? " • Instructor Copy" : ""}
              </div>
              <div style="font-size:20px;font-weight:800;color:#FFFFFF;line-height:1.3;">
                📝 Assignment Scheduled for Friday
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#0F172A;">
                Hi ${safeName},
              </p>

              <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#334155;">
                Quick heads-up! Your upcoming <strong>Assignment</strong> will be held this <strong>Friday (20 Nov) during our regular class time</strong>.
              </p>

              <div style="background-color:#F0FDFA;border-left:4px solid #0D9488;border-radius:8px;padding:14px 16px;margin:0 0 22px;">
                <p style="margin:0;font-size:13.5px;line-height:1.6;color:#134E4A;">
                  <strong>Preparation Reminder:</strong> Please watch all previous class recordings and revise your notes carefully before Friday so you're 100% ready.
                </p>
              </div>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
                <tr>
                  <td style="border-radius:10px;background-color:#0D9488;">
                    <a href="${RECORDINGS_URL}" target="_blank" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                      🎥 Watch All Class Recordings
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:#334155;">
                Stay prepared and give it your best!
              </p>

              <p style="margin:18px 0 0;font-size:14px;line-height:1.5;color:#0F172A;">
                Warm regards,<br />
                <strong>Vineet Sir</strong><br />
                <span style="font-size:12px;color:#64748B;">TechGration AI Academy</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;text-align:center;font-size:11.5px;color:#64748B;">
              TechGration LMS • <a href="https://campus.techgration.live" style="color:#0D9488;text-decoration:none;">campus.techgration.live</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildEmailText(recipientName: string) {
  const firstName = recipientName.split(" ")[0] || "Learner"
  return [
    `Hi ${firstName},`,
    "",
    "Quick heads-up! Your upcoming Assignment will be held this Friday (20 Nov) during our regular class time.",
    "",
    "Please make sure you watch all previous class recordings and revise your notes beforehand so you're 100% ready.",
    "",
    `Watch All Recordings: ${RECORDINGS_URL}`,
    "",
    "Stay prepared and give it your best!",
    "",
    "Warm regards,",
    "Vineet Sir",
    "TechGration AI Academy",
  ].join("\n")
}

async function main() {
  console.log("==========================================================")
  console.log("📣 FRIDAY ASSIGNMENT UPDATE — COMMUNITY + 36s PACED EMAILS")
  console.log("==========================================================")

  // 1. Publish Community Feed Update (idempotent check)
  const existingPost = await db.communityPost.findFirst({
    where: { courseId: COURSE_ID, title: COMMUNITY_TITLE },
  })

  if (existingPost) {
    console.log(`ℹ️ Community Post already exists: ${existingPost.id}`)
  } else {
    const post = await db.communityPost.create({
      data: {
        authorId: INSTRUCTOR_ID,
        authorName: "Vineet Sir",
        authorRole: "TEACHER",
        courseId: COURSE_ID,
        title: COMMUNITY_TITLE,
        content: COMMUNITY_CONTENT,
        category: "IMPORTANT_NOTICE",
        priority: "URGENT",
        isPinned: true,
        actionUrl: `/student/courses/${COURSE_ID}?tab=recordings`,
        actionLabel: "Watch Class Recordings",
      },
    })
    console.log(`✅ Community Feed Post published (Pinned): ${post.id}`)
  }

  // 2. Fetch enrolled AI batch students
  const students = await getClassRecipients(COURSE_ID)
  console.log(`👥 Enrolled AI students found: ${students.length}`)

  // 3. Create In-App Notifications (skip if already sent for this title)
  const existingNotif = await db.notification.findFirst({
    where: { title: "📝 Assignment Scheduled for Friday (Class Time)" },
  })
  if (!existingNotif && students.length > 0) {
    const notifRes = await db.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: "📝 Assignment Scheduled for Friday (Class Time)",
        message:
          "Your Assignment will be held this Friday (20 Nov) during class time. Revise all previous class recordings and come prepared!",
        href: `/student/courses/${COURSE_ID}?tab=recordings`,
      })),
    })
    console.log(`🔔 Created ${notifRes.count} in-app notifications.`)
  } else if (existingNotif) {
    console.log("ℹ️ In-app notifications already created.")
  }

  // 4. Build deduplicated email target list (Instructor Copy FIRST so admin sees it right away)
  const seenEmails = new Set<string>()
  const targets: { id: string; name: string; email: string; isInstructorCopy: boolean }[] = []

  const addTarget = (t: { id: string; name: string; email: string; isInstructorCopy: boolean }) => {
    const normalized = t.email.trim().toLowerCase()
    if (!normalized || seenEmails.has(normalized)) return
    seenEmails.add(normalized)
    targets.push({ ...t, email: normalized })
  }

  addTarget({
    id: "instructor-copy",
    name: "Vineet Sir",
    email: "jaykumar0305@gmail.com",
    isInstructorCopy: true,
  })

  for (const s of students) {
    addTarget({
      id: s.id,
      name: s.name || "Learner",
      email: s.email,
      isInstructorCopy: false,
    })
  }

  // Skip emails already sent under this template key (safe resume)
  const alreadySentLogs = await db.emailLog.findMany({
    where: { template: TEMPLATE_KEY, status: "SENT" },
    select: { toEmail: true },
  })
  const alreadySentSet = new Set(alreadySentLogs.map((l) => l.toEmail.trim().toLowerCase()))
  const pendingTargets = targets.filter((t) => !alreadySentSet.has(t.email))

  console.log(
    `📧 Email dispatch queue: ${pendingTargets.length} pending (${alreadySentSet.size} already sent). Pacing: 1 email every ${PACING_MS / 1000}s.`
  )

  let sentCount = 0
  let failedCount = 0

  for (let i = 0; i < pendingTargets.length; i++) {
    const target = pendingTargets[i]
    const subject = target.isInstructorCopy
      ? "[Instructor Copy] 📝 Assignment Update: Scheduled for Friday During Class Time — Be Prepared!"
      : "📝 Assignment Update: Scheduled for Friday During Class Time — Be Prepared!"

    try {
      await transporter.sendMail({
        from: `"Vineet Sir • TechGration AI Academy" <welcome@jashank.me>`,
        replyTo: "jaykumar0305@gmail.com",
        to: target.email,
        subject,
        text: buildEmailText(target.name),
        html: buildEmailHtml(target.name, target.isInstructorCopy),
        headers: {
          "X-Mailer": "TechGration LMS Academic Notice v2.0",
          "X-Priority": "3",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
      })

      await db.emailLog
        .create({
          data: {
            toEmail: target.email,
            subject,
            template: TEMPLATE_KEY,
            status: "SENT",
          },
        })
        .catch(() => {})

      sentCount++
      const nowIst = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })
      console.log(`[${i + 1}/${pendingTargets.length}] [${nowIst}] ✅ Sent to ${target.email} (${target.name})`)
    } catch (err: any) {
      failedCount++
      await db.emailLog
        .create({
          data: {
            toEmail: target.email,
            subject,
            template: TEMPLATE_KEY,
            status: "FAILED",
            error: err?.message || "Unknown SMTP error",
          },
        })
        .catch(() => {})
      console.error(`[${i + 1}/${pendingTargets.length}] ❌ Failed to ${target.email}: ${err?.message || err}`)
    }

    // Strictly wait 36 seconds before sending the next email
    if (i < pendingTargets.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, PACING_MS))
    }
  }

  console.log(`\n🎉 ALL DONE! Sent: ${sentCount}, Failed: ${failedCount}, Total Processed: ${pendingTargets.length}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
