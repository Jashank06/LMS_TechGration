"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InlineAlert } from "@/components/feedback/inline-alert"
import { OtpInput } from "@/components/auth/otp-input"
import {
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()

  // Steps: 1 = Email Input, 2 = 6-Digit OTP, 3 = New Password, 4 = Success
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1)

  // Fields
  const [email, setEmail] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)

  // OTP Timer & Status
  const [resendCooldown, setResendCooldown] = React.useState(60)
  const [canResend, setCanResend] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Password Strength
  const passCheck = React.useMemo(() => {
    return {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    }
  }, [newPassword])

  const strength = React.useMemo(() => {
    if (!newPassword) return { score: 0, label: "Empty", color: "bg-muted", width: "0%" }
    const passedCount = Object.values(passCheck).filter(Boolean).length
    if (passedCount <= 1) return { score: 25, label: "Weak", color: "bg-red-500", width: "25%" }
    if (passedCount === 2) return { score: 50, label: "Fair", color: "bg-amber-500", width: "50%" }
    if (passedCount === 3) return { score: 75, label: "Good", color: "bg-blue-500", width: "75%" }
    return { score: 100, label: "Strong", color: "bg-emerald-500", width: "100%" }
  }, [newPassword, passCheck])

  // Timer Countdown
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

  // Step 1: Send Password Reset OTP
  async function handleSendResetOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset code")
      }

      toast.success("Reset Code Sent!", {
        description: `Check your inbox at ${email}`,
      })

      setStep(2)
      setResendCooldown(60)
      setOtpCode("")
    } catch (err: any) {
      setError(err.message || "Failed to process request")
    } finally {
      setIsLoading(false)
    }
  }

  // Resend Reset Code
  async function handleResendCode() {
    if (!canResend || isLoading) return
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code")
      }

      toast.success("New Reset Code Sent", {
        description: `Dispatched to ${email}`,
      })
      setResendCooldown(60)
      setOtpCode("")
    } catch (err: any) {
      setError(err.message || "Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Confirm OTP entered and advance to New Password
  function handleConfirmOtp(codeToCheck?: string) {
    const code = codeToCheck || otpCode
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.")
      return
    }
    setError(null)
    setStep(3)
  }

  // Step 3: Complete Password Reset
  async function handleCompleteReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter carefully.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      toast.success("Password Updated Successfully!", {
        description: "You can now log in with your new password.",
      })

      setStep(4)
    } catch (err: any) {
      setError(err.message || "Failed to complete password reset")
      // If code was invalid, jump back to Step 2 so user can re-enter code
      if (err.message && err.message.toLowerCase().includes("code")) {
        setStep(2)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {step === 4 ? "Password Reset Complete" : "Reset your password"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 1 && "Enter your registered email to receive a 6-digit verification code."}
          {step === 2 && "Enter the 6-digit code dispatched to your inbox."}
          {step === 3 && "Create a secure new password for your account."}
          {step === 4 && "Your credentials have been securely updated in our cloud."}
        </p>
      </div>

      {error && (
        <InlineAlert
          variant="error"
          title="Reset password alert"
          message={error}
        />
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: EMAIL ENTRY */}
        {step === 1 && (
          <motion.form
            key="step-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSendResetOtp}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-foreground">
                Registered email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@techgration.com"
                disabled={isLoading}
                className="h-10 text-sm focus-visible:ring-brand-teal"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking account & sending code...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>Send 6-Digit Reset Code</span>
                </div>
              )}
            </Button>
          </motion.form>
        )}

        {/* STEP 2: 6-DIGIT OTP */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Recipient pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/80 border border-border">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Reset code sent to
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
                Enter 6-Digit Password Reset Code
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter the code sent from TechGration Security.
              </p>

              <div className="pt-2">
                <OtpInput
                  length={6}
                  value={otpCode}
                  onChange={(val) => {
                    setOtpCode(val)
                    if (error) setError(null)
                  }}
                  onComplete={(code) => handleConfirmOtp(code)}
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
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-teal hover:underline font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Reset Code</span>
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
              onClick={() => handleConfirmOtp()}
              disabled={isLoading || otpCode.length !== 6}
              className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md"
            >
              <span>Continue to New Password</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </motion.div>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <motion.form
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCompleteReset}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-medium text-foreground">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              {newPassword && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Strength:</span>
                    <span className="font-semibold text-foreground">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isLoading}
                className="h-10 text-sm focus-visible:ring-brand-teal"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal transition-all shadow-md mt-4"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Save New Password & Complete</span>
                </div>
              )}
            </Button>
          </motion.form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(30,201,143,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-muted-foreground">
                Your account is secure and ready. All existing sessions have been signed out.
              </p>
            </div>
            <div className="pt-3">
              <Button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full h-10 font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal shadow-md"
              >
                <span>Sign In with New Password</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
