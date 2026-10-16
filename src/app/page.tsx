import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Palette,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Laptop,
  Users,
  CheckCircle2,
} from "lucide-react"

export default function HomePage() {
  const portals = [
    {
      title: "Student Portal",
      role: "Student",
      href: "/student/dashboard",
      badge: "Learner Workspace",
      icon: GraduationCap,
      description:
        "Motivational, distraction-free learning with progress sync, live video classes, assignments, auto-graded assessments, and verifiable certificates.",
      features: [
        "Continue Learning card with saved video position",
        "Interactive lesson player with Q&A & resources",
        "Real-time live class calendar & attendance",
        "PDF certificates with cryptographic code verification",
      ],
      cta: "Explore Student Portal",
    },
    {
      title: "Teacher Portal",
      role: "Teacher",
      href: "/teacher/dashboard",
      badge: "Instructor Console",
      icon: Laptop,
      description:
        "Comprehensive teaching & curriculum command center. Visual curriculum builder, attendance audit trails, and multi-criteria assignment grading workspace.",
      features: [
        "Visual module & lesson ordering with dnd-kit",
        "Live class scheduling with conflict detection",
        "Roster attendance tracking with revision history",
        "Fast side-by-side submission grading workspace",
      ],
      cta: "Explore Teacher Portal",
    },
    {
      title: "Admin Portal",
      role: "Admin",
      href: "/admin/dashboard",
      badge: "Enterprise Governance",
      icon: ShieldCheck,
      description:
        "Enterprise-grade administrative operations. Centralized RBAC, course approval workflows, bulk enrollment imports, immutable audit logs, and settings governance.",
      features: [
        "Granular permission matrix & super-admin protection",
        "Curriculum governance & course approval pipelines",
        "Bulk CSV student enrollment with row error detection",
        "Append-only security audit trail & integrations manager",
      ],
      cta: "Explore Admin Portal",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand-teal/30">
      {/* Global Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo variant="sidebar" portalName="LMS" href="/" priority />

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/programs" className="hover:text-foreground transition-colors">
              Programs
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/design" className="text-brand-ink dark:text-brand-cyan hover:underline flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              <span>Design System</span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle variant="button" />
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 border-b border-border bg-gradient-teal-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Enterprise Learning Management System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Empowering Minds Through{" "}
                <span className="text-teal-gradient">Technology, Integration & Impact.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                TechGration LMS brings learners, educators, and enterprise administrators together on an unified, high-performance platform. Engineered with precision design, real-time sync, and institutional-grade security.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button asChild size="lg" className="shadow-lg shadow-brand-teal/20">
                  <Link href="/student/dashboard" className="gap-2">
                    <span>Enter Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline">
                  <Link href="/design" className="gap-2">
                    <Palette className="w-4 h-4 text-brand-ink dark:text-brand-cyan" />
                    <span>View Design System</span>
                  </Link>
                </Button>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Dual Light & Dark Themes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Shared RBAC Architecture</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>WCAG AA Accessible</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <BrandLogo variant="hero" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Three Portals Showcase */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Three Dedicated Portals. One Cohesive Ecosystem.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Built from the ground up to provide tailored workflows for students, teachers, and system administrators without fragmented silos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portals.map((portal) => {
            const Icon = portal.icon
            return (
              <Card
                key={portal.title}
                className="flex flex-col border-border bg-card shadow-card hover:shadow-hover hover:border-brand-teal/40 transition-all rounded-2xl"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-ink dark:text-brand-cyan flex items-center justify-center border border-brand-teal/25">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="border-border">
                      {portal.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{portal.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {portal.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-2.5">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                    Key Workflows
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {portal.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/60">
                  <Button asChild className="w-full" size="sm">
                    <Link href={portal.href} className="justify-between">
                      <span>{portal.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <BrandLogo variant="sidebar" portalName="LMS" href="/" />

          <p className="text-xs text-muted-foreground text-center sm:text-right">
            © 2026 TechGration Technologies Private Limited. All rights reserved.
            <br />
            <span className="text-[11px] text-muted-foreground/80">Learning. Technology. Growth.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
