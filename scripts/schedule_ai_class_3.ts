import { db } from "@/server/db"
import { getClassRecipients } from "@/server/services/live-class-mailer"
import { buildIcs } from "@/server/email/ics"
import { classScheduledEmail } from "@/server/email/templates"
import { transporter } from "@/server/email/mailer"

async function scheduleAiClass3() {
  const courseId = "6ad283b4e196d0b8fbfb9eae"
  const title = "Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 3"
  const description = "Interactive engineering lecture on Deep Learning Architectures, Transformers, Multi-Head Attention Mechanisms, and Practical Implementation with Vineet Sir. Join on time with your questions ready."
  const instructorName = "Vineet Sir"
  const instructorId = "6acea351533d6b57ff7c5401"
  const startsAt = new Date("2026-10-30T12:30:00.000Z") // 6:00 PM IST
  const endsAt = new Date("2026-10-30T14:00:00.000Z")   // 7:30 PM IST (90 mins)
  const meetingUrl = "https://us06web.zoom.us/j/81921050081?pwd=NQaWfRADJ6x5SGJiYrpMh8Z9mr7v8l.1"
  const meetingId = "819 2105 0081"
  const platform = "ZOOM"

  console.log("1. Creating AI Class 3 in database...")
  const liveClass = await db.liveClass.create({
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
      joinOpensMinBefore: 15,
      status: "SCHEDULED",
    },
    include: {
      course: true,
    },
  })

  console.log("✅ Class Created in LMS:")
  console.log("ID:", liveClass.id)
  console.log("Title:", liveClass.title)
  console.log("Course:", liveClass.course.title)
  console.log("Time: Today, 30 Oct 2026 at 06:00 PM IST")
  console.log("Zoom:", liveClass.meetingUrl)
  console.log("Meeting ID:", liveClass.meetingId)

  console.log("\n2. Fetching enrolled students...")
  const students = await getClassRecipients(courseId)
  console.log(`Found ${students.length} active enrolled students.`)

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

  // Create claimed dispatch row for SCHEDULED
  const dispatch = await db.reminderDispatch.create({
    data: {
      liveClassId: liveClass.id,
      kind: "SCHEDULED",
      offsetMin: 0,
    },
  })

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
    description: `Live class by ${liveClass.instructorName}. Meeting Link: ${liveClass.meetingUrl}`,
    startsAt: liveClass.startsAt,
    endsAt: liveClass.endsAt,
    url: liveClass.meetingUrl,
    organizerName: liveClass.instructorName,
    organizerEmail: "welcome@jashank.me",
    cancelled: false,
  })

  let sentCount = 0
  let failedCount = 0

  console.log("\n3. Dispatching schedule notification emails to all enrolled students...")

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const rendered = classScheduledEmail({
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
        attachments: icsBody
          ? [
              {
                filename: "class-invite.ics",
                content: icsBody,
                contentType: "text/calendar; method=REQUEST",
              },
            ]
          : undefined,
      })

      await db.emailLog.create({
        data: {
          toEmail: target.email,
          subject,
          template: "class-scheduled",
          liveClassId: liveClass.id,
          status: "SENT",
        },
      }).catch(() => {})

      sentCount++
      console.log(`[${i + 1}/${targets.length}] ✅ Sent to ${target.email}`)
    } catch (err: any) {
      failedCount++
      console.error(`[${i + 1}/${targets.length}] ❌ Failed to ${target.email}:`, err.message)
    }

    // Respect Gmail rate limit (1.2s delay between sends)
    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 1200))
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
  await db.notification.createMany({
    data: students.map((s) => ({
      userId: s.id,
      title: "📅 AI Live Class 3 Scheduled (Today 6:00 PM)",
      message: "Deep Learning Architectures & Transformers with Vineet Sir. Join link will be sent at 5:30 PM.",
      href: "/student/live-classes",
    })),
  }).catch(() => {})

  console.log(`\n🎉 CLASS 3 SCHEDULE DISPATCH COMPLETE: ${sentCount} sent, ${failedCount} failed.`)
  console.log(`LiveClass ID: ${liveClass.id}`)
}

scheduleAiClass3()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
