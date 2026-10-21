import { db } from "@/server/db"
import { executeCode } from "@/server/services/judge0"
import { generateDuelCode, getHappyHourStatus } from "@/lib/duel-constants"
import { sendOpenChallengeEmail, sendGhostDefeatedEmail } from "@/server/email/duel-templates"
import { CodingDifficulty, DuelMode, DuelStatus } from "@prisma/client"

export interface CreateDuelInput {
  creatorId: string
  mode: DuelMode
  difficulty?: CodingDifficulty
  topic?: string
  stakeXp?: number
  expiryHours?: number
  problemId?: string
}

/**
 * Creates a new Duel (Open Challenge or Friend Invite).
 * Handles atomic XP escrow deduction for staked challenges.
 */
export async function createDuel(input: CreateDuelInput) {
  const {
    creatorId,
    mode,
    difficulty = CodingDifficulty.EASY,
    topic,
    stakeXp = 0,
    expiryHours = 24,
  } = input

  // 1. Find suitable published problem
  let problem = null
  if (input.problemId) {
    problem = await db.codingProblem.findUnique({ where: { id: input.problemId } })
  } else {
    const where: any = { isPublished: true }
    if (difficulty) where.difficulty = difficulty
    if (topic && topic !== "ALL" && topic !== "Random") {
      where.topics = { has: topic.toLowerCase() }
    }

    let availableProblems = await db.codingProblem.findMany({
      where,
      select: { id: true, xpReward: true, difficulty: true },
      take: 50,
    })

    if (availableProblems.length === 0 && difficulty) {
      // Fallback 1: match difficulty only
      availableProblems = await db.codingProblem.findMany({
        where: { isPublished: true, difficulty },
        select: { id: true, xpReward: true, difficulty: true },
        take: 50,
      })
    }

    if (availableProblems.length === 0) {
      // Fallback 2: any published problem
      availableProblems = await db.codingProblem.findMany({
        where: { isPublished: true },
        select: { id: true, xpReward: true, difficulty: true },
        take: 50,
      })
    }

    if (availableProblems.length > 0) {
      // Pick random from matches
      problem = availableProblems[Math.floor(Math.random() * availableProblems.length)]
    }
  }

  if (!problem) {
    throw new Error("No problems available for duel matching")
  }

  // 2. Atomic Escrow Transaction: Deduct stake from creator if > 0
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000)
  const code = generateDuelCode()
  const happyHour = getHappyHourStatus()

  const duel = await db.$transaction(async (tx) => {
    if (stakeXp > 0) {
      const streak = await tx.codingStreak.findUnique({ where: { userId: creatorId } })
      const currentXp = streak?.totalXp || 0
      if (currentXp < stakeXp) {
        throw new Error(`Insufficient XP to stake. You have ${currentXp} XP, but required ${stakeXp} XP.`)
      }

      await tx.codingStreak.update({
        where: { userId: creatorId },
        data: { totalXp: { decrement: stakeXp } },
      })
    }

    return await tx.codingDuel.create({
      data: {
        code,
        mode,
        status: DuelStatus.WAITING,
        problemId: problem.id,
        creatorId,
        difficulty: problem.difficulty,
        topic: topic || "Algorithms",
        stakeXp,
        isHappyHour: happyHour.isLive,
        expiresAt,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        problem: { select: { id: true, title: true, difficulty: true, slug: true } },
      },
    })
  })

  // 3. If Open Challenge: Dispatch background email to batchmates (Throttled)
  if (mode === "OPEN_CHALLENGE") {
    triggerOpenChallengeBroadcast({
      creatorName: duel.creator.name,
      creatorEmail: duel.creator.email,
      topic: duel.topic || "Algorithms",
      difficulty: duel.difficulty,
      stakeXp: duel.stakeXp,
      duelCode: duel.code,
    }).catch((err) => console.warn("Challenge broadcast email background error:", err))
  }

  return duel
}

/**
 * Creates an authentic Ghost Duel by pulling a real batchmate's past accepted submission.
 */
