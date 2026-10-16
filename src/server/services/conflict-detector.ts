export interface ScheduledSession {
  id: string
  courseId: string
  courseTitle: string
  instructorName: string
  title: string
  startsAt: Date | string
  endsAt: Date | string
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
}

export interface ConflictCheckResult {
  hasConflict: boolean
  conflictType: "HOST_CLASH" | "COURSE_CLASH" | "BOTH" | null
  message: string | null
  conflictingSessions: ScheduledSession[]
}

export function detectScheduleConflict({
  sessions,
  proposedStartsAt,
  proposedEndsAt,
  courseId,
  excludeSessionId,
}: {
  sessions: ScheduledSession[]
  proposedStartsAt: Date | string
  proposedEndsAt: Date | string
  courseId: string
  excludeSessionId?: string
}): ConflictCheckResult {
  const pStart = new Date(proposedStartsAt).getTime()
  const pEnd = new Date(proposedEndsAt).getTime()

  if (pEnd <= pStart) {
    return {
      hasConflict: true,
      conflictType: "HOST_CLASH",
      message: "End time must be after start time.",
      conflictingSessions: [],
    }
  }

  const conflicting: ScheduledSession[] = []
  let hostClash = false
  let courseClash = false

  for (const session of sessions) {
    if (excludeSessionId && session.id === excludeSessionId) continue
    if (session.status === "CANCELLED" || session.status === "COMPLETED") continue

    const sStart = new Date(session.startsAt).getTime()
    const sEnd = new Date(session.endsAt).getTime()

    // Overlap condition: startA < endB && endA > startB
    const isOverlapping = pStart < sEnd && pEnd > sStart

    if (isOverlapping) {
      conflicting.push(session)
      // Teacher host clash
      hostClash = true
      // Course clash if same course
      if (session.courseId === courseId) {
        courseClash = true
      }
    }
  }

  if (conflicting.length === 0) {
    return {
      hasConflict: false,
      conflictType: null,
      message: null,
      conflictingSessions: [],
    }
  }

  const conflictType =
    hostClash && courseClash ? "BOTH" : hostClash ? "HOST_CLASH" : "COURSE_CLASH"

  const details = conflicting
    .map(
      (s) =>
        `"${s.title}" (${new Date(s.startsAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(s.endsAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })})`
    )
    .join(", ")

  return {
    hasConflict: true,
    conflictType,
    message: `Schedule conflict detected with: ${details}`,
    conflictingSessions: conflicting,
  }
}
