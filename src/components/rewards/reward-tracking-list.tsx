"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "motion/react"
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SWAG_CATALOG, type ClaimWithCourse } from "@/server/services/rewards"

interface RewardTrackingListProps {
  claims: ClaimWithCourse[]
  onExploreCatalog: () => void
}

export function RewardTrackingList({ claims, onExploreCatalog }: RewardTrackingListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success("Tracking code copied!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (claims.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-card/40 space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
          <Package className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">
            No Swag Claims Yet
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Reach the <strong>#1 Rank on your course leaderboard</strong> by excelling in evaluated quizzes and assignments to claim your official TechGration champion swag!
          </p>
        </div>
        <Button
          onClick={onExploreCatalog}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
          <span>Explore Available Swag</span>
        </Button>
      </div>
    )
  }

  const steps = [
    { title: "Claim Placed", desc: "Order confirmed in system", done: true },
    { title: "Quality Check", desc: "Authenticity & size verified", done: true },
    { title: "Packaging", desc: "Packed in TechGration gift box", done: true },
    { title: "Dispatched", desc: "Handed over to BlueDart", done: false },
    { title: "Delivered", desc: "Expected in 3-5 days", done: false },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            My Champion Swag Orders & Live Tracking
          </h2>
          <p className="text-xs text-muted-foreground">
            Track real-time dispatch and delivery progress for your earned rewards.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
          {claims.length} Active Shipment{claims.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {claims.map((claim) => {
          const catalogItem = SWAG_CATALOG.find((s) => s.id === claim.rewardId)
          const imageSrc = catalogItem?.image || "/rewards/techgration-tshirt.png"

          return (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xl p-5 sm:p-7 shadow-xl space-y-6"
            >
              {/* Claim Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-background border border-border/50 shrink-0 p-1 flex items-center justify-center">
                    <Image
                      src={imageSrc}
                      alt={claim.rewardTitle}
                      width={100}
                      height={100}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      🏆 #1 Champion Award
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5">
                      {claim.rewardTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Earned in: <strong className="text-foreground">{claim.courseTitle}</strong>
                    </p>
                  </div>
                </div>

                {/* Tracking Code Chip */}
                {claim.trackingCode && (
                  <div className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-2xl p-2 px-3 self-start sm:self-auto">
                    <div className="text-left">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Tracking Number
                      </p>
                      <p className="font-mono text-xs font-bold text-foreground">
                        {claim.trackingCode}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(claim.trackingCode!, claim.id)}
                      className="h-7 w-7 p-0 rounded-lg"
                    >
                      {copiedId === claim.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Step-by-Step Delivery Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-500" />
                    Shipment Status: <strong className="text-emerald-500">{claim.status}</strong>
                  </span>
                  <span>Carrier: <strong>{claim.courier || "BlueDart Express"}</strong></span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                  {steps.map((st, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        st.done
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "border-border/40 bg-muted/30 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        {st.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs font-bold">{st.title}</p>
                      <p className="text-[10px] mt-0.5 truncate">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Configuration Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-1">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Selected Specifications
                  </p>
                  <p className="text-foreground font-semibold">
                    {claim.selectedOption}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Claimed on: {new Date(claim.claimedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl border border-border/40 bg-muted/20 space-y-1">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    Shipping Destination
                  </p>
                  <p className="text-foreground font-semibold">
                    {claim.shippingName} ({claim.shippingPhone})
                  </p>
                  <p className="text-muted-foreground truncate">
                    {claim.shippingAddress}, {claim.shippingCity}, {claim.shippingState} - {claim.shippingPincode}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
