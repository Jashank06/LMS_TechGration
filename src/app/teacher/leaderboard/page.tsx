import * as React from "react"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { isStaff, ownedByTeacher } from "@/server/services/teacher-scope"
import { getCourseLeaderboard } from "@/server/services/leaderboard"
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client"
import { LeaderboardEmpty } from "@/components/leaderboard/leaderboard-extras"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Leaderboard — Teacher Portal",
  description: "Course-wise student rankings based on evaluated assignments and quizzes.",
}

interface PageProps {
  searchParams: Promise<{ course?: string }>
}

export default async function TeacherLeaderboardPage({ searchParams }: PageProps) {
  const session = await getTeacherSession()
  if (!session) redirect("/teacher/login")

  const { course: requestedCourseId } = await searchParams
  const user = session.user

  const courses = await db.course.findMany({
    where: isStaff(user.role) ? {} : ownedByTeacher(user),
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  })

  if (courses.length === 0) {
    return (
      <div className="space-y-6 pb-12">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leaderboard</h1>
        <LeaderboardEmpty kind="teacher-no-courses" />
      </div>
    )
  }

  let activeId = courses[0].id
  if (requestedCourseId) {
    if (!courses.some((c) => c.id === requestedCourseId)) notFound()
    activeId = requestedCourseId
  }

  const data = await getCourseLeaderboard(activeId, { id: user.id, isStaff: true })
  if (!data) notFound()

  return (
    <div className="pb-12">
      <LeaderboardClient
        key={activeId}
        data={data}
        courses={courses}
        variant="teacher"
        basePath="/teacher/leaderboard"
      />
    </div>
  )
}
