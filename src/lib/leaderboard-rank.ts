/**
 * Pure leaderboard ranking logic (no DB / no framework imports) so it can be
 * verified in isolation. All inputs come from real evaluated records.
 */

export type LeaderboardBadge = "TOP_SCORER" | "QUIZ_ACE" | "ASSIGNMENT_ACE" | "RISING_STAR"

export interface RawStudent {
  userId: string
  displayName: string
  avatarUrl: string | null
  isAnonymous: boolean
  email: string | null
}

export interface RawAssignmentScore {
  userId: string
  assignmentId: string
  marks: number
  max: number
  at: Date
}

export interface RawQuizScore {
  userId: string
  assessmentId: string
  earned: number
  total: number
  at: Date
}

export interface RankedRow extends RawStudent {
  rank: number
  totalMarks: number
  assignmentMarks: number
  quizMarks: number
  accuracyPct: number
  gradedAssignments: number
  quizzesTaken: number
  lastScoredAt: string | null
  rankDelta: number | null // positive = climbed, negative = dropped, null = no comparison
  badges: LeaderboardBadge[]
}

interface Aggregate extends RawStudent {
  totalMarks: number
  assignmentMarks: number
  quizMarks: number
  maxMarks: number
  accuracyPct: number
  gradedAssignments: number
  quizzesTaken: number
  lastScoredAt: Date | null
}

function aggregate(
  students: RawStudent[],
  assignmentScores: RawAssignmentScore[],
  quizScores: RawQuizScore[],
  asOf?: Date
): Aggregate[] {
  const cutoff = asOf ? asOf.getTime() : Infinity

  return students.map((s) => {
    const mine = assignmentScores.filter((a) => a.userId === s.userId && a.at.getTime() <= cutoff)
    const myQuiz = quizScores.filter((q) => q.userId === s.userId && q.at.getTime() <= cutoff)

    // Best attempt per quiz (highest earned marks; tie -> higher ratio; tie -> earlier)
    const bestByQuiz = new Map<string, RawQuizScore>()
    for (const q of myQuiz) {
      const cur = bestByQuiz.get(q.assessmentId)
      if (!cur) {
        bestByQuiz.set(q.assessmentId, q)
        continue
      }
      const qRatio = q.total > 0 ? q.earned / q.total : 0
      const cRatio = cur.total > 0 ? cur.earned / cur.total : 0
      if (
        q.earned > cur.earned ||
        (q.earned === cur.earned && qRatio > cRatio) ||
        (q.earned === cur.earned && qRatio === cRatio && q.at < cur.at)
      ) {
        bestByQuiz.set(q.assessmentId, q)
      }
    }
    const bestQuizzes = [...bestByQuiz.values()]

    const assignmentMarks = mine.reduce((acc, a) => acc + a.marks, 0)
    const assignmentMax = mine.reduce((acc, a) => acc + a.max, 0)
    const quizMarks = bestQuizzes.reduce((acc, q) => acc + q.earned, 0)
    const quizMax = bestQuizzes.reduce((acc, q) => acc + q.total, 0)

    const totalMarks = assignmentMarks + quizMarks
    const maxMarks = assignmentMax + quizMax

    const times = [...mine.map((a) => a.at.getTime()), ...bestQuizzes.map((q) => q.at.getTime())]
    const last = times.length ? new Date(Math.max(...times)) : null

    return {
      ...s,
      totalMarks,
      assignmentMarks,
      quizMarks,
      maxMarks,
      accuracyPct: maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 1000) / 10 : 0,
      gradedAssignments: mine.length,
      quizzesTaken: bestQuizzes.length,
      lastScoredAt: last,
    }
  })
}

function sortAndRank(rows: Aggregate[]): Array<Aggregate & { rank: number }> {
  const sorted = [...rows].sort((a, b) => {
    if (b.totalMarks !== a.totalMarks) return b.totalMarks - a.totalMarks
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct
    const at = a.lastScoredAt ? a.lastScoredAt.getTime() : Infinity
    const bt = b.lastScoredAt ? b.lastScoredAt.getTime() : Infinity
    if (at !== bt) return at - bt
    return a.displayName.localeCompare(b.displayName)
  })

  const out: Array<Aggregate & { rank: number }> = []
  sorted.forEach((row, idx) => {
    const prev = out[idx - 1]
    const tied =
      prev && prev.totalMarks === row.totalMarks && prev.accuracyPct === row.accuracyPct
    out.push({ ...row, rank: tied ? prev.rank : idx + 1 })
  })
  return out
}

export function rankStudents(
  students: RawStudent[],
  assignmentScores: RawAssignmentScore[],
  quizScores: RawQuizScore[],
  options: { now?: Date; compareDays?: number } = {}
): { ranked: RankedRow[]; waiting: RawStudent[] } {
  const now = options.now ?? new Date()
  const compareDays = options.compareDays ?? 7
  const past = new Date(now.getTime() - compareDays * 24 * 60 * 60 * 1000)

  const current = aggregate(students, assignmentScores, quizScores)
  const scored = current.filter((r) => r.gradedAssignments + r.quizzesTaken > 0)
  const waiting = current
    .filter((r) => r.gradedAssignments + r.quizzesTaken === 0)
    .map((r) => ({
      userId: r.userId,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      isAnonymous: r.isAnonymous,
      email: r.email,
    }))

  const rankedNow = sortAndRank(scored)

  // Previous ranks (same data, filtered by time) for movement
  const previous = aggregate(students, assignmentScores, quizScores, past).filter(
    (r) => r.gradedAssignments + r.quizzesTaken > 0
  )
  const prevRankMap = new Map<string, number>()
  sortAndRank(previous).forEach((r) => prevRankMap.set(r.userId, r.rank))
  const hasHistory = prevRankMap.size > 0

  const deltas = new Map<string, number | null>()
  for (const r of rankedNow) {
    const prev = prevRankMap.get(r.userId)
    deltas.set(r.userId, hasHistory && prev !== undefined ? prev - r.rank : null)
  }

  const multi = rankedNow.length >= 2
  const maxQuiz = Math.max(0, ...rankedNow.map((r) => r.quizMarks))
  const maxAsgn = Math.max(0, ...rankedNow.map((r) => r.assignmentMarks))
  const maxClimb = Math.max(0, ...[...deltas.values()].map((d) => d ?? 0))

  const ranked: RankedRow[] = rankedNow.map((r) => {
    const badges: LeaderboardBadge[] = []
    const delta = deltas.get(r.userId) ?? null
    if (r.rank === 1 && r.totalMarks > 0) badges.push("TOP_SCORER")
    if (multi && maxQuiz > 0 && r.quizMarks === maxQuiz) badges.push("QUIZ_ACE")
    if (multi && maxAsgn > 0 && r.assignmentMarks === maxAsgn) badges.push("ASSIGNMENT_ACE")
    if (multi && maxClimb > 0 && delta === maxClimb) badges.push("RISING_STAR")

    return {
      userId: r.userId,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      isAnonymous: r.isAnonymous,
      email: r.email,
      rank: r.rank,
      totalMarks: r.totalMarks,
      assignmentMarks: r.assignmentMarks,
      quizMarks: r.quizMarks,
      accuracyPct: r.accuracyPct,
      gradedAssignments: r.gradedAssignments,
      quizzesTaken: r.quizzesTaken,
      lastScoredAt: r.lastScoredAt ? r.lastScoredAt.toISOString() : null,
      rankDelta: delta,
      badges,
    }
  })

  return { ranked, waiting }
}
