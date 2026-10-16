import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth/session"
import { db } from "@/server/db"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
    }

    let permissions: string[] = []
    if (user.role === Role.SUPER_ADMIN) {
      const allPerms = await db.rolePermission.findMany({ select: { permission: true } })
      permissions = Array.from(new Set(allPerms.map((p) => p.permission)))
    } else {
      const userPerms = await db.rolePermission.findMany({
        where: { role: user.role, granted: true },
        select: { permission: true },
      })
      permissions = userPerms.map((p) => p.permission)
    }

    return NextResponse.json({
      authenticated: true,
      user,
      permissions,
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 })
  }
}
