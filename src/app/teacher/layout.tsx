import * as React from "react"
import { TeacherShell } from "@/components/teacher/teacher-shell"

export const metadata = {
  title: "Teacher Portal | TechGration LMS",
  description: "Comprehensive instructor command center and curriculum editor.",
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TeacherShell>{children}</TeacherShell>
}
