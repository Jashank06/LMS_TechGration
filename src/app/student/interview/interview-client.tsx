"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Lock,
  ArrowRight,
  Sparkles,
  Bot,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
  Binary,
  Layers,
  Award,
  BookOpen,
  GraduationCap,
  Flame,
  Briefcase,
  TrendingUp,
  Cpu,
  Video,
} from "lucide-react"

export interface EnrolledCourseInterviewInfo {
  id: string
  courseId: string
  courseTitle: string
  courseSubtitle: string | null
  category: string
  level: string
  instructorName: string
  progressPct: number
  status: string
}

export function InterviewClient({
  studentName,
  enrolledCourses,
  hasEarnedCertificate,
}: {
  studentName: string
  enrolledCourses: EnrolledCourseInterviewInfo[]
  hasEarnedCertificate: boolean
}) {
  const [selectedCourseIndex, setSelectedCourseIndex] = React.useState<number>(0)
  const activeCourse = enrolledCourses[selectedCourseIndex] || enrolledCourses[0] || null

  const isEligible = activeCourse ? activeCourse.progressPct >= 100 && hasEarnedCertificate : false

  return (
    <div className="space-y-8">
      {/* Top Multi-Course Switcher (if enrolled in > 1 course) */}
      {enrolledCourses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {enrolledCourses.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseIndex(idx)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
                selectedCourseIndex === idx
                  ? "bg-cyan-500/15 text-cyan-500 border-cyan-500/40 shadow-xs"
                  : "bg-card/70 text-muted-foreground border-border/70 hover:text-foreground hover:border-border"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="max-w-[200px] truncate">{course.courseTitle}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/80 text-foreground font-mono">
                {course.progressPct}%
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CENTER STAGE: ULTRA-HIGH-TECH CYBER VAULT LOCK HERO                       */}
      {/* ========================================================================= */}
      <div className="relative group">
        {/* Ambient Cyber Lighting */}
        <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Outer High-Tech Bezel */}
        <div className="relative rounded-[2rem] border-2 border-cyan-500/30 bg-gradient-to-b from-card/95 via-card to-background p-6 sm:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden text-center">
          
          {/* Cyber Precision Corner Brackets */}
          <div className="pointer-events-none absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
          <div className="pointer-events-none absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
          <div className="pointer-events-none absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg" />
          <div className="pointer-events-none absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg" />

          {/* Micro Grid Background */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00D6D6_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Concentric Animated Lock Rings */}
          <div className="relative z-10 flex items-center justify-center mb-6">
            <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
            <div className="absolute w-44 h-44 rounded-full border border-amber-500/20 animate-pulse opacity-40" />

            {/* Glowing Center Hub */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
              <Lock className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow-xs mb-3">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Interview Gateway Locked • Eligibility Pending</span>
          </div>

          {/* Core User-Specified Requirement Headline */}
          <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Complete your course to be eligible for interview
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {activeCourse
                ? `You are currently enrolled in "${activeCourse.courseTitle}". Achieve 100% course completion and claim your verified certificate to unlock technical interview screenings.`
                : "Enroll in a course and achieve 100% curriculum completion to unlock faculty mock interviews and AI technical screening."}
            </p>
          </div>

          {/* Enrolled Course Progress Pill */}
          {activeCourse && (
            <div className="relative z-10 mt-6 max-w-md mx-auto p-4 rounded-2xl bg-secondary/50 border border-border/80 backdrop-blur-md space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Your Current Course Progress</span>
                </span>
                <span className="font-black font-mono text-foreground text-sm">
                  {activeCourse.progressPct}% / 100%
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-2.5 w-full bg-background/80 rounded-full overflow-hidden p-0.5 border border-border/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-teal via-cyan-400 to-emerald-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(activeCourse.progressPct, 4))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Start</span>
                <span>100% Required for Interview</span>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          {activeCourse && (
            <div className="relative z-10 mt-7 flex items-center justify-center gap-3">
              <Button
                asChild
                className="h-12 px-8 rounded-2xl font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-sm shadow-xl shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link href={`/student/courses/${activeCourse.courseId}`}>
                  <span>Continue Learning to Unlock Interview</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ELIGIBILITY CRITERIA MATRIX                                               */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-500 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                Placement & Interview Eligibility Checklist
              </h3>
              <p className="text-xs text-muted-foreground">
                All 3 prerequisites must be fully fulfilled to unlock technical mock sessions.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-secondary/80 text-muted-foreground border border-border/60">
            0 / 3 Fulfilled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Requirement 1 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Criterion 1
              </span>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" />
                <span>{activeCourse ? `${activeCourse.progressPct}% / 100%` : "0%"}</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">100% Curriculum Completion</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete all foundational theory, neural architecture modules, and hands-on laboratory exercises.
            </p>
          </div>

          {/* Requirement 2 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Criterion 2
              </span>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" />
                <span>Pending</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Capstone Lab & Assessment</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Build and submit the production architectural capstone project and pass the final technical assessment.
            </p>
          </div>

          {/* Requirement 3 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Criterion 3
              </span>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" />
                <span>Unclaimed</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Verified Industry Certificate</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Claim your cryptographically signed TechGration certificate with unique verification hash.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE PREVIEW: WHAT YOU WILL UNLOCK                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                What You Will Unlock
              </h3>
              <p className="text-xs text-muted-foreground">
                Exclusive placement acceleration features unlocked upon eligibility.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Feature Roadmap Preview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Feature 1 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/25 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                AI Technical Voice & Architectural Viva
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adaptive AI interviewer simulates live technical screenings, asking targeted deep-dive questions based on your course curriculum.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-cyan-500 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Real-Time Code & Concept Analysis</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/25 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                1-on-1 Faculty Mock Screening
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Schedule a 45-minute live 1-on-1 video mock interview with Lead Course Architect (Jay Kumar) to fine-tune your problem-solving presentation.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-purple-400 font-semibold">
              <Video className="w-3.5 h-3.5" />
              <span>Direct Mentorship & Detailed Feedback</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/25 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                Interview Readiness Diagnostic Matrix
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive granular rubric scoring on System Architecture, Algorithmic Precision, Code Quality, and Engineering Communication.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-blue-400 font-semibold">
              <Binary className="w-3.5 h-3.5" />
              <span>Personalized Improvement Roadmap</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">
                Enterprise Placement Referral Gateway
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Candidates scoring ≥ 85% on their mock evaluations receive direct resume routing and referrals to TechGration hiring partners.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Fast-Track Recruiter Visibility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