export async function createGhostDuel(params: {
  creatorId: string
  submissionId: string
}) {
  const { creatorId, submissionId } = params

  const submission = await db.codingSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: { select: { id: true, name: true } },
      problem: { select: { id: true, title: true, difficulty: true, timeLimitMs: true } },
    },
  })

  if (!submission || submission.verdict !== "ACCEPTED") {
    throw new Error("Authentic accepted submission record not found")
  }

  const code = generateDuelCode()
  const totalDurationMs = submission.executionTimeMs
    ? Math.max(30000, Math.round(submission.executionTimeMs * 45))
    : 180000 // approx 3 mins

  // Generate realistic milestones for ghost progress bar
  const totalTests = submission.totalTests || 5
  const ghostTimeline = [
    { atMs: 0, passed: 0, total: totalTests },
    { atMs: Math.round(totalDurationMs * 0.35), passed: Math.max(1, Math.floor(totalTests * 0.4)), total: totalTests },
    { atMs: Math.round(totalDurationMs * 0.75), passed: Math.max(2, Math.floor(totalTests * 0.8)), total: totalTests },
    { atMs: totalDurationMs, passed: totalTests, total: totalTests },
  ]

  const duel = await db.codingDuel.create({
    data: {
      code,
      mode: DuelMode.GHOST_RACE,
      status: DuelStatus.IN_PROGRESS,
      problemId: submission.problemId,
      creatorId,
      difficulty: submission.problem.difficulty,
      topic: "Ghost Speedrun",
      stakeXp: 0,
      isGhost: true,
      ghostUserId: submission.userId,
      ghostSubmissionId: submission.id,
      ghostTotalTimeMs: totalDurationMs,
      ghostTimeline,
      opponentPassedTests: 0,
      opponentTotalTests: totalTests,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    include: {
      problem: true,
      ghostUser: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
    },
  })

  return duel
}

/**
 * Joins a waiting duel room (Open Challenge or Friend Invite).
 */
export async function joinDuel(duelCode: string, opponentId: string) {
  const duel = await db.codingDuel.findUnique({
    where: { code: duelCode },
    include: { problem: true, creator: true },
  })

  if (!duel) throw new Error("Duel room not found")
  if (duel.status !== DuelStatus.WAITING) {
    if (duel.opponentId === opponentId) return duel
    throw new Error("This duel is already in progress or completed")
  }
  if (duel.creatorId === opponentId) {
    return duel // creator re-entering
  }

  // Deduct opponent stake if stake > 0
  const updatedDuel = await db.$transaction(async (tx) => {
    const fresh = await tx.codingDuel.findUnique({ where: { id: duel.id } })
    if (!fresh || fresh.status !== DuelStatus.WAITING || (fresh.opponentId && fresh.opponentId !== opponentId)) {
      throw new Error("This challenge was just accepted by another student!")
    }

    if (fresh.stakeXp > 0) {
      const streak = await tx.codingStreak.findUnique({ where: { userId: opponentId } })
      const currentXp = streak?.totalXp || 0
      if (currentXp < fresh.stakeXp) {
        throw new Error(`Insufficient XP to enter this staked duel. You need ${fresh.stakeXp} XP.`)
      }

      await tx.codingStreak.update({
        where: { userId: opponentId },
        data: { totalXp: { decrement: fresh.stakeXp } },
      })
    }

    return await tx.codingDuel.update({
      where: { id: fresh.id },
      data: {
        opponentId,
        status: DuelStatus.COUNTDOWN,
        startedAt: new Date(),
      },
      include: {
        creator: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        opponent: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
        problem: true,
      },
    })
  })

  return updatedDuel
}

/**
 * Submits code inside a duel.
 * Atomically marks winner and disburses XP escrow.
 */
