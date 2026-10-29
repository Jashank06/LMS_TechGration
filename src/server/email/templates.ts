/**
 * Branded transactional email templates (cyber-metallic dark theme).
 * Every template returns { subject, html, text } so callers can pass it to sendMail().
 */

const rawAppUrl =
  process.env.PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  "https://campus.techgration.live"

// In outbound emails sent to learners, never send localhost links; always use the production domain.
export const APP_URL = (
  rawAppUrl.includes("localhost") ? "https://campus.techgration.live" : rawAppUrl
).replace(/\/$/, "")

export interface RenderedMail {
  subject: string
  html: string
  text: string
}

export type PlatformKey = "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "CUSTOM"

export const PLATFORM_LABEL: Record<PlatformKey, string> = {
  ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet",
  TEAMS: "Microsoft Teams",
  CUSTOM: "Online Meeting",
}

export function esc(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** "Wed, 15 Oct 2026 · 8:00 PM IST" rendered in the recipient's timezone */
export function formatWhen(date: Date, timezone = "Asia/Kolkata"): string {
  try {
    const day = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: timezone,
    }).format(date)
    const time = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
      timeZoneName: "short",
    }).format(date)
    return `${day} · ${time.toUpperCase()}`
  } catch {
    return date.toISOString()
  }
}

function layout(opts: {
  accent: string
  eyebrow: string
  heading: string
  bodyHtml: string
}): string {
  const { accent, eyebrow, heading, bodyHtml } = opts
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#080B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E2E8F0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080B0E;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#11161B;border:1px solid ${accent}40;border-radius:16px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#0A0E12 0%,#161F26 100%);padding:26px 32px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;">
    <div style="font-size:21px;font-weight:700;color:#FFFFFF;letter-spacing:-0.4px;">TechGration LMS</div>
    <div style="font-size:11px;color:${accent};text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-top:4px;">${esc(eyebrow)}</div>
  </td></tr>
  <tr><td style="padding:30px 32px;">
    <div style="font-size:19px;font-weight:700;color:#F8FAFC;margin-bottom:14px;">${esc(heading)}</div>
    ${bodyHtml}
  </td></tr>
  <tr><td style="background:#0D1115;padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;font-size:12px;color:#64748B;">
    TechGration Technologies © 2026 · Need help? <a href="mailto:support@techgration.com" style="color:${accent};text-decoration:none;">support@techgration.com</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

function button(label: string, href: string, accent: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px auto 6px;"><tr><td style="background:${accent};border-radius:10px;">
<a href="${esc(href)}" style="display:inline-block;padding:13px 30px;font-size:15px;font-weight:700;color:#06201F;text-decoration:none;">${esc(label)}</a>
</td></tr></table>`
}

function p(html: string): string {
  return `<p style="font-size:14px;line-height:1.65;color:#94A3B8;margin:0 0 14px;">${html}</p>`
}

/* ------------------------------ Onboarding ------------------------------ */

export function inviteEmail(input: {
  name: string
  email: string
  role: "TEACHER" | "STUDENT" | "ADMIN" | "SUPER_ADMIN"
  invitedBy?: string
}): RenderedMail {
  const roleLabel = input.role === "TEACHER" ? "Instructor" : input.role === "STUDENT" ? "Learner" : "Administrator"
  const link = `${APP_URL}/forgot-password?email=${encodeURIComponent(input.email)}`
  const accent = "#00D6D6"
  return {
    subject: `You're invited to TechGration LMS as ${roleLabel}`,
    text: `Hi ${input.name},\n\n${input.invitedBy || "An administrator"} created your ${roleLabel} account on TechGration LMS.\nSet your password here: ${link}\n(You will receive a 6-digit verification code to confirm your email.)`,
    html: layout({
      accent,
      eyebrow: "Account Invitation",
      heading: `Welcome aboard, ${input.name}!`,
      bodyHtml:
        p(`${esc(input.invitedBy || "An administrator")} has created your <strong style="color:#E2E8F0;">${roleLabel}</strong> account on TechGration LMS using <strong style="color:#E2E8F0;">${esc(input.email)}</strong>.`) +
        p(`Click below to set your password. You'll receive a one-time 6-digit code on this email to verify it's you.`) +
        button("Set My Password", link, accent) +
        p(`<span style="font-size:12px;color:#64748B;">If the button doesn't work, open: ${esc(link)}</span>`),
    }),
  }
}

