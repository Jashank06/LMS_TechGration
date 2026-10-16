"use client"

import * as React from "react"
import Link from "next/link"
import { useTransition } from "react"
import { loginAction, demoLoginAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InlineAlert } from "@/components/feedback/inline-alert"
import { Eye, EyeOff, Loader2, Sparkles, GraduationCap, School, ShieldAlert, ArrowRight } from "lucide-react"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [demoPendingRole, setDemoPendingRole] = React.useState<string | null>(null)
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

  function handleDemoLogin(role: "student" | "teacher" | "admin") {
    setError(null)
    setDemoPendingRole(role)
    startTransition(async () => {
      const result = await demoLoginAction(role)
      if (result && !result.success) {
        setError(result.error || `Could not sign in with ${role} demo account.`)
        setDemoPendingRole(null)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 1-Click Demo Login Banner */}
      <div className="rounded-xl border border-brand-teal/40 bg-brand-teal/5 dark:bg-brand-teal/10 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-brand-ink dark:text-brand-teal">
          <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
          <span>Instant 1-Click Demo Access</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Click any role to test the live portal immediately without typing credentials:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isPending}
            onClick={() => handleDemoLogin("student")}
            className="flex items-center justify-center gap-1.5 text-xs font-medium bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal shadow-sm transition-all"
          >
            {demoPendingRole === "student" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5" />
            )}
            <span>Student</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleDemoLogin("teacher")}
            className="flex items-center justify-center gap-1.5 text-xs font-medium border-border hover:border-brand-teal/40 transition-all"
          >
            {demoPendingRole === "teacher" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <School className="w-3.5 h-3.5" />
            )}
            <span>Teacher</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleDemoLogin("admin")}
            className="flex items-center justify-center gap-1.5 text-xs font-medium border-border hover:border-brand-teal/40 transition-all"
          >
            {demoPendingRole === "admin" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>Admin</span>
          </Button>
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-border" />
        <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Or sign in with email
        </span>
        <div className="flex-grow border-t border-border" />
      </div>

      {error && (
        <InlineAlert
          variant="error"
          title="Sign-in failed"
          message={error}
        />
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-medium">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="student@techgration.com"
            defaultValue="student@techgration.com"
            disabled={isPending}
            className="h-10 text-sm focus-visible:ring-brand-teal"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-ink dark:text-brand-teal hover:underline font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              defaultValue="Student@123"
              disabled={isPending}
              className="h-10 text-sm pr-10 focus-visible:ring-brand-teal"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <Checkbox id="remember" name="remember" defaultChecked />
          <Label
            htmlFor="remember"
            className="text-xs font-normal text-muted-foreground cursor-pointer select-none"
          >
            Keep me signed in on this device
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md mt-2"
        >
          {isPending && !demoPendingRole ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>Sign In to Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="text-brand-ink dark:text-brand-teal font-semibold hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
