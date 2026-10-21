"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "motion/react"
import { Sparkles, Lock, ArrowRight, Eye, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SwagRewardItem } from "@/server/services/rewards"

interface RewardCardProps {
  item: SwagRewardItem
  isEligible: boolean
  onPreview: (item: SwagRewardItem) => void
  onClaim: (item: SwagRewardItem) => void
}

export function RewardCard({ item, isEligible, onPreview, onClaim }: RewardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 bg-card/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all"
    >
      {/* Subtle Glow on Card Hover */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Top Bar: Clean Category & Champion Pill */}
      <div className="flex items-center justify-between gap-3 mb-3 z-10">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border/50">
          {item.category}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
          <Crown className="w-3.5 h-3.5" />
          <span>#1 Champion Exclusive</span>
        </span>
      </div>

      {/* BIG HERO IMAGE CONTAINER (Clickable to Inspect Full Showcase) */}
      <div
        onClick={() => onPreview(item)}
        className="relative w-full aspect-[16/11] sm:aspect-[16/10] cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-b from-muted/50 via-muted/30 to-muted/10 border border-border/50 flex items-center justify-center p-3 sm:p-4 group/img transition-all"
      >
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={800}
          className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover/img:scale-105"
          priority
        />

        {/* Hover Inspect Overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 backdrop-blur-xs transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white text-zinc-950 shadow-xl">
            <Eye className="w-4 h-4" />
            <span>Click to View Full Studio Showcase</span>
          </span>
        </div>
      </div>

      {/* Clean Bottom Section: Prominent Title, Value Tag, & Action Button (No Clutter) */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pt-3.5 border-t border-border/40">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-amber-500 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              {item.retailValue}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-500">
              FREE FOR #1 CHAMPION
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 sm:w-auto w-full">
          {isEligible ? (
            <Button
              onClick={() => onClaim(item)}
              size="lg"
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-6 shadow-lg shadow-amber-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Claim Free Swag</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => onPreview(item)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-2xl border-border/80 hover:border-amber-500/50 text-xs sm:text-sm text-muted-foreground hover:text-foreground font-semibold px-5 justify-between sm:justify-center"
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-500" />
                <span>#1 Rank Required</span>
              </span>
              <span className="text-xs text-amber-500 font-bold ml-2">Inspect</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
