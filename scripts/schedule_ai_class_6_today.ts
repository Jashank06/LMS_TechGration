import { db } from "../src/server/db"
import { getClassRecipients } from "../src/server/services/live-class-mailer"
import { buildIcs } from "../src/server/email/ics"
import { classScheduledEmail } from "../src/server/email/templates"
import { transporter } from "../src/server/email/mailer"

async function scheduleAiClass6Today() {
  const courseId = "6ad283b4e196d0b8fbfb9eae"
  const title = "Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 6"
  const description =
    "Live interactive engineering lecture: Deep Learning, CNNs, Transformers, and Practical Model Architectures with Vineet Sir. Keep your questions and coding setup ready."
  const instructorName = "Vineet Sir"
  const instructorId = "6acea351533d6b57ff7c5401"
  const startsAt = new Date("2026-11-14T12:30:00.000Z") // 6:00 PM IST Today (14 Nov 2026)
  const endsAt = new Date("2026-11-14T13:30:00.000Z")   // 7:00 PM IST Today (60 mins)
  const meetingUrl = "https://us06web.zoom.us/j/89733324596?pwd=llhJIKFkMOobo26FcqRPKJqY38QTQ7.1"
  const meetingId = "897 3332 4596"
  const platform = "ZOOM"

  console.log("==================================================")
  console.log("1. Scheduling AI Class 6 for Today (14 Nov 2026)...")
  console.log("==================================================")

  // Check if already created for today
  let liveClass = await db.liveClass.findFirst({
    where: {
      courseId,
      startsAt: {
        gte: new Date("2026-11-14T00:00:00.000Z"),
        lt: new Date("2026-11-14T23:59:59.000Z"),
      },
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
        title,
        meetingUrl,
        meetingId,
        startsAt,
        endsAt,
        status: "SCHEDULED",
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

  // 2. Create Community Post so learners in portal see it immediately
  try {
    const existingPost = await db.communityPost.findFirst({
      where: {
        title: { contains: "Class 6 Today" },
      },
    })

    if (!existingPost) {
      await db.communityPost.create({
        data: {
          authorId: instructorId,
          courseId,
          title: "Live Class Alert: AI & Modern Deep Learning Systems — Class 6 Today at 6:00 PM IST 🚀",
          content:
            "Attention AI Cohort Learners! Class 6 is commencing today at 6:00 PM IST.\n\n• Topic: Deep Learning Architectures, Model Optimization & Practical Implementation\n• Join directly via the Zoom link below\n• Ensure your Python and PyTorch environments are ready",
          category: "CLASS_RESCHEDULE",
          priority: "URGENT",
          isPinned: true,
          authorName: "Vineet Sir",
          authorRole: "TEACHER",
          actionUrl: meetingUrl,
          actionLabel: "Join Live Zoom Room",
          meetingUrl: meetingUrl,
          rescheduledStartsAt: startsAt,
        },
      })
      console.log("✅ Community Post published on student feed.")
    } else {
      await db.communityPost.update({
        where: { id: existingPost.id },
        data: {
          actionUrl: meetingUrl,
          meetingUrl: meetingUrl,
          rescheduledStartsAt: startsAt,
          isPinned: true,
        },
      })
      console.log("✅ Existing Community Post updated.")
    }
  } catch (err: any) {
    console.error("Warning: could not update community post:", err.message)
  }

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
    description: `Live lecture by ${liveClass.instructorName}. Topic: Deep Learning Architectures & Implementation. Zoom Link: ${liveClass.meetingUrl}`,
    startsAt: liveClass.startsAt,
    endsAt: liveClass.endsAt,
    url: liveClass.meetingUrl,
    organizerName: liveClass.instructorName,
    organizerEmail: "welcome@jashank.me",
    cancelled: false,
  })

  let sentCount = 0
  let failedCount = 0

  console.log("\n3. Dispatching urgent live class announcement emails to all enrolled learners...")

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const rendered = classScheduledEmail({
      ...base,
      recipientName: target.name,
      timezone: target.timezone,
    })

    const isTeacherCopy = target.id === "instructor"
    const subject = isTeacherCopy
      ? `[Instructor Copy] 🔴 Starting at 6:00 PM: AI Class 6 (Direct Zoom Link)`
      : `🔴 Starting at 6:00 PM: AI Class 6 (Direct Zoom Link)`

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
          "X-Priority": "1", // High priority since class is in 10 mins
          "Importance": "high",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
        attachments: icsBody
          ? [
              {
                filename: "ai_class_6_invite.ics",
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

    // Pacing: 500ms between sends (delivers all ~93 emails in ~45 seconds)
    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 500))
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
        title: "🔴 AI Live Class 6 Starting at 6:00 PM IST",
        message:
          "Advanced Deep Learning Architectures with Vineet Sir. Direct Zoom Join Link is active now.",
        href: meetingUrl,
      })),
    })
    .catch(() => {})

  console.log(`\n🎉 AI CLASS 6 SCHEDULE & JOIN DISPATCH COMPLETE: ${sentCount} sent, ${failedCount} failed.`)
  console.log(`LiveClass ID: ${liveClass.id}`)
}

scheduleAiClass6Today()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
