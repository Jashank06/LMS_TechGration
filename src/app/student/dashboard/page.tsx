import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { StudentDashboardClient } from "./student-dashboard-client"
import {
  calculateStudentStudyMetrics,
  recalculateCourseProgress,
} from "@/server/services/course-progress"

export const metadata: Metadata = {
  title: "Student Dashboard — TechGration LMS",
  description: "Personalized learning dashboard, continuing courses, live sessions, and metrics.",
}

export default async function StudentDashboardPage() {
  const user = await requireStudent()

  // 1. Fetch Student Enrollments
  const rawEnrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
    orderBy: { lastAccessedAt: "desc" },
  })

  // Prioritize "Artificial Intelligence" course in Continue Learning:
  // If the student is enrolled in multiple courses, Artificial Intelligence must ALWAYS have highest priority.
  const enrollments = [...rawEnrollments].sort((a, b) => {
    const isAiA =
      a.course.id === "6ad283b4e196d0b8fbfb9eae" ||
      a.course.title.toLowerCase().includes("artificial intelligence")
    const isAiB =
      b.course.id === "6ad283b4e196d0b8fbfb9eae" ||
      b.course.title.toLowerCase().includes("artificial intelligence")

    if (isAiA && !isAiB) return -1
    if (!isAiA && isAiB) return 1
    return 0
  })

  // 2. Fetch Upcoming Live Classes
  const enrolledCourseIds = enrollments
    .filter((e) => e.status === "ACTIVE")
    .map((e) => e.courseId)

  const upcomingLiveClasses = await db.liveClass.findMany({
    where: {
      status: { in: ["SCHEDULED", "LIVE"] },
      endsAt: { gt: new Date() },
      courseId: { in: enrolledCourseIds },
    },
    include: {
      course: true,
    },
    orderBy: { startsAt: "asc" },
    take: 3,
  })

  // 3. Fetch Assignments
  const assignments = await db.assignment.findMany({
    include: {
      course: true,
      submissions: {
        where: { userId: user.id },
      },
    },
    orderBy: { dueAt: "asc" },
    take: 3,
  })

  // 4. Fetch Certificates & Quizzes Passed
  const certificatesCount = await db.certificate.count({
    where: { userId: user.id },
  })

  const passedQuizzesCount = await db.assessmentAttempt.count({
    where: { userId: user.id, scorePct: { gte: 70 } },
  })

  // 5. Calculate Resume Course & Next Lesson
  const activeEnrollment = enrollments[0]
  let resumeLesson = null

  if (activeEnrollment) {
    for (const mod of activeEnrollment.course.modules) {
      if (mod.lessons.length > 0) {
        resumeLesson = mod.lessons[0]
        break
      }
    }
    // Synchronize latest progress for active course
    const fresh = await recalculateCourseProgress(user.id, activeEnrollment.course.id)
    activeEnrollment.progressPct = fresh.progressPct
  }

  // 6. Fetch Authentic Student Study Metrics (Live classes, recordings, coding practice, lessons)
  const studyMetrics = await calculateStudentStudyMetrics(user.id)

  // Overall completion percentage (Prioritize active course progress if engaged)
  const displayCompletionPct =
    activeEnrollment && activeEnrollment.progressPct > 0
      ? Math.round(activeEnrollment.progressPct)
      : enrollments.length > 0
      ? Math.round(
          enrollments.reduce((acc, curr) => acc + curr.progressPct, 0) /
            enrollments.length
        )
      : 0

  return (
    <StudentDashboardClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.profile?.avatarUrl,
      }}
      enrollmentsCount={enrollments.length}
      activeEnrollmentsCount={enrollments.filter((e) => e.status === "ACTIVE").length}
      avgProgress={displayCompletionPct}
      completedLessonsCount={studyMetrics.completedLessonsCount}
      hoursInvested={studyMetrics.hoursInvested}
      passedQuizzesCount={passedQuizzesCount}
      certificatesCount={certificatesCount}
      activeEnrollment={
        activeEnrollment
          ? {
              id: activeEnrollment.id,
              progressPct: activeEnrollment.progressPct,
              course: {
                id: activeEnrollment.course.id,
                title: activeEnrollment.course.title,
                category: activeEnrollment.course.category,
                thumbnailUrl: activeEnrollment.course.thumbnailUrl,
              },
            }
          : null
      }
      resumeLesson={
        resumeLesson
          ? {
              id: resumeLesson.id,
              title: resumeLesson.title,
              position: resumeLesson.position,
            }
          : null
      }
      past7DaysData={studyMetrics.past7DaysData}
      weeklyHoursText={studyMetrics.weeklyHoursText}
      daysGoalReached={studyMetrics.daysGoalReached}
      upcomingLiveClasses={upcomingLiveClasses.map((cls) => ({
        id: cls.id,
        title: cls.title,
        status: cls.status,
        instructorName: cls.instructorName,
        startsAt: cls.startsAt,
        endsAt: cls.endsAt,
        meetingUrl: cls.meetingUrl,
        joinOpensMinBefore: cls.joinOpensMinBefore,
        course: cls.course ? { title: cls.course.title } : null,
      }))}
      assignments={assignments.map((asgn) => ({
        id: asgn.id,
        title: asgn.title,
        maxMarks: asgn.maxMarks,
        dueAt: asgn.dueAt,
        course: { title: asgn.course.title },
        submissions: asgn.submissions.map((s) => ({
          status: s.status,
          marksAwarded: s.marksAwarded,
        })),
      }))}
    />
  )
}
