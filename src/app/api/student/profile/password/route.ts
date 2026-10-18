import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
        { status: 400 }
      )
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    })

    if (!fullUser?.passwordHash) {
      return NextResponse.json({ error: "User credentials error." }, { status: 400 })
    }

    const isValid = await bcrypt.compare(currentPassword, fullUser.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password does not match our records." },
        { status: 400 }
      )
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({
      success: true,
      message: "Password changed successfully!",
    })
  } catch (error: any) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    )
  }
}
