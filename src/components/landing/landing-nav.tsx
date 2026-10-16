"use client"

import * as React from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight, Sparkles, Layers, ShieldCheck, GraduationCap } from "lucide-react"

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "Why TechGration", href: "#why-us" },
  ]

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        setMobileMenuOpen(false)
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-background/80 dark:bg-[#070A0D]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <BrandLogo variant="sidebar" portalName="LMS" href="/" priority />

        {/* Center: Apple-style Desktop Section Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] bg-secondary/50 dark:bg-white/[0.03] backdrop-blur-md shadow-xs">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Controls & CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <ThemeToggle variant="button" />

          <Button asChild size="sm" variant="ghost" className="text-xs font-semibold rounded-full px-3.5">
            <Link href="/login">Sign In</Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="text-xs font-semibold rounded-full px-4 bg-brand-teal text-brand-charcoal hover:bg-brand-cyan shadow-xs hover:shadow-[0_0_20px_rgba(0,214,214,0.35)] transition-all"
          >
            <Link href="/student/dashboard" className="gap-1.5">
              <span>Start Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle variant="button" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-card/95 backdrop-blur-xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-border/80 flex flex-col gap-2.5">
            <Button asChild variant="outline" size="sm" className="w-full justify-center rounded-xl">
              <Link href="/login">Sign In to Account</Link>
            </Button>
            <Button asChild size="sm" className="w-full justify-center rounded-xl bg-brand-teal text-brand-charcoal font-semibold">
              <Link href="/student/dashboard">Launch Student Workspace</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
