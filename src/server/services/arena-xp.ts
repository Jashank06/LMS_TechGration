import { db } from "@/server/db"

/**
 * Awards XP for the first accepted solution on a problem.
 * Atomic: prevents duplicate XP awards via CodingProgress.xpAwarded check.
 */
export async function awardFirstAcXp(
  userId: string,
  problemId: string,
  submissionId: string,
  xpAmount: number
): Promise<{ awarded: boolean; totalXp: number; forfeited?: boolean }> {
  // Check if XP already awarded or if solution was unlocked
  const existing = await db.codingProgress.findUnique({
    where: { userId_problemId: { userId, problemId } },
  })

  if (existing && existing.xpAwarded > 0) {
    // Already awarded — update attempt count only
    await db.codingProgress.update({
      where: { id: existing.id },
      data: { attemptCount: { increment: 1 } },
    })
    return { awarded: false, totalXp: existing.xpAwarded, forfeited: false }
  }

  // If student unlocked the solution, FORFEIT all XP for this problem
  if (existing && existing.isSolutionUnlocked) {
    await db.codingProgress.update({
      where: { id: existing.id },
      data: {
        isSolved: true,
        bestSubmissionId: submissionId,
        solvedAt: new Date(),
        attemptCount: { increment: 1 },
      },
    })

    // Update streak solved count without adding any XP
    await updateStreak(userId, 0)

    const streak = await db.codingStreak.findUnique({ where: { userId } })
    return { awarded: false, totalXp: streak?.totalXp || 0, forfeited: true }
  }

  // Upsert CodingProgress with solved state + XP
  await db.codingProgress.upsert({
    where: { userId_problemId: { userId, problemId } },
    create: {
      userId,
      problemId,
      isSolved: true,
      bestSubmissionId: submissionId,
      xpAwarded: xpAmount,
      attemptCount: 1,
      solvedAt: new Date(),
    },
    update: {
      isSolved: true,
      bestSubmissionId: submissionId,
      xpAwarded: xpAmount,
      solvedAt: new Date(),
      attemptCount: { increment: 1 },
    },
  })

  // Create XP log entry
  await db.codingXpLog.create({
    data: {
      userId,
      problemId,
      amount: xpAmount,
      reason: "FIRST_AC",
    },
  })

  // Update streak
  await updateStreak(userId, xpAmount)

  // Get new total
  const streak = await db.codingStreak.findUnique({ where: { userId } })
  return { awarded: true, totalXp: streak?.totalXp || xpAmount, forfeited: false }
}

/**
 * Records an attempt (non-AC submission) in CodingProgress.
 */
export async function recordAttempt(userId: string, problemId: string): Promise<void> {
  await db.codingProgress.upsert({
    where: { userId_problemId: { userId, problemId } },
    create: { userId, problemId, attemptCount: 1 },
    update: { attemptCount: { increment: 1 } },
  })
}

/**
 * Updates daily streak for a user.
 */
async function updateStreak(userId: string, xpToAdd: number): Promise<void> {
  const today = new Date().toISOString().split("T")[0]! // "YYYY-MM-DD"
  const streak = await db.codingStreak.findUnique({ where: { userId } })

  if (!streak) {
    await db.codingStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        totalXp: xpToAdd,
        totalSolved: 1,
      },
    })
    return
  }

  if (streak.lastActiveDate === today) {
    // Already active today — just increment XP and solved count
    await db.codingStreak.update({
      where: { userId },
      data: {
        totalXp: { increment: xpToAdd },
        totalSolved: { increment: 1 },
      },
    })
    return
  }

  // Check if yesterday was active (consecutive streak)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0]!
  const isConsecutive = streak.lastActiveDate === yesterday
  const newCurrent = isConsecutive ? streak.currentStreak + 1 : 1
  const newLongest = Math.max(streak.longestStreak, newCurrent)

  await db.codingStreak.update({
    where: { userId },
    data: {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActiveDate: today,
      totalXp: { increment: xpToAdd },
      totalSolved: { increment: 1 },
    },
  })
}
