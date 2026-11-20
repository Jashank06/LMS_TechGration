import { db } from "../src/server/db"
import { getClassRecipients } from "../src/server/services/live-class-mailer"
import { buildIcs } from "../src/server/email/ics"
import { transporter } from "../src/server/email/mailer"

const APP_URL = "https://campus.techgration.live"

function esc(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function renderClass7Email(opts: {
  recipientName: string
  title: string
  courseTitle: string
  teacherName: string
  startsAt: Date
  endsAt: Date
  meetingUrl: string
  meetingId: string
  isTeacherCopy?: boolean
}) {
  const {
    recipientName,
    title,
    courseTitle,
    teacherName,
    startsAt,
    meetingUrl,
    meetingId,
    isTeacherCopy,
  } = opts

  const accent = "#00D6D6"
  const formattedTime = "Today (Fri, 20 Nov 2026) · 6:00 PM IST"
  const subject = isTeacherCopy
    ? `[Instructor Copy] 🔴 Class 7 Starting at 6:00 PM: AI & Modern Deep Learning Systems`
    : `🔴 Class 7 Starting at 6:00 PM: AI & Modern Deep Learning Systems (Direct Zoom Link)`

  const text = `Hi ${recipientName},

Your live class for "${courseTitle}" is scheduled for today at 6:00 PM IST!

Session: ${title}
Instructor: ${teacherName}
Time: ${formattedTime} (75 mins)
Platform: Zoom
Meeting ID: ${meetingId}

👉 Direct Zoom Join Link:
${meetingUrl}

A calendar invite (.ics) is attached to this email. Please join 5 minutes early so we can start promptly.

Student Portal: ${APP_URL}/student/live-classes

Best regards,
Vineet Sir & TechGration AI Academy Team`

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
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#11161B;border:1px solid ${accent}45;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0A0E12 0%,#131D24 100%);padding:26px 32px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;">
            <div style="font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">TechGration AI Academy</div>
            <div style="font-size:11px;color:${accent};text-transform:uppercase;letter-spacing:2.5px;font-weight:700;margin-top:5px;">Live Class Alert · Class 7</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <div style="font-size:20px;font-weight:700;color:#F8FAFC;margin-bottom:12px;line-height:1.35;">
              🔴 AI Live Class 7 Today at 6:00 PM IST
            </div>

            <p style="font-size:14px;line-height:1.65;color:#94A3B8;margin:0 0 16px;">
              Hi <strong style="color:#F1F5F9;">${esc(recipientName)}</strong>, get ready for today's live engineering lecture. We will be diving into advanced model architectures, transformers, and practical implementations.
            </p>

            <!-- Class Card -->
            <div style="background:${accent}12;border:1px solid ${accent}50;border-radius:14px;padding:20px;margin:16px 0 20px;">
              <div style="font-size:16px;font-weight:700;color:#FFFFFF;margin-bottom:8px;">
                ${esc(title)}
              </div>
              <div style="font-size:13px;color:#94A3B8;line-height:1.9;">
                📚 <strong style="color:#CBD5E1;">Course:</strong> ${esc(courseTitle)}<br/>
                👨‍🏫 <strong style="color:#CBD5E1;">Instructor:</strong> ${esc(teacherName)}<br/>
                🕗 <strong style="color:#CBD5E1;">Schedule:</strong> <strong style="color:#38BDF8;">${formattedTime}</strong> (75 mins)<br/>
                💻 <strong style="color:#CBD5E1;">Platform:</strong> Zoom Meeting<br/>
                🆔 <strong style="color:#CBD5E1;">Meeting ID:</strong> <span style="font-family:monospace;color:#F8FAFC;background:#1E293B;padding:2px 8px;border-radius:6px;">${esc(meetingId)}</span>
              </div>
            </div>

            <!-- Join Button -->
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px auto 12px;width:100%;max-width:340px;">
              <tr>
                <td style="background:${accent};border-radius:12px;text-align:center;box-shadow:0 6px 20px rgba(0,214,214,0.35);">
                  <a href="${esc(meetingUrl)}" style="display:block;padding:15px 28px;font-size:16px;font-weight:700;color:#041F1E;text-decoration:none;letter-spacing:-0.2px;">
                    🚀 Join Live Zoom Class
                  </a>
                </td>
              </tr>
            </table>

            <div style="text-align:center;font-size:12px;color:#64748B;margin-top:10px;line-height:1.7;">
              Or open the Zoom link directly in your browser or app:<br/>
              <a href="${esc(meetingUrl)}" style="color:${accent};word-break:break-all;text-decoration:none;">${esc(meetingUrl)}</a>
            </div>

            <!-- Calendar & Portal Notes -->
            <div style="background:#0F172A;border:1px solid #1E293B;border-radius:12px;padding:14px 18px;margin:22px 0 10px;font-size:12px;color:#94A3B8;line-height:1.65;">
              <strong style="color:#E2E8F0;">🗓️ Calendar Invite Attached:</strong> An <code>.ics</code> invite is attached to this email so you can add it to your Google Calendar or Apple Calendar with 1 click.<br/>
              <strong style="color:#E2E8F0;">💻 Student Portal:</strong> You can also access the session directly from your <a href="${APP_URL}/student/live-classes" style="color:${accent};text-decoration:none;">TechGration Student Portal</a>.
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0D1115;padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:12px;color:#64748B;">
            TechGration Technologies Pvt. Ltd. © 2026 · Need help? <a href="mailto:support@techgration.live" style="color:${accent};text-decoration:none;">support@techgration.live</a>
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

async function scheduleAiClass7Today() {
  const courseId = "6ad283b4e196d0b8fbfb9eae"
  const title = "Live Class: Artificial Intelligence & Modern Deep Learning Systems — Class 7"
  const description =
    "Live interactive engineering lecture: Advanced Neural Architectures, Transformers, Fine-Tuning & Practical Implementation with Vineet Sir. Keep your questions and coding setup ready."
  const instructorName = "Vineet Sir"
  const instructorId = "6acea351533d6b57ff7c5401"
  const startsAt = new Date("2026-11-20T12:30:00.000Z") // 6:00 PM IST Today (20 Nov 2026)
  const endsAt = new Date("2026-11-20T13:45:00.000Z")   // 7:15 PM IST Today (75 mins)
  const meetingUrl = "https://us06web.zoom.us/j/85388390423?pwd=RknbRpd90eEk4tcy7c65NzHbOaXfBV.1"
  const meetingId = "853 8839 0423"
  const platform = "ZOOM"

  console.log("==================================================")
  console.log("1. Scheduling AI Class 7 for Today (20 Nov 2026)...")
  console.log("==================================================")

  // 1. Check if already created for today
  let liveClass = await db.liveClass.findFirst({
    where: {
      courseId,
      startsAt: {
        gte: new Date("2026-11-20T00:00:00.000Z"),
        lt: new Date("2026-11-20T23:59:59.000Z"),
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
    liveClass = await db.liveClass.update({
      where: { id: liveClass.id },
      data: {
        title,
        description,
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

  // 2. Publish or update Pinned Community Feed Post
  try {
    const existingPost = await db.communityPost.findFirst({
      where: {
        title: { contains: "Class 7 Today" },
      },
    })

    if (!existingPost) {
      await db.communityPost.create({
        data: {
          authorId: instructorId,
          courseId,
          title: "Live Class Alert: AI & Modern Deep Learning Systems — Class 7 Today at 6:00 PM IST 🚀",
          content:
            "Attention AI Cohort Learners! Class 7 is commencing today at 6:00 PM IST.\n\n• Topic: Advanced Neural Architectures, Transformers, Fine-Tuning & Practical Implementation\n• Join directly via the Zoom link below\n• Ensure your Python and PyTorch environments are ready",
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
      console.log("✅ Pinned Community Post published on student feed.")
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

  // 3. Fetch active enrolled students
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

  // 4. Create in-app notifications
  try {
    await db.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: "🔴 AI Live Class 7 Today at 6:00 PM IST",
        message:
          "Advanced Deep Learning & Transformers with Vineet Sir. Direct Zoom Join Link is active now.",
        href: meetingUrl,
      })),
    })
    console.log(`✅ Pushed ${students.length} in-app portal notifications.`)
  } catch (err: any) {
    console.error("Warning: could not push notifications:", err.message)
  }

  // 5. Create or retrieve dispatch record for SCHEDULED
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

  // 6. Generate calendar invite .ics
  const icsBody = buildIcs({
    uid: liveClass.id,
    title: `${liveClass.title} — ${liveClass.course.title}`,
    description: `Live lecture by ${liveClass.instructorName}. Topic: Advanced Neural Architectures & Transformers. Meeting Link: ${liveClass.meetingUrl}`,
    startsAt: liveClass.startsAt,
    endsAt: liveClass.endsAt,
    url: liveClass.meetingUrl,
    organizerName: liveClass.instructorName,
    organizerEmail: "welcome@jashank.me",
    cancelled: false,
  })

  let sentCount = 0
  let failedCount = 0

  console.log("\n3. Dispatching high-priority announcement emails to all enrolled learners...")

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const isTeacherCopy = target.id === "instructor"

    const rendered = renderClass7Email({
      recipientName: target.name,
      title: liveClass.title,
      courseTitle: liveClass.course.title,
      teacherName: liveClass.instructorName,
      startsAt: liveClass.startsAt,
      endsAt: liveClass.endsAt,
      meetingUrl: liveClass.meetingUrl,
      meetingId: liveClass.meetingId || "853 8839 0423",
      isTeacherCopy,
    })

    try {
      await transporter.sendMail({
        from: `"Vineet Sir • TechGration AI Academy" <welcome@jashank.me>`,
        replyTo: "jaykumar0305@gmail.com",
        to: target.email,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
        headers: {
          "X-Mailer": "TechGration LMS Academic Dispatcher v2.0",
          "X-Priority": "1",
          "Importance": "high",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
        attachments: icsBody
          ? [
              {
                filename: "ai_class_7_invite.ics",
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
            subject: rendered.subject,
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

    // Pacing: 500ms between sends (delivers ~122 emails in ~60 seconds smoothly)
    if (i < targets.length - 1) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  // 7. Update dispatch status
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

  console.log("\n==================================================")
  console.log(`🎉 AI CLASS 7 SCHEDULE & DISPATCH COMPLETE: ${sentCount} sent, ${failedCount} failed.`)
  console.log(`LiveClass ID: ${liveClass.id}`)
  console.log("==================================================")
}

scheduleAiClass7Today()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
