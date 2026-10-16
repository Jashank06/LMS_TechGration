import * as React from "react"
import { TeacherShell } from "@/components/teacher/teacher-shell"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { getTeacherNavCounts } from "@/server/services/nav-counts"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Teacher Portal | TechGration LMS",
  description: "Comprehensive instructor command center and curriculum editor.",
}

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getTeacherSession()
  const counts = session ? await getTeacherNavCounts(session.user) : null

  return (
    <TeacherShell
      user={
        session
          ? {
              name: session.user.name,
              email: session.user.email,
              avatarUrl: session.user.avatarUrl,
              headline: session.user.headline,
            }
          : null
      }
      counts={counts}
    >
      {children}
    </TeacherShell>
  )
}
