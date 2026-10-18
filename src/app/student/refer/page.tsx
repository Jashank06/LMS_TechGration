import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { getStudentReferralStats } from "@/server/services/referrals"
import { ReferralClient } from "@/components/referral/referral-client"

export const metadata: Metadata = {
  title: "Refer & Earn ₹500 Cashback — TechGration LMS",
  description: "Refer your friends and family to TechGration LMS and earn up to ₹500 cashback directly when they enroll.",
}

export default async function StudentReferPage() {
  const user = await requireStudent()
  const stats = await getStudentReferralStats(user.id)

  return (
    <div className="h-full w-full flex flex-col justify-center items-center overflow-x-hidden md:overflow-y-hidden">
      <ReferralClient stats={stats} studentName={user.name} />
    </div>
  )
}
