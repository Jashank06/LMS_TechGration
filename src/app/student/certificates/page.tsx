import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import {
  CertificatesClient,
  CertificateItem,
  InProgressCourseCertificate,
} from "./certificates-client"
import { Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Certificates Center — TechGration LMS",
  description: "View your earned certificates and track in-progress course credentials.",
}

export default async function CertificatesPage() {
  const user = await requireStudent()

  // 1. Fetch earned certificates
  const certificates = await db.certificate.findMany({
    where: { userId: user.id },
    include: {
      course: true,
      user: true,
    },
    orderBy: { issuedAt: "desc" },
  })

  // 2. Fetch all course enrollments for this student (courses in "My Courses")
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: true,
    },
    orderBy: { enrolledAt: "desc" },
  })

  const earnedCourseIds = new Set(certificates.map((c) => c.courseId))

  const certItems: CertificateItem[] = certificates.map((c) => ({
    id: c.id,
    code: c.code,
    courseId: c.courseId,
    courseTitle: c.courseTitle,
    studentName: c.studentName,
    issuedAt: c.issuedAt.toISOString(),
    teacherName: c.course.instructorName,
  }))

  // Enrolled courses where certificate is in progress or ready to claim
  const inProgressCourses: InProgressCourseCertificate[] = enrollments
    .filter((e) => !earnedCourseIds.has(e.courseId))
    .map((e) => ({
      id: e.id,
      courseId: e.courseId,
      courseTitle: e.course.title,
      courseSubtitle: e.course.subtitle,
      category: e.course.category,
      level: e.course.level,
      thumbnailUrl: e.course.thumbnailUrl,
      instructorName: e.course.instructorName,
      progressPct: Math.round(e.progressPct),
      status: e.status,
      enrolledAt: e.enrolledAt.toISOString(),
    }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto">
      {/* Banner with Apple/Google Glassmorphism */}
      <div className="relative rounded-3xl overflow-hidden border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-brand-teal/15 rounded-full blur-3xl opacity-70 dark:opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl opacity-50 dark:opacity-30" />

        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs backdrop-blur-md">
            <Award className="w-3.5 h-3.5" />
            <span className="tracking-wide">Verified Industry Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Certificates & Industry Credentials
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Cryptographically hashed with unique verification codes and public registry lookup. Complete your enrolled courses to unlock your official verified certificate.
          </p>
        </div>
      </div>

      <CertificatesClient
        studentName={user.name || "Student"}
        certificates={certItems}
        inProgressCourses={inProgressCourses}
      />
    </div>
  )
}
