"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Award,
  Calendar,
  ExternalLink,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Flame,
  Fingerprint,
  QrCode,
  ShieldAlert,
  Cpu,
  Layers,
  Check,
  Binary,
  Radio,
} from "lucide-react"
import { toast } from "sonner"
import { triggerBrandCelebration } from "@/components/motion/celebration"

export interface CertificateItem {
  id: string
  code: string
  courseId: string
  courseTitle: string
  studentName: string
  issuedAt: string
  teacherName: string
}

export interface InProgressCourseCertificate {
  id: string
  courseId: string
  courseTitle: string
  courseSubtitle: string | null
  category: string
  level: string
  thumbnailUrl: string | null
  instructorName: string
  progressPct: number
  status: string
  enrolledAt: string
}

export function CertificatesClient({
  studentName,
  certificates,
  inProgressCourses,
}: {
  studentName: string
  certificates: CertificateItem[]
  inProgressCourses: InProgressCourseCertificate[]
}) {
  const [earnedList, setEarnedList] = React.useState<CertificateItem[]>(certificates)
  const [inProgressList, setInProgressList] =
    React.useState<InProgressCourseCertificate[]>(inProgressCourses)
  
  // Track active view: in_progress vs earned
  const [activeTab, setActiveTab] = React.useState<"in_progress" | "earned">(
    inProgressCourses.length > 0 ? "in_progress" : "earned"
  )

  // Track active course selected in stage
  const [selectedCourseIndex, setSelectedCourseIndex] = React.useState<number>(0)

  // Modals
  const [selectedCert, setSelectedCert] = React.useState<CertificateItem | null>(null)
  const [securityModalOpen, setSecurityModalOpen] = React.useState<boolean>(false)
  const [claimingCourseId, setClaimingCourseId] = React.useState<string | null>(null)

  const activeCourse = inProgressList[selectedCourseIndex] || inProgressList[0] || null

  const handlePrint = () => {
    window.print()
  }

  const handleClaimCertificate = async (courseId: string) => {
    setClaimingCourseId(courseId)
    try {
      const res = await fetch("/api/student/certificates/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to claim certificate. Please try again.")
        return
      }

      // Trigger brand celebration confetti
      triggerBrandCelebration()
      toast.success(data.message || "Certificate issued successfully! Congratulations!")

      // Move from inProgress to earned
      setInProgressList((prev) => prev.filter((item) => item.courseId !== courseId))
      setEarnedList((prev) => [data.certificate, ...prev])
      setActiveTab("earned")

      // Open certificate modal automatically
      setSelectedCert(data.certificate)
    } catch (err) {
      console.error(err)
      toast.error("Network error while claiming certificate.")
    } finally {
      setClaimingCourseId(null)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Segmented Switcher & Recipient Info */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        <div className="grid grid-cols-2 sm:flex items-center gap-2 p-1.5 bg-secondary/60 rounded-2xl border border-border/70 backdrop-blur-md shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("in_progress")}
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "in_progress"
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground active:bg-muted/50"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Progress ({inProgressList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("earned")}
            className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "earned"
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground active:bg-muted/50"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Earned ({earnedList.length})</span>
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs text-muted-foreground px-3.5 py-2 rounded-2xl sm:rounded-full bg-card/60 border border-border/60 backdrop-blur-md w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-teal shrink-0" />
            <span>Recipient:</span>
          </div>
          <strong className="text-foreground truncate">{studentName}</strong>
        </div>
      </div>

      {/* MULTIPLE COURSES SELECTOR TABS (If student is enrolled in > 1 course) */}
      {activeTab === "in_progress" && inProgressList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth pb-2">
          {inProgressList.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseIndex(idx)}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
                selectedCourseIndex === idx
                  ? "bg-brand-teal/15 text-brand-teal border-brand-teal/40 shadow-xs"
                  : "bg-card/70 text-muted-foreground border-border/70 hover:text-foreground hover:border-border active:bg-muted"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="max-w-[180px] truncate">{course.courseTitle}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/80 text-foreground font-mono">
                {course.progressPct}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CENTER STAGE: IN-PROGRESS CERTIFICATE SPOTLIGHT                         */}
      {/* ========================================================================= */}
      {activeTab === "in_progress" && (
        <>
          {activeCourse ? (
            <div className="space-y-8">
              {/* THE ULTRA-HIGH-TECH CERTIFICATE PODIUM */}
              <div className="relative group">
                {/* Ambient Cyber Light Glow */}
                <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-brand-teal/20 via-cyan-500/10 to-brand-teal/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Outer High-Tech Bezel */}
                <div className="relative rounded-[2rem] border-2 border-brand-teal/30 bg-gradient-to-b from-card/95 via-card to-background p-4 sm:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden">
                  
                  {/* Cyber Precision Corner Brackets */}
                  <div className="pointer-events-none absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-teal/50 rounded-tl-lg" />
                  <div className="pointer-events-none absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-teal/50 rounded-tr-lg" />
                  <div className="pointer-events-none absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-teal/50 rounded-bl-lg" />
                  <div className="pointer-events-none absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-teal/50 rounded-br-lg" />

                  {/* Micro Tech Grid Background */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00D6D6_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* CERTIFICATE INNER CANVAS */}
                  <div className="relative z-10 border border-brand-teal/20 rounded-2xl p-4 sm:p-12 text-center space-y-5 sm:space-y-6 bg-gradient-to-b from-background/40 via-card/30 to-background/60 shadow-inner">
                    
                    {/* Official TechGration Crest */}
                    <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto drop-shadow-[0_10px_25px_rgba(0,214,214,0.3)]">
                      <Image
                        src="/brand/tg-mark.png"
                        alt="TechGration Official Seal"
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>

                    {/* Authority Header */}
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-extrabold text-brand-teal bg-brand-teal/10 border border-brand-teal/25">
                        <Binary className="w-3 h-3" />
                        <span>TECHGRATION TECHNOLOGIES • FACULTY OF AI & COMPUTING</span>
                      </div>
                      <h2 className="text-lg sm:text-3xl font-extrabold tracking-tight text-foreground font-serif uppercase">
                        Certificate of Architectural Mastery
                      </h2>
                    </div>

                    <p className="text-xs text-muted-foreground italic tracking-wide">
                      This cryptographically verified credential is awarded to
                    </p>

                    {/* Recipient Spotlight */}
                    <div className="py-1">
                      <span className="text-2xl sm:text-5xl font-black tracking-tight text-foreground underline decoration-brand-teal decoration-4 underline-offset-8 drop-shadow-sm break-words">
                        {studentName}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                      for demonstrating exceptional mastery, completing all advanced architectural labs, live instructor sessions, and rigorous capstone requirements in
                    </p>

                    {/* Course Title Spotlight */}
                    <div className="py-1">
                      <h3 className="text-base sm:text-2xl font-black text-brand-teal tracking-tight max-w-2xl mx-auto">
                        {activeCourse.courseTitle}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                        Category: {activeCourse.category} • Level: {activeCourse.level}
                      </p>
                    </div>

                    {/* Signature & Cryptographic Ledger Footer */}
                    <div className="pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 items-end gap-4 text-xs text-muted-foreground">
                      <div className="text-left space-y-0.5">
                        <div className="w-24 border-b border-muted-foreground/40 pb-1 mb-1 font-serif italic text-foreground font-bold">
                          Jay Kumar
                        </div>
                        <p className="font-bold text-foreground text-[11px]">Jay Kumar</p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Lead Course Architect</p>
                      </div>

                      <div className="hidden sm:flex flex-col items-center justify-center space-y-1">
                        <div className="w-8 h-8 rounded-full border border-brand-teal/40 flex items-center justify-center text-brand-teal bg-brand-teal/5 shadow-xs">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono tracking-wider text-brand-teal font-bold uppercase">
                          OFFICIAL SEAL
                        </span>
                      </div>

                      <div className="text-right space-y-0.5 font-mono">
                        <p className="text-[10px] text-muted-foreground uppercase">Registry Identifier</p>
                        <p className="font-bold text-foreground text-[11px] tracking-wider">
                          {activeCourse.progressPct >= 100 ? "TG-UNCLAIMED" : "TG-LOCKED-PREVIEW"}
                        </p>
                        <p className="text-[9px] text-brand-teal">techgration.live/verify</p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* FROSTED CYBER SECURITY SHIELD (OVERLAY WHEN IN-PROGRESS / LOCKED)         */}
                  {/* ========================================================================= */}
                  <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-10 text-center transition-all">
                    
                    {/* Concentric Pulsing Lock HUD */}
                    <div className="relative flex items-center justify-center mb-5">
                      {/* Outer Pulse Rings */}
                      <div className="absolute w-36 h-36 rounded-full border border-brand-teal/20 animate-ping opacity-25" />
                      <div className="absolute w-44 h-44 rounded-full border border-amber-500/20 animate-pulse opacity-40" />

                      {/* SVG Circular Progress Gauge */}
                      <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
                        {/* Background Track */}
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-secondary/60"
                        />
                        {/* Glowing Progress Arc */}
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="url(#progressGradient)"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 52}
                          strokeDashoffset={
                            2 * Math.PI * 52 * (1 - Math.max(activeCourse.progressPct, 4) / 100)
                          }
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00D6D6" />
                            <stop offset="50%" stopColor="#18E6E6" />
                            <stop offset="100%" stopColor="#10B981" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Center Core HUD */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {activeCourse.progressPct >= 100 ? (
                          <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />
                        ) : (
                          <Lock className="w-7 h-7 text-amber-500 animate-pulse" />
                        )}
                        <span className="text-xl font-black text-foreground font-mono mt-0.5">
                          {activeCourse.progressPct}%
                        </span>
                      </div>
                    </div>

                    {/* HUD Status Text */}
                    <div className="max-w-md space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-card/90 border border-border/80 shadow-md">
                        {activeCourse.progressPct >= 100 ? (
                          <span className="flex items-center gap-1.5 text-emerald-500">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>100% Curriculum Fulfilled</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>Certificate Locked • In Progress</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                        {activeCourse.progressPct >= 100
                          ? "Congratulations! Your verified certificate is ready to issue."
                          : "Complete this course to unlock your cryptographically verified certificate."}
                      </h3>

                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        {activeCourse.progressPct >= 100
                          ? "Click below to mint your verifiable certificate code with permanent public registry record."
                          : "Attend live classes, finish study modules, and submit assignments to unlock your official credential."}
                      </p>
                    </div>

                    {/* Quick Specs Chip */}
                    <div className="mt-5 flex items-center justify-center flex-wrap gap-2 text-[11px] text-muted-foreground font-medium">
                      <span className="px-2.5 py-1 rounded-lg bg-card/70 border border-border/60 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-brand-teal" />
                        <span>SHA-256 Validated</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-card/70 border border-border/60 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Public Registry</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-card/70 border border-border/60 flex items-center gap-1">
                        <Printer className="w-3 h-3 text-purple-400" />
                        <span>Vector PDF Export</span>
                      </span>
                    </div>

                    {/* Primary Action Button directly on HUD */}
                    <div className="mt-6 flex items-center justify-center w-full px-2">
                      {activeCourse.progressPct >= 100 ? (
                        <Button
                          onClick={() => handleClaimCertificate(activeCourse.courseId)}
                          disabled={claimingCourseId === activeCourse.courseId}
                          className="w-full sm:w-auto h-12 px-6 sm:px-8 rounded-2xl font-extrabold bg-gradient-to-r from-emerald-500 to-brand-teal hover:opacity-95 text-brand-charcoal text-xs sm:text-sm shadow-xl shadow-brand-teal/25 transition-all hover:scale-[1.02] active:scale-[0.98] justify-center"
                        >
                          <Sparkles className="w-4 h-4 mr-2 shrink-0" />
                          <span>
                            {claimingCourseId === activeCourse.courseId
                              ? "Issuing Official Credential..."
                              : "Claim & Mint Verified Certificate 🎉"}
                          </span>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          className="w-full sm:w-auto h-12 px-6 sm:px-8 rounded-2xl font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs sm:text-sm shadow-xl shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98] justify-center text-center"
                        >
                          <Link href={`/student/courses/${activeCourse.courseId}`} className="justify-center">
                            <span>Continue Learning to Unlock</span>
                            <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PROGRESS COMMAND DECK & LEARNING MILESTONES                                */}
              {/* ========================================================================= */}
              <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-500" />
                      <span>{activeCourse.courseTitle}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Lead Instructor: <strong className="text-foreground">{activeCourse.instructorName}</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-brand-teal">
                      {activeCourse.progressPct}%
                    </span>
                    <span className="text-xs text-muted-foreground block font-medium">
                      Overall Progress
                    </span>
                  </div>
                </div>

                {/* Smooth Progress Bar */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-secondary/80 rounded-full overflow-hidden p-0.5 border border-border/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-teal via-cyan-400 to-emerald-400 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(activeCourse.progressPct, 4))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Course Start (0%)</span>
                    <span>Verified Certificate Minting (100%)</span>
                  </div>
                </div>

                {/* 4 Curriculum Verification Milestones */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-brand-teal">Phase 1</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                    </div>
                    <p className="text-xs font-bold text-foreground">Curriculum Lectures</p>
                    <p className="text-[10px] text-muted-foreground">Theory & core concepts</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-brand-teal">Phase 2</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                    </div>
                    <p className="text-xs font-bold text-foreground">Live Masterclasses</p>
                    <p className="text-[10px] text-muted-foreground">Weekly interactive sessions</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-brand-teal">Phase 3</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                    </div>
                    <p className="text-xs font-bold text-foreground">Architectural Labs</p>
                    <p className="text-[10px] text-muted-foreground">Hands-on practical code</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-brand-teal/10 border border-brand-teal/25 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-brand-teal">Phase 4</span>
                      <Award className="w-3.5 h-3.5 text-brand-teal" />
                    </div>
                    <p className="text-xs font-bold text-brand-teal">Industry Credential</p>
                    <p className="text-[10px] text-muted-foreground">Tamper-proof certificate</p>
                  </div>
                </div>

                {/* Footer Security Tech Info */}
                <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-teal" />
                    <span>Cryptographic Verification Engine: <strong>SHA-256 Ledger</strong></span>
                  </div>

                  <button
                    onClick={() => setSecurityModalOpen(true)}
                    className="text-brand-ink dark:text-brand-teal font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View Tamper-Proof Security Specs</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">No enrolled courses yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enroll in a course to start your learning journey and unlock your official verified certificate.
                </p>
              </div>
              <Button
                asChild
                className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs h-10 px-5 rounded-xl shadow-md shadow-brand-teal/20"
              >
                <Link href="/student/explore">Browse Courses</Link>
              </Button>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. EARNED CERTIFICATES SECTION                                            */}
      {/* ========================================================================= */}
      {activeTab === "earned" && (
        <div className="space-y-6">
          {earnedList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-muted-foreground mx-auto shadow-sm">
                <Lock className="w-7 h-7 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">No issued certificates yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You are currently progressing toward your certificates. Complete your enrolled course to 100% to earn and verify your official credential.
                </p>
              </div>
              <Button
                onClick={() => setActiveTab("in_progress")}
                className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs h-10 px-5 rounded-xl shadow-md shadow-brand-teal/20"
              >
                View Course Progress
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedList.map((cert) => {
                const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })

                return (
                  <div
                    key={cert.id}
                    className="group p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs hover:border-brand-teal/50 hover:shadow-[0_12px_35px_-8px_rgba(0,214,214,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-2xl bg-brand-teal/15 text-brand-teal border border-brand-teal/30 shadow-xs">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-md bg-secondary/60">
                          ID: {cert.code}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 group-hover:text-brand-teal transition-colors">
                        {cert.courseTitle}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        Awarded to <strong className="text-foreground font-semibold">{cert.studentName}</strong>
                      </p>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                          <span>{issuedDate}</span>
                        </span>
                        <span className="text-emerald-500 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 flex items-center gap-2.5">
                      <Button
                        onClick={() => setSelectedCert(cert)}
                        size="sm"
                        className="flex-1 font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs h-10 rounded-xl shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>View Certificate</span>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-10 px-3.5 text-xs rounded-xl border-border/80 hover:bg-secondary"
                        title="Public Verification Link"
                      >
                        <Link href={`/verify/${cert.code}`} target="_blank">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFICIAL ISSUED CERTIFICATE MODAL                                      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 3. OFFICIAL ISSUED CERTIFICATE MODAL                                      */}
      {/* ========================================================================= */}
      <Dialog open={Boolean(selectedCert)} onOpenChange={(open) => !open && setSelectedCert(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90dvh] overflow-y-auto overscroll-contain p-0 border-border/80 bg-card rounded-3xl">
          <DialogTitle className="sr-only">Certificate of Completion</DialogTitle>
          {selectedCert && (
            <div className="p-4 sm:p-8 space-y-6 select-none bg-gradient-to-b from-card via-card to-brand-teal/5">
              <div className="relative border-2 sm:border-4 border-brand-teal/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center space-y-4 bg-background/50 shadow-inner">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                  <Image
                    src="/brand/tg-mark.png"
                    alt="TechGration Seal"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-bold text-brand-teal block">
                    TechGration Technologies Private Limited
                  </span>
                  <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                    CERTIFICATE OF COMPLETION
                  </h2>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  This certifies that
                </p>

                <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground underline decoration-brand-teal decoration-2 underline-offset-4 break-words">
                  {selectedCert.studentName}
                </p>

                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  has successfully fulfilled all curriculum, live masterclasses, hands-on architectural labs, and assessment requirements for
                </p>

                <h3 className="text-sm sm:text-lg font-bold text-foreground">
                  {selectedCert.courseTitle}
                </h3>

                <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="text-left">
                    <p className="font-bold text-foreground text-xs">{selectedCert.teacherName}</p>
                    <p className="text-[10px]">Lead Course Architect</p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-foreground font-bold text-xs">ID: {selectedCert.code}</p>
                    <p className="text-[10px]">techgration.live/verify</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs border-border/80 rounded-xl h-11 sm:h-10 px-4 font-semibold justify-center"
                >
                  <Link href={`/verify/${selectedCert.code}`} target="_blank" className="justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    <span>Public Verification Link</span>
                    <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                  </Link>
                </Button>

                <Button
                  onClick={handlePrint}
                  size="sm"
                  className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs h-11 sm:h-10 px-5 rounded-xl shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98] justify-center"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  <span>Print / Save PDF</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* ========================================================================= */}
      {/* 5. TAMPER-PROOF SECURITY SPECS MODAL                                      */}
      {/* ========================================================================= */}
      <Dialog open={securityModalOpen} onOpenChange={setSecurityModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain p-5 sm:p-6 border-border/80 bg-card rounded-3xl space-y-5">
          <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Cryptographic Verification Architecture</span>
          </DialogTitle>

          <p className="text-xs text-muted-foreground leading-relaxed">
            TechGration certificates are engineered to the highest standard of academic and enterprise authenticity, ensuring your achievements cannot be forged or altered.
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Binary className="w-4 h-4 text-brand-teal" />
                <span>SHA-256 Cryptographic Hash</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Each certificate is signed with a unique SHA-256 hash derived from the recipient identity, course ID, and issuance timestamp.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Public Registry Lookup</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Recruiters, engineering leaders, and universities can verify credential validity instantly via <strong className="text-foreground">techgration.live/verify/[code]</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Permanent Immutability</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Once claimed upon 100% course completion, your credential is permanently linked to your profile and cannot be revoked or tampered with.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setSecurityModalOpen(false)}
              className="w-full sm:w-auto bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal font-bold text-xs h-11 sm:h-10 px-6 rounded-xl shadow-md shadow-brand-teal/20 justify-center"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
