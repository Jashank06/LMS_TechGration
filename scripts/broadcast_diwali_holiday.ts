import { db } from "@/server/db"
import { transporter } from "@/server/email/mailer"
import { esc } from "@/server/email/templates"

function buildDiwaliEmail(name: string) {
  const subject = "🪔 Happy Diwali! Festive Holiday Notice (Fri 6th & Sat 7th Nov) — TechGration LMS"
  const portalUrl = "https://campus.techgration.live/student/dashboard"

  const text = `Dear ${name},\n\nWishing you and your family a very Happy, Prosperous, and Luminous Diwali! 🪔✨\n\nPlease note that all Live Interactive Classes are suspended on Friday (06 Nov 2026) and Saturday (07 Nov 2026) on account of Diwali celebrations.\n\nHOLIDAY SCHEDULE:\n• Friday, 06 Nov 2026 — Holiday (No Live Classes)\n• Saturday, 07 Nov 2026 — Holiday (No Live Classes)\n• Sunday, 08 Nov 2026 — Regular Weekend / Self-Study\n• Classes Resume — Regular live sessions resume next week as per timetable\n\nThe TechGration portal remains 24/7 accessible for self-paced practice, Coding Arena problems, and recorded session revisions.\n\nOpen Student Portal: ${portalUrl}\n\nWarm festive wishes,\nVineet Sir & TechGration Academic Team`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#080B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E2E8F0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080B0E;padding:32px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#11161B;border:1px solid rgba(245,158,11,0.35);border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(245,158,11,0.08);">
        
        <!-- Header Banner with Festive Glow -->
        <tr>
          <td style="background:linear-gradient(135deg, #161208 0%, #1A1612 50%, #0D1115 100%);padding:32px 32px 26px;border-bottom:1px solid rgba(245,158,11,0.2);text-align:center;">
            <div style="display:inline-block;padding:5px 14px;border-radius:20px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);font-size:11px;color:#FBBF24;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:10px;">
              🪔 Festive Holiday Announcement • Diwali 2026
            </div>
            <div style="font-size:24px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;margin:4px 0 2px;">
              TechGration LMS
            </div>
            <div style="font-size:12px;color:#00D6D6;text-transform:uppercase;letter-spacing:2px;font-weight:600;">
              Enterprise Learning Cloud
            </div>
          </td>
        </tr>

        <!-- Main Body Content -->
        <tr>
          <td style="padding:32px 34px;">
            <div style="font-size:20px;font-weight:700;color:#F8FAFC;margin-bottom:12px;line-height:1.4;">
              Happy Diwali & Festive Holiday Notice ✨
            </div>
            
            <p style="font-size:15px;line-height:1.65;color:#E2E8F0;margin:0 0 16px;">
              Dear <strong style="color:#00D6D6;">${esc(name)}</strong>,
            </p>

            <p style="font-size:14px;line-height:1.7;color:#94A3B8;margin:0 0 18px;">
              On behalf of the entire TechGration Engineering & Academic Faculty, we extend our heartfelt wishes to you and your loved ones for a joyous, luminous, and prosperous <strong style="color:#FBBF24;">Diwali!</strong> 🪔✨ May this festival of lights spark fresh curiosity, deep wisdom, and soaring success in your engineering journey.
            </p>

            <!-- Schedule Highlight Card -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.3);border-radius:14px;margin:22px 0;overflow:hidden;">
              <tr>
                <td style="padding:18px 22px;border-bottom:1px solid rgba(245,158,11,0.15);background:rgba(245,158,11,0.1);">
                  <div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:#F59E0B;">
                    📅 Holiday & Class Schedule (Fri 06 Nov & Sat 07 Nov)
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 22px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#CBD5E1;">
                        <strong style="color:#EF4444;">• Friday, 06 Nov 2026:</strong> Holiday (No Live Interactive Classes)
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#CBD5E1;">
                        <strong style="color:#EF4444;">• Saturday, 07 Nov 2026:</strong> Holiday (No Live Interactive Classes)
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#CBD5E1;">
                        <strong style="color:#94A3B8;">• Sunday, 08 Nov 2026:</strong> Weekend Self-Study / Rest
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;font-size:13px;color:#10B981;">
                        <strong style="color:#10B981;">• Classes Resume:</strong> Regular live sessions resume next week as per timetable
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="font-size:14px;line-height:1.7;color:#94A3B8;margin:0 0 16px;">
              Take this time to relax, recharge, and celebrate with your family. If you wish to do light practice during the break, the <strong style="color:#FFFFFF;">TechGration LMS portal remains 24/7 active</strong>:
            </p>

            <ul style="font-size:13px;line-height:1.8;color:#94A3B8;margin:0 0 24px;padding-left:20px;">
              <li><strong style="color:#00D6D6;">Course Recordings:</strong> Catch up on past live sessions directly in your Course Hub.</li>
              <li><strong style="color:#00D6D6;">Coding Arena:</strong> Solve interactive programming challenges and keep your streak alive.</li>
              <li><strong style="color:#00D6D6;">Study Materials:</strong> Download handouts, slides, and curated notebooks.</li>
            </ul>

            <!-- CTA Button -->
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px auto 10px;">
              <tr>
                <td style="background:linear-gradient(135deg, #F59E0B 0%, #D97706 100%);border-radius:12px;box-shadow:0 6px 20px rgba(245,158,11,0.35);">
                  <a href="${esc(portalUrl)}" style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:700;color:#0D1115;text-decoration:none;letter-spacing:0.3px;">
                    Open Student Portal →
                  </a>
                </td>
              </tr>
            </table>

            <div style="margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);font-size:13px;line-height:1.6;color:#94A3B8;">
              Wishing you and your family a safe, peaceful, and prosperous celebration! 🪔<br><br>
              Warm regards,<br>
              <strong style="color:#F8FAFC;">Vineet Sir & TechGration Academic Team</strong><br>
              <span style="font-size:11px;color:#64748B;">TechGration Learning Systems</span>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0D1115;padding:22px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:12px;color:#64748B;">
            TechGration Technologies © 2026 • Enterprise Learning Cloud<br>
            Official Communications • <a href="${esc(portalUrl)}" style="color:#00D6D6;text-decoration:none;">campus.techgration.live</a>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { subject, html, text }
}

