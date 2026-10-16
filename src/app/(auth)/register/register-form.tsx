"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InlineAlert } from "@/components/feedback/inline-alert"
import { OtpInput } from "@/components/auth/otp-input"
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Sparkles,
} from "lucide-react"

export function RegisterForm() {
  const router = useRouter()

  // Form step: 1 = Details, 2 = Email OTP Verification, 3 = Success Launch
  const [step, setStep] = React.useState<1 | 2 | 3>(1)

  // Fields
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [termsAccepted, setTermsAccepted] = React.useState(true)

  // OTP State
  const [otpCode, setOtpCode] = React.useState("")
  const [resendCooldown, setResendCooldown] = React.useState(60)
  const [canResend, setCanResend] = React.useState(false)

  // Loading & Error
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Password requirements calculation
  const passCheck = React.useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const strength = React.useMemo(() => {
    if (!password) return { score: 0, label: "Empty", color: "bg-muted", width: "0%" }
    const passedCount = Object.values(passCheck).filter(Boolean).length
    if (passedCount <= 1) return { score: 25, label: "Weak", color: "bg-red-500", width: "25%" }
    if (passedCount === 2) return { score: 50, label: "Fair", color: "bg-amber-500", width: "50%" }
    if (passedCount === 3) return { score: 75, label: "Good", color: "bg-blue-500", width: "75%" }
    return { score: 100, label: "Strong", color: "bg-emerald-500", width: "100%" }
  }, [password, passCheck])

  // Cooldown countdown timer
  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 2 && resendCooldown > 0) {
      setCanResend(false)
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    } else if (resendCooldown === 0) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [step, resendCooldown])

  // Step 1: Submit details and send Email OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!termsAccepted) {
      setError("Please accept the Terms of Service to continue.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code")
      }

      toast.success("Verification Code Sent!", {
        description: `Check your inbox at ${email}`,
      })

      setStep(2)
      setResendCooldown(60)
      setOtpCode("")
    } catch (err: any) {
      setError(err.message || "Failed to send verification code")
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (!canResend || isLoading) return
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend verification code")
      }

      toast.success("New Code Dispatched", {
        description: `A fresh 6-digit code was sent to ${email}`,
      })
      setResendCooldown(60)
      setOtpCode("")
    } catch (err: any) {
      setError(err.message || "Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP and create account
  async function handleVerifyOtp(codeToVerify?: string) {
    const code = codeToVerify || otpCode
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode: code,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Verification failed")
      }

      // Success! Fire celebration fireworks
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00D6D6", "#1EC98F", "#5B9BFF", "#FFB547"],
      })

      setStep(3)
      toast.success("Account Created & Verified!", {
        description: "Launching your personalized student dashboard...",
      })

      setTimeout(() => {
        router.push("/student/dashboard")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <InlineAlert
          variant="error"
          title="Registration alert"
          message={error}
        />
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: CREDENTIALS */}
        {step === 1 && (
          <motion.form
            key="step-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSendOtp}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-foreground">
                Full name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                disabled={isLoading}
                className="h-10 text-sm focus-visible:ring-brand-teal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@company.com"
                disabled={isLoading}
                className="h-10 text-sm focus-visible:ring-brand-teal"
              />
              <p className="text-[11px] text-muted-foreground">
                A 6-digit verification code will be sent to this email.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                Create password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={isLoading}
                  className="h-10 text-sm pr-10 focus-visible:ring-brand-teal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Password strength:</span>
                    <span className="font-semibold text-foreground">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pt-1">
                    <span className={passCheck.length ? "text-emerald-500 font-medium" : ""}>
                      ✓ 8+ Characters
                    </span>
                    <span className={passCheck.uppercase ? "text-emerald-500 font-medium" : ""}>
                      ✓ 1 Uppercase Letter
                    </span>
                    <span className={passCheck.number ? "text-emerald-500 font-medium" : ""}>
                      ✓ 1 Number
                    </span>
                    <span className={passCheck.special ? "text-emerald-500 font-medium" : ""}>
                      ✓ 1 Special Character
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(!!v)}
                className="mt-0.5"
              />
              <Label
                htmlFor="terms"
                className="text-xs font-normal text-muted-foreground leading-snug cursor-pointer select-none"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-brand-teal hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-brand-teal hover:underline">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !name || !email || !password}
              className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending verification code...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>Verify Email & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </motion.form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Recipient email pill with edit button */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/80 border border-border">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-brand-teal/15 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand-teal" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Code dispatched to
                  </p>
                  <p className="text-xs font-medium text-foreground truncate">{email}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0 gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Change</span>
              </Button>
            </div>

            <div className="space-y-3 text-center">
              <h2 className="text-sm font-semibold text-foreground">
                Enter 6-Digit Verification Code
              </h2>
              <p className="text-xs text-muted-foreground">
                Check your inbox (and spam folder) for the one-time code.
              </p>

              <div className="pt-2">
                <OtpInput
                  length={6}
                  value={otpCode}
                  onChange={(val) => {
                    setOtpCode(val)
                    if (error) setError(null)
                  }}
                  onComplete={(completedCode) => {
                    handleVerifyOtp(completedCode)
                  }}
                  disabled={isLoading}
                  hasError={!!error}
                />
              </div>
            </div>

            {/* Resend Cooldown */}
            <div className="text-center pt-1">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-teal hover:underline font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Resend code in{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {resendCooldown}s
                  </span>
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otpCode.length !== 6}
              className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying code & creating account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Launch Account</span>
                </div>
              )}
            </Button>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS CELEBRATION */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-teal/15 border border-brand-teal/40 mx-auto flex items-center justify-center text-brand-teal shadow-[0_0_30px_rgba(0,214,214,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-brand-teal animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Welcome to TechGration LMS!
              </h2>
              <p className="text-xs text-muted-foreground">
                Your email has been verified. Redirecting to your dashboard...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-brand-teal font-medium">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Initializing workspace...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-ink dark:text-brand-teal font-semibold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
