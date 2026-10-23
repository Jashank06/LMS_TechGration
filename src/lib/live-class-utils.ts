/**
 * Shared utility for evaluating live class join windows, lifecycle states,
 * and countdown timings across student portal, dashboard, and join gateway.
 */

export interface LiveClassWindowInfo {
  /** True when the student is allowed to join the meeting (within join buffer or live) */
  isJoinable: boolean
  /** True when the class start time has passed and has not concluded */
  isLive: boolean
  /** True when the class is scheduled for the future and join window is still locked */
  isUpcoming: boolean
  /** True when the class end time has passed or status is explicitly COMPLETED */
  isEnded: boolean
  /** Exact Date when the join button unlocks */
  joinOpensAt: Date
  /** Scheduled start Date */
  startsAt: Date
  /** Scheduled end Date */
  endsAt: Date
  /** Remaining milliseconds until join button unlocks (0 if already unlocked) */
  timeUntilOpenMs: number
  /** Formatted open time e.g. "05:50 PM" */
  formattedOpenTime: string
  /** Minutes buffer before startsAt when join unlocks (default: 10) */
  bufferMin: number
}

export function computeClassWindowStatus(
  input: {
    startsAt: Date | string
    endsAt: Date | string
    status?: string | null
    joinOpensMinBefore?: number | null
  },
  currentDate: Date = new Date()
): LiveClassWindowInfo {
  const now = currentDate.getTime()
  const startsAt = new Date(input.startsAt)
  const endsAt = new Date(input.endsAt)
  const startsAtMs = startsAt.getTime()
  const endsAtMs = endsAt.getTime()

  const bufferMin =
    typeof input.joinOpensMinBefore === "number" && !isNaN(input.joinOpensMinBefore)
      ? Math.max(0, input.joinOpensMinBefore)
      : 10

  const joinOpensAtMs = startsAtMs - bufferMin * 60 * 1000
  const joinOpensAt = new Date(joinOpensAtMs)

  const isEnded = input.status === "COMPLETED" || now > endsAtMs
  const isCancelled = input.status === "CANCELLED"

  // Live if status is LIVE or current time is between startsAt and endsAt (and not ended/cancelled)
  const isLive = !isEnded && !isCancelled && (input.status === "LIVE" || (now >= startsAtMs && now <= endsAtMs))

  // Joinable if live or within [joinOpensAt, endsAt]
  const isJoinable = !isEnded && !isCancelled && (isLive || (now >= joinOpensAtMs && now <= endsAtMs))

  const isUpcoming = !isEnded && !isCancelled && now < joinOpensAtMs
  const timeUntilOpenMs = Math.max(0, joinOpensAtMs - now)

  const formattedOpenTime = joinOpensAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return {
    isJoinable,
    isLive,
    isUpcoming,
    isEnded,
    joinOpensAt,
    startsAt,
    endsAt,
    timeUntilOpenMs,
    formattedOpenTime,
    bufferMin,
  }
}
