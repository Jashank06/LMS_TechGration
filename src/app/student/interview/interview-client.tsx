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
  Terminal,
  Mic,
  Volume2,
  Activity,
  Zap,
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth pb-1">
          {enrolledCourses.map((course, idx) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseIndex(idx)}
              className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2.5 ${
                selectedCourseIndex === idx
                  ? "bg-cyan-500/15 text-cyan-500 border-cyan-500/40 shadow-xs"
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
      {/* CENTER STAGE: ULTRA-HIGH-TECH CYBER VAULT LOCK HERO                       */}
      {/* ========================================================================= */}
      <div className="relative group">
        {/* Ambient Cyber Lighting */}
        <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Outer High-Tech Bezel */}
        <div className="relative rounded-[2rem] border-2 border-cyan-500/30 bg-gradient-to-b from-card/95 via-card to-background p-5 sm:p-12 shadow-2xl backdrop-blur-2xl overflow-hidden text-center">
          
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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>
          </div>

          {/* Status Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow-xs mb-3">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Interview Gateway Locked • Eligibility Pending</span>
          </div>

          {/* Core User-Specified Requirement Headline */}
          <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-4xl font-black tracking-tight text-foreground">
              Complete your course to be eligible for interview
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
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
            <div className="relative z-10 mt-7 flex items-center justify-center">
              <Button
                asChild
                className="w-full sm:w-auto h-12 px-6 sm:px-8 rounded-2xl font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs sm:text-sm shadow-xl shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98] justify-center"
              >
                <Link href={`/student/courses/${activeCourse.courseId}`} className="justify-center">
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
      {/* FUTURISTIC AI TECHNICAL INTERVIEW SIMULATION STUDIO                       */}
      {/* ========================================================================= */}
      <div className="relative group">
        {/* Ambient Back Glow */}
        <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-purple-500/15 via-cyan-500/15 to-emerald-500/15 rounded-[2.5rem] blur-2xl opacity-60" />

        {/* Studio Console Container */}
        <div className="relative rounded-[2rem] border-2 border-border/80 bg-gradient-to-b from-[#0C1014] to-[#070A0D] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden text-left text-white space-y-6">
          
          {/* macOS Terminal Titlebar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-xs" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <Terminal className="w-3.5 h-3.5 text-brand-teal" />
                <span>tg-ai-interview-viva://live-sandbox [ARM64_NEURAL_ENGINE]</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Lock className="w-3 h-3" />
                <span>LOCKED STUDIO • ACTIVATES AT 100%</span>
              </span>
            </div>
          </div>

          {/* Studio Stage Layout (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 Cols: AI Voice Viva & Waveform */}
            <div className="lg:col-span-7 rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Voice Agent Identity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal/20 to-cyan-500/10 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-lg shadow-brand-teal/10">
                      <Bot className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span>TechGration AI Technical Examiner</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-brand-teal/20 text-brand-teal border border-brand-teal/30">v2.5</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400">Adaptive Architectural & Deep Learning Viva</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-brand-teal" />
                    <span>Live Viva Stream</span>
                  </span>
                </div>

                {/* Examiner Question Bubble */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-brand-teal font-bold flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3" />
                    <span>Real-Time Viva Question:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
                    &quot;Hello <strong className="text-white">{studentName}</strong>. Let&apos;s evaluate your architectural depth in distributed systems. Walk me through how you would architect a high-throughput vector database search handling 50k QPS with sub-50ms latency using HNSW indexing and GPU quantization.&quot;
                  </p>
                </div>

                {/* Animated Audio Equalizer Waveform */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-1.5 overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 shrink-0">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Neural Audio:</span>
                  </div>
                  <div className="flex items-center gap-1 h-8 flex-1 justify-end">
                    {[40, 75, 55, 90, 60, 30, 85, 100, 70, 45, 95, 65, 80, 50, 90, 40, 70, 85, 60, 100, 45, 80].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-brand-teal via-cyan-400 to-emerald-400 opacity-80 animate-pulse"
                        style={{
                          height: `${h}%`,
                          animationDuration: `${0.6 + (i % 5) * 0.15}s`,
                          animationDelay: `${(i % 4) * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Candidate Voice Input State (Locked) */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-2 font-mono text-[11px]">
                  <Mic className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Candidate Mic Input (Locked until 100% completion)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">AST Analysis Ready</span>
              </div>
            </div>

            {/* Right 5 Cols: Diagnostic Telemetry HUD */}
            <div className="lg:col-span-5 rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>Viva Telemetry HUD</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">CALIBRATED</span>
                </div>

                {/* Score Meters */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">System Architecture</span>
                      <span className="text-brand-teal font-bold">98 / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-teal to-cyan-400 w-[98%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Algorithmic Precision</span>
                      <span className="text-emerald-400 font-bold">95 / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Technical Articulation</span>
                      <span className="text-purple-400 font-bold">96 / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 w-[96%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">Production Reliability</span>
                      <span className="text-amber-400 font-bold">94 / 100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-[94%]" />
                    </div>
                  </div>
                </div>

                {/* Telemetry Verdict */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-brand-teal/5 border border-emerald-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Tier-1 Recruiter Clearance</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Evaluated candidates scoring ≥ 85% receive automated referral routing to TechGration enterprise hiring partners.
                  </p>
                </div>
              </div>

              {/* 1-on-1 Faculty Tag */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Faculty Mock: Jay Kumar</span>
                </span>
                <span className="text-white font-bold">45m Live 1-on-1</span>
              </div>
            </div>
          </div>

          {/* Bottom Career Pipeline Ribbon */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">Phase 1 (Active)</div>
                <div className="text-xs font-bold text-white">100% Course Study</div>
                <div className="text-[10px] text-neutral-400">Labs & Lectures</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono font-bold text-brand-teal uppercase">Phase 2 (Locked)</div>
                <div className="text-xs font-bold text-white">AI Voice Viva</div>
                <div className="text-[10px] text-neutral-400">Architectural Drill</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono font-bold text-purple-400 uppercase">Phase 3 (Locked)</div>
                <div className="text-xs font-bold text-white">1-on-1 Faculty Mock</div>
                <div className="text-[10px] text-neutral-400">Lead Architect Defense</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Phase 4 (Locked)</div>
                <div className="text-xs font-bold text-white">Placement Dispatch</div>
                <div className="text-[10px] text-neutral-400">Hiring Partner Network</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