export function courseAssignedTeacherEmail(input: {
  teacherName: string
  courseTitle: string
  studentCount: number
}): RenderedMail {
  const accent = "#1EC98F"
  const link = `${APP_URL}/teacher/courses`
  return {
    subject: `You are now the instructor of "${input.courseTitle}"`,
    text: `Hi ${input.teacherName}, you've been assigned to teach "${input.courseTitle}" (${input.studentCount} learners enrolled). Open: ${link}`,
    html: layout({
      accent,
      eyebrow: "Course Assignment",
      heading: "New course assigned to you",
      bodyHtml:
        p(`Hi <strong style="color:#E2E8F0;">${esc(input.teacherName)}</strong>, you have been assigned as the instructor of:`) +
        `<div style="background:${accent}12;border:1px solid ${accent}55;border-radius:12px;padding:16px;margin:6px 0 16px;">
          <div style="font-size:16px;font-weight:700;color:#F8FAFC;">${esc(input.courseTitle)}</div>
          <div style="font-size:12px;color:#94A3B8;margin-top:4px;">${input.studentCount} learner(s) currently enrolled</div>
        </div>` +
        p("You can now schedule live classes for this course. Enrolled learners will be emailed automatically, with reminders before every session.") +
        button("Open Instructor Portal", link, accent),
    }),
  }
}

export function courseEnrolledStudentEmail(input: {
  studentName: string
  courseTitle: string
  teacherName?: string | null
}): RenderedMail {
  const accent = "#00D6D6"
  const link = `${APP_URL}/student/my-courses`
  return {
    subject: `You're enrolled in "${input.courseTitle}"`,
    text: `Hi ${input.studentName}, you have been enrolled in "${input.courseTitle}"${input.teacherName ? ` taught by ${input.teacherName}` : ""}. Open: ${link}`,
    html: layout({
      accent,
      eyebrow: "Enrollment Confirmed",
      heading: "You're in! 🎓",
      bodyHtml:
        p(`Hi <strong style="color:#E2E8F0;">${esc(input.studentName)}</strong>, you have been enrolled in:`) +
        `<div style="background:${accent}12;border:1px solid ${accent}55;border-radius:12px;padding:16px;margin:6px 0 16px;">
          <div style="font-size:16px;font-weight:700;color:#F8FAFC;">${esc(input.courseTitle)}</div>
          ${input.teacherName ? `<div style="font-size:12px;color:#94A3B8;margin-top:4px;">Instructor: ${esc(input.teacherName)}</div>` : ""}
        </div>` +
        p("Live class schedules and reminders will arrive in your inbox. You can also join sessions from your Live Classes page.") +
        button("Go to My Courses", link, accent),
    }),
  }
}

/* ---------------------------- Live class mails ---------------------------- */

export interface LiveClassMailData {
  classId: string
  title: string
  courseTitle: string
  teacherName: string
  startsAt: Date
  endsAt: Date
  platform: PlatformKey
  meetingUrl: string
  meetingId?: string | null
  meetingPasscode?: string | null
  recipientName: string
  timezone?: string
  joinOpensMinBefore?: number
  /** Only for reminder mails */
  offsetMin?: number
  /** Only for reschedule mails */
  oldStartsAt?: Date
  /** Optional reason on cancel */
  reason?: string | null
}

function classCard(d: LiveClassMailData, accent: string): string {
  const tz = d.timezone || "Asia/Kolkata"
  const mins = Math.max(1, Math.round((d.endsAt.getTime() - d.startsAt.getTime()) / 60000))
  return `<div style="background:${accent}10;border:1px solid ${accent}55;border-radius:12px;padding:18px;margin:6px 0 16px;">
    <div style="font-size:17px;font-weight:700;color:#F8FAFC;margin-bottom:6px;">${esc(d.title)}</div>
    <div style="font-size:13px;color:#94A3B8;line-height:1.8;">
      📚 ${esc(d.courseTitle)}<br/>
      👨‍🏫 ${esc(d.teacherName)}<br/>
      🕗 <strong style="color:#E2E8F0;">${esc(formatWhen(d.startsAt, tz))}</strong> (${mins} min)<br/>
      💻 ${PLATFORM_LABEL[d.platform]}${d.meetingPasscode ? ` · 🔐 Passcode: <strong style="color:#F8FAFC;">${esc(d.meetingPasscode)}</strong>` : ""}${d.meetingId ? ` · ID: <span style="font-family:monospace;">${esc(d.meetingId)}</span>` : ""}
    </div>
  </div>`
}

