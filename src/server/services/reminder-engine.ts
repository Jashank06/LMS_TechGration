import { db } from "@/server/db"
import { addMin, getOffsets, runDispatch } from "@/server/services/live-class-mailer"

/** A reminder that is more than this many minutes overdue is skipped instead of sent late. */
export const STALE_GRACE_MIN = 5
/** Sweep horizon: offsets are validated <= 120 min, so 180 min covers everything. */
const HORIZON_MIN = 180

export interface SweepResult {
  checked: number
  sent: { classId: string; offsetMin: number; recipients: number; sent: number; failed: number }[]
  skipped: { classId: string; offsetMin: number; reason: string }[]
}

/**
 * Automatically marks expired sessions (where endsAt has passed) as COMPLETED.
 */
export async function autoCompleteExpiredClasses(now: Date = new Date()): Promise<number> {
  try {
    const res = await db.liveClass.updateMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE"] },
        endsAt: { lt: now },
      },
      data: {
        status: "COMPLETED",
      },
    })
    return res.count
  } catch (err) {
    console.error("Auto-complete expired classes error:", err)
    return 0
  }
}

/**
 * Called every minute. For each upcoming class, every reminder offset that is due and
 * has no ReminderDispatch row yet is claimed atomically (unique index) and sent once.
 *
 *  - catch-up safe: a missed tick is picked up on the next one
 *  - duplicate safe: concurrent workers can't both claim the same (class, kind, offset)
 *  - stale safe: reminders overdue by > STALE_GRACE_MIN are marked SKIPPED, not sent late
 */
export async function runReminderSweep(now: Date = new Date()): Promise<SweepResult> {
  const result: SweepResult = { checked: 0, sent: [], skipped: [] }

  // 1. Auto-transition any session whose endsAt has passed to COMPLETED
  await autoCompleteExpiredClasses(now)

  const classes = await db.liveClass.findMany({
    where: { status: "SCHEDULED", startsAt: { gt: now, lte: addMin(now, HORIZON_MIN) } },
    include: { dispatches: true },
  })

  for (const cls of classes) {
    result.checked++
    const existing = new Set(cls.dispatches.filter((d) => d.kind === "REMINDER").map((d) => d.offsetMin))

    for (const offset of getOffsets(cls)) {
      if (existing.has(offset)) continue
      const dueAt = addMin(cls.startsAt, -offset)
      if (dueAt > now) continue // not due yet

      const overdueMin = (now.getTime() - dueAt.getTime()) / 60000
      if (overdueMin > STALE_GRACE_MIN) {
        await db.reminderDispatch
          .create({ data: { liveClassId: cls.id, kind: "REMINDER", offsetMin: offset, status: "SKIPPED", completedAt: now } })
          .catch(() => {})
        result.skipped.push({ classId: cls.id, offsetMin: offset, reason: "stale" })
        continue
      }

      const dispatched = await runDispatch({ classId: cls.id, kind: "REMINDER", offsetMin: offset })
      if (dispatched) {
        result.sent.push({
          classId: cls.id,
          offsetMin: offset,
          recipients: dispatched.recipients,
          sent: dispatched.sent,
          failed: dispatched.failed,
        })
      }
    }
  }

  return result
}

/**
 * Smart-skip: when a class is (re)scheduled with less lead time than an offset,
 * that offset is recorded as SKIPPED so we never fire a "30 min left" mail for a class
 * that starts in 20 minutes.
 */
export async function markPastOffsetsSkipped(
  cls: { id: string; startsAt: Date; reminderOffsetsMin?: number[] | null },
  now: Date = new Date()
): Promise<number[]> {
  const skipped: number[] = []
  for (const offset of getOffsets(cls)) {
    if (addMin(cls.startsAt, -offset) <= now) {
      await db.reminderDispatch
        .create({ data: { liveClassId: cls.id, kind: "REMINDER", offsetMin: offset, status: "SKIPPED", completedAt: now } })
        .catch(() => {})
      skipped.push(offset)
    }
  }
  return skipped
}

/** Pure helper used by the teacher UI preview and tests. */
export function buildReminderTimeline(startsAt: Date, offsets: number[], now: Date = new Date()) {
  return [...offsets]
    .sort((a, b) => b - a)
    .map((offset) => {
      const at = addMin(startsAt, -offset)
      return { offsetMin: offset, at, willSend: at > now }
    })
}
