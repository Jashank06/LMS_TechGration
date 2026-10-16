import { db } from "@/server/db"
import { ownedByTeacher } from "@/server/services/teacher-scope"

export interface StudentNavCounts {
  pendingAssignments: number
  pendingQuizzes: number
}

export interface TeacherNavCounts {
  assignmentsToReview: number
  quizzes: number
  liveToday: number
}

/** Real sidebar counts for a student across active enrollments. */
export async function getStudentNavCounts(userId: string): Promise<StudentNavCounts> {
  const enrollments = await db.enrollment.findMany({
    where: { userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { courseId: true },
  })
  const courseIds = enrollments.map((e) => e.courseId)
  if (courseIds.length === 0) return { pendingAssignments: 0, pendingQuizzes: 0 }

  const [assignments, quizzes] = await Promise.all([
    db.assignment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, submissions: { where: { userId }, select: { id: true } } },
    }),
    db.assessment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, attempts: { where: { userId }, select: { id: true } } },
    }),
  ])

  return {
    pendingAssignments: assignments.filter((a) => a.submissions.length === 0).length,
    pendingQuizzes: quizzes.filter((q) => q.attempts.length === 0).length,
  }
}

/** Real sidebar counts for a teacher (courses they own, or all for staff). */
export async function getTeacherNavCounts(user: {
  id: string
  name: string
  role: string
}): Promise<TeacherNavCounts> {
  const isStaff = user.role === "ADMIN" || user.role === "SUPER_ADMIN"
  const courseWhere = isStaff ? {} : ownedByTeacher(user)
  const courses = await db.course.findMany({ where: courseWhere, select: { id: true } })
  const courseIds = courses.map((c) => c.id)
  if (courseIds.length === 0) return { assignmentsToReview: 0, quizzes: 0, liveToday: 0 }

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  const [assignmentsToReview, quizzes, liveToday] = await Promise.all([
    db.assignmentSubmission.count({
      where: { status: { not: "GRADED" }, assignment: { courseId: { in: courseIds } } },
    }),
    db.assessment.count({ where: { courseId: { in: courseIds } } }),
    db.liveClass.count({
      where: {
        courseId: { in: courseIds },
        status: { not: "CANCELLED" },
        startsAt: { gte: start, lt: end },
      },
    }),
  ])

  return { assignmentsToReview, quizzes, liveToday }
}
