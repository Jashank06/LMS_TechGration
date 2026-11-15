import { db } from "@/server/db"
import { getClassRecipients } from "@/server/services/live-class-mailer"
import { classReminderEmail } from "@/server/email/templates"
import { transporter } from "@/server/email/mailer"

export async function dispatchReminder530Pm() {
  console.log("==================================================")
  console.log("⏰ AI CLASS 5 — 5:30 PM REMINDER DISPATCH ENGINE")
  console.log("==================================================")

  const courseId = "6ad283b4e196d0b8fbfb9eae"

  // Find today's scheduled Class 5
  const liveClass = await db.liveClass.findFirst({
    where: {
      courseId,
      startsAt: {
        gte: new Date("2026-11-13T00:00:00.000Z"),
        lt: new Date("2026-11-13T23:59:59.000Z"),
      },
      status: "SCHEDULED",
    },
    include: {
      course: true,
      dispatches: true,
    },
    orderBy: { startsAt: "asc" },
  })

  if (!liveClass) {
    console.error("❌ No scheduled AI class found for today (13 Nov 2026).")
    process.exit(1)
  }

  console.log(`Found Class: "${liveClass.title}" (ID: ${liveClass.id})`)
  console.log(`Starts at: ${liveClass.startsAt.toISOString()} (Today 6:00 PM IST)`)
  console.log(`Zoom URL: ${liveClass.meetingUrl}`)
  console.log(`Meeting ID: ${liveClass.meetingId}`)

  const students = await getClassRecipients(courseId)
  const targets = [
    ...students.sort((a, b) => (a.email === "arunkumar0003578@gmail.com" ? -1 : 1)),
    {
      id: "instructor",
      name: "Vineet Sir",
      email: "jaykumar0305@gmail.com",
      timezone: "Asia/Kolkata",
    },
  ]

  console.log(`Total reminder targets: ${targets.length}`)

  // Claim or find dispatch record for offsetMin: 30
  let dispatch = await db.reminderDispatch.findFirst({
    where: { liveClassId: liveClass.id, kind: "REMINDER", offsetMin: 30 },
  })

  if (!dispatch) {
    dispatch = await db.reminderDispatch.create({
      data: {
        liveClassId: liveClass.id,
        kind: "REMINDER",
        offsetMin: 30,
      },
    })
  }

  const base = {
    classId: liveClass.id,
    title: liveClass.title,
    courseTitle: liveClass.course.title,
    teacherName: liveClass.instructorName,
    startsAt: liveClass.startsAt,
    endsAt: liveClass.endsAt,
    platform: liveClass.platform as any,
    meetingUrl: liveClass.meetingUrl,
    meetingId: liveClass.meetingId,
    joinOpensMinBefore: liveClass.joinOpensMinBefore,
    offsetMin: 30,
  }

  let sentCount = 0
  let failedCount = 0

  console.log("\n🚀 Dispatching 5:30 PM reminder emails with active 'Join Classroom Now' button...")

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const rendered = classReminderEmail({
      ...base,
      recipientName: target.name,
      timezone: target.timezone,
    })

    const isTeacherCopy = target.id === "instructor"
    const subject = isTeacherCopy
      ? `[Instructor Copy] 🔴 30 min left — AI Class 5 starts at 6:00 PM (Zoom Join Link)`
      : `🔴 30 min left — Join AI Class 5 at 6:00 PM (Direct Zoom Link)`

    try {
      await transporter.sendMail({
        from: `"Vineet Sir • TechGration AI Academy" <welcome@jashank.me>`,
        replyTo: "jaykumar0305@gmail.com",
        to: target.email,
        subject,
        text: rendered.text,
        html: rendered.html,
        headers: {
          "X-Mailer": "TechGration LMS Academic Reminder v2.0",
          "X-Priority": "3",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
      })

      await db.emailLog
        .create({
          data: {
            toEmail: target.email,
            subject,
            template: "class-reminder-30m",
            liveClassId: liveClass.id,
            status: "SENT",
          },
        })
        .catch(() => {})

      sentCount++
      console.log(`[${i + 1}/${targets.length}] ✅ Reminder sent to ${target.email} (${target.name})`)
    } catch (err: any) {
      failedCount++
      console.error(`[${i + 1}/${targets.length}] ❌ Failed to ${target.email}:`, err.message)
    }

    // Pacing to respect Gmail SMTP rate limits
    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  // Update dispatch status
  await db.reminderDispatch.update({
    where: { id: dispatch.id },
    data: {
      recipients: targets.length,
      sentCount,
      failedCount,
      status: failedCount === 0 ? "SENT" : sentCount === 0 ? "FAILED" : "PARTIAL",
      completedAt: new Date(),
    },
  })

  // In-app notifications
  await db.notification
    .createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: "🔴 AI Class 5 Commencing in 30 Minutes!",
        message: "Your live Zoom room is now active. Click to join directly.",
        href: `/join/${liveClass.id}?direct=1`,
      })),
    })
    .catch(() => {})

  console.log(`\n🎉 5:30 PM REMINDER DISPATCH FINISHED: ${sentCount} sent, ${failedCount} failed.`)
}

if (require.main === module) {
  dispatchReminder530Pm()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("FATAL ERROR:", err)
      process.exit(1)
    })
}
