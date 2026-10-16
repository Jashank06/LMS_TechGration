import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { SettingsClient } from "./settings-client"
import { Settings } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Profile & Settings — TechGration LMS",
  description: "Manage your personal profile, credentials, active sessions, and learning preferences.",
}

export default async function SettingsPage() {
  const user = await requireStudent()

  const sessions = await db.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  const sessionItems = sessions.map((s) => ({
    id: s.id,
    userAgent: s.userAgent || "macOS • Chrome Browser",
    createdAt: s.createdAt.toISOString(),
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Banner with Apple/Google Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs backdrop-blur-md">
            <Settings className="w-3.5 h-3.5" />
            <span className="tracking-wide">Account Security & Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Student Profile & Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Configure your technical background, learning objectives, notification rules, and active security sessions.
          </p>
        </div>
      </div>

      <SettingsClient
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
        }}
        sessions={sessionItems}
      />
    </div>
  )
}
