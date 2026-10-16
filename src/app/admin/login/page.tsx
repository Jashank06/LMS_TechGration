"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { BrandLogo } from "@/components/brand/brand-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Laptop,
  GraduationCap,
  Crown,
} from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [activeDemo, setActiveDemo] = React.useState<string | null>(null)

  const demoAccounts = [
    {
      role: "Super Admin",
      email: "superadmin@techgration.com",
      pass: "SuperAdmin@2026!",
      icon: Crown,
      badge: "Highest Authority",
      color: "from-amber-500/20 to-brand-teal/20 text-amber-400 border-amber-500/30",
    },
    {
      role: "Operations Admin",
      email: "admin@techgration.live",
      pass: "Admin@2026!",
      icon: ShieldCheck,
      badge: "Platform Ops",
      color: "from-brand-teal/20 to-cyan-500/20 text-brand-cyan border-brand-teal/30",
    },
    {
      role: "Instructor",
      email: "jaykumar0305@gmail.com",
      pass: "Teacher@2026!",
      icon: Laptop,
      badge: "Teacher Console",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
    {
      role: "Student",
      email: "arjun.patel@techgration.com",
      pass: "Student@2026!",
      icon: GraduationCap,
      badge: "Learner Workspace",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
  ]

  const handleSelectDemo = (account: (typeof demoAccounts)[0]) => {
    setEmail(account.email)
    setPassword(account.pass)
    setActiveDemo(account.role)
    setErrorMessage(null)
    toast.info(`Filled credentials for ${account.role}`, {
      description: account.email,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage("Please enter both email and password")
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          requiredRole: "ANY",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed")
        toast.error("Login Failed", { description: data.error })
        return
      }

      toast.success(`Welcome back, ${data.user.name}!`, {
        description: `Signed in as ${data.user.role}. Redirecting to dashboard...`,
      })

      router.push(data.redirectUrl || "/admin/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Login submit error:", err)
      setErrorMessage("Network error during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0E11] text-[#F2F5F8] flex flex-col justify-between selection:bg-brand-teal/30 selection:text-white overflow-hidden">
      {/* Background Animated Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-brand-teal/15 via-brand-cyan/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00D6D6 1px, transparent 1px), linear-gradient(90deg, #00D6D6 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <BrandLogo variant="sidebar" portalName="Admin" href="/" priority />
        <div className="flex items-center gap-3">
          <ThemeToggle variant="button" />
          <Button asChild variant="outline" size="sm" className="border-white/10 hover:border-brand-teal/40">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      {/* Central Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          {/* Outer Cyber Glow Border Card */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-brand-teal/40 via-white/10 to-white/5 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl bg-[#12171B]/95 p-8 sm:p-10 border border-white/5">
              {/* Badge & Lockup */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative w-14 h-14 rounded-2xl bg-[#171F24] border border-brand-teal/30 flex items-center justify-center shadow-lg shadow-brand-teal/10 mb-4 group">
                  <div className="absolute inset-0 rounded-2xl bg-brand-teal/10 animate-pulse pointer-events-none" />
                  <ShieldCheck className="w-7 h-7 text-brand-teal" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-brand-teal/10 text-brand-cyan border border-brand-teal/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enterprise Security Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Admin Command Center
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
                  Sign in to manage users, govern curriculum, inspect audit logs, and oversee system operations.
                </p>
              </div>

              {/* 1-Click Demo Account Quick Fill Switcher */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    Quick-Fill Demo Credentials:
                  </span>
                  <span className="text-[11px] text-brand-teal/90 font-medium">1-Click Test</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {demoAccounts.map((account) => {
                    const Icon = account.icon
                    const isSelected = activeDemo === account.role
                    return (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => handleSelectDemo(account)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? "bg-brand-teal/15 border-brand-teal shadow-sm shadow-brand-teal/20"
                            : "bg-[#182026]/70 border-white/10 hover:border-brand-teal/50 hover:bg-[#1E2830]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3.5 h-3.5 text-brand-teal" />
                          <span className="text-xs font-semibold text-white truncate">{account.role}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate w-full">
                          {account.badge}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Institutional Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@techgration.live"
                      required
                      className="pl-10 h-11 bg-[#171E24] border-white/10 focus:border-brand-teal focus:ring-brand-teal text-white placeholder:text-muted-foreground/60 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Master Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-brand-teal transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="pl-10 pr-10 h-11 bg-[#171E24] border-white/10 focus:border-brand-teal focus:ring-brand-teal text-white placeholder:text-muted-foreground/60 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="sr-only">Toggle password visibility</span>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-brand-teal hover:bg-brand-teal-deep text-brand-charcoal font-bold text-sm tracking-wide shadow-lg shadow-brand-teal/20 transition-all gap-2 mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-charcoal border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <>
                      <span>Enter Admin Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Security Policy Footnote */}
              <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-muted-foreground/80">
                <KeyRound className="w-3.5 h-3.5 text-brand-teal" />
                <span>Append-only audit logs track all administrative access sessions.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-muted-foreground/60">
        &copy; {new Date().getFullYear()} TechGration Technologies Private Limited. All rights reserved.
      </footer>
    </div>
  )
}
