"use client"

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ExternalLink, ShieldCheck, Heart } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-xl py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-4">
            <BrandLogo variant="sidebar" portalName="LMS" href="/" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              TechGration LMS is a next-generation enterprise learning platform uniting students,
              teachers, and institutions under an intuitive, real-time operating ecosystem.
            </p>
            <div className="text-xs text-muted-foreground/80 font-mono">
              Learning. Technology. Growth.
            </div>
          </div>

          {/* Quick Workspaces Directory */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              Dedicated Workspaces
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/student/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span>Student Learner Workspace</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/teacher/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span>Instructor Command Center</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <span>Enterprise Admin Governance</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & System */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">
              Credential Verification & Platform
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  New Student Registration
                </Link>
              </li>
              <li>
                <Link href="/student/certificates" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Public Certificate Registry (SHA-256)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 TechGration Technologies Private Limited. All rights reserved.</p>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </span>
            <span>WCAG AA Accessible</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
