import * as React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { getCourseLeaderboard } from "@/server/services/leaderboard"
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client"
import { LeaderboardEmpty } from "@/components/leaderboard/leaderboard-extras"

export const metadata: Metadata = {
  title: "Leaderboard — TechGration LMS",
  description: "See how you rank among classmates based on evaluated assignments and quizzes.",
}

interface PageProps {
  searchParams: Promise<{ course?: string }>
}

export default async function StudentLeaderboardPage({ searchParams }: PageProps) {
  const user = await requireStudent()
  const { course: requestedCourseId } = await searchParams

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { lastAccessedAt: "desc" },
  })

  if (enrollments.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Leaderboard</h1>
        <LeaderboardEmpty kind="no-courses" />
      </div>
    )
  }

  const courses = enrollments.map((e) => ({ id: e.course.id, title: e.course.title }))

  let activeId = courses[0].id
  if (requestedCourseId) {
    if (!courses.some((c) => c.id === requestedCourseId)) notFound()
    activeId = requestedCourseId
  }

  const data = await getCourseLeaderboard(activeId, { id: user.id, isStaff: false })
  if (!data) notFound()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <LeaderboardClient
        key={activeId}
        data={data}
        courses={courses}
        variant="student"
        basePath="/student/leaderboard"
        anonymousSelf={Boolean(user.profile?.leaderboardAnonymous)}
      />
    </div>
  )
}
