"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export async function updateProfileAction(formData: FormData) {
  const user = await requireStudent()

  const name = formData.get("name") as string
  const headline = formData.get("headline") as string
  const bio = formData.get("bio") as string
  const phone = formData.get("phone") as string
  const timezone = formData.get("timezone") as string
  const learningGoals = formData.get("learningGoals") as string
  const avatarUrl = formData.get("avatarUrl") as string | null

  if (name?.trim()) {
    await db.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    })
  }

  const profileUpdateData: Record<string, any> = {
    headline: headline?.trim() || null,
    bio: bio?.trim() || null,
    phone: phone?.trim() || null,
    timezone: timezone?.trim() || "Asia/Kolkata",
    learningGoals: learningGoals?.trim() || null,
  }

  if (avatarUrl !== undefined && avatarUrl !== null) {
    profileUpdateData.avatarUrl = avatarUrl.trim() || null
  }

  await db.userProfile.upsert({
    where: { userId: user.id },
    update: profileUpdateData,
    create: {
      userId: user.id,
      headline: headline?.trim() || null,
      bio: bio?.trim() || null,
      phone: phone?.trim() || null,
      timezone: timezone?.trim() || "Asia/Kolkata",
      learningGoals: learningGoals?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
    },
  })

  revalidatePath("/student/settings")
  revalidatePath("/student/dashboard")
  revalidatePath("/student/my-courses")
  revalidatePath("/student")
  revalidatePath("/")

  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireStudent()
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." }
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return { success: false, error: "Current password does not match our records." }
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  })

  return { success: true }
}

export async function revokeSessionAction(sessionId: string) {
  const user = await requireStudent()

  await db.session.deleteMany({
    where: {
      id: sessionId,
      userId: user.id,
    },
  })

  revalidatePath("/student/settings")
  return { success: true }
}
