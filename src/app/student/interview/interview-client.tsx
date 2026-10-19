"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Lock,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Briefcase,
  Flame,
  Layers,
  MapPin,
  Banknote,
  Send,
  Calendar,
  ExternalLink,
  BookOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

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

interface CompanyJobOpening {
  id: string
  companyName: string
  tagline: string
  logoInitial: string
  logoBg: string
  role: string
  cohortTag: string
  ctc: string
  workType: string
  location: string
  tags: string[]
  rounds: string[]
  openings: number
  description: string
}

const HIRING_COMPANIES: CompanyJobOpening[] = [
  {
    id: "neuralbridge",
    companyName: "NeuralBridge AI Labs",
    tagline: "Enterprise Generative AI & Foundation Model Engineering",
    logoInitial: "NB",
    logoBg: "from-cyan-500 to-blue-600",
    role: "Generative AI & LLM Systems Engineer",
    cohortTag: "AI & Deep Learning Cohort",
    ctc: "₹16 - ₹24 LPA",
    workType: "Full-time • Remote",
    location: "Bangalore / Remote",
    tags: ["PyTorch", "Transformers", "FastAPI", "LangChain", "VectorDB"],
    rounds: [
      "Round 1: Screening & Resume Shortlist",
      "Round 2: Neural Architecture Viva",
      "Round 3: CTO Leadership Round",
    ],
    openings: 3,
    description:
      "Design high-throughput distributed inference pipelines, custom fine-tuning architectures, and low-latency RAG systems for enterprise LLM workloads.",
  },
  {
    id: "hyperstack",
    companyName: "HyperStack Innovations",
    tagline: "High-Throughput FullStack Cloud Platforms",
    logoInitial: "HS",
    logoBg: "from-emerald-500 to-teal-600",
    role: "FullStack Cloud Systems Developer",
    cohortTag: "FullStack Web & Cloud Cohort",
    ctc: "₹12 - ₹18 LPA",
    workType: "Full-time • Hybrid",
    location: "Gurugram / Hybrid",
    tags: ["Next.js 15", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
    rounds: [
      "Round 1: Code Review & Project Defense",
      "Round 2: FullStack System Design",
      "Round 3: Engineering VP Interview",
    ],
    openings: 5,
    description:
      "Build reactive Next.js 15 architectures, real-time WebSocket pipelines, and zero-downtime microservices serving millions of concurrent sessions.",
  },
  {
    id: "kubematrix",
    companyName: "KubeMatrix Technologies",
    tagline: "Automated Cloud Infrastructure & Kubernetes SRE",
    logoInitial: "KM",
    logoBg: "from-blue-600 to-indigo-600",
    role: "DevOps & Cloud Infrastructure Architect",
    cohortTag: "Cloud & DevOps Cohort",
    ctc: "₹11 - ₹17 LPA",
    workType: "Full-time • Remote",
    location: "Noida / Remote",
    tags: ["Kubernetes", "Terraform", "AWS", "CI/CD Pipelines", "Prometheus"],
    rounds: [
      "Round 1: Technical Screening",
      "Round 2: Live Cluster Architecture Debugging",
      "Round 3: VP of Operations",
    ],
    openings: 4,
    description:
      "Deploy self-healing Kubernetes clusters, automate multi-region infrastructure as code, and establish high-observability CI/CD pipelines.",
  },
  {
    id: "cognitivedynamics",
    companyName: "Cognitive Dynamics",
    tagline: "Edge Neural Detection & Deep Vision Systems",
    logoInitial: "CD",
    logoBg: "from-purple-600 to-pink-600",
    role: "Computer Vision & Deep Learning Specialist",
    cohortTag: "AI & Machine Learning Cohort",
    ctc: "₹14 - ₹20 LPA",
    workType: "Full-time • Hybrid",
    location: "Hyderabad / Hybrid",
    tags: ["Computer Vision", "PyTorch", "YOLOv8", "TensorRT", "MLOps"],
    rounds: [
      "Round 1: Vision Model Screening",
      "Round 2: CUDA Optimization & Architecture",
      "Round 3: Director Interview",
    ],
    openings: 2,
    description:
      "Develop ultra-fast edge neural detection models, automated spatial video analytics pipelines, and low-latency TensorRT inference endpoints.",
  },
  {
    id: "quantdata",
    companyName: "QuantAnalytics Systems",
    tagline: "Algorithmic Decision Engines & Predictive Big Data",
    logoInitial: "QA",
    logoBg: "from-amber-500 to-orange-600",
    role: "Data Science & Predictive Modeling Engineer",
    cohortTag: "Data Science Cohort",
    ctc: "₹10 - ₹16 LPA",
    workType: "Full-time • Remote",
    location: "Pune / Remote",
    tags: ["Python", "Statistical Modeling", "SQL", "Tableau", "Scikit-learn"],
    rounds: [
      "Round 1: Statistical Problem Solving",
      "Round 2: Machine Learning Deep Dive",
      "Round 3: Head of Analytics",
    ],
    openings: 3,
    description:
      "Transform high-velocity telemetry data into predictive statistical scoring models, architecting automated business decision engines.",
  },
  {
    id: "algotech",
    companyName: "Algotech Core Systems",
    tagline: "Low-Latency High Frequency Trading & Systems Architecture",
    logoInitial: "AT",
    logoBg: "from-red-600 to-rose-700",
    role: "High-Performance C++ Systems Developer",
    cohortTag: "DSA & Systems Cohort",
    ctc: "₹15 - ₹26 LPA",
    workType: "Full-time • On-site",
    location: "Bangalore / On-site",
    tags: ["C++20", "Low Latency", "Concurrency", "Data Structures", "Linux Kernel"],
    rounds: [
      "Round 1: Algorithmic Complexity Drill",
      "Round 2: Cache-Oblivious Low-Level Design",
      "Round 3: Founder & Lead Architect",
    ],
    openings: 2,
    description:
      "Design sub-microsecond transaction processing pipelines, lock-free concurrent data structures, and memory-mapped operating systems interfaces.",
  },
]

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

  const [selectedCompany, setSelectedCompany] = React.useState<CompanyJobOpening | null>(null)
  const [isApplying, setIsApplying] = React.useState(false)
  const [appliedCompanyIds, setAppliedCompanyIds] = React.useState<string[]>([])

  const handleApply = (company: CompanyJobOpening) => {
    if (!isEligible) {
      toast.error("Complete your course first to unlock company interview applications.")
      return
    }
    setSelectedCompany(company)
  }

  const confirmApplication = () => {
    if (!selectedCompany) return
    setIsApplying(true)
    setTimeout(() => {
      setIsApplying(false)
      setAppliedCompanyIds((prev) => [...prev, selectedCompany.id])
      toast.success(
        `Application submitted to ${selectedCompany.companyName}! TechGration placement team will schedule your technical interview rounds.`
      )
      setSelectedCompany(null)
    }, 1200)
  }

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
      {/* ELIGIBILITY GATEWAY STATUS / HERO CARD                                     */}
      {/* ========================================================================= */}
      {!isEligible ? (
        <div className="relative group">
          {/* Ambient Lighting */}
          <div className="pointer-events-none absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* High-Tech Bezel Card */}
          <div className="relative rounded-[2rem] border-2 border-cyan-500/30 bg-gradient-to-b from-card/95 via-card to-background p-6 sm:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden text-center">
            {/* Precision Corner Brackets */}
            <div className="pointer-events-none absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-lg" />
            <div className="pointer-events-none absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-lg" />
            <div className="pointer-events-none absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-lg" />
            <div className="pointer-events-none absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-500/50 rounded-br-lg" />

            {/* Glowing Lock Center Hub */}
            <div className="relative z-10 flex items-center justify-center mb-5">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              </div>
            </div>

            {/* Status Badge */}
            <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow-xs mb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Company Interviews Locked • Course Completion Required</span>
            </div>

            {/* Core User-Specified Requirement Headline */}
            <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground">
                Complete your course to be eligible for interview
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {activeCourse
                  ? `You are currently enrolled in "${activeCourse.courseTitle}". Achieve 100% curriculum completion and claim your verified certificate to unlock direct interview applications across our hiring network.`
                  : "Enroll in a course and achieve 100% curriculum completion to unlock direct company technical interviews."}
              </p>
            </div>

            {/* Progress Pill */}
            {activeCourse && (
              <div className="relative z-10 mt-6 max-w-md mx-auto p-4 rounded-2xl bg-secondary/50 border border-border/80 backdrop-blur-md space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Current Course Progress</span>
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
            <div className="relative z-10 mt-6 flex items-center justify-center">
              {activeCourse ? (
                <Button
                  asChild
                  className="w-full sm:w-auto h-11 px-7 rounded-2xl font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs sm:text-sm shadow-xl shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link href={`/student/courses/${activeCourse.courseId}`}>
                    <span>Continue Learning to Unlock Interviews</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full sm:w-auto h-11 px-7 rounded-2xl font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal text-xs sm:text-sm shadow-xl shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link href="/student/catalog">
                    <span>Browse Courses & Enroll</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Celebration Banner when student has achieved 100% and certificate */
        <div className="p-6 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                ✓ Eligibility Unlocked • 100% Complete
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                You Are Eligible for Direct Company Interviews!
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Congratulations {studentName}! Apply to any of the hiring partners below to initiate technical interview rounds.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl shrink-0">
            Certified Graduate
          </span>
        </div>
      )}

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
                All 3 prerequisites must be fully fulfilled to unlock direct company interviews.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-secondary/80 text-muted-foreground border border-border/60">
            {isEligible ? "3 / 3 Fulfilled" : "0 / 3 Fulfilled"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Requirement 1 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Criterion 1
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 font-mono ${activeCourse?.progressPct === 100 ? "text-emerald-400" : "text-amber-500"}`}>
                {activeCourse?.progressPct === 100 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                <span>{activeCourse ? `${activeCourse.progressPct}% / 100%` : "0%"}</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">100% Curriculum Completion</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete all foundational theory, architecture modules, and hands-on laboratory exercises.
            </p>
          </div>

          {/* Requirement 2 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Criterion 2
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 font-mono ${activeCourse?.progressPct === 100 ? "text-emerald-400" : "text-amber-500"}`}>
                {activeCourse?.progressPct === 100 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                <span>{activeCourse?.progressPct === 100 ? "Passed" : "Pending"}</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Evaluated Assignments & Quizzes</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Submit all practical assignments and pass technical quizzes with instructor evaluations.
            </p>
          </div>

          {/* Requirement 3 */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-xl space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                Criterion 3
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 font-mono ${hasEarnedCertificate ? "text-emerald-400" : "text-amber-500"}`}>
                {hasEarnedCertificate ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                <span>{hasEarnedCertificate ? "Verified" : "Unclaimed"}</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Verified Course Certificate</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Claim your cryptographically signed TechGration certificate with unique verification hash.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIRING PARTNER COMPANIES SECTION (BLURRED IF LOCKED)                       */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Hiring Partner Companies & Interview Drives
              </h3>
              <p className="text-xs text-muted-foreground">
                Apply directly for technical interviews across verified partner enterprises upon course completion.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary/80 text-foreground border border-border/60 self-start sm:self-auto flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-teal" />
            <span>6 Active Tech Drives</span>
          </span>
        </div>

        {/* Company Cards Container: If locked, show with blur and lock banner */}
        <div className="relative">
          {/* Locked Overlay Floating Banner (if not eligible) */}
          {!isEligible && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="max-w-lg p-6 sm:p-8 rounded-3xl bg-card/90 border-2 border-amber-500/40 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-md">
                  <Lock className="w-7 h-7 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    Direct Applications Locked
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-foreground">
                    Interview Portal Unlocks at 100% Course Completion
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hiring partner companies accept direct interview applications from students who have earned their certified course credentials.
                  </p>
                </div>
                {activeCourse && (
                  <Button
                    asChild
                    size="sm"
                    className="font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal rounded-xl text-xs h-10 px-6 shadow-md"
                  >
                    <Link href={`/student/courses/${activeCourse.courseId}`}>
                      <span>Continue &quot;{activeCourse.courseTitle}&quot;</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Grid of Companies (Blurred when !isEligible) */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-300 ${
              !isEligible
                ? "filter blur-[5px] select-none pointer-events-none opacity-40 scale-[0.99]"
                : "filter-none opacity-100"
            }`}
          >
            {HIRING_COMPANIES.map((company) => {
              const hasApplied = appliedCompanyIds.includes(company.id)

              return (
                <div
                  key={company.id}
                  className="rounded-3xl border border-border/80 bg-card/85 backdrop-blur-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-cyan-500/40 transition-all hover:shadow-md"
                >
                  <div className="space-y-4">
                    {/* Header Row: Company Logo & Details */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${company.logoBg} flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0`}
                        >
                          {company.logoInitial}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground leading-snug">
                            {company.companyName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {company.tagline}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/80 text-brand-teal border border-border/60 shrink-0">
                        {company.openings} Openings
                      </span>
                    </div>

                    {/* Role Title & CTC */}
                    <div className="p-3.5 rounded-2xl bg-secondary/35 border border-border/60 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-foreground">
                          {company.role}
                        </span>
                        <span className="text-xs font-black font-mono text-emerald-500 flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5" />
                          <span>{company.ctc}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-cyan-500" />
                          <span>{company.workType}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{company.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {company.description}
                    </p>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {company.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-background/80 text-foreground border border-border/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Interview Rounds Pipeline */}
                    <div className="space-y-1.5 pt-1 border-t border-border/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Interview Format:
                      </span>
                      <div className="space-y-1">
                        {company.rounds.map((r, i) => (
                          <div
                            key={r}
                            className="text-[11px] text-muted-foreground flex items-center gap-1.5"
                          >
                            <span className="w-4 h-4 rounded-full bg-cyan-500/15 text-cyan-500 font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply Action Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleApply(company)}
                      disabled={hasApplied}
                      className={`w-full h-11 rounded-xl font-bold text-xs shadow-sm transition-all ${
                        hasApplied
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isEligible
                          ? "bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal shadow-brand-teal/20"
                          : "bg-secondary text-muted-foreground border border-border/80"
                      }`}
                    >
                      {hasApplied ? (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Interview Applied • Under Review</span>
                        </span>
                      ) : isEligible ? (
                        <span className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5" />
                          <span>Apply for Interview</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked (Complete Course to Apply)</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APPLICATION CONFIRMATION DIALOG (WHEN UNLOCKED)                           */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedCompany)}
        onOpenChange={(open) => !open && setSelectedCompany(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-foreground">
              Apply for Interview
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedCompany?.companyName} • {selectedCompany?.role}
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Candidate:</span>
                  <span className="font-bold text-foreground">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course Credential:</span>
                  <span className="font-bold text-emerald-500">100% Certified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package (CTC):</span>
                  <span className="font-bold text-foreground font-mono">{selectedCompany.ctc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-bold text-foreground">{selectedCompany.location}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                By submitting this application, your verified TechGration course transcript, evaluated project portfolio, and certificate will be directly forwarded to the hiring team at <strong>{selectedCompany.companyName}</strong>.
              </p>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCompany(null)}
                  className="w-1/2 rounded-xl text-xs font-semibold h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmApplication}
                  disabled={isApplying}
                  className="w-1/2 rounded-xl text-xs font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-10 shadow-sm"
                >
                  {isApplying ? "Submitting..." : "Confirm & Apply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
