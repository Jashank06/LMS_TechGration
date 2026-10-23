import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { StudentDashboardClient } from "./student-dashboard-client"

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

  // 2. Fetch Completed Lessons Count
  const completedLessonsCount = await db.lessonProgress.count({
    where: { userId: user.id, status: "COMPLETED" },
  })

  // 3. Fetch Upcoming Live Classes
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

  // 4. Fetch Assignments
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

  // 5. Fetch Certificates & Quizzes Passed
  const certificatesCount = await db.certificate.count({
    where: { userId: user.id },
  })

  const passedQuizzesCount = await db.assessmentAttempt.count({
    where: { userId: user.id, scorePct: { gte: 70 } },
  })

  // Calculate Resume Course & Next Lesson
  const activeEnrollment = enrollments[0]
  let resumeLesson = null

  if (activeEnrollment) {
    for (const mod of activeEnrollment.course.modules) {
      if (mod.lessons.length > 0) {
        resumeLesson = mod.lessons[0]
        break
      }
    }
  }

  // Calculate overall average progress
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((acc, curr) => acc + curr.progressPct, 0) /
            enrollments.length
        )
      : 0

  const hoursInvested = (completedLessonsCount * 0.5).toFixed(1) + " hrs"

  // 6. Calculate Real Weekly Study Time from lessonProgress
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const recentProgress = await db.lessonProgress.findMany({
    where: {
      userId: user.id,
      updatedAt: { gte: sevenDaysAgo },
    },
    select: {
      watchedSec: true,
      updatedAt: true,
    },
  })

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const past7DaysData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    minutes: 0,
    label: "0m",
  }))

  let totalWeeklyMinutes = 0
  for (const prog of recentProgress) {
    const d = new Date(prog.updatedAt)
    const dayName = dayNames[d.getDay()]
    const minutes = Math.round((prog.watchedSec || 0) / 60)
    totalWeeklyMinutes += minutes
    const dayEntry = past7DaysData.find((entry) => entry.day === dayName)
    if (dayEntry) {
      dayEntry.minutes += minutes
      const h = Math.floor(dayEntry.minutes / 60)
      const m = dayEntry.minutes % 60
      dayEntry.label = h > 0 ? `${h}h ${m}m` : `${m}m`
    }
  }

  const weeklyHoursText = `${(totalWeeklyMinutes / 60).toFixed(1)} hrs total`
  const daysGoalReached = past7DaysData.filter((d) => d.minutes >= 45).length

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
      avgProgress={avgProgress}
      completedLessonsCount={completedLessonsCount}
      hoursInvested={hoursInvested}
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
      past7DaysData={past7DaysData}
      weeklyHoursText={weeklyHoursText}
      daysGoalReached={daysGoalReached}
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
