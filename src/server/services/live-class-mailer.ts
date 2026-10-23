import { db } from "@/server/db"
import { sendMailBatch, type SendMailInput } from "@/server/email/mailer"
import { buildIcs } from "@/server/email/ics"
import {
  APP_URL,
  classCancelledEmail,
  classRescheduledEmail,
  classReminderEmail,
  classScheduledEmail,
  type LiveClassMailData,
  type PlatformKey,
} from "@/server/email/templates"
import type { DispatchKind, DispatchStatus } from "@prisma/client"

export const DEFAULT_REMINDER_OFFSETS = [30, 15]

export function getOffsets(cls: { reminderOffsetsMin?: number[] | null }): number[] {
  const list = cls.reminderOffsetsMin && cls.reminderOffsetsMin.length ? cls.reminderOffsetsMin : DEFAULT_REMINDER_OFFSETS
  return Array.from(new Set(list)).sort((a, b) => b - a)
}

export function addMin(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000)
}

export interface Recipient {
  id: string
  name: string
  email: string
  timezone: string
}

export async function getClassRecipients(courseId: string): Promise<Recipient[]> {
  if (!courseId) return []
  const enrollments = await db.enrollment.findMany({
    where: {
      courseId,
      status: "ACTIVE",
      user: {
        status: "ACTIVE",
        role: "STUDENT",
      },
    },
    include: { user: { include: { profile: true } } },
  })

  // Deduplicate by user email to ensure each enrolled student receives exactly one email
  const seen = new Set<string>()
  const list: Recipient[] = []
  for (const e of enrollments) {
    const email = e.user.email?.toLowerCase().trim()
    if (!email || seen.has(email)) continue
    seen.add(email)
    list.push({
      id: e.user.id,
      name: e.user.name,
      email: e.user.email,
      timezone: e.user.profile?.timezone || "Asia/Kolkata",
    })
  }
  return list
}

export async function loadClass(classId: string) {
  const cls = await db.liveClass.findUnique({
    where: { id: classId },
    include: { course: true },
  })
  if (!cls) return null

  const teacher = cls.instructorId
    ? await db.user.findUnique({ where: { id: cls.instructorId }, include: { profile: true } })
    : await db.user.findFirst({
        where: { name: cls.instructorName, role: "TEACHER" },
        include: { profile: true },
      })

  return { cls, teacher }
}

interface SendClassMailsInput {
  classId: string
  kind: DispatchKind
  offsetMin?: number
  oldStartsAt?: Date
  reason?: string | null
  includeTeacherCopy?: boolean
}

/**
 * Sends one lifecycle mail (scheduled / reminder / rescheduled / cancelled / manual nudge)
 * to every ACTIVE enrolled learner (+ optional instructor copy) and creates in-app notifications.
 */
export async function sendClassMails(input: SendClassMailsInput) {
  const loaded = await loadClass(input.classId)
  if (!loaded) return { recipients: 0, sent: 0, failed: 0 }
  const { cls, teacher } = loaded

  // Strictly enrolled students in this specific course
  const students = await getClassRecipients(cls.courseId)
  const targets: Recipient[] = [...students]

  // Teacher copy only on initial schedule or reschedule if requested, NEVER on student reminders
  if (input.includeTeacherCopy && teacher && input.kind !== "REMINDER") {
    targets.push({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      timezone: teacher.profile?.timezone || "Asia/Kolkata",
    })
  }

  const base = {
    classId: cls.id,
    title: cls.title,
    courseTitle: cls.course.title,
    teacherName: cls.instructorName,
    startsAt: cls.startsAt,
    endsAt: cls.endsAt,
    platform: cls.platform as PlatformKey,
    meetingUrl: cls.meetingUrl,
    joinOpensMinBefore: cls.joinOpensMinBefore,
    offsetMin: input.offsetMin,
    oldStartsAt: input.oldStartsAt,
    reason: input.reason,
  }

  const cancelled = input.kind === "CANCELLED"
  const attachIcs = input.kind === "SCHEDULED" || input.kind === "RESCHEDULED" || cancelled
  const icsBody = attachIcs
    ? buildIcs({
        uid: cls.id,
        title: `${cls.title} — ${cls.course.title}`,
        description: `Live class by ${cls.instructorName}. Meeting Link: ${cls.meetingUrl}`,
        startsAt: cls.startsAt,
        endsAt: cls.endsAt,
        url: cls.meetingUrl,
        organizerName: teacher?.name || cls.instructorName,
        organizerEmail: teacher?.email || process.env.SMTP_USER || "welcome@jashank.me",
        sequence: input.kind === "RESCHEDULED" ? Math.floor(Date.now() / 60000) % 100000 : 0,
        cancelled,
      })
    : null

  const mails: SendMailInput[] = targets.map((r) => {
    const data: LiveClassMailData = { ...base, recipientName: r.name, timezone: r.timezone }
    const rendered =
      input.kind === "SCHEDULED"
        ? classScheduledEmail(data)
        : input.kind === "RESCHEDULED"
        ? classRescheduledEmail(data)
        : cancelled
        ? classCancelledEmail(data)
        : classReminderEmail(data)

    const isTeacherCopy = teacher && r.id === teacher.id
    return {
      to: r.email,
      subject: isTeacherCopy ? `[Instructor copy] ${rendered.subject}` : rendered.subject,
      html: rendered.html,
      text: rendered.text,
      template: `class-${input.kind.toLowerCase()}`,
      liveClassId: cls.id,
      attachments: icsBody
        ? [{ filename: "class-invite.ics", content: icsBody, contentType: "text/calendar; method=" + (cancelled ? "CANCEL" : "REQUEST") }]
        : undefined,
    }
  })

  const result = await sendMailBatch(mails, 5)

  // In-app notifications for learners (best effort)
  if (students.length) {
    const title =
      input.kind === "SCHEDULED"
        ? `New class: ${cls.title}`
        : input.kind === "RESCHEDULED"
        ? `Rescheduled: ${cls.title}`
        : cancelled
        ? `Cancelled: ${cls.title}`
        : `Starting soon: ${cls.title}`
    await db.notification
      .createMany({
        data: students.map((s) => ({
          userId: s.id,
          title,
          message: `${cls.course.title} · ${cls.instructorName}`,
          href: "/student/live-classes",
        })),
      })
      .catch(() => {})
  }

  return { recipients: targets.length, sent: result.sent, failed: result.failed }
}

/**
 * Creates (or claims) a ReminderDispatch row and runs the mail send.
 * Returns null when another worker has already claimed this exact dispatch.
 */
export async function runDispatch(opts: SendClassMailsInput) {
  const offsetMin = opts.offsetMin ?? 0
  const claimed = await db.reminderDispatch
    .create({ data: { liveClassId: opts.classId, kind: opts.kind, offsetMin } })
    .catch(() => null)
  if (!claimed) return null

  try {
    const res = await sendClassMails(opts)
    const status: DispatchStatus =
      res.recipients === 0 ? "SKIPPED" : res.failed === 0 ? "SENT" : res.sent === 0 ? "FAILED" : "PARTIAL"
    await db.reminderDispatch.update({
      where: { id: claimed.id },
      data: { status, recipients: res.recipients, sentCount: res.sent, failedCount: res.failed, completedAt: new Date() },
    })
    return { dispatchId: claimed.id, ...res, status }
  } catch (error) {
    await db.reminderDispatch
      .update({ where: { id: claimed.id }, data: { status: "FAILED", completedAt: new Date() } })
      .catch(() => {})
    throw error
  }
}
