"use client"

import * as React from "react"
import { motion } from "motion/react"
import confetti from "canvas-confetti"
import {
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRight,
  Share2,
  Loader2,
  Video,
  ExternalLink,
  Copy,
  Check,
  Clock,
} from "lucide-react"
import { toast } from "sonner"

const LIVE_ZOOM_URL =
  "https://us06web.zoom.us/j/83402526743?pwd=2GsWJFuRJB3X6oyIeHWuH8djg306D8.1"
const ZOOM_MEETING_ID = "834 0252 6743"
const STORAGE_KEY = "tg_workshop_github_unlocked_lead"

const WORKSHOP_DOMAINS = [
  "Artificial Intelligence & Gen AI",
  "Machine Learning",
  "Cyber Security & Ethical Hacking",
  "Data Analytics",
  "Cloud and DevOps",
  "UI/UX Developer",
  "Full Stack Developer",
  "Data Science",
  "DSA in Python",
  "DSA in Java",
  "DSA in C++",
  "App Development",
  "VLSI Design",
  "IoT & Robotics",
  "AutoCAD & MATLAB",
  "HR & Finance",
  "Leadership & Management",
  "Digital Marketing and Growth",
] as const

export function WorkshopGithubClient() {
  const [isUnlocked, setIsUnlocked] = React.useState(false)
  const [hasCheckedStorage, setHasCheckedStorage] = React.useState(false)
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState(false)

  // Form Fields
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [college, setCollege] = React.useState("")
  const [interestedDomain, setInterestedDomain] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Check localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.name && parsed?.phone) {
          setName(parsed.name)
          setPhone(parsed.phone)
          setCollege(parsed.college || "")
          setInterestedDomain(parsed.interestedDomain || "")
          setIsUnlocked(true)
        }
      }
    } catch {}
    setHasCheckedStorage(true)
  }, [])

  // Validation: Name min 2 chars, Phone exactly 10 digits, College min 2 chars, Domain selected
  const cleanedPhone = phone.replace(/[^0-9]/g, "")
  const isPhoneValid = cleanedPhone.length === 10
  const isFormValid =
    name.trim().length >= 2 &&
    isPhoneValid &&
    college.trim().length >= 2 &&
    interestedDomain.trim().length > 0

  const handleJoinNow = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/workshop/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanedPhone,
          college: college.trim(),
          interestedDomain,
          workshopName: "Master GitHub Live Workshop",
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to register. Please try again.")
      }

      // Save unlock state locally
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            name: name.trim(),
            phone: cleanedPhone,
            college: college.trim(),
            interestedDomain,
            unlockedAt: new Date().toISOString(),
          })
        )
      } catch {}

      // Celebrate with confetti
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0D9488", "#14B8A6", "#2DD4BF", "#065F46", "#F59E0B"],
      })

      setIsUnlocked(true)
      setIsRedirecting(true)
      toast.success("Registered! Opening Live Zoom Workshop...")

      // Smoothly redirect into Zoom live session (works reliably in WhatsApp in-app browser & mobile)
      setTimeout(() => {
        window.location.href = LIVE_ZOOM_URL
      }, 900)
    } catch (err: any) {
      toast.error(err.message || "Could not register. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🚀 *TechGration Master GitHub Live Workshop (Today 6:00 PM – 7:00 PM IST)*\n\nLearn Version Control, Team Collaboration & Build a Real-World Dev Portfolio live with TechGration!\n\n👉 *Register & Join Live Here:* https://campus.techgration.live/workshop-github`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  const handleCopyMeetingId = () => {
    navigator.clipboard?.writeText(ZOOM_MEETING_ID.replace(/\s+/g, "")).catch(() => {})
    setCopiedId(true)
    toast.success("Meeting ID copied")
    setTimeout(() => setCopiedId(false), 2000)
  }

  if (!hasCheckedStorage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Subtle Ambient Background Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-teal-200/35 via-teal-100/15 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* MINIMAL NAVBAR */}
      <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-teal-600/30">
              TG
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              TechGration
            </span>
          </div>

          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {!isUnlocked ? (
          /* ========================================================
             GATE / REGISTRATION CARD (Light & Teal Minimal Theme)
             ======================================================== */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mx-auto"
          >
            {/* Header / Title */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Live Workshop · 6:00 PM – 7:00 PM IST
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Master GitHub Workshop
              </h1>
            </div>

            {/* Clean White Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xl shadow-slate-200/50">
              <div className="text-center space-y-1 mb-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Enter Details to Join Live Workshop
                </h2>
                <p className="text-xs text-slate-500">
                  Fill out the quick form below to enter the live Zoom session.
                </p>
              </div>

              <form onSubmit={handleJoinNow} className="space-y-4">
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* 2. Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 bg-slate-50/70 transition-all">
                    <span className="inline-flex items-center px-3 text-xs font-medium text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                      required
                      className="flex-1 h-10 px-3 text-xs sm:text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  {phone.length > 0 && !isPhoneValid && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      Enter 10-digit number ({10 - phone.length} digits left)
                    </p>
                  )}
                </div>

                {/* 3. College / Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    College / Institution <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Medicaps University, Indore"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* 4. Interested Domain (18 Domains Dropdown) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Interested Domain <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={interestedDomain}
                      onChange={(e) => setInterestedDomain(e.target.value)}
                      required
                      className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all cursor-pointer appearance-none pr-8"
                    >
                      <option value="" disabled className="text-slate-400">
                        -- Select Domain --
                      </option>
                      {WORKSHOP_DOMAINS.map((domain, idx) => (
                        <option key={domain} value={domain} className="text-slate-900 py-1">
                          {idx + 1}. {domain}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* JOIN NOW BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full h-11 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      isFormValid && !isSubmitting
                        ? "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 cursor-pointer"
                        : "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Joining Live Session...</span>
                      </>
                    ) : isFormValid ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>Join Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Fill all fields to Join</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400 pt-1">
                  Instant entry to Live Zoom Workshop · Free for all learners
                </p>
              </form>
            </div>
          </motion.div>
        ) : (
          /* ========================================================
             UNLOCKED LIVE ZOOM LAUNCH CARD (Light & Teal Aesthetic)
             ======================================================== */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600">
                <Video className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200/80 rounded-full px-3 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Registered · {name}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-1">
                  Master GitHub Live Workshop
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isRedirecting
                    ? "Opening your live Zoom workshop room..."
                    : "Your seat is confirmed. Tap below to enter the live Zoom session."}
                </p>
              </div>

              {/* Session Timing & Meeting ID */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Timing
                  </span>
                  <span className="font-semibold text-slate-800">Today · 6:00 PM – 7:00 PM IST</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/70 pt-2">
                  <span className="text-slate-500">Zoom Meeting ID</span>
                  <button
                    type="button"
                    onClick={handleCopyMeetingId}
                    className="inline-flex items-center gap-1.5 font-mono font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                  >
                    <span>{ZOOM_MEETING_ID}</span>
                    {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Direct Live Zoom Button */}
              <a
                href={LIVE_ZOOM_URL}
                className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/25 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Join Live Zoom Session</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="pt-1 flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={handleShareOnWhatsApp}
                  className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-800 font-medium cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share with Friends
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* CLEAN MINIMAL FOOTER */}
      <footer className="relative z-10 w-full py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50">
        <p>© 2026 TechGration. All rights reserved.</p>
      </footer>
    </div>
  )
}
