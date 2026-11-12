import { db } from "@/server/db"
import { AttendanceStatus, ProgressStatus } from "@prisma/client"

/**
 * Recalculates and updates the course progress percentage for an enrolled student.
 * Supports both traditional asynchronous lesson modules and live bootcamp cohorts.
 */
export async function recalculateCourseProgress(userId: string, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
        },
      },
      liveClasses: {
        where: { status: { not: "CANCELLED" } },
        select: { id: true },
      },
    },
  })

  if (!course) return { progressPct: 0, totalUnits: 0, completedUnits: 0 }

  const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  const liveClassIds = course.liveClasses.map((lc) => lc.id)

  const [completedLessonsCount, attendedClassesCount] = await Promise.all([
    allLessonIds.length > 0
      ? db.lessonProgress.count({
          where: {
            userId,
            lessonId: { in: allLessonIds },
            status: ProgressStatus.COMPLETED,
          },
        })
      : 0,
    liveClassIds.length > 0
      ? db.attendanceRecord.count({
          where: {
            userId,
            liveClassId: { in: liveClassIds },
            status: AttendanceStatus.PRESENT,
          },
        })
      : 0,
  ])

  const totalUnits = allLessonIds.length + liveClassIds.length
  const completedUnits = completedLessonsCount + attendedClassesCount

  const progressPct =
    totalUnits > 0
      ? Math.min(100, Math.round((completedUnits / totalUnits) * 100))
      : 0

  await db.enrollment.updateMany({
    where: {
      userId,
      courseId,
    },
    data: {
      progressPct,
      lastAccessedAt: new Date(),
      ...(progressPct >= 100 ? { completedAt: new Date() } : {}),
    },
  })

  return { progressPct, totalUnits, completedUnits }
}

/**
 * Marks attendance when a student joins a live class or accesses its classroom gateway.
 */
export async function recordLiveClassAttendance(userId: string, liveClassId: string) {
  const liveClass = await db.liveClass.findUnique({
    where: { id: liveClassId },
  })

  if (!liveClass) {
    throw new Error("Live class not found")
  }

  // 1. Upsert attendance record
  await db.attendanceRecord.upsert({
    where: {
      liveClassId_userId: {
        liveClassId,
        userId,
      },
    },
    update: {
      markedAt: new Date(),
      status: AttendanceStatus.PRESENT,
    },
    create: {
      liveClassId,
      userId,
      status: AttendanceStatus.PRESENT,
      markedAt: new Date(),
    },
  })

  // 2. Recalculate enrollment progress
  const progressResult = await recalculateCourseProgress(userId, liveClass.courseId)

  return {
    success: true,
    meetingUrl: liveClass.meetingUrl,
    progressPct: progressResult.progressPct,
  }
}

/**
 * Marks session completion when a student finishes watching a live class recording.
 */
export async function recordRecordingCompletion(userId: string, liveClassId: string) {
  const liveClass = await db.liveClass.findUnique({
    where: { id: liveClassId },
  })

  if (!liveClass) {
    throw new Error("Live class recording not found")
  }

  // Watching the recording fulfills attendance for the session
  await db.attendanceRecord.upsert({
    where: {
      liveClassId_userId: {
        liveClassId,
        userId,
      },
    },
    update: {
      markedAt: new Date(),
      status: AttendanceStatus.PRESENT,
    },
    create: {
      liveClassId,
      userId,
      status: AttendanceStatus.PRESENT,
      markedAt: new Date(),
    },
  })

  const progressResult = await recalculateCourseProgress(userId, liveClass.courseId)

  return {
    success: true,
    progressPct: progressResult.progressPct,
  }
}

/**
 * Aggregates all authentic learning activity across live classes, recordings,
 * async video lessons, and Coding Arena problem practice.
 */
