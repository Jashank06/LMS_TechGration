"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import {
  Video,
  Code2,
  HelpCircle,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Play,
  FileCheck2,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingFeatures() {
  const features = [
    {
      title: "Live Interactive Classrooms & Video Replay",
      badge: "Real-Time Mentorship",
      icon: Video,
      gradient: "from-rose-500 to-red-600",
      borderHover: "hover:border-rose-500/50",
      description:
        "Attend high-definition interactive Google Meet broadcasts hosted by senior TechGration engineers. Ask questions live, participate in code reviews, and revisit HD recordings anytime with position-saved video playback.",
      perks: [
        "Live interactive broadcasts with senior software architects",
        "Automated attendance tracking & personal timetable schedule",
        "Full 1080p recording archives available 24/7 on demand",
        "Downloadable lesson notes, architecture diagrams, and starter code",
      ],
      linkText: "Join Live Cohorts",
      href: "/student/live-classes",
    },
    {
      title: "Hands-On Assignments & Real Projects",
      badge: "Production Engineering",
      icon: Code2,
      gradient: "from-blue-500 to-indigo-600",
      borderHover: "hover:border-blue-500/50",
      description:
        "Theory alone won't get you hired. Build real distributed microservices, Next.js applications, and cloud infrastructures. Submit live GitHub repositories and receive detailed rubric evaluations from instructors.",
      perks: [
        "Real-world capstone projects designed for your resume",
        "Submit repository links & deployment URLs directly",
        "Detailed rubric scoring with qualitative faculty code reviews",
        "Hands-on cloud laboratories and real production architectures",
      ],
      linkText: "View Assignments Hub",
      href: "/student/assignments",
    },
    {
      title: "Smart Quizzes & Knowledge Assessments",
      badge: "Instant Evaluation",
      icon: HelpCircle,
      gradient: "from-purple-500 to-violet-600",
      borderHover: "hover:border-purple-500/50",
      description:
        "Reinforce your technical knowledge through time-bound MCQ assessments. Benefit from points-weighted scoring, instant automatic grading, detailed answer explanations, and module-level mastery tracking.",
      perks: [
        "Point-weighted questions reflecting real interview standards",
        "Instant grading with comprehensive conceptual explanations",
        "Retake options to master challenging distributed topics",
        "Automated accuracy analysis across every module in your track",
      ],
      linkText: "Take Practice Tests",
      href: "/student/quizzes",
    },
    {
      title: "Dynamic Leaderboards & Verified Credentials",
      badge: "Recognition & Ranks",
      icon: Trophy,
      gradient: "from-amber-400 to-yellow-500",
      borderHover: "hover:border-amber-500/50",
      description:
        "Challenge yourself and rise up the cohort standings. Marks from evaluated assignments and quizzes determine your live standing on the animated Top 3 podium. Graduate with verifiable TechGration credentials.",
      perks: [
        "Live cohort leaderboard with sequenced Top 3 podium reveal",
        "Student privacy toggle (stay anonymous with Anonymous Learner)",
        "Earn merit badges (Top Scorer, Quiz Ace, Rising Star)",
        "Cryptographically signed certificates verifiable via public URL",
      ],
      linkText: "Check Standings",
      href: "/student/leaderboard",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30">
          <Zap className="w-3.5 h-3.5 text-brand-teal" />
          <span>The TechGration LMS Experience</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Everything You Need to{" "}
          <span className="block mt-1 bg-gradient-to-r from-brand-ink via-brand-teal to-brand-cyan bg-clip-text text-transparent dark:from-brand-teal dark:to-cyan-200">
            Master Modern Technology.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Built specifically for engineering learners. Our platform combines live mentorship,
          real project building, instant assessments, and competitive leaderboards in one cohesive experience.
        </p>
      </div>

      {/* 4 Massive Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f, idx) => {
          const Icon = f.icon
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col justify-between rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-8 sm:p-10 shadow-sm ${f.borderHover} hover:shadow-2xl transition-all group`}
            >
              <div className="space-y-6">
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-secondary border border-border/80 text-foreground">
                    {f.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
                    {f.description}
                  </p>
                </div>

                {/* Bullet Perks */}
                <div className="space-y-3 pt-2">
                  {f.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
                <Button asChild variant="ghost" className="p-0 text-xs font-bold text-brand-ink dark:text-brand-teal hover:bg-transparent group-hover:translate-x-1 transition-transform">
                  <Link href={f.href} className="gap-1.5">
                    <span>{f.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <span className="text-[11px] font-mono text-muted-foreground">TechGration LMS</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