async function main() {
  console.log("==================================================")
  console.log("🪔 TECHGRATION DIWALI HOLIDAY BROADCAST ENGINE")
  console.log("==================================================\n")

  // 1. Fetch all distinct enrolled students
  console.log("1. Fetching all active enrolled students...")
  const enrollments = await db.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  })

  const studentMap = new Map<string, { id: string; name: string; email: string; courses: string[] }>()
  for (const e of enrollments) {
    if (!e.user || !e.user.email) continue
    if (!studentMap.has(e.user.id)) {
      studentMap.set(e.user.id, {
        id: e.user.id,
        name: e.user.name || "Student",
        email: e.user.email.trim(),
        courses: [e.course.title],
      })
    } else {
      const existing = studentMap.get(e.user.id)!
      if (!existing.courses.includes(e.course.title)) {
        existing.courses.push(e.course.title)
      }
    }
  }

  const students = Array.from(studentMap.values())
  console.log(`Found ${students.length} distinct enrolled students across all courses.`)

  // 2. Add instructor / admin copy
  const targets = [
    ...students.sort((a, b) => (a.email === "arunkumar0003578@gmail.com" ? -1 : 1)),
    {
      id: "instructor-copy",
      name: "Vineet Sir & Admin",
      email: "jaykumar0305@gmail.com",
      courses: ["All Courses (Instructor Copy)"],
    },
  ]

  console.log(`Total email delivery targets: ${targets.length}\n`)

  // 3. Create platform-wide Announcement
  console.log("2. Creating LMS System Announcement...")
  const announcement = await db.announcement.create({
    data: {
      title: "🪔 Happy Diwali & Festive Holiday Notice (6th & 7th Nov)",
      body: "Wishing all students and their families a joyous, bright, and prosperous Diwali! Please note that all live interactive classes are suspended on Friday (06 Nov) and Saturday (07 Nov) on account of Diwali celebrations. Regular live sessions resume next week as per timetable. The portal, Coding Arena, and lecture recordings remain 24/7 available. Happy Diwali!",
      targetRole: "ALL",
      publishedAt: new Date(),
    },
  })
  console.log(`✅ Announcement created (ID: ${announcement.id})`)

  // 4. Create in-app Notifications for all enrolled students
  console.log("\n3. Creating in-app notifications for all enrolled students...")
  const notificationsData = students.map((s) => ({
    userId: s.id,
    title: "🪔 Happy Diwali! Holiday Notice (Fri & Sat)",
    message: "All live classes are suspended on Friday (6 Nov) & Saturday (7 Nov) for Diwali. Wishing you and your family a joyful festival!",
    href: "/student/dashboard",
  }))

  const notifyResult = await db.notification.createMany({
    data: notificationsData,
  })
  console.log(`✅ Created ${notifyResult.count} in-app student notifications.\n`)

  // 5. Dispatch personalized emails with pacing
  console.log("4. Dispatching Diwali Holiday Emails to all recipients...")
  let sentCount = 0
  let failedCount = 0

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const rendered = buildDiwaliEmail(target.name)
    const isInstructorCopy = target.id === "instructor-copy"
    const subject = isInstructorCopy ? `[Instructor Copy] ${rendered.subject}` : rendered.subject

    try {
      await transporter.sendMail({
        from: `"TechGration Academic Office" <welcome@jashank.me>`,
        to: target.email,
        subject,
        text: rendered.text,
        html: rendered.html,
      })

      await db.emailLog.create({
        data: {
          toEmail: target.email,
          subject,
          template: "diwali-holiday-notice",
          status: "SENT",
        },
      }).catch(() => {})

      sentCount++
      console.log(`[${i + 1}/${targets.length}] ✅ Sent to ${target.email} (${target.name})`)
    } catch (err: any) {
      failedCount++
      console.error(`[${i + 1}/${targets.length}] ❌ Failed to ${target.email}:`, err.message)
    }

    // Pacing to respect Gmail SMTP rate limits (1.2s delay between messages)
    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 1200))
    }
  }

  console.log("\n==================================================")
  console.log(`🎉 DIWALI HOLIDAY BROADCAST COMPLETE!`)
  console.log(`Total Sent: ${sentCount} / ${targets.length}`)
  console.log(`Total Failed: ${failedCount}`)
  console.log("==================================================")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
