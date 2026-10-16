"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InlineAlert } from "@/components/feedback/inline-alert"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import { motion } from "motion/react"
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Laptop,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"

export default function TeacherLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("jaykumar0305@gmail.com")
  const [password, setPassword] = React.useState("Teacher@2026!")
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [demoLoading, setDemoLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Authentication failed. Check your credentials.")
        setLoading(false)
        return
      }

      toast.success("Welcome back, " + data.user.name)
      router.push("/teacher/dashboard")
      router.refresh()
    } catch {
      setError("Network error. Could not connect to authentication service.")
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError(null)
    setDemoLoading(true)

    try {
      const res = await fetch("/api/auth/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to start demo session")
        setDemoLoading(false)
        return
      }

      triggerBrandCelebration()
      toast.success("Logged in as Dr. Vikram Joshi (Demo Instructor)")
      router.push("/teacher/dashboard")
      router.refresh()
    } catch {
      setError("Failed to launch demonstration session.")
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground relative overflow-hidden selection:bg-brand-teal/30">
      {/* Background Decorative Tech Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-teal/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-cyan/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl bg-[radial-gradient(#00D6D6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.06]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <BrandLogo variant="sidebar" portalName="Teacher" href="/" priority />
        <div className="flex items-center gap-3">
          <ThemeToggle variant="button" />
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-teal via-brand-cyan to-brand-ink" />

            <CardHeader className="text-center pt-8 pb-4">
              <div className="inline-flex items-center justify-center mx-auto mb-3 w-12 h-12 rounded-2xl bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30 shadow-teal-glow">
                <Laptop className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                Instructor Console
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                Enter your faculty credentials to manage courses, live classes & grading.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 sm:px-8">
              {/* 1-Click Demo Teacher Access Pill */}
              <div className="p-3.5 rounded-xl border border-brand-teal/30 bg-brand-teal/5 relative overflow-hidden group">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-brand-ink dark:text-brand-cyan shrink-0" />
                      <span>Instant Demo Access</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      Login as Dr. Vikram Joshi (Lead Cloud Instructor)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleDemoLogin}
                    disabled={demoLoading || loading}
                    className="shrink-0 shadow-sm"
                  >
                    {demoLoading ? "Launching..." : "1-Click Access"}
                  </Button>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-border" />
                <span className="absolute px-3 bg-card text-[11px] text-muted-foreground uppercase font-medium tracking-wider">
                  Or use credentials
                </span>
              </div>

              {error && (
                <InlineAlert variant="error" title="Authentication Error">
                  {error}
                </InlineAlert>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Faculty Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jaykumar0305@gmail.com"
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                      Password
                    </Label>
                    <span className="text-[11px] text-brand-ink dark:text-brand-cyan hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-9 pr-9 h-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || demoLoading}
                  className="w-full mt-2 font-semibold shadow-teal-glow"
                >
                  {loading ? (
                    <span>Verifying session...</span>
                  ) : (
                    <>
                      <span>Enter Faculty Portal</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2 pb-6 text-center text-xs text-muted-foreground border-t border-border/60 bg-muted/20">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-ink dark:text-brand-teal" />
                <span>Protected by TechGration Enterprise RBAC Security</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground">
        © 2026 TechGration Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  )
}
