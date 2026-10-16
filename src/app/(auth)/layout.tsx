import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { ShieldCheck, Sparkles, BookOpen, Video, Award } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Top right theme toggle for entire auth page */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* Brand Hero Showcase (Visible on Large screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#0A0E12] text-white border-r border-white/10">
        {/* Ambient brand glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-teal/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-brand-cyan/10 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,214,214,0.06)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.01] active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/brand/tg-mark.png"
                  alt="TechGration"
                  width={28}
                  height={28}
                  style={{ width: "auto", height: "auto" }}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-lg text-white">TechGration LMS</span>
                <span className="text-[10px] tracking-widest uppercase text-brand-teal font-medium">Enterprise Learning</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Content: 3D Official Logo & Value Props */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden border border-white/15 bg-black/40 backdrop-blur-md shadow-2xl p-4 flex items-center justify-center mb-8">
            <Image
              src="/brand/techgration-logo.webp"
              alt="TechGration Technologies"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 512px"
              className="object-contain p-2"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          </div>

          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white mb-3">
            Accelerate Your Technical Mastery with Enterprise Programs
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed mb-6">
            Join thousands of engineers and professionals advancing their careers through live interactive classes, hands-on practical labs, and industry-verified credentials.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <Video className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Live Interactive Classes</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <BookOpen className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Distraction-Free Video Labs</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <Award className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Verified Certificates</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/5">
              <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
              <span>Personalized Progress AI</span>
            </div>
          </div>
        </div>

        {/* Footer / Trust Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <span>256-Bit TLS & SOC2 Compliant Cloud</span>
          </div>
          <span>TechGration Technologies © 2026</span>
        </div>
      </div>

      {/* Main Auth Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 min-h-screen">
        {/* Mobile Brand Header */}
        <div className="lg:hidden w-full max-w-md mb-8 flex flex-col items-center text-center">
          <div className="mb-3">
            <BrandLogo variant="lockup" href="/" />
          </div>
          <p className="text-xs text-muted-foreground">Learning. Technology. Growth.</p>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
