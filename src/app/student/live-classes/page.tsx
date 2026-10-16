import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { LiveClassesClient, LiveClassItem } from "./live-classes-client"
import { Video } from "lucide-react"

export const metadata: Metadata = {
  title: "Live Classes & Schedule — TechGration LMS",
  description: "Join upcoming live interactive classes and access lecture recordings.",
}

export default async function LiveClassesPage() {
  const user = await requireStudent()

  const liveClasses = await db.liveClass.findMany({
    include: {
      course: true,
      attendances: {
        where: { userId: user.id },
      },
    },
    orderBy: { startsAt: "asc" },
  })

  const classItems: LiveClassItem[] = liveClasses.map((cls) => {
    const attendance = cls.attendances[0]
    return {
      id: cls.id,
      title: cls.title,
      description: cls.description || "",
      courseTitle: cls.course.title,
      teacherName: cls.instructorName,
      startsAt: cls.startsAt.toISOString(),
      endsAt: cls.endsAt.toISOString(),
      meetingUrl: cls.meetingUrl || "https://meet.google.com/tg-lms-demo",
      status: cls.status,
      recordingUrl: cls.recordingUrl,
      attendanceStatus: attendance?.status,
      isJoinable: cls.status === "LIVE" || cls.status === "SCHEDULED",
    }
  })

  const studentTimezone = user.profile?.timezone || "Asia/Kolkata (IST)"

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* Banner with Apple/Google Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-brand-teal/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs backdrop-blur-md">
            <Video className="w-3.5 h-3.5" />
            <span className="tracking-wide">Live Interactive Class Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Live Engineering Sessions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Attend real-time architectural reviews, system design whiteboarding, and Q&A sessions led by principal architects.
          </p>
        </div>
      </div>

      <LiveClassesClient classes={classItems} timezone={studentTimezone} />
    </div>
  )
}
