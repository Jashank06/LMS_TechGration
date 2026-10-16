import { cookies } from "next/headers"
import crypto from "node:crypto"
import { db } from "@/server/db"
import { Role, UserStatus, type User } from "@prisma/client"

const SESSION_COOKIE_NAME = "tg_session"
const SESSION_MAX_AGE_DAYS = 7

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  status: UserStatus
  avatarUrl?: string | null
}

export async function createSession(userId: string, req?: Request): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)

  let ipAddress: string | undefined
  let userAgent: string | undefined

  if (req) {
    ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1"
    userAgent = req.headers.get("user-agent") || undefined
  }

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  return { token, expiresAt }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await db.session.deleteMany({
      where: { token },
    }).catch(() => {
      // Ignore if session was already deleted
    })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) return null

    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!session) return null

    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }

    if (session.user.status === UserStatus.SUSPENDED || session.user.status === UserStatus.DEACTIVATED) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      status: session.user.status,
      avatarUrl: session.user.profile?.avatarUrl,
    }
  } catch (err) {
    console.error("getCurrentUser error:", err)
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN")
  }
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole([Role.ADMIN, Role.SUPER_ADMIN])
}
