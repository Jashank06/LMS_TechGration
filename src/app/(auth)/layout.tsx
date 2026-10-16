import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Typewriter } from "@/components/ui/typewriter"
import { ShieldCheck, Sparkles, BookOpen, Video, Award, Users, CheckCircle2 } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background relative overflow-hidden">
      {/* Top right theme toggle for entire auth page */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
      </div>

      {/* Brand Hero Showcase (Visible on Large screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#070A0D] text-white border-r border-white/10">
        {/* Cyber-mesh grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient brand glow effects */}
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-brand-teal/20 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-brand-cyan/15 blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,214,214,0.08)_0%,transparent_75%)] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,214,214,0.25)]">
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
                <span className="font-extrabold tracking-tight text-xl text-white">TechGration LMS</span>
                <span className="text-[10px] tracking-widest uppercase text-brand-teal font-semibold">Enterprise Learning</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center Content: 3D Official Logo & Value Props */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          {/* Logo Showcase with Floating Stat Badges */}
          <div className="relative mb-8">
            <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden border border-white/20 bg-black/50 backdrop-blur-xl shadow-2xl p-4 flex items-center justify-center">
              <Image
                src="/brand/techgration-logo.webp"
                alt="TechGration Technologies"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 512px"
                className="object-contain p-2 drop-shadow-[0_10px_25px_rgba(0,214,214,0.25)]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl pointer-events-none" />
            </div>

            {/* Floating Achievement Badges */}
            <div className="absolute -bottom-3 -left-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101720]/95 border border-brand-teal/40 shadow-lg text-[11px] font-medium text-white backdrop-blur-md">
              <Users className="w-3.5 h-3.5 text-brand-teal" />
              <span>10,000+ Enrolled Engineers</span>
            </div>

            <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101720]/95 border border-brand-cyan/40 shadow-lg text-[11px] font-medium text-white backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
              <span>98.4% Course Completion</span>
            </div>
          </div>

          {/* Dynamic Headline with Live Typewriter */}
          <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white mb-3 min-h-[72px] xl:min-h-[80px]">
            Accelerate your career in{" "}
            <Typewriter
              words={[
                "Full-Stack Development",
                "Cloud & DevOps Architecture",
                "Generative AI Systems",
                "Scalable Microservices",
                "System Design & Security",
              ]}
              className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-[#2beeee] to-brand-cyan"
            />
          </h2>

          <p className="text-sm text-neutral-300/90 leading-relaxed mb-6 font-normal">
            Join elite engineers and tech teams mastering modern enterprise stacks through live interactive classes, hands-on production labs, and industry-verified credentials.
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs text-neutral-200">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-teal/40 hover:bg-white/[0.08] transition-all duration-300">
              <div className="w-7 h-7 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-brand-teal" />
              </div>
              <span className="font-medium">Live Interactive Classes</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-teal/40 hover:bg-white/[0.08] transition-all duration-300">
              <div className="w-7 h-7 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-brand-teal" />
              </div>
              <span className="font-medium">Distraction-Free Video Labs</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-teal/40 hover:bg-white/[0.08] transition-all duration-300">
              <div className="w-7 h-7 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-brand-teal" />
              </div>
              <span className="font-medium">Verified Credentials</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-teal/40 hover:bg-white/[0.08] transition-all duration-300">
              <div className="w-7 h-7 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-brand-teal" />
              </div>
              <span className="font-medium">Personalized Progress AI</span>
            </div>
          </div>
        </div>

        {/* Footer / Trust Badges */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <span>256-Bit TLS & SOC2 Compliant Cloud</span>
          </div>
          <span className="text-[11px]">TechGration Technologies © 2026</span>
        </div>
      </div>

      {/* Main Auth Form Container with Ambient Lights */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 min-h-screen relative">
        {/* Soft Ambient Radial Lights for Right Column */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-teal/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />

        {/* Mobile Brand Header */}
        <div className="lg:hidden w-full max-w-md mb-6 flex flex-col items-center text-center">
          <div className="mb-2">
            <BrandLogo variant="lockup" href="/" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Learning. Technology. Growth.</p>
        </div>

        <div className="w-full max-w-[460px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
