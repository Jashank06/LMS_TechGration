import { db } from "@/server/db"
import { getClassRecipients } from "@/server/services/live-class-mailer"
import { buildIcs } from "@/server/email/ics"
import { classScheduledEmail } from "@/server/email/templates"
import { transporter } from "@/server/email/mailer"

async function scheduleAiClass5Today() {
  const courseId = "6ad283b4e196d0b8fbfb9eae"
  const title = "Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 5"
  const description =
    "Live interactive engineering lecture on Advanced Deep Learning Architectures, Model Fine-Tuning, and Production AI Pipelines with Vineet Sir. Keep your questions and coding setup ready."
  const instructorName = "Vineet Sir"
  const instructorId = "6acea351533d6b57ff7c5401"
  const startsAt = new Date("2026-11-13T12:30:00.000Z") // 6:00 PM IST Today (13 Nov 2026)
  const endsAt = new Date("2026-11-13T13:30:00.000Z")   // 7:00 PM IST Today (60 mins)
  const meetingUrl = "https://us06web.zoom.us/j/86247538542?pwd=FG0rPUChGz75q1pj8BaI6lIklpW2do.1"
  const meetingId = "862 4753 8542"
  const platform = "ZOOM"

  console.log("==================================================")
  console.log("1. Scheduling AI Class 5 for Today (13 Nov 2026)...")
  console.log("==================================================")

  // Check if already created
  let liveClass = await db.liveClass.findFirst({
    where: {
      courseId,
      startsAt: {
        gte: new Date("2026-11-13T00:00:00.000Z"),
        lt: new Date("2026-11-13T23:59:59.000Z"),
      },
      status: "SCHEDULED",
    },
    include: { course: true },
  })

  if (!liveClass) {
    liveClass = await db.liveClass.create({
      data: {
        courseId,
        title,
        description,
        instructorName,
        instructorId,
        startsAt,
        endsAt,
        timezone: "Asia/Kolkata",
        platform,
        meetingUrl,
        meetingId,
        reminderOffsetsMin: [30, 15],
        joinOpensMinBefore: 30,
        status: "SCHEDULED",
      },
      include: {
        course: true,
      },
    })
    console.log("✅ Created fresh LiveClass in MongoDB:")
  } else {
    // Update meeting url if changed
    liveClass = await db.liveClass.update({
      where: { id: liveClass.id },
      data: {
        meetingUrl,
        meetingId,
        startsAt,
        endsAt,
        joinOpensMinBefore: 30,
      },
      include: { course: true },
    })
    console.log("✅ Updated existing scheduled LiveClass in MongoDB:")
  }

  console.log("ID:", liveClass.id)
  console.log("Title:", liveClass.title)
  console.log("Starts at:", liveClass.startsAt.toISOString(), "(Today, 6:00 PM IST)")
  console.log("Zoom URL:", liveClass.meetingUrl)
  console.log("Meeting ID:", liveClass.meetingId)

  console.log("\n2. Fetching enrolled students...")
  const students = await getClassRecipients(courseId)
  console.log(`Found ${students.length} active enrolled students in AI course.`)

  // Target list: Aarav first, then other students, plus instructor Vineet Sir
  const targets = [
    ...students.sort((a, b) => (a.email === "arunkumar0003578@gmail.com" ? -1 : 1)),
    {
      id: "instructor",
      name: "Vineet Sir",
      email: "jaykumar0305@gmail.com",
      timezone: "Asia/Kolkata",
    },
  ]

  console.log(`Total email targets: ${targets.length}`)

  // Create or retrieve dispatch record for SCHEDULED
  let dispatch = await db.reminderDispatch.findFirst({
    where: { liveClassId: liveClass.id, kind: "SCHEDULED", offsetMin: 0 },
  })
  if (!dispatch) {
    dispatch = await db.reminderDispatch.create({
      data: {
        liveClassId: liveClass.id,
        kind: "SCHEDULED",
        offsetMin: 0,
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
  }

  // Generate calendar invite .ics
  const icsBody = buildIcs({
    uid: liveClass.id,
    title: `${liveClass.title} — ${liveClass.course.title}`,
    description: `Live lecture by ${liveClass.instructorName}. Topic: Deep Learning Architectures & Pipelines. Meeting Link: ${liveClass.meetingUrl}`,
    startsAt: liveClass.startsAt,
    endsAt: liveClass.endsAt,
    url: liveClass.meetingUrl,
    organizerName: liveClass.instructorName,
    organizerEmail: "welcome@jashank.me",
    cancelled: false,
  })

  let sentCount = 0
  let failedCount = 0

  console.log("\n3. Dispatching anti-spam optimized schedule emails to all enrolled learners...")

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const rendered = classScheduledEmail({
      ...base,
      recipientName: target.name,
      timezone: target.timezone,
    })

    const isTeacherCopy = target.id === "instructor"
    const subject = isTeacherCopy
      ? `[Instructor Copy] Live Class Today at 6:00 PM: AI & Deep Learning Systems — Class 5`
      : `Live Class Today at 6:00 PM: AI & Deep Learning Systems — Class 5`

    try {
      await transporter.sendMail({
        from: `"Vineet Sir • TechGration AI Academy" <welcome@jashank.me>`,
        replyTo: "jaykumar0305@gmail.com",
        to: target.email,
        subject,
        text: rendered.text,
        html: rendered.html,
        headers: {
          "X-Mailer": "TechGration LMS Academic Dispatcher v2.0",
          "X-Priority": "3",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
        attachments: icsBody
          ? [
              {
                filename: "ai_class_5_invite.ics",
                content: icsBody,
                contentType: "text/calendar; method=REQUEST",
              },
            ]
          : undefined,
      })

      await db.emailLog
        .create({
          data: {
            toEmail: target.email,
            subject,
            template: "class-scheduled",
            liveClassId: liveClass.id,
            status: "SENT",
          },
        })
        .catch(() => {})

      sentCount++
      console.log(`[${i + 1}/${targets.length}] ✅ Delivered to ${target.email} (${target.name})`)
    } catch (err: any) {
      failedCount++
      console.error(`[${i + 1}/${targets.length}] ❌ Failed to ${target.email}:`, err.message)
    }

    // Polite pacing to respect Gmail SMTP rate limits (1 second delay)
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

  // In-app notifications for all students
  await db.notification
    .createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: "📅 AI Live Class 5 Scheduled for Today (6:00 PM IST)",
        message:
          "Advanced Deep Learning Architectures with Vineet Sir. Direct Zoom Join Link will be active at 5:30 PM.",
        href: "/student/live-classes",
      })),
    })
    .catch(() => {})

  console.log(`\n🎉 AI CLASS 5 SCHEDULE DISPATCH COMPLETE: ${sentCount} sent, ${failedCount} failed.`)
  console.log(`LiveClass ID: ${liveClass.id}`)
}

scheduleAiClass5Today()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
