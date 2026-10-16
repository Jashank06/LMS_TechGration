"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { TeacherSidebar } from "./teacher-sidebar"
import { TeacherHeader } from "./teacher-header"
import type { TeacherNavCounts } from "@/server/services/nav-counts"

export interface TeacherShellProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    avatarUrl?: string | null
    headline?: string | null
  } | null
  counts?: TeacherNavCounts | null
}

export function TeacherShell({ children, user, counts }: TeacherShellProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/teacher/login"

  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-background text-foreground">{children}</div>
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Teacher Navigation Sidebar */}
      <TeacherSidebar user={user} counts={counts} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
