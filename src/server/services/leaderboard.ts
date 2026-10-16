import { db } from "@/server/db"
import { rankStudents, type RankedRow, type RawStudent } from "@/lib/leaderboard-rank"

export const ANONYMOUS_NAME = "Anonymous Learner"

export interface Viewer {
  id: string
  isStaff: boolean
}

export interface LeaderboardEntry extends Omit<RankedRow, "email"> {
  email: string | null
  isSelf: boolean
}

export interface WaitingEntry {
  userId: string
  displayName: string
  avatarUrl: string | null
  isSelf: boolean
}

export interface CourseLeaderboard {
  course: { id: string; title: string }
  ranked: LeaderboardEntry[]
  waiting: WaitingEntry[]
  stats: { enrolled: number; ranked: number; topMarks: number; averageMarks: number }
}

/**
 * Builds the real leaderboard for a course from graded assignments and quiz attempts.
 * Returns null when the viewer is not allowed to see it (non-enrolled student).
 */
export async function getCourseLeaderboard(
  courseId: string,
  viewer: Viewer
): Promise<CourseLeaderboard | null> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  })
  if (!course) return null

  const enrollments = await db.enrollment.findMany({
    where: {
      courseId,
      status: { in: ["ACTIVE", "COMPLETED"] },
      user: { role: "STUDENT", status: "ACTIVE" },
    },
    include: { user: { include: { profile: true } } },
  })

  const viewerEnrolled = enrollments.some((e) => e.userId === viewer.id)
  if (!viewer.isStaff && !viewerEnrolled) return null

  const studentIds = enrollments.map((e) => e.userId)

  const [submissions, attempts] =
    studentIds.length === 0
      ? [[], []]
      : await Promise.all([
          db.assignmentSubmission.findMany({
            where: {
              userId: { in: studentIds },
              status: "GRADED",
              marksAwarded: { not: null },
              assignment: { courseId },
            },
            select: {
              userId: true,
              assignmentId: true,
              marksAwarded: true,
              gradedAt: true,
              submittedAt: true,
              assignment: { select: { maxMarks: true } },
            },
          }),
          db.assessmentAttempt.findMany({
            where: {
              userId: { in: studentIds },
              submittedAt: { not: null },
              assessment: { courseId },
            },
            select: {
              userId: true,
              assessmentId: true,
              scorePct: true,
              earnedMarks: true,
              totalMarks: true,
              submittedAt: true,
              assessment: { select: { questions: { select: { points: true } } } },
            },
          }),
        ])

  const students: RawStudent[] = enrollments.map((e) => {
    const isSelf = e.userId === viewer.id
    const anonymous = Boolean(e.user.profile?.leaderboardAnonymous)
    const hide = anonymous && !isSelf && !viewer.isStaff
    return {
      userId: e.userId,
      displayName: hide ? ANONYMOUS_NAME : e.user.name,
      avatarUrl: hide ? null : e.user.profile?.avatarUrl ?? null,
      isAnonymous: anonymous,
      email: viewer.isStaff ? e.user.email : null,
    }
  })

  const { ranked, waiting } = rankStudents(
    students,
    submissions.map((s) => ({
      userId: s.userId,
      assignmentId: s.assignmentId,
      marks: s.marksAwarded ?? 0,
      max: s.assignment.maxMarks,
      at: s.gradedAt ?? s.submittedAt,
    })),
    attempts.map((a) => {
      // Legacy attempts (saved before marks were stored) fall back to percentage x current question points
      let total = a.totalMarks
      let earned = a.earnedMarks
      if (total === 0) {
        total = a.assessment.questions.reduce((acc, q) => acc + q.points, 0)
        earned = Math.round((a.scorePct / 100) * total)
      }
      return {
        userId: a.userId,
        assessmentId: a.assessmentId,
        earned,
        total,
        at: a.submittedAt as Date,
      }
    })
  )

  const entries: LeaderboardEntry[] = ranked.map((r) => ({ ...r, isSelf: r.userId === viewer.id }))
  const totalMarksSum = entries.reduce((acc, r) => acc + r.totalMarks, 0)

  return {
    course,
    ranked: entries,
    waiting: waiting.map((w) => ({
      userId: w.userId,
      displayName: w.displayName,
      avatarUrl: w.avatarUrl,
      isSelf: w.userId === viewer.id,
    })),
    stats: {
      enrolled: enrollments.length,
      ranked: entries.length,
      topMarks: entries.length ? entries[0].totalMarks : 0,
      averageMarks: entries.length ? Math.round((totalMarksSum / entries.length) * 10) / 10 : 0,
    },
  }
}
