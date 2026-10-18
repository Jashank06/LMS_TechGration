import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    })

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        avatarUrl: fullUser.profile?.avatarUrl ?? null,
        phone: fullUser.profile?.phone ?? null,
        headline: fullUser.profile?.headline ?? null,
        bio: fullUser.profile?.bio ?? null,
        timezone: fullUser.profile?.timezone ?? "Asia/Kolkata",
        learningGoals: fullUser.profile?.learningGoals ?? null,
        profile: fullUser.profile
          ? {
              headline: fullUser.profile.headline,
              bio: fullUser.profile.bio,
              phone: fullUser.profile.phone,
              avatarUrl: fullUser.profile.avatarUrl,
              timezone: fullUser.profile.timezone,
              learningGoals: fullUser.profile.learningGoals,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error("Get student profile error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load profile" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, headline, bio, phone, avatarUrl, timezone, learningGoals } = body

    if (name && typeof name === "string" && name.trim()) {
      await db.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      })
    }

    const profileData: Record<string, any> = {
      headline: headline !== undefined ? (headline?.trim() || null) : undefined,
      bio: bio !== undefined ? (bio?.trim() || null) : undefined,
      phone: phone !== undefined ? (phone?.trim() || null) : undefined,
      timezone: timezone?.trim() || undefined,
      learningGoals: learningGoals !== undefined ? (learningGoals?.trim() || null) : undefined,
    }

    // Clean undefined keys for clean update
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] === undefined) {
        delete profileData[key]
      }
    })

    if (avatarUrl !== undefined) {
      profileData.avatarUrl = avatarUrl?.trim() || null
    }

    const updatedProfile = await db.userProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
        timezone: timezone?.trim() || "Asia/Kolkata",
      },
    })

    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        avatarUrl: updatedUser?.profile?.avatarUrl ?? null,
        phone: updatedUser?.profile?.phone ?? null,
        headline: updatedUser?.profile?.headline ?? null,
        bio: updatedUser?.profile?.bio ?? null,
        timezone: updatedUser?.profile?.timezone ?? "Asia/Kolkata",
        learningGoals: updatedUser?.profile?.learningGoals ?? null,
        profile: updatedUser?.profile
          ? {
              headline: updatedUser.profile.headline,
              bio: updatedUser.profile.bio,
              phone: updatedUser.profile.phone,
              avatarUrl: updatedUser.profile.avatarUrl,
              timezone: updatedUser.profile.timezone,
              learningGoals: updatedUser.profile.learningGoals,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error("Update student profile error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}
