import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { getStudentRewardStatus } from "@/server/services/rewards"
import { RewardsClient } from "@/components/rewards/rewards-client"

export const metadata: Metadata = {
  title: "Champion Swag Hub — TechGration LMS",
  description: "Exclusive premium merchandise and audio gear for #1 Course Champions on the Leaderboard.",
}

export default async function StudentRewardsPage() {
  const user = await requireStudent()
  const { eligibility, claims } = await getStudentRewardStatus(user.id)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <RewardsClient eligibility={eligibility} claims={claims} />
    </div>
  )
}
