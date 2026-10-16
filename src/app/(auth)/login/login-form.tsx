"use client"

import * as React from "react"
import Link from "next/link"
import { useTransition } from "react"
import { motion } from "motion/react"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InlineAlert } from "@/components/feedback/inline-alert"
import { Eye, EyeOff, Loader2, ArrowRight, Mail, Lock, Sparkles, ShieldCheck } from "lucide-react"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result && !result.success) {
        setError(result.error || "Failed to sign in. Please check your credentials.")
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative rounded-3xl p-7 sm:p-9 border border-border/80 dark:border-white/10 bg-card/85 dark:bg-[#0c1117]/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {/* Specular top rim highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-80" />

      {/* Security Badge & Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 dark:bg-brand-teal/15 border border-brand-teal/30 text-brand-ink dark:text-brand-teal text-[11px] font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal animate-pulse" />
          <span>Enterprise Secure Login</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Access your courses, scheduled live classes, and verified certificates.
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <InlineAlert
            variant="error"
            title="Sign-in failed"
            message={error}
          />
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field with embedded icon */}
        <div className="space-y-1.5 group">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground/90">
            Work or Student Email
          </Label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-teal transition-colors pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="name@company.com"
              disabled={isPending}
              className="h-11 sm:h-12 pl-10 pr-4 text-sm rounded-xl border border-border/80 dark:border-white/10 bg-background/60 dark:bg-black/30 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:border-brand-teal transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Password Field with embedded icon and peek button */}
        <div className="space-y-1.5 group">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-ink dark:text-brand-teal font-medium hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-teal transition-colors pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              disabled={isPending}
              className="h-11 sm:h-12 pl-10 pr-10 text-sm rounded-xl border border-border/80 dark:border-white/10 bg-background/60 dark:bg-black/30 placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-brand-teal/40 focus-visible:border-brand-teal transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me option */}
        <div className="flex items-center space-x-2 pt-1 pb-1">
          <Checkbox id="remember" name="remember" defaultChecked />
          <Label
            htmlFor="remember"
            className="text-xs font-normal text-muted-foreground cursor-pointer select-none"
          >
            Keep me securely signed in on this device
          </Label>
        </div>

        {/* High-Impact Cyber Shimmer Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            disabled={isPending}
            className="relative group overflow-hidden w-full h-11 sm:h-12 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-brand-teal via-[#2ceeee] to-brand-teal text-brand-charcoal shadow-[0_4px_25px_-4px_rgba(0,214,214,0.4)] hover:shadow-[0_6px_30px_-3px_rgba(0,214,214,0.6)] transition-all duration-300 mt-2"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            {isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-charcoal" />
                <span>Authenticating credentials...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign In to Learning Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-border/60 dark:border-white/10 text-center">
        <p className="text-xs text-muted-foreground font-normal">
          Don&apos;t have an enterprise account?{" "}
          <Link
            href="/register"
            className="text-brand-ink dark:text-brand-teal font-semibold hover:underline transition-colors ml-1"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Security footer note */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
        <span>End-to-End TLS Encryption & Zero-Trust Session</span>
      </div>
    </motion.div>
  )
}
