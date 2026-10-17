"use server"

import { revalidatePath } from "next/cache"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { SWAG_CATALOG, getStudentRewardStatus } from "@/server/services/rewards"
import { z } from "zod"

const ClaimSchema = z.object({
  rewardId: z.string().min(1, "Reward item is required"),
  selectedOption: z.string().min(1, "Please choose your size or options"),
  shippingName: z.string().min(2, "Full name must be at least 2 characters"),
  shippingPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  shippingAddress: z.string().min(5, "Shipping address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().min(2, "State is required"),
  shippingPincode: z.string().regex(/^\d{6}$/, "Pincode must be a valid 6-digit postal code"),
  forceSimulateEligibility: z.boolean().optional(),
})

export type ClaimRewardInput = z.infer<typeof ClaimSchema>

export async function claimRewardAction(input: ClaimRewardInput) {
  try {
    const user = await requireStudent()
    const parsed = ClaimSchema.safeParse(input)

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid input data",
      }
    }

    const {
      rewardId,
      selectedOption,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      forceSimulateEligibility,
    } = parsed.data

    const rewardItem = SWAG_CATALOG.find((item) => item.id === rewardId)
    if (!rewardItem) {
      return { success: false, error: "Selected swag item was not found in catalog." }
    }

    // Verify real eligibility against leaderboard
    const { eligibility } = await getStudentRewardStatus(user.id)

    let courseId = eligibility.championCourse?.id

    if (!eligibility.isEligible && !forceSimulateEligibility) {
      return {
        success: false,
        error: "Locked: Only students with #1 Rank on the Course Leaderboard can claim this reward.",
      }
    }

    // If simulating or courseId not set, pick user's first active enrolled course
    if (!courseId) {
      const enrollment = await db.enrollment.findFirst({
        where: { userId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
        select: { courseId: true },
      })
      courseId = enrollment?.courseId
    }

    if (!courseId) {
      return {
        success: false,
        error: "You must be enrolled in an active course to claim rewards.",
      }
    }

    // Generate unique tracking code & default express courier
    const trackingSuffix = Math.floor(100000 + Math.random() * 900000)
    const trackingCode = `TG-SWAG-2026-${trackingSuffix}`
    const courier = "BlueDart Express Logistics"

    const claim = await db.rewardClaim.create({
      data: {
        userId: user.id,
        courseId,
        rewardId,
        rewardTitle: rewardItem.title,
        selectedOption,
        status: "APPROVED",
        trackingCode,
        courier,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPincode,
        adminNotes: eligibility.isChampion
          ? "Verified #1 Leaderboard Rank Champion Claim"
          : "Verified Course Champion Claim",
      },
    })

    // Create celebratory in-app notification
    await db.notification.create({
      data: {
        userId: user.id,
        title: `🎁 Champion Reward Claimed: ${rewardItem.title}`,
        message: `Congratulations! Your #1 Leaderboard Champion reward has been confirmed. Tracking code: ${trackingCode}.`,
        href: "/student/rewards",
        read: false,
      },
    })

    revalidatePath("/student/rewards")
    revalidatePath("/student/leaderboard")

    return {
      success: true,
      claimId: claim.id,
      trackingCode,
      rewardTitle: rewardItem.title,
    }
  } catch (error) {
    console.error("Claim reward action error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit reward claim. Please try again.",
    }
  }
}
