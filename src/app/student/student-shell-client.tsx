"use client"

import * as React from "react"
import { StudentSidebar, type StudentNavCountsProp } from "@/components/shell/student-sidebar"
import { StudentTopbar } from "@/components/shell/student-topbar"
import { X } from "lucide-react"

interface StudentShellClientProps {
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
    headline?: string | null
  }
  counts?: StudentNavCountsProp
  children: React.ReactNode
}

export function StudentShellClient({ user, counts, children }: StudentShellClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <StudentSidebar user={user} counts={counts} />
      </div>

      {/* Mobile Drawer Backdrop and Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-card shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground bg-secondary/80"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <StudentSidebar user={user} counts={counts} onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <StudentTopbar
          user={user}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto bg-aurora-mesh">
          {children}
        </main>
      </div>
    </div>
  )
}
