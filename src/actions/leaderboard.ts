"use server"

import { revalidatePath } from "next/cache"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export async function setLeaderboardAnonymousAction(anonymous: boolean) {
  const user = await requireStudent()

  await db.userProfile.upsert({
    where: { userId: user.id },
    update: { leaderboardAnonymous: anonymous },
    create: { userId: user.id, leaderboardAnonymous: anonymous },
  })

  revalidatePath("/student/leaderboard")
  return { success: true, anonymous }
}
