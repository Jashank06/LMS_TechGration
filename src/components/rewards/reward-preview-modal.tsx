"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { X, Check, ShieldCheck, Sparkles, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SwagRewardItem } from "@/server/services/rewards"

interface RewardPreviewModalProps {
  item: SwagRewardItem | null
  isEligible: boolean
  onClose: () => void
  onClaim: (item: SwagRewardItem) => void
}

export function RewardPreviewModal({ item, isEligible, onClose, onClaim }: RewardPreviewModalProps) {
  if (!item) return null

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
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-wrap items-center gap-2 pr-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {item.badgeText}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              {item.category}
            </span>
            <span className="text-xs text-muted-foreground line-through ml-auto">
              Retail: {item.retailValue}
            </span>
            <span className="text-sm font-bold text-emerald-500">
              FREE FOR #1 CHAMPION
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Product High-Res Image Showcase */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-muted/50 to-muted/20 border border-border/40 flex items-center justify-center p-4 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={item.image}
                alt={item.title}
                width={800}
                height={800}
                className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>

            {/* Right: Specifications & Highlights */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm font-medium text-amber-500">
                  {item.subtitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.tagline}
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  Key Craftsmanship Details
                </h3>
                <ul className="space-y-2">
                  {item.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                      <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-500 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Specifications Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  Product Specifications
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {item.specs.map((spec, i) => (
                    <div key={i} className="p-2.5 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[11px] text-muted-foreground font-medium">{spec.label}</p>
                      <p className="text-foreground font-semibold mt-0.5 truncate">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claim Action or Locked Notice */}
              <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center gap-3">
                {isEligible ? (
                  <Button
                    onClick={() => {
                      onClose()
                      onClaim(item)
                    }}
                    size="lg"
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-xl shadow-amber-500/25"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Configure & Claim Free Swag</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="w-full p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center gap-3 text-xs sm:text-sm">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      Locked: Only the <strong>#1 Top Ranker</strong> on the course leaderboard can claim this item.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
