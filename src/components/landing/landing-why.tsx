"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  Sparkles,
  Users,
  Code2,
  Award,
  CheckCircle2,
  Rocket,
  ShieldCheck,
} from "lucide-react"

export function LandingWhy() {
  const pillars = [
    {
      title: "Production-First Curriculum",
      icon: Rocket,
      gradient: "from-teal-500 to-cyan-500",
      description:
        "Every lesson, lab, and quiz is authored by practicing engineers. You learn the exact distributed patterns, Next.js conventions, and cloud architectures used by leading tech enterprises.",
    },
    {
      title: "Senior Architect Mentorship",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      description:
        "Never learn in isolation. Get your code reviewed by experienced architects, participate in live audio/video class discussions, and receive direct qualitative rubric feedback on your submissions.",
    },
    {
      title: "100% Practical & Portfolio-Ready",
      icon: Code2,
      gradient: "from-purple-500 to-violet-600",
      description:
        "Forget toy apps and hello-world exercises. You build real Dockerized microservices, configure Terraform VPCs, and fine-tune open-source AI models ready to showcase in technical interviews.",
    },
    {
      title: "Verifiable TechGration Credentials",
      icon: Award,
      gradient: "from-amber-500 to-orange-500",
      description:
        "Prove your skills to employers with tamper-proof digital certificates signed with SHA-256 cryptographic hashes, instantly verifiable on our public credential registry.",
    },
  ]

  return (
    <section id="why-us" className="py-20 md:py-32 border-t border-border/80 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>The TechGration Advantage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Why Students Choose{" "}
            <span className="block mt-1 bg-gradient-to-r from-brand-ink via-brand-teal to-brand-cyan bg-clip-text text-transparent dark:from-brand-teal dark:to-cyan-200">
              TechGration Technologies.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We bridge the gap between academic theory and real-world technology engineering.
            Here is what makes our Learning Management System different.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-7 space-y-4 hover:border-brand-teal/50 hover:shadow-lg transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.gradient} text-white flex items-center justify-center shadow-xs`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
