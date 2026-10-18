import { db } from "@/server/db"

export interface ReferralStudentStats {
  referralCode: string
  totalInvited: number
  totalEnrolled: number
  cashbackEarned: number
  supportPhone: string
  referrals: {
    id: string
    name: string
    maskedEmail: string
    joinedAt: Date
    isEnrolled: boolean
    enrolledCoursesCount: number
    status: "ENROLLED_CASHBACK_ELIGIBLE" | "JOINED_PENDING_ENROLLMENT"
    cashbackAmount: number
  }[]
}

export const SUPPORT_PHONE = "9911752744"

/**
 * Generate a friendly, unique Refer ID for a student
 * Example: TG-7C53FF
 */
export function getStudentReferralCode(userId: string): string {
  if (!userId) return "TG-LEARN"
  const suffix = userId.slice(-6).toUpperCase()
  return `TG-${suffix}`
}

/**
 * Resolve a student referrer by their Refer ID (e.g. "TG-7C53FF" or "7c53ff" or full ObjectId)
 */
export async function resolveReferrerByCode(code: string): Promise<{ id: string; name: string; email: string } | null> {
  if (!code || typeof code !== "string") return null

  const cleaned = code.trim().replace(/^TG-?/i, "").toLowerCase()
  if (!cleaned) return null

  // If full 24-character ObjectId
  if (/^[0-9a-f]{24}$/i.test(cleaned)) {
    const user = await db.user.findUnique({
      where: { id: cleaned },
      select: { id: true, name: true, email: true },
    })
    if (user) return user
  }

  // If 6-character suffix (e.g. 7C53FF)
  if (cleaned.length >= 4 && cleaned.length <= 12) {
    const allUsers = await db.user.findMany({
      select: { id: true, name: true, email: true },
    })
    const matched = allUsers.find((u) => u.id.toLowerCase().endsWith(cleaned))
    if (matched) return matched
  }

  return null
}

function maskEmail(email: string): string {
  const parts = email.split("@")
  if (parts.length !== 2) return "***@techgration.com"
  const [name, domain] = parts
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`
  return `${maskedName}@${domain}`
}

function maskName(fullName: string): string {
  const parts = fullName.trim().split(" ")
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

/**
 * Fetch comprehensive referral stats for a student
 */
export async function getStudentReferralStats(userId: string): Promise<ReferralStudentStats> {
  const referralCode = getStudentReferralCode(userId)

  try {
    const invitedUsers = await db.user.findMany({
      where: {
        invitedById: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    let totalEnrolled = 0

    const referrals = invitedUsers.map((friend) => {
      const activeEnrollments = friend.enrollments.filter(
        (e) => e.status === "ACTIVE" || e.status === "COMPLETED"
      )
      const isEnrolled = activeEnrollments.length > 0
      if (isEnrolled) totalEnrolled++

      return {
        id: friend.id,
        name: maskName(friend.name),
        maskedEmail: maskEmail(friend.email),
        joinedAt: friend.createdAt,
        isEnrolled,
        enrolledCoursesCount: activeEnrollments.length,
        status: isEnrolled
          ? ("ENROLLED_CASHBACK_ELIGIBLE" as const)
          : ("JOINED_PENDING_ENROLLMENT" as const),
        cashbackAmount: isEnrolled ? 500 : 0,
      }
    })

    const cashbackEarned = totalEnrolled * 500

    return {
      referralCode,
      totalInvited: invitedUsers.length,
      totalEnrolled,
      cashbackEarned,
      supportPhone: SUPPORT_PHONE,
      referrals,
    }
  } catch (error) {
    console.error("Error in getStudentReferralStats:", error)
    return {
      referralCode,
      totalInvited: 0,
      totalEnrolled: 0,
      cashbackEarned: 0,
      supportPhone: SUPPORT_PHONE,
      referrals: [],
    }
  }
}