function joinBlock(d: LiveClassMailData, accent: string): string {
  const meetingUrl = d.meetingUrl?.trim() || `${APP_URL}/join/${d.classId}`
  return (
    button("Join Now", meetingUrl, accent) +
    (d.meetingPasscode
      ? `<div style="text-align:center;font-size:13px;font-weight:600;color:#F8FAFC;margin:10px 0 4px;">🔐 Meeting Passcode: <span style="font-family:monospace;background:#334155;color:#38BDF8;padding:3px 10px;border-radius:6px;letter-spacing:1px;">${esc(d.meetingPasscode)}</span></div>`
      : "") +
    `<div style="text-align:center;font-size:12px;color:#64748B;margin-top:10px;line-height:1.7;">
      Or open the meeting link directly:<br/>
      <a href="${esc(meetingUrl)}" style="color:${accent};word-break:break-all;">${esc(meetingUrl)}</a>
    </div>`
  )
}

export function classScheduledEmail(d: LiveClassMailData): RenderedMail {
  const accent = "#00D6D6"
  const when = formatWhen(d.startsAt, d.timezone)
  const portalUrl = `${APP_URL}/student/live-classes`
  const isImminent = d.startsAt.getTime() - Date.now() <= 30 * 60 * 1000

  return {
    subject: isImminent
      ? `🚀 Starting Soon — ${d.title} at ${formatWhen(d.startsAt, d.timezone)}`
      : `📅 Class scheduled: ${d.title} — ${when}`,
    text: isImminent
      ? `Hi ${d.recipientName}, "${d.title}" is starting soon at ${when}.\nPlatform: ${PLATFORM_LABEL[d.platform]}\nMeeting Link: ${d.meetingUrl}${d.meetingPasscode ? `\nPasscode: ${d.meetingPasscode}` : ""}\n\nJoin Now: ${d.meetingUrl}\nOr open student portal: ${portalUrl}`
      : `Hi ${d.recipientName}, "${d.title}" (${d.courseTitle}) by ${d.teacherName} is scheduled for ${when}.\nPlatform: ${PLATFORM_LABEL[d.platform]}\n\nA calendar invite (.ics) is attached to this email so you can add it to your calendar.\n\nNOTE: The active Join Classroom link will be emailed to you 30 minutes before the session starts, and will also unlock on your student portal at that time.\nView schedule on portal: ${portalUrl}`,
    html: layout({
      accent,
      eyebrow: isImminent ? "Workshop Starting Soon" : "Live Class Scheduled",
      heading: isImminent ? `🚀 ${d.title} starts soon!` : `Live class scheduled, ${d.recipientName}!`,
      bodyHtml:
        (isImminent
          ? p(`Hi <strong style="color:#E2E8F0;">${esc(d.recipientName)}</strong>, your live workshop is starting shortly. Please keep your setup ready and join on time!`)
          : p("A new live session has been scheduled for your course. Please add it to your calendar using the attached invite.")) +
        classCard(d, accent) +
        (isImminent
          ? joinBlock(d, accent)
          : `<div style="background:#0F172A;border:1px dashed #334155;border-radius:12px;padding:14px 16px;margin:16px 0;font-size:13px;line-height:1.6;color:#94A3B8;">
              <div style="font-weight:700;color:#F8FAFC;margin-bottom:4px;">⏰ Active Join Link Delivery</div>
              The active <strong>Join Classroom</strong> button will be emailed to you <strong>30 minutes before the session begins</strong>, and will also unlock directly on your student portal at that time.
            </div>` +
            button("View Class Schedule", portalUrl, accent)),
    }),
  }
}