export async function submitDuelCode(params: {
  duelCode: string
  userId: string
  code: string
  language: string
}) {
  const { duelCode, userId, code, language } = params

  const duel = await db.codingDuel.findUnique({
    where: { code: duelCode },
    include: {
      problem: { include: { testCases: { orderBy: { position: "asc" } } } },
      creator: { select: { id: true, name: true, email: true } },
      opponent: { select: { id: true, name: true, email: true } },
      ghostUser: { select: { id: true, name: true, email: true } },
    },
  })

  if (!duel) throw new Error("Duel not found")
  if (duel.status !== DuelStatus.IN_PROGRESS && duel.status !== DuelStatus.COUNTDOWN) {
    return {
      success: true,
      isFinished: true,
      winnerId: duel.winnerId,
      verdict: "DUEL_ALREADY_FINISHED",
    }
  }

  const isCreator = duel.creatorId === userId

  // Execute against all test cases
  const testCases = duel.problem.testCases.map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  }))

  const execResult = await executeCode({
    sourceCode: code,
    language,
    testCases,
    timeLimitSec: Math.ceil(duel.problem.timeLimitMs / 1000),
    memoryLimitKb: duel.problem.memoryLimitKb,
  })

  const isAccepted = execResult.overallVerdict === "ACCEPTED"
  const passedTests = execResult.passedCount
  const totalTests = execResult.totalCount

  // If not accepted, simply update live progress in DB
  if (!isAccepted) {
    await db.codingDuel.update({
      where: { id: duel.id },
      data: isCreator
        ? { creatorPassedTests: passedTests, creatorTotalTests: totalTests, creatorCode: code }
        : { opponentPassedTests: passedTests, opponentTotalTests: totalTests, opponentCode: code },
    })

    return {
      success: true,
      verdict: execResult.overallVerdict,
      passedTests,
      totalTests,
      isWinner: false,
      isAccepted: false,
    }
  }

  // ─── ACCEPTED: Atomic Winner Resolution via MongoDB Transaction ───
  const completionTimeMs = duel.startedAt ? Date.now() - duel.startedAt.getTime() : 120000

  const resolved = await db.$transaction(async (tx) => {
    const current = await tx.codingDuel.findUnique({ where: { id: duel.id } })
    if (current?.status === DuelStatus.COMPLETED) {
      return { alreadyFinished: true, winnerId: current.winnerId }
    }

    // Calculate XP: Base + Double if Happy Hour + Bounty Pot
    let xpReward = duel.problem.xpReward
    if (duel.isHappyHour) xpReward *= 2
    if (duel.stakeXp > 0) xpReward += duel.stakeXp * 2 // winner takes both stakes

    // Mark winner
    await tx.codingDuel.update({
      where: { id: duel.id },
      data: {
        status: DuelStatus.COMPLETED,
        winnerId: userId,
        completedAt: new Date(),
        ...(isCreator
          ? {
              creatorPassedTests: totalTests,
              creatorTotalTests: totalTests,
              creatorFinished: true,
              creatorTimeMs: completionTimeMs,
              creatorCode: code,
            }
          : {
              opponentPassedTests: totalTests,
              opponentTotalTests: totalTests,
              opponentFinished: true,
              opponentTimeMs: completionTimeMs,
              opponentCode: code,
            }),
      },
    })

    // Award XP to winner
    await tx.codingStreak.upsert({
      where: { userId },
      create: { userId, totalXp: xpReward, totalSolved: 1, currentStreak: 1, longestStreak: 1 },
      update: { totalXp: { increment: xpReward } },
    })

    // Log XP
    await tx.codingXpLog.create({
      data: {
        userId,
        problemId: duel.problemId,
        amount: xpReward,
        reason: duel.isHappyHour ? "DUEL_WIN_HAPPY_HOUR_2X" : "DUEL_WIN",
      },
    })

    return { alreadyFinished: false, winnerId: userId, xpReward }
  })

  // If Ghost mode and challenger defeated ghost: Dispatch viral notification email!
  if (duel.isGhost && duel.ghostUser && duel.ghostTotalTimeMs) {
    if (completionTimeMs < duel.ghostTotalTimeMs) {
      const challenger = duel.creator.name
      const defTimeStr = formatMs(completionTimeMs)
      const origTimeStr = formatMs(duel.ghostTotalTimeMs)

      sendGhostDefeatedEmail({
        recipientEmail: duel.ghostUser.email,
        recipientName: duel.ghostUser.name,
        defeaterName: challenger,
        problemTitle: duel.problem.title,
        defeaterTime: defTimeStr,
        originalTime: origTimeStr,
        duelCode: duel.code,
      }).catch((e) => console.warn("Ghost defeated email background error:", e))
    }
  }

  return {
    success: true,
    verdict: "ACCEPTED",
    passedTests,
    totalTests,
    isWinner: resolved.winnerId === userId,
    xpReward: resolved.xpReward,
  }
}

