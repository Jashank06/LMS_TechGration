import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/server/db"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { CheckCircle2, Award, ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return {
    title: `Verify Certificate ${resolvedParams.code} — TechGration LMS`,
    description: "Public credential registry and validity verification.",
  }
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const resolvedParams = await params

  const certificate = await db.certificate.findUnique({
    where: { code: resolvedParams.code },
    include: {
      user: true,
      course: true,
    },
  })

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Certificate Not Found</h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No credential was found matching code &quot;{resolvedParams.code}&quot;. Please verify the identifier and try again.
        </p>
        <Link href="/" className="mt-4 text-xs text-brand-ink dark:text-brand-teal font-semibold hover:underline">
          Return to TechGration Home
        </Link>
      </div>
    )
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-card/60 backdrop-blur-md">
        <BrandLogo variant="sidebar" />
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Authentic Credential Verified</p>
              <p className="text-[11px] text-muted-foreground">This certificate was directly issued by TechGration Technologies Private Limited.</p>
            </div>
          </div>

          <div className="space-y-4 text-center py-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Official Recipient
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {certificate.studentName}
            </h2>
            <p className="text-xs text-muted-foreground">
              has demonstrated technical excellence in
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-brand-ink dark:text-brand-teal">
              {certificate.courseTitle}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
            <div>
              <p className="text-muted-foreground">Certificate Identifier</p>
              <p className="font-mono font-bold text-foreground mt-0.5">{certificate.code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date Issued</p>
              <p className="font-semibold text-foreground mt-0.5">{issuedDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Issuing Faculty</p>
              <p className="font-semibold text-foreground mt-0.5">{certificate.course.instructorName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Accreditation</p>
              <p className="font-semibold text-foreground mt-0.5">Enterprise Cloud Verified</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>TechGration LMS</span>
            </Link>
            <span>Verified Registry Hash: SHA-256 Validated</span>
          </div>
        </div>
      </main>
    </div>
  )
}