export async function calculateStudentStudyMetrics(userId: string) {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    attendances,
    lessonProgresses,
    codingProgresses,
    recentSubmissions,
  ] = await Promise.all([
    db.attendanceRecord.findMany({
      where: { userId, status: AttendanceStatus.PRESENT },
      include: {
        liveClass: {
          select: {
            id: true,
            startsAt: true,
            endsAt: true,
          },
        },
      },
    }),
    db.lessonProgress.findMany({
      where: { userId },
      select: {
        watchedSec: true,
        status: true,
        updatedAt: true,
      },
    }),
    db.codingProgress.findMany({
      where: { userId },
      select: {
        isSolved: true,
        updatedAt: true,
      },
    }),
    db.codingSubmission.findMany({
      where: { userId },
      select: {
        id: true,
        verdict: true,
        submittedAt: true,
      },
      orderBy: { submittedAt: "desc" },
      take: 150,
    }),
  ])

  // 1. Attended Live Classes Minutes
  let totalLiveMinutes = 0
  for (const att of attendances) {
    const start = new Date(att.liveClass.startsAt).getTime()
    const end = new Date(att.liveClass.endsAt).getTime()
    const durationMin = Math.max(45, Math.round((end - start) / (1000 * 60)))
    totalLiveMinutes += durationMin
  }

  // 2. Video Lessons Minutes
  const totalLessonMinutes = Math.round(
    lessonProgresses.reduce((sum, lp) => sum + (lp.watchedSec || 0), 0) / 60
  )

  // 3. Coding Arena Practice Minutes
  const solvedCount = codingProgresses.filter((cp) => cp.isSolved).length
  const totalSubmissionsCount = recentSubmissions.length
  // Each solved problem represents ~15 min of dedicated coding; each test submission ~5 min
  const codingMinutes = Math.min(
    720,
    solvedCount * 15 + Math.max(0, totalSubmissionsCount - solvedCount) * 5
  )

  const totalStudyMinutes = totalLiveMinutes + totalLessonMinutes + codingMinutes
  const hoursInvested = `${(totalStudyMinutes / 60).toFixed(1)} hrs`

  // 4. Total Completed Sessions / Lessons (Hybrid)
  const completedAsyncLessonsCount = lessonProgresses.filter(
    (lp) => lp.status === ProgressStatus.COMPLETED
  ).length
  const completedLessonsCount = attendances.length + completedAsyncLessonsCount

  // 5. Weekly Study Activity (Past 7 Days: Mon-Sun)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const past7DaysData = orderedDays.map((day) => ({
    day,
    minutes: 0,
    label: "0m",
  }))

  const addToDay = (date: Date, minutes: number) => {
    if (date < sevenDaysAgo) return
    const dayName = dayNames[date.getDay()]
    const entry = past7DaysData.find((d) => d.day === dayName)
    if (entry) {
      entry.minutes += minutes
    }
  }

  // Add recent attendances to past 7 days
  for (const att of attendances) {
    const date = new Date(att.markedAt || att.liveClass.startsAt)
    const start = new Date(att.liveClass.startsAt).getTime()
    const end = new Date(att.liveClass.endsAt).getTime()
    const durationMin = Math.max(45, Math.round((end - start) / (1000 * 60)))
    addToDay(date, durationMin)
  }

  // Add recent video lesson watches
  for (const lp of lessonProgresses) {
    const date = new Date(lp.updatedAt)
    const minutes = Math.round((lp.watchedSec || 0) / 60)
    if (minutes > 0) {
      addToDay(date, minutes)
    }
  }

  // Add recent coding activity
  for (const sub of recentSubmissions) {
    const date = new Date(sub.submittedAt)
    addToDay(date, 8) // ~8 minutes per active coding submission session
  }

  // Format labels and calculate total weekly minutes
  let totalWeeklyMinutes = 0
  for (const d of past7DaysData) {
    totalWeeklyMinutes += d.minutes
    const h = Math.floor(d.minutes / 60)
    const m = d.minutes % 60
    d.label = h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const weeklyHoursText = `${(totalWeeklyMinutes / 60).toFixed(1)} hrs total`
  const daysGoalReached = past7DaysData.filter((d) => d.minutes >= 45).length

  return {
    hoursInvested,
    completedLessonsCount,
    past7DaysData,
    weeklyHoursText,
    daysGoalReached,
    totalStudyMinutes,
    totalLiveMinutes,
    codingMinutes,
  }
}
