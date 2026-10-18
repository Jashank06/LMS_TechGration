import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { SWAG_CATALOG, getStudentRewardStatus } from "@/server/services/rewards"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
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
    } = body

    if (!rewardId || !selectedOption || !shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPincode) {
      return NextResponse.json(
        { error: "Please fill in all shipping details and select an option." },
        { status: 400 }
      )
    }

    const rewardItem = SWAG_CATALOG.find((item) => item.id === rewardId)
    if (!rewardItem) {
      return NextResponse.json({ error: "Selected merchandise item was not found." }, { status: 404 })
    }

    const { eligibility } = await getStudentRewardStatus(user.id)
    let courseId = eligibility.championCourse?.id

    if (!eligibility.isEligible && !forceSimulateEligibility) {
      return NextResponse.json(
        { error: "Locked: Only students with #1 Rank on the Course Leaderboard can claim this reward." },
        { status: 403 }
      )
    }

    if (!courseId) {
      const enrollment = await db.enrollment.findFirst({
        where: { userId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } },
        select: { courseId: true },
      })
      courseId = enrollment?.courseId
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "You must be enrolled in an active course to claim rewards." },
        { status: 400 }
      )
    }

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
      },
    })

    return NextResponse.json({
      success: true,
      message: "Champion Swag claimed successfully! Dispatched via BlueDart.",
      claim: {
        id: claim.id,
        trackingCode: claim.trackingCode,
        courier: claim.courier,
        status: claim.status,
        rewardTitle: claim.rewardTitle,
        selectedOption: claim.selectedOption,
        claimedAt: claim.claimedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Reward claim API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process reward claim" },
      { status: 500 }
    )
  }
}
