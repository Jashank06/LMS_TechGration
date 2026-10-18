"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { motion } from "motion/react"
import {
  Copy,
  Check,
  Share2,
  Sparkles,
  Phone,
  MessageCircle,
  Users,
  Gift,
  ArrowRight,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReferralStudentStats } from "@/server/services/referrals"

interface ReferralClientProps {
  stats: ReferralStudentStats
  studentName?: string
}

export function ReferralClient({ stats, studentName }: ReferralClientProps) {
  const [copiedId, setCopiedId] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)
  const [origin, setOrigin] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const referralLink = origin ? `${origin}/register?ref=${stats.referralCode}` : `/register?ref=${stats.referralCode}`

  const shareText = `🎓 Hey! I'm learning on TechGration LMS. Use my unique Refer ID *${stats.referralCode}* when you enroll in top tech courses and I get up to ₹500 cashback! 🚀\n\nEnroll here: ${referralLink}`

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
  const supportWhatsappUrl = `https://wa.me/91${stats.supportPhone}?text=${encodeURIComponent(
    `Hi TechGration, I am ${studentName || "a student"} (Refer ID: ${stats.referralCode}). I have a query about the Refer & Earn up to ₹500 cashback.`
  )}`

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralCode)
      setCopiedId(true)
      toast.success("Refer ID Copied!", {
        description: `Code ${stats.referralCode} copied to clipboard.`,
      })
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      toast.error("Failed to copy code.")
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopiedLink(true)
      toast.success("Invite Link Copied!", {
        description: "Share this link with your friends to enroll.",
      })
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      toast.error("Failed to copy link.")
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join TechGration LMS & Earn Cashback",
          text: `Use my Refer ID ${stats.referralCode} to enroll in TechGration courses and get up to ₹500 cashback!`,
          url: referralLink,
        })
        toast.success("Thanks for sharing!")
      } catch (err: any) {
        if (err.name !== "AbortError") {
          window.open(whatsappUrl, "_blank")
        }
      }
    } else {
      window.open(whatsappUrl, "_blank")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col justify-between items-center py-2 sm:py-3 px-3 sm:px-6 select-none overflow-x-hidden md:overflow-y-hidden">
      {/* 1. Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center shrink-0 mb-1"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-bold mb-1 tracking-wide shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>REFER & EARN</span>
          <span className="w-1 h-1 rounded-full bg-amber-500" />
          <span className="font-extrabold text-amber-700 dark:text-amber-300">UPTO ₹500 CASHBACK</span>
        </div>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-tight">
          Refer Friends & Earn <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">₹500 Cashback</span>
        </h1>
        <p className="text-[12px] sm:text-xs text-muted-foreground max-w-lg mx-auto line-clamp-1 sm:line-clamp-none mt-0.5">
          Share your Refer ID. When friends enroll in any course, you get up to ₹500 cashback!
        </p>
      </motion.div>

      {/* 2. Responsive Centerpiece Image (Constrained to fit viewport cleanly with zero scrolling) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 15,
          delay: 0.1,
        }}
        className="relative shrink-0 flex items-center justify-center my-1 group max-w-full"
      >
        {/* Pulsating golden aura */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.85, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-400/25 to-orange-500/30 rounded-3xl blur-xl sm:blur-2xl pointer-events-none"
        />

        {/* 3D floating levitation wrapper */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="relative max-h-[32vh] sm:max-h-[35vh] lg:max-h-[38vh] flex items-center justify-center"
        >
          {/* Glass frame */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 bg-card/80 backdrop-blur-xl shadow-[0_15px_40px_-10px_rgba(245,158,11,0.3)] flex items-center justify-center">
            {/* Holographic Laser Sweep */}
            <motion.div
              animate={{ x: ["-150%", "250%"] }}
              transition={{
                repeat: Infinity,
                duration: 3.2,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/40 dark:via-amber-200/35 to-transparent skew-x-[-25deg] pointer-events-none z-20"
            />

            {/* Cyber HUD Corner Accents */}
            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm z-20 pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm z-20 pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm z-20 pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm z-20 pointer-events-none" />

            {/* Top-Right Badge */}
            <div className="absolute top-2.5 right-3 z-20 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-amber-400/50 text-[10px] font-bold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>CASHBACK ACTIVE</span>
            </div>

            {/* Sized responsively to viewport height so it fits on one screen */}
            <Image
              src="/₹500 Cashback Celebration.png"
              alt="₹500 Cashback Celebration"
              width={1536}
              height={1024}
              priority
              className="h-[28vh] sm:h-[32vh] lg:h-[35vh] max-h-[300px] w-auto aspect-[3/2] object-contain transform transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-height: 500px) 35vh, (max-height: 700px) 32vh, 480px"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Compact Unique Refer ID & "Refer Now" CTA Section — Staggered Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 17,
          delay: 0.55,
        }}
        className="w-full max-w-xl mx-auto shrink-0 bg-card/90 dark:bg-[#12161B]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-xl text-center my-1 relative overflow-hidden"
      >
        {/* Code pill */}
        <div className="flex items-center justify-between gap-2 bg-muted/60 dark:bg-black/40 border border-amber-500/35 rounded-xl px-3 sm:px-4 py-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
              REFER ID:
            </span>
            <span className="font-mono text-lg sm:text-2xl font-black tracking-wider text-amber-600 dark:text-amber-400 select-all">
              {stats.referralCode}
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyId}
            className="h-8 px-3 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold transition-all"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>

        {/* Buttons row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Refer Now */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 15,
              delay: 0.7,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group w-full"
          >
            {/* Glowing ring */}
            <motion.span
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                  "0 0 0 8px rgba(16, 185, 129, 0.28)",
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-xl pointer-events-none"
            />

            <Button
              size="default"
              onClick={handleNativeShare}
              className="relative overflow-hidden w-full h-11 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-extrabold rounded-xl shadow-md shadow-emerald-500/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2.2, repeatDelay: 1, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
              />
              <Share2 className="w-4 h-4 text-white" />
              <span>Refer Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </motion.div>

          {/* Share on WhatsApp */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 15,
              delay: 0.8,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold rounded-xl shadow-md shadow-[#25D366]/20 transition-all text-sm sm:text-base px-3"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Share on WhatsApp</span>
            </a>
          </motion.div>
        </div>

        {/* Copy Link line */}
        <button
          onClick={handleCopyLink}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Invite link copied to clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Or click here to copy invite link</span>
            </>
          )}
        </button>
      </motion.div>

      {/* 4. Single-Screen Bottom Strip (Combines Live Stats & 9911752744 Support with Zero Overflow) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.85 }}
        className="w-full max-w-xl mx-auto shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-card/60 dark:bg-[#12161B]/60 border border-border/60 text-xs text-muted-foreground mt-1"
      >
        {/* Performance micro counters */}
        <div className="flex items-center gap-2.5 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-foreground">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>{stats.totalInvited} Invited</span>
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {stats.totalEnrolled} Enrolled
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
            ₹{stats.cashbackEarned} Cashback
          </span>
        </div>

        {/* Support Direct Link 9911752744 */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground hidden sm:inline">Support:</span>
          <a
            href={supportWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Phone className="w-3 h-3" />
            <span>{stats.supportPhone}</span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
