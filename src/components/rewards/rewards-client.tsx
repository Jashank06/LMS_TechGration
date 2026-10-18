"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "motion/react"
import {
  Sparkles,
  ShoppingBag,
  Package,
  Shirt,
  Headphones,
  SlidersHorizontal,
  Crown,
  Trophy,
} from "lucide-react"
import { RewardHero } from "./reward-hero"
import { RewardCard } from "./reward-card"
import { RewardPreviewModal } from "./reward-preview-modal"
import { RewardClaimDialog } from "./reward-claim-dialog"
import { RewardTrackingList } from "./reward-tracking-list"
import {
  SWAG_CATALOG,
  type SwagRewardItem,
  type StudentRewardEligibility,
  type ClaimWithCourse,
} from "@/server/services/rewards"

interface RewardsClientProps {
  eligibility: StudentRewardEligibility
  claims: ClaimWithCourse[]
}

type TabType = "all" | "wearables" | "tech" | "claims"

export function RewardsClient({ eligibility, claims }: RewardsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<TabType>("all")
  const [previewItem, setPreviewItem] = React.useState<SwagRewardItem | null>(null)
  const [claimItem, setClaimItem] = React.useState<SwagRewardItem | null>(null)
  const [simulatedChampion, setSimulatedChampion] = React.useState(false)

  const isEligible = eligibility.isChampion || simulatedChampion

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"],
    })
  }

  // Filter items based on tab
  const filteredItems = React.useMemo(() => {
    if (activeTab === "wearables") {
      return SWAG_CATALOG.filter(
        (i) => i.id === "techgration-tshirt" || i.id === "techgration-cap"
      )
    }
    if (activeTab === "tech") {
      return SWAG_CATALOG.filter(
        (i) => i.id === "techgration-sleeve" || i.id === "boat-earbuds"
      )
    }
    return SWAG_CATALOG
  }, [activeTab])

  const handleClaimSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section with Rank Eligibility & Champion Status */}
      <RewardHero
        eligibility={eligibility}
        claimsCount={claims.length}
        simulatedChampion={simulatedChampion}
        onToggleSimulate={() => setSimulatedChampion((prev) => !prev)}
        onTriggerConfetti={triggerConfetti}
      />

      {/* Navigation Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth pb-1 -mx-1 px-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`whitespace-nowrap min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-foreground text-background shadow-md"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted"
            }`}
          >
            All Champion Swag (4)
          </button>

          <button
            onClick={() => setActiveTab("wearables")}
            className={`whitespace-nowrap min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "wearables"
                ? "bg-foreground text-background shadow-md"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted"
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Wearables (T-Shirt & Cap)</span>
          </button>

          <button
            onClick={() => setActiveTab("tech")}
            className={`whitespace-nowrap min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "tech"
                ? "bg-foreground text-background shadow-md"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Tech Gear (Sleeve & Earbuds)</span>
          </button>

          <button
            onClick={() => setActiveTab("claims")}
            className={`whitespace-nowrap min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "claims"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders & Tracking ({claims.length})</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Exclusive to #1 Leaderboard Champion</span>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "claims" ? (
        <RewardTrackingList
          claims={claims}
          onExploreCatalog={() => setActiveTab("all")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredItems.map((item) => (
            <RewardCard
              key={item.id}
              item={item}
              isEligible={isEligible}
              onPreview={(it) => setPreviewItem(it)}
              onClaim={(it) => setClaimItem(it)}
            />
          ))}
        </div>
      )}

      {/* Full Preview Lightbox Modal */}
      <RewardPreviewModal
        item={previewItem}
        isEligible={isEligible}
        onClose={() => setPreviewItem(null)}
        onClaim={(it) => setClaimItem(it)}
      />

      {/* Claim Configuration & Shipping Dialog */}
      <RewardClaimDialog
        item={claimItem}
        simulatedChampion={simulatedChampion}
        onClose={() => setClaimItem(null)}
        onSuccess={handleClaimSuccess}
      />
    </div>
  )
}