/**
 * Sends a background challenge notification to registered active students (rate limited).
 */
async function triggerOpenChallengeBroadcast(params: {
  creatorName: string
  creatorEmail: string
  topic: string
  difficulty: string
  stakeXp: number
  duelCode: string
}) {
  const students = await db.user.findMany({
    where: {
      role: "STUDENT",
      email: { not: params.creatorEmail },
      status: "ACTIVE",
    },
    select: { email: true, name: true },
    take: 15, // Broadcast to first 15 active students
  })

  for (const s of students) {
    await sendOpenChallengeEmail({
      recipientEmail: s.email,
      recipientName: s.name,
      challengerName: params.creatorName,
      topic: params.topic,
      difficulty: params.difficulty,
      stakeXp: params.stakeXp,
      duelCode: params.duelCode,
    })
  }
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`
}

/**
 * Rapid matchmaking for Daily Duel Happy Hour (9:00 PM - 9:30 PM IST).
 * Pairs waiting students in sliding 45-second window.
 */
export async function matchHappyHourQueue(userId: string) {
  const cutoff = new Date(Date.now() - 45 * 1000)

  // 1. Check if user already waiting
  const existingUserDuel = await db.codingDuel.findFirst({
    where: {
      creatorId: userId,
      mode: DuelMode.HAPPY_HOUR,
      status: DuelStatus.WAITING,
      createdAt: { gte: cutoff },
    },
  })

  if (existingUserDuel) {
    return {
      matched: false,
      duelCode: existingUserDuel.code,
      status: existingUserDuel.status,
    }
  }

  // 2. Look for another waiting student
  const openQueueDuel = await db.codingDuel.findFirst({
    where: {
      mode: DuelMode.HAPPY_HOUR,
      status: DuelStatus.WAITING,
      opponentId: null,
      creatorId: { not: userId },
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "asc" },
  })

  if (openQueueDuel) {
    const matched = await db.$transaction(async (tx) => {
      const current = await tx.codingDuel.findUnique({ where: { id: openQueueDuel.id } })
      if (!current || current.status !== DuelStatus.WAITING || current.opponentId) {
        return null
      }
      return await tx.codingDuel.update({
        where: { id: openQueueDuel.id },
        data: {
          opponentId: userId,
          status: DuelStatus.COUNTDOWN,
          startedAt: new Date(),
        },
      })
    })

    if (matched) {
      return {
        matched: true,
        duelCode: matched.code,
        status: DuelStatus.COUNTDOWN,
      }
    }
  }

  // 3. No match found -> create waiting room
  const availableProblems = await db.codingProblem.findMany({
    where: { isPublished: true },
    select: { id: true, difficulty: true },
    take: 50,
  })

  if (availableProblems.length === 0) {
    throw new Error("No coding problems available for Happy Hour")
  }

  const problem = availableProblems[Math.floor(Math.random() * availableProblems.length)]

  const code = generateDuelCode()
  const newDuel = await db.codingDuel.create({
    data: {
      code,
      mode: DuelMode.HAPPY_HOUR,
      status: DuelStatus.WAITING,
      problemId: problem.id,
      creatorId: userId,
      difficulty: problem.difficulty,
      topic: "Happy Hour Rush",
      stakeXp: 0,
      isHappyHour: true,
      expiresAt: new Date(Date.now() + 6 * 60 * 1000), // 6 minutes
    },
  })

  return {
    matched: false,
    duelCode: newDuel.code,
    status: DuelStatus.WAITING,
  }
}

/**
 * Surrenders an active duel or cancels a waiting challenge with 100% refund.
 */
export async function forfeitDuel(params: { duelCode: string; userId: string }) {
  const { duelCode, userId } = params
  const duel = await db.codingDuel.findUnique({
    where: { code: duelCode },
    include: { creator: true, opponent: true },
  })

  if (!duel) throw new Error("Duel not found")
  if (duel.creatorId !== userId && duel.opponentId !== userId) {
    throw new Error("You are not a participant in this duel")
  }

  // Case 1: Waiting challenge cancelled by creator -> 100% Refund
  if (duel.status === DuelStatus.WAITING) {
    if (duel.creatorId !== userId) {
      throw new Error("Only the creator can cancel a waiting duel")
    }

    return await db.$transaction(async (tx) => {
      if (duel.stakeXp > 0) {
        await tx.codingStreak.update({
          where: { userId },
          data: { totalXp: { increment: duel.stakeXp } },
        })
      }

      const cancelled = await tx.codingDuel.update({
        where: { id: duel.id },
        data: { status: DuelStatus.CANCELLED },
      })

      return {
        success: true,
        status: DuelStatus.CANCELLED,
        refundedXp: duel.stakeXp,
      }
    })
  }

  // Case 2: In-progress surrender
  if (duel.status === DuelStatus.COUNTDOWN || duel.status === DuelStatus.IN_PROGRESS) {
    const isCreator = duel.creatorId === userId
    const winnerId = isCreator ? duel.opponentId : duel.creatorId

    if (!winnerId) {
      return await db.codingDuel.update({
        where: { id: duel.id },
        data: { status: DuelStatus.CANCELLED },
      })
    }

    return await db.$transaction(async (tx) => {
      const pot = duel.stakeXp * 2
      if (pot > 0) {
        await tx.codingStreak.update({
          where: { userId: winnerId },
          data: { totalXp: { increment: pot } },
        })

        await tx.codingXpLog.create({
          data: {
            userId: winnerId,
            problemId: duel.problemId,
            amount: pot,
            reason: "DUEL_FORFEIT_WIN",
          },
        })
      }

      await tx.codingDuel.update({
        where: { id: duel.id },
        data: {
          status: DuelStatus.FORFEITED,
          winnerId,
          completedAt: new Date(),
        },
      })

      return {
        success: true,
        status: DuelStatus.FORFEITED,
        winnerId,
        awardedPot: pot,
      }
    })
  }

  return { success: false, message: "Duel cannot be forfeited in current state" }
}

/**
 * Lazy sweeper: Marks expired waiting challenges as EXPIRED and refunds stakes.
 */
export async function sweepExpiredDuels() {
  const expiredDuels = await db.codingDuel.findMany({
    where: {
      status: DuelStatus.WAITING,
      expiresAt: { lte: new Date() },
    },
    take: 50,
  })

  if (expiredDuels.length === 0) return { swept: 0 }

  let sweptCount = 0
  for (const duel of expiredDuels) {
    try {
      await db.$transaction(async (tx) => {
        if (duel.stakeXp > 0) {
          await tx.codingStreak.update({
            where: { userId: duel.creatorId },
            data: { totalXp: { increment: duel.stakeXp } },
          })
        }

        await tx.codingDuel.update({
          where: { id: duel.id },
          data: { status: DuelStatus.EXPIRED },
        })
      })
      sweptCount++
    } catch (e) {
      console.error(`Failed to sweep expired duel ${duel.code}:`, e)
    }
  }

  return { swept: sweptCount }
}

/**
 * Fetches sanitized, real-time room state with ghost milestone interpolation.
 */
export async function getDuelRoomState(duelCode: string, currentUserId: string) {
  const duel = await db.codingDuel.findUnique({
    where: { code: duelCode },
    include: {
      problem: {
        select: {
          id: true,
          slug: true,
          title: true,
          statement: true,
          difficulty: true,
          topics: true,
          starterCode: true,
          timeLimitMs: true,
          memoryLimitKb: true,
          xpReward: true,
          testCases: {
            where: { isSample: true }, // NEVER expose hidden tests!
            orderBy: { position: "asc" },
            select: {
              id: true,
              input: true,
              expectedOutput: true,
              explanation: true,
              position: true,
            },
          },
        },
      },
      creator: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
      opponent: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
      ghostUser: { select: { id: true, name: true, profile: { select: { avatarUrl: true } } } },
      winner: { select: { id: true, name: true } },
    },
  })

  if (!duel) throw new Error("Duel room not found")

  const isCreator = duel.creatorId === currentUserId
  const isOpponent = duel.opponentId === currentUserId
  const elapsedMs = duel.startedAt ? Math.max(0, Date.now() - duel.startedAt.getTime()) : 0

  let opponentPassedTests = duel.opponentPassedTests
  let opponentTotalTests = duel.opponentTotalTests || 5

  // Ghost interpolation
  if (duel.isGhost && duel.ghostTimeline && duel.status === DuelStatus.IN_PROGRESS) {
    const timeline = duel.ghostTimeline as Array<{ atMs: number; passed: number; total: number }>
    for (const step of timeline) {
      if (elapsedMs >= step.atMs) {
        opponentPassedTests = Math.max(opponentPassedTests, step.passed)
        opponentTotalTests = step.total
      }
    }

    if (duel.ghostTotalTimeMs && elapsedMs >= duel.ghostTotalTimeMs && !duel.opponentFinished) {
      db.codingDuel.update({
        where: { id: duel.id },
        data: {
          opponentFinished: true,
          opponentTimeMs: duel.ghostTotalTimeMs,
          opponentPassedTests: opponentTotalTests,
        },
      }).catch(() => {})
    }
  }

  return {
    code: duel.code,
    mode: duel.mode,
    status: duel.status,
    difficulty: duel.difficulty,
    topic: duel.topic,
    stakeXp: duel.stakeXp,
    isHappyHour: duel.isHappyHour,
    isGhost: duel.isGhost,
    ghostTotalTimeMs: duel.ghostTotalTimeMs,
    problem: duel.problem,
    creator: duel.creator,
    opponent: duel.isGhost ? duel.ghostUser : duel.opponent,
    winner: duel.winner,
    winnerId: duel.winnerId,
    creatorPassedTests: duel.creatorPassedTests,
    creatorTotalTests: duel.creatorTotalTests || 5,
    creatorFinished: duel.creatorFinished,
    creatorTimeMs: duel.creatorTimeMs,
    creatorTabSwitches: duel.creatorTabSwitches,
    opponentPassedTests,
    opponentTotalTests,
    opponentFinished: duel.opponentFinished,
    opponentTimeMs: duel.opponentTimeMs,
    opponentTabSwitches: duel.opponentTabSwitches,
    startedAt: duel.startedAt,
    expiresAt: duel.expiresAt,
    completedAt: duel.completedAt,
    elapsedMs,
    isCurrentUserCreator: isCreator,
    isParticipant: isCreator || isOpponent,
  }
}

/**
 * Updates live telemetry and anti-cheat event counters.
 */
export async function updateDuelProgress(params: {
  duelCode: string
  userId: string
  passedTests?: number
  totalTests?: number
  tabSwitched?: boolean
  suspiciousPaste?: boolean
  codeSnippet?: string
}) {
  const { duelCode, userId, passedTests, totalTests, tabSwitched, codeSnippet } = params

  const duel = await db.codingDuel.findUnique({
    where: { code: duelCode },
    select: { id: true, creatorId: true, opponentId: true, status: true },
  })

  if (!duel) throw new Error("Duel not found")
  if (duel.status !== DuelStatus.IN_PROGRESS && duel.status !== DuelStatus.COUNTDOWN) {
    return { success: true, updated: false }
  }

  const isCreator = duel.creatorId === userId
  const isOpponent = duel.opponentId === userId

  if (!isCreator && !isOpponent) {
    throw new Error("Unauthorized progress update")
  }

  const updateData: any = {}
  if (isCreator) {
    if (passedTests !== undefined) updateData.creatorPassedTests = passedTests
    if (totalTests !== undefined) updateData.creatorTotalTests = totalTests
    if (tabSwitched) updateData.creatorTabSwitches = { increment: 1 }
    if (codeSnippet) updateData.creatorCode = codeSnippet
  } else {
    if (passedTests !== undefined) updateData.opponentPassedTests = passedTests
    if (totalTests !== undefined) updateData.opponentTotalTests = totalTests
    if (tabSwitched) updateData.opponentTabSwitches = { increment: 1 }
    if (codeSnippet) updateData.opponentCode = codeSnippet
  }

  await db.codingDuel.update({
    where: { id: duel.id },
    data: updateData,
  })

  return { success: true, updated: true }
}
