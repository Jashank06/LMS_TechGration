"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  Video,
  FileCheck2,
} from "lucide-react"

export function LandingCurriculum() {
  const tracks = [
    {
      title: "Next.js 16 Enterprise Architecture & Micro-Frontends",
      category: "Full-Stack Web Systems",
      level: "ADVANCED",
      modules: 8,
      hours: 24,
      tag: "Live Interactive Batch",
      description:
        "Master distributed frontend systems with Next.js 16, React 19 Server Actions, micro-frontends, edge streaming, and production authentication patterns.",
      accent: "from-teal-500 to-cyan-500",
      skills: ["Server Components", "Turbopack", "Edge Middleware", "Prisma ORM"],
    },
    {
      title: "Production Kubernetes, Docker & Service Mesh",
      category: "DevOps & Cloud Infrastructure",
      level: "INTERMEDIATE",
      modules: 6,
      hours: 18,
      tag: "Hands-on Cloud Labs",
      description:
        "Architect, deploy, and scale resilient microservices across production Kubernetes clusters using Docker, Helm, Istio service mesh, and ArgoCD GitOps.",
      accent: "from-blue-500 to-indigo-600",
      skills: ["Kubernetes Clusters", "Helm Charts", "Istio Mesh", "ArgoCD GitOps"],
    },
    {
      title: "Applied Artificial Intelligence & Autonomous Agents",
      category: "AI & Distributed Computing",
      level: "ADVANCED",
      modules: 5,
      hours: 20,
      tag: "LangGraph & vLLM",
      description:
        "Design production Retrieval-Augmented Generation (RAG) pipelines, high-throughput model serving with vLLM, and autonomous multi-agent orchestration with LangGraph.",
      accent: "from-purple-500 to-violet-600",
      skills: ["LangGraph Agents", "Vector Databases", "vLLM Serving", "PEFT Fine-Tuning"],
    },
    {
      title: "Zero-Trust Cloud Security & DevSecOps",
      category: "Information Security",
      level: "ENTERPRISE",
      modules: 5,
      hours: 16,
      tag: "Industry Certified",
      description:
        "Implement end-to-end zero-trust architecture, automated vulnerability scanners, infrastructure-as-code security with Terraform, and CIS compliance benchmarks.",
      accent: "from-amber-500 to-orange-500",
      skills: ["Terraform IaC", "AWS IAM Policies", "Vulnerability Scanners", "CIS Benchmarks"],
    },
  ]

  return (
    <section id="courses" className="py-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30">
            <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
            <span>Enterprise Learning Tracks</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Curriculum Engineered for Modern Industry
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every curriculum track is authored by seasoned architects and includes real-time live classes,
            hands-on coding deliverables, and automated assessments.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-full px-5 self-start md:self-auto shadow-xs">
          <Link href="/student/catalog" className="gap-2">
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tracks.map((track, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between hover:border-brand-teal/50 hover:shadow-xl transition-all group"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-ink dark:text-brand-teal">
                  {track.category}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/80">
                  {track.level}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug group-hover:text-brand-ink dark:group-hover:text-brand-teal transition-colors">
                {track.title}
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {track.description}
              </p>

              {/* Skills Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {track.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-secondary/60 text-foreground/80 border border-border/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Metrics & CTA */}
            <div className="pt-6 mt-6 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{track.modules} Modules</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{track.hours} Hours</span>
                </span>
              </div>

              <Button asChild size="sm" variant="ghost" className="rounded-full text-brand-ink dark:text-brand-teal font-bold group-hover:translate-x-1 transition-transform">
                <Link href="/student/catalog" className="gap-1.5">
                  <span>Enroll</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
