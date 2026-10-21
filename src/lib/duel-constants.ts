/**
 * TechGration 1v1 Battle Arena Constants & Timezone Utilities
 */

export const DUEL_MODES = [
  "OPEN_CHALLENGE",
  "GHOST_RACE",
  "DIRECT_INVITE",
  "HAPPY_HOUR",
] as const

export type DuelModeType = (typeof DUEL_MODES)[number]

export const DUEL_MODE_LABELS: Record<DuelModeType, string> = {
  OPEN_CHALLENGE: "Open Challenge",
  GHOST_RACE: "Ghost Battle",
  DIRECT_INVITE: "Friend Invite",
  HAPPY_HOUR: "2x XP Duel Rush",
}

export const STAKE_OPTIONS = [0, 25, 50] as const

export const EXPIRY_OPTIONS = [
  { label: "2 Hours", hours: 2 },
  { label: "12 Hours", hours: 12 },
  { label: "24 Hours", hours: 24 },
] as const

/** Generate a unique 8-char alphanumeric duel share code (e.g. DUEL-9K2P) */
export function generateDuelCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ" // No 0/O, 1/I confusion
  let result = "DUEL-"
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Calculates whether the current moment falls in the daily 9:00 PM - 9:30 PM IST window.
 * Uses strict Indian Standard Time (UTC+05:30) offset.
 */
export function getHappyHourStatus(): {
  isLive: boolean
  secondsRemaining: number
  nextRushDate: Date
  formattedNext: string
} {
  const now = new Date()
  // Current UTC time + 5h 30m offset
  const istOffsetMs = 5.5 * 60 * 60 * 1000
  const istNow = new Date(now.getTime() + istOffsetMs)

  const istHours = istNow.getUTCHours()
  const istMinutes = istNow.getUTCMinutes()
  const istSeconds = istNow.getUTCSeconds()

  // 9:00 PM (21:00) to 9:29:59 PM (21:29:59)
  const isLive = istHours === 21 && istMinutes < 30

  let secondsRemaining = 0
  if (isLive) {
    const elapsedSeconds = istMinutes * 60 + istSeconds
    secondsRemaining = 30 * 60 - elapsedSeconds
  }

  // Calculate next 9:00 PM IST
  const targetIst = new Date(istNow)
  targetIst.setUTCHours(21, 0, 0, 0)

  // If already past 9:30 PM today in IST, next rush is tomorrow 9:00 PM
  if (istHours > 21 || (istHours === 21 && istMinutes >= 30)) {
    targetIst.setUTCDate(targetIst.getUTCDate() + 1)
  }

  // Convert target back to standard UTC timestamp
  const nextRushDate = new Date(targetIst.getTime() - istOffsetMs)
  const diffSec = Math.max(0, Math.floor((nextRushDate.getTime() - now.getTime()) / 1000))
  const hoursLeft = Math.floor(diffSec / 3600)
  const minsLeft = Math.floor((diffSec % 3600) / 60)

  return {
    isLive,
    secondsRemaining: isLive ? secondsRemaining : diffSec,
    nextRushDate,
    formattedNext: isLive
      ? `${Math.floor(secondsRemaining / 60)}m ${secondsRemaining % 60}s left`
      : `${hoursLeft}h ${minsLeft}m`,
  }
}