export function classReminderEmail(d: LiveClassMailData): RenderedMail {
  const accent = "#FFB547"
  const offset = d.offsetMin ?? 15
  const when = formatWhen(d.startsAt, d.timezone)
  return {
    subject: `⏰ ${offset} min left — ${d.title} starts ${when}`,
    text: `Hi ${d.recipientName}, "${d.title}" starts in ${offset} minutes (${when}).\nMeeting link: ${d.meetingUrl}`,
    html: layout({
      accent,
      eyebrow: `Starts in ${offset} minutes`,
      heading: `⏰ ${d.title} starts in ${offset} min`,
      bodyHtml:
        p(`Hi <strong style="color:#E2E8F0;">${esc(d.recipientName)}</strong>, your live class is about to begin. Keep your mic and camera ready.`) +
        classCard(d, accent) +
        joinBlock(d, accent),
    }),
  }
}

export function classRescheduledEmail(d: LiveClassMailData): RenderedMail {
  const accent = "#5B9BFF"
  const tz = d.timezone || "Asia/Kolkata"
  const when = formatWhen(d.startsAt, tz)
  const portalUrl = `${APP_URL}/student/live-classes`
  const isImminent = d.startsAt.getTime() - Date.now() <= (d.joinOpensMinBefore ?? 15) * 60 * 1000

  return {
    subject: `🔁 Rescheduled: ${d.title} — now ${when}`,
    text: `Hi ${d.recipientName}, "${d.title}" has been rescheduled to ${when}.${d.oldStartsAt ? ` (Earlier: ${formatWhen(d.oldStartsAt, tz)})` : ""}${d.reason ? `\nReason: ${d.reason}` : ""}\n\nA calendar update (.ics) has been attached to this email.\n${isImminent ? `Meeting link: ${d.meetingUrl}` : `View on portal: ${portalUrl}`}`,
    html: layout({
      accent,
      eyebrow: "Class Rescheduled",
      heading: "Your class time has changed",
      bodyHtml:
        (d.oldStartsAt
          ? p(`<span style="text-decoration:line-through;color:#64748B;">${esc(formatWhen(d.oldStartsAt, tz))}</span> &nbsp;→&nbsp; <strong style="color:#E2E8F0;">${esc(when)}</strong>`)
          : "") +
        classCard(d, accent) +
        (d.reason
          ? `<div style="background:#1E293B;border-left:4px solid #5B9BFF;padding:12px 14px;border-radius:8px;margin:12px 0 16px;font-size:13px;line-height:1.6;color:#E2E8F0;">
              <strong style="color:#5B9BFF;">Note from instructor:</strong> ${esc(d.reason)}
            </div>`
          : "") +
        p("The attached invite updates your calendar. Fresh reminder emails will be sent before the new start time.") +
        (isImminent
          ? joinBlock(d, accent)
          : `<div style="background:#0F172A;border:1px dashed #334155;border-radius:12px;padding:14px 16px;margin:16px 0;font-size:13px;line-height:1.6;color:#94A3B8;">
              <div style="font-weight:700;color:#F8FAFC;margin-bottom:4px;">⏰ Active Join Link Delivery</div>
              The active join link will be emailed to you 30 minutes before the new start time, and will unlock on your student portal.
            </div>` +
            button("View Updated Schedule", portalUrl, accent)),
    }),
  }
}

export function classCancelledEmail(d: LiveClassMailData): RenderedMail {
  const accent = "#EF4444"
  const when = formatWhen(d.startsAt, d.timezone)
  return {
    subject: `❌ Cancelled: ${d.title} (${when})`,
    text: `Hi ${d.recipientName}, "${d.title}" scheduled for ${when} has been cancelled.${d.reason ? ` Reason: ${d.reason}` : ""}`,
    html: layout({
      accent,
      eyebrow: "Class Cancelled",
      heading: "This class has been cancelled",
      bodyHtml:
        p(`Hi <strong style="color:#E2E8F0;">${esc(d.recipientName)}</strong>, unfortunately the following session will not take place.`) +
        classCard(d, accent) +
        (d.reason ? p(`<strong style="color:#E2E8F0;">Reason:</strong> ${esc(d.reason)}`) : "") +
        p("Your instructor will share a new schedule soon."),
    }),
  }
}
