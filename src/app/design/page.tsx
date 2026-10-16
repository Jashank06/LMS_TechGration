"use client"

import * as React from "react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { InlineAlert } from "@/components/feedback/inline-alert"
import { DemoDataBadge } from "@/components/feedback/demo-badge"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import { PageTransition } from "@/components/motion/page-transition"
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Check,
  Copy,
  Layers,
  Palette,
  Type,
  LayoutGrid,
  Bell,
  Search,
  ArrowRight,
  ExternalLink,
} from "lucide-react"

export default function DesignGalleryPage() {
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null)

  const copyToClipboard = (hex: string, label: string) => {
    navigator.clipboard?.writeText(hex)
    setCopiedToken(label)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const brandSwatches = [
    { label: "Electric Teal", hex: "#00D6D6", token: "--brand-teal", desc: "Primary brand accent & action fill" },
    { label: "Deep Teal", hex: "#00AEB8", token: "--brand-teal-deep", desc: "Hover states & deep contrast" },
    { label: "Bright Cyan", hex: "#18E6E6", token: "--brand-cyan", desc: "Dark mode high-visibility accent" },
    { label: "Accessible Ink", hex: "#00757E", token: "--brand-ink", desc: "WCAG AA compliant text/link teal" },
    { label: "Metallic Silver", hex: "#D7DCE2", token: "--brand-silver", desc: "Emblem bevels & premium accents" },
    { label: "Deep Charcoal", hex: "#101416", token: "--brand-charcoal", desc: "Dark text on teal & dark background" },
    { label: "Dark Surface", hex: "#171C20", token: "--card (dark)", desc: "Layered card surface in dark mode" },
    { label: "Elevated Surface", hex: "#20272C", token: "--secondary (dark)", desc: "Elevated dark controls & dropdowns" },
    { label: "Light Background", hex: "#F6F8FA", token: "--background (light)", desc: "Spacious soft off-white canvas" },
    { label: "White Surface", hex: "#FFFFFF", token: "--card (light)", desc: "Crisp white card backgrounds" },
    { label: "Subtle Border", hex: "#E4E9ED", token: "--border", desc: "Gentle boundaries in light mode" },
    { label: "Dark Border", hex: "#252D33", token: "--border (dark)", desc: "Fine borders in dark mode" },
  ]

  const statusSwatches = [
    { label: "Success", hex: "#16A675", token: "--success", desc: "Passed quizzes, completed courses" },
    { label: "Warning", hex: "#E6A23C", token: "--warning", desc: "Upcoming deadlines, review notices" },
    { label: "Destructive", hex: "#E05260", token: "--destructive", desc: "Errors, cancellations, late tasks" },
    { label: "Informational", hex: "#4A8DFF", token: "--info", desc: "Live class updates, announcements" },
  ]

  return (
    <PageTransition className="min-h-screen bg-background text-foreground pb-24">
      {/* Top sticky showcase bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="sidebar" portalName="LMS" href="/design" />
            <span className="hidden sm:inline-block h-4 w-px bg-border" />
            <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground">
              Design System & Component Showcase
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="segmented" />
            <Button
              size="sm"
              onClick={triggerBrandCelebration}
              className="gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrate</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-teal-glow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 0: Foundation & Design System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              TechGration LMS{" "}
              <span className="text-teal-gradient">Design System</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Derived directly from the official TechGration metallic emblem. Engineered with semantic tokens, WCAG AA contrast accessibility, dual light/dark aesthetics, and micro-interactions.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <DemoDataBadge />
              <Badge variant="outline" className="border-border">Inter / Geist Sans</Badge>
              <Badge variant="outline" className="border-border">Tailwind CSS v4</Badge>
              <Badge variant="outline" className="border-border">Next.js 16 App Router</Badge>
            </div>
          </div>

          <div className="w-full max-w-sm md:max-w-md">
            <BrandLogo variant="hero" priority />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Section 1: Color Tokens */}
        <section id="colors" className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Palette className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
            <h2 className="text-xl font-bold tracking-tight">Brand & Semantic Color Tokens</h2>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Core Brand Palette
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {brandSwatches.map((swatch) => (
                <button
                  key={swatch.label}
                  type="button"
                  onClick={() => copyToClipboard(swatch.hex, swatch.label)}
                  className="group relative flex flex-col p-3 rounded-xl border border-border bg-card hover:border-brand-teal/40 transition-all text-left shadow-subtle hover:shadow-card"
                >
                  <div
                    className="w-full h-14 rounded-lg mb-2.5 shadow-inner border border-black/10 flex items-end justify-end p-1.5 transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {copiedToken === swatch.label ? (
                      <span className="p-1 rounded bg-black/60 text-white text-[10px] flex items-center gap-1 font-mono">
                        <Check className="w-2.5 h-2.5" /> Copied
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 p-1 rounded bg-black/50 text-white text-[10px] flex items-center transition-opacity">
                        <Copy className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-xs text-foreground truncate">{swatch.label}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{swatch.hex}</span>
                  <span className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-1">{swatch.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Status & Feedback Tokens
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {statusSwatches.map((swatch) => (
                <div
                  key={swatch.label}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card shadow-subtle"
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 border border-black/10 shadow-inner"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-foreground">{swatch.label}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{swatch.hex}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{swatch.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Logo Treatments */}
        <section id="logos" className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Layers className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
            <h2 className="text-xl font-bold tracking-tight">Brand Logo Implementations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm">Compact Emblem</CardTitle>
                <CardDescription>Sidebar collapsed & favicon usage</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-8 bg-muted/30 rounded-lg m-4">
                <BrandLogo variant="mark" />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm">Sidebar Portal Lockup</CardTitle>
                <CardDescription>Tailored for each portal context</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-6 bg-muted/30 rounded-lg m-4">
                <BrandLogo variant="sidebar" portalName="Student" />
                <BrandLogo variant="sidebar" portalName="Teacher" />
                <BrandLogo variant="sidebar" portalName="Admin" />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm">Header Lockup</CardTitle>
                <CardDescription>Global top navigation & email footers</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-8 bg-muted/30 rounded-lg m-4">
                <BrandLogo variant="lockup" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Buttons & Controls */}
        <section id="buttons" className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <LayoutGrid className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
            <h2 className="text-xl font-bold tracking-tight">Buttons & Interactive Controls</h2>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-6 shadow-card">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="default">
                  <span>Primary Teal</span>
                </Button>
                <Button variant="outline">
                  <span>Outline</span>
                </Button>
                <Button variant="secondary">
                  <span>Secondary</span>
                </Button>
                <Button variant="metallic">
                  <span>Metallic Action</span>
                </Button>
                <Button variant="destructive">
                  <span>Destructive</span>
                </Button>
                <Button variant="ghost">
                  <span>Ghost</span>
                </Button>
                <Button variant="link">
                  <span>Link Button</span>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sizes</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="xs">Extra Small (xs)</Button>
                <Button size="sm">Small (sm)</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large Hero (lg)</Button>
                <Button size="icon" aria-label="Notifications">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">States</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button disabled>Disabled Button</Button>
                <Button variant="outline" disabled>Disabled Outline</Button>
                <Button className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Resume Course</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Typography Hierarchy */}
        <section id="typography" className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Type className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
            <h2 className="text-xl font-bold tracking-tight">Typography Hierarchy</h2>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-card">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Display 32px / 40px Bold</span>
              <h1 className="text-3xl font-extrabold tracking-tight">Next-Generation Learning Infrastructure</h1>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">H1 24px / 32px SemiBold</span>
              <h2 className="text-2xl font-bold tracking-tight">Student Performance & Milestone Overview</h2>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">H2 18px / 28px SemiBold</span>
              <h3 className="text-lg font-semibold tracking-tight">Active Curriculum Modules</h3>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">H3 15px / 22px Medium</span>
              <h4 className="text-sm font-semibold">Cloud Architecture & Microservices Implementation</h4>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Body 14px / 22px Regular</span>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                TechGration LMS unites students, teachers, and administrators into an integrated workspace. Lessons support interactive code environments, video playback progress tracking, scheduled live video meetings, and automated grading.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Caption 12px / 16px</span>
              <p className="text-xs text-muted-foreground">
                Last modified 2 hours ago by System Administrator • Session ID: #TG-8904
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Feedback & Status States */}
        <section id="feedback" className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <ShieldCheck className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
            <h2 className="text-xl font-bold tracking-tight">Feedback, Alerts & Empty States</h2>
          </div>

          <div className="space-y-4">
            <InlineAlert variant="info" title="Scheduled Live Class">
              Live class &quot;Enterprise DevOps Pipeline Design&quot; starts today at 04:30 PM IST. Please prepare your terminal environment.
            </InlineAlert>

            <InlineAlert variant="success" title="Certificate Issued">
              Congratulations! You have completed all 14 modules in &quot;AWS Solutions Architecture Professional&quot;. Certificate TG-2026-9042 is available for verification.
            </InlineAlert>

            <InlineAlert variant="warning" title="Submission Deadline Approaching">
              Assignment &quot;Kubernetes Cluster Hardening&quot; is due in 3 hours. Late submissions incur a 10% penalty.
            </InlineAlert>

            <InlineAlert variant="error" title="Session Verification Required">
              Your administrative session token has expired. Please authenticate again to modify tenant permissions.
            </InlineAlert>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <EmptyState
              variant="courses"
              title="No Courses Enrolled Yet"
              description="Browse the TechGration course catalog to start learning modern cloud, AI, and software engineering skills."
              actionLabel="Explore Course Catalog"
              onAction={() => alert("Catalog navigation")}
            />

            <ErrorState
              title="Unable to Load Live Attendance"
              message="Failed to retrieve real-time attendance rosters from the synchronization daemon."
              requestId="ERR-SYNC-9214"
              onRetry={() => alert("Retrying attendance sync...")}
            />
          </div>
        </section>

        {/* Section 6: Cards & Surfaces */}
        <section id="cards" className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <Layers className="w-5 h-5 text-brand-ink dark:text-brand-cyan" />
            <h2 className="text-xl font-bold tracking-tight">Cards & Surfaces Showcase</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Preview Card */}
            <Card className="shadow-card hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-brand-teal/40 text-brand-ink dark:text-brand-cyan bg-brand-teal/10">
                    Student Portal
                  </Badge>
                  <span className="text-xs text-muted-foreground">85% Complete</span>
                </div>
                <CardTitle className="text-base mt-2">Full-Stack Cloud Engineering</CardTitle>
                <CardDescription>Instructor: Dr. Vikram Joshi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-brand-teal rounded-full w-[85%]" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Next lesson: Module 8.2 — Zero-Downtime Database Migrations
                </p>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button size="sm" className="w-full">
                  <span>Continue Learning</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>

            {/* Teacher Preview Card */}
            <Card className="shadow-card hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                    Teacher Portal
                  </Badge>
                  <span className="text-xs text-muted-foreground">14 Submissions</span>
                </div>
                <CardTitle className="text-base mt-2">Submissions Grading Queue</CardTitle>
                <CardDescription>Advanced Docker & Container Security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pending Review:</span>
                  <span className="font-semibold text-warning">8 assignments</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Graded Today:</span>
                  <span className="font-semibold text-success">6 assignments</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <span>Open Grading Workspace</span>
                </Button>
              </CardFooter>
            </Card>

            {/* Admin Preview Card */}
            <Card className="shadow-card hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                    Admin Portal
                  </Badge>
                  <span className="text-xs text-muted-foreground">System Health</span>
                </div>
                <CardTitle className="text-base mt-2">Enterprise Governance</CardTitle>
                <CardDescription>Security, RBAC & Audit Trails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active Super-Admins:</span>
                  <span className="font-semibold">2 accounts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Immutable Audit Logs:</span>
                  <span className="font-semibold text-success">Active & Verified</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button variant="metallic" size="sm" className="w-full">
                  <span>Inspect Audit Records</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
