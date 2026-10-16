import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { getStudentNavCounts } from "@/server/services/nav-counts"
import { StudentShellClient } from "./student-shell-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Student Portal — TechGration LMS",
  description: "Enterprise learning workspace for TechGration students.",
}

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStudent()
  const counts = await getStudentNavCounts(user.id)

  return (
    <StudentShellClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.profile?.avatarUrl,
        headline: user.profile?.headline,
      }}
      counts={counts}
    >
      {children}
    </StudentShellClient>
  )
}
