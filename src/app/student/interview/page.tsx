import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { InterviewClient, EnrolledCourseInterviewInfo } from "./interview-client"
import { Briefcase, Building2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Company Interviews & Placements — TechGration LMS",
  description: "Apply for direct technical interviews at partner tech companies upon curriculum completion.",
}

export default async function InterviewPage() {
  const user = await requireStudent()

  // 1. Fetch active course enrollments
  const rawEnrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: true,
    },
    orderBy: { enrolledAt: "desc" },
  })

  // Prioritize "Artificial Intelligence" course
  const enrollments = [...rawEnrollments].sort((a, b) => {
    const isAiA =
      a.course.id === "6ad283b4e196d0b8fbfb9eae" ||
      a.course.title.toLowerCase().includes("artificial intelligence")
    const isAiB =
      b.course.id === "6ad283b4e196d0b8fbfb9eae" ||
      b.course.title.toLowerCase().includes("artificial intelligence")

    if (isAiA && !isAiB) return -1
    if (!isAiA && isAiB) return 1
    return 0
  })

  // 2. Fetch earned certificates
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
  })

  const enrolledCourses: EnrolledCourseInterviewInfo[] = enrollments.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    courseTitle: e.course.title,
    courseSubtitle: e.course.subtitle,
    category: e.course.category,
    level: e.course.level,
    instructorName: e.course.instructorName,
    progressPct: Math.round(e.progressPct),
    status: e.status,
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-xs backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5 text-cyan-500" />
            <span className="tracking-wide">Direct Company Hiring Drives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Company Interview & Placement Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Apply for direct technical interviews with top companies, AI labs, and product startups once you achieve 100% course completion.
          </p>
        </div>
      </div>

      <InterviewClient
        studentName={user.name || "Student"}
        enrolledCourses={enrolledCourses}
        hasEarnedCertificate={certificates.length > 0}
      />
    </div>
  )
}
