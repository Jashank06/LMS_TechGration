"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, Sparkles, BookOpen } from "lucide-react"

export function LandingCta() {
  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-brand-teal/10 backdrop-blur-2xl p-8 sm:p-14 lg:p-16 text-center overflow-hidden shadow-2xl">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-brand-teal/20 rounded-full blur-3xl opacity-75 dark:opacity-35" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-75 dark:opacity-35" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal animate-pulse" />
            <span>Enrollment Open For Next Batch</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Ready to Accelerate Your{" "}
            <span className="block mt-1 bg-gradient-to-r from-brand-ink via-brand-teal to-brand-cyan bg-clip-text text-transparent dark:from-brand-teal dark:to-cyan-200">
              Software Engineering Career?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Join TechGration Technologies Learning Management System today. Attend live interactive classes,
            complete graded cloud projects, and earn credentials recognized across the tech industry.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 py-6 text-sm font-bold bg-brand-teal text-brand-charcoal hover:bg-brand-cyan shadow-lg shadow-brand-teal/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link href="/student/dashboard" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>Enter Student Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-sm font-semibold border-border hover:bg-muted/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
            >
              <Link href="/student/catalog" className="gap-2">
                <BookOpen className="w-4 h-4 text-brand-teal" />
                <span>Browse Course Catalog</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
