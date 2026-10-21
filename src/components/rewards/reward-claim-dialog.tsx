"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import confetti from "canvas-confetti"
import {
  X,
  Sparkles,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  MapPin,
  Phone,
  User,
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { claimRewardAction, type ClaimRewardInput } from "@/actions/rewards"
import type { SwagRewardItem } from "@/server/services/rewards"

interface RewardClaimDialogProps {
  item: SwagRewardItem | null
  simulatedChampion?: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RewardClaimDialog({
  item,
  simulatedChampion = false,
  onClose,
  onSuccess,
}: RewardClaimDialogProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>({})
  const [shippingName, setShippingName] = React.useState("")
  const [shippingPhone, setShippingPhone] = React.useState("")
  const [shippingAddress, setShippingAddress] = React.useState("")
  const [shippingCity, setShippingCity] = React.useState("")
  const [shippingState, setShippingState] = React.useState("")
  const [shippingPincode, setShippingPincode] = React.useState("")

  const [loading, setLoading] = React.useState(false)
  const [confirmedClaim, setConfirmedClaim] = React.useState<{
    trackingCode: string
    rewardTitle: string
  } | null>(null)
  const [copiedCode, setCopiedCode] = React.useState(false)

  // Initialize default options when item changes
  React.useEffect(() => {
    if (item) {
      const defaults: Record<string, string> = {}
      for (const opt of item.options) {
        defaults[opt.key] = opt.defaultChoice
      }
      setSelectedOptions(defaults)
      setConfirmedClaim(null)
    }
  }, [item])

  if (!item) return null

  const handleOptionChange = (key: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }))
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingName.trim() || shippingName.length < 2) {
      toast.error("Please enter a valid recipient full name.")
      return
    }
    if (!shippingPhone.trim() || shippingPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.")
      return
    }
    if (!shippingAddress.trim() || shippingAddress.length < 5) {
      toast.error("Please enter your complete street address.")
      return
    }
    if (!shippingCity.trim()) {
      toast.error("Please enter your city.")
      return
    }
    if (!shippingState.trim()) {
      toast.error("Please enter your state.")
      return
    }
    if (!/^\d{6}$/.test(shippingPincode.trim())) {
      toast.error("Please enter a valid 6-digit postal PIN code.")
      return
    }

    const formattedOptions = Object.entries(selectedOptions)
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(" • ")

    setLoading(true)
    try {
      const res = await claimRewardAction({
        rewardId: item.id,
        selectedOption: formattedOptions || "Standard",
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim(),
        shippingState: shippingState.trim(),
        shippingPincode: shippingPincode.trim(),
        forceSimulateEligibility: simulatedChampion,
      })

      if (res.success && res.trackingCode) {
        triggerConfetti()
        setConfirmedClaim({
          trackingCode: res.trackingCode,
          rewardTitle: res.rewardTitle || item.title,
        })
        toast.success("Champion reward claimed successfully!")
        onSuccess()
      } else {
        toast.error(res.error || "Failed to process claim.")
      }
    } catch (err) {
      toast.error("An unexpected error occurred while claiming your reward.")
    } finally {
      setLoading(false)
    }
  }

  const copyTracking = () => {
    if (confirmedClaim?.trackingCode) {
      navigator.clipboard.writeText(confirmedClaim.trackingCode)
      setCopiedCode(true)
      toast.success("Tracking code copied to clipboard!")
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl max-h-[90dvh] overscroll-contain overflow-y-auto rounded-3xl border border-border/70 bg-card p-5 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {!confirmedClaim ? (
            /* CLAIM CONFIGURATION & ADDRESS FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div className="space-y-1 pr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>#1 Champion Swag Claim Console</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  Configure & Claim {item.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Customize your item specifications and enter your dispatch address. All shipping and handling is 100% covered by TechGration.
                </p>
              </div>

              {/* Product Mini Preview Card */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-border/50 bg-muted/30">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-background border border-border/40 shrink-0 p-1 flex items-center justify-center">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-amber-500 font-medium">
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] text-emerald-500 font-bold mt-0.5">
                    100% Free Award for Course Champion
                  </p>
                </div>
              </div>

              {/* Dynamic Product Options (Size, Color) */}
              {item.options.length > 0 && (
                <div className="space-y-4 pt-1">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Step 1: Choose Your Specifications
                  </h3>
                  {item.options.map((opt) => (
                    <div key={opt.key} className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground">
                        {opt.name}:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {opt.choices.map((choice) => {
                          const isSelected = (selectedOptions[opt.key] || opt.defaultChoice) === choice
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => handleOptionChange(opt.key, choice)}
                              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500/15 text-amber-500 shadow-xs"
                                  : "border-border/60 bg-background hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95"
                              }`}
                            >
                              {choice}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping Address Inputs */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  Step 2: Shipping & Delivery Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      Recipient Full Name
                    </Label>
                    <Input
                      placeholder="e.g. Arun Kumar"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="rounded-xl h-11 sm:h-10 text-base sm:text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      Contact Mobile Number
                    </Label>
                    <Input
                      placeholder="e.g. 9876543210"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      className="rounded-xl h-11 sm:h-10 text-base sm:text-xs"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    Complete Street Address (Flat / House No., Street, Landmark)
                  </Label>
                  <Input
                    placeholder="e.g. Flat 402, Tech Towers, Cyber City"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="rounded-xl h-11 sm:h-10 text-base sm:text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">City</Label>
                    <Input
                      placeholder="e.g. Bengaluru"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="rounded-xl h-11 sm:h-10 text-base sm:text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">State</Label>
                    <Input
                      placeholder="e.g. Karnataka"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="rounded-xl h-11 sm:h-10 text-base sm:text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">Postal PIN</Label>
                    <Input
                      placeholder="e.g. 560100"
                      value={shippingPincode}
                      onChange={(e) => setShippingPincode(e.target.value)}
                      className="rounded-xl h-11 sm:h-10 text-base sm:text-xs"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-border/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl text-xs h-11 sm:h-10 w-full sm:w-auto"
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm px-6 h-11 sm:h-10 w-full sm:w-auto shadow-lg shadow-amber-500/20 justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Processing Dispatch Claim...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      <span>Confirm & Claim Free Swag</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* CLAIM SUCCESS VOUCHER */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                  Champion Swag Claim Confirmed! 🎉
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Your customized <strong className="text-foreground">{confirmedClaim.rewardTitle}</strong> has been assigned to our logistics dispatch queue.
                </p>
              </div>

              {/* Digital Swag Voucher Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent text-left space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>DISPATCH TRACKING CODE</span>
                  <span className="text-emerald-500 font-bold">APPROVED & VERIFIED</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-background/80 border border-border/50">
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                    {confirmedClaim.trackingCode}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyTracking}
                    className="h-8 text-xs font-semibold rounded-lg"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </Button>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-1">
                  <p>🚚 Courier: <strong>BlueDart Express Air</strong></p>
                  <p>📦 Delivery Estimate: <strong>3-5 Business Days</strong></p>
                  <p>🛡️ Inspection: <strong>TechGration Official QC Passed</strong></p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={onClose}
                  size="lg"
                  className="rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold text-xs sm:text-sm px-8"
                >
                  View My Swag Orders
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
