import { db } from "@/server/db"
import { getClassRecipients } from "@/server/services/live-class-mailer"
import { classReminderEmail } from "@/server/email/templates"
import { transporter } from "@/server/email/mailer"

async function dispatchReminder() {
  console.log("==================================================")
  console.log("⏰ AI CLASS 5 — 5:45 PM REMINDER DISPATCH ENGINE")
  console.log("==================================================")

  const courseId = "6ad283b4e196d0b8fbfb9eae"

  // Find today's Class 5
  const liveClass = await db.liveClass.findFirst({
    where: {
      courseId,
      startsAt: {
        gte: new Date("2026-11-07T00:00:00.000Z"),
        lt: new Date("2026-11-07T23:59:59.000Z"),
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
    console.error("❌ No scheduled AI class found for today (07 Nov 2026).")
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

  console.log(`Total recipient targets: ${targets.length}`)

  // Claim reminder dispatch row for offsetMin: 15
  let dispatch = await db.reminderDispatch.findFirst({
    where: { liveClassId: liveClass.id, kind: "REMINDER", offsetMin: 15 },
  })

  if (!dispatch) {
    dispatch = await db.reminderDispatch.create({
      data: {
        liveClassId: liveClass.id,
        kind: "REMINDER",
        offsetMin: 15,
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
    offsetMin: 15,
  }

  let sentCount = 0
  let failedCount = 0

  console.log("\n🚀 Dispatching 5:45 PM reminder emails with active 'Join Now' button...")

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const rendered = classReminderEmail({
      ...base,
      recipientName: target.name,
      timezone: target.timezone,
    })

    const isTeacherCopy = target.id === "instructor"
    const subject = isTeacherCopy ? `[Instructor copy] ${rendered.subject}` : rendered.subject

    try {
      await transporter.sendMail({
        from: `"TechGration LMS" <welcome@jashank.me>`,
        to: target.email,
        subject,
        text: rendered.text,
        html: rendered.html,
      })

      await db.emailLog.create({
        data: {
          toEmail: target.email,
          subject,
          template: "class-reminder-15",
          liveClassId: liveClass.id,
          status: "SENT",
        },
      }).catch(() => {})

      sentCount++
      console.log(`[${i + 1}/${targets.length}] ✅ 15m Reminder sent to ${target.email} (${target.name})`)
    } catch (err: any) {
      failedCount++
      console.error(`[${i + 1}/${targets.length}] ❌ Failed to ${target.email}:`, err.message)
    }

    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 1200))
    }
  }

  if (dispatch) {
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
  }

  // In-app notification for students with direct meeting link
  await db.notification.createMany({
    data: students.map((s) => ({
      userId: s.id,
      title: "🚀 AI Class 5 starts in 15 minutes!",
      message: "Click to join the live Zoom room with Vineet Sir now.",
      href: "/student/live-classes",
    })),
  }).catch(() => {})

  console.log(`\n🎉 5:45 PM REMINDER DISPATCH COMPLETE: ${sentCount} sent, ${failedCount} failed.`)
}

dispatchReminder()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
