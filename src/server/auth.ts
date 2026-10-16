import crypto from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { Role, User, UserProfile, Session, UserStatus } from "@prisma/client"
import { db } from "@/server/db"

export const SESSION_COOKIE_NAME = "tg_session"
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

export type AuthenticatedUser = User & {
  profile: UserProfile | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate cryptographically secure 64-char token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Creates a DB session and writes the HTTP-only cookie.
 */
export async function createSession(userId: string): Promise<Session> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return session
}

/**
 * Retrieves the active session and attached user.
 * Cleans up expired sessions if encountered.
 */
export async function getSession(): Promise<{
  session: Session
  user: AuthenticatedUser
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

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

    if (!session) {
      return null
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }

    // Check user active status
    if (session.user.status !== UserStatus.ACTIVE) {
      return null
    }

    return {
      session,
      user: session.user,
    }
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error
    }
    console.error("Error retrieving session:", error)
    return null
  }
}

/**
 * Returns currently authenticated user or null.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const sessionData = await getSession()
  return sessionData ? sessionData.user : null
}

/**
 * Guard that enforces authentication and optional role restrictions.
 * Redirects to /login if unauthenticated.
 */
export async function requireUser(allowedRoles?: Role[]): Promise<AuthenticatedUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If student tries to access admin or vice versa, redirect to their home portal
    if (user.role === Role.STUDENT) {
      redirect("/student/dashboard")
    } else if (user.role === Role.TEACHER) {
      redirect("/teacher/dashboard")
    } else {
      redirect("/admin/dashboard")
    }
  }

  return user
}

/**
 * Specifically enforces student role.
 */
export async function requireStudent(): Promise<AuthenticatedUser> {
  return requireUser([Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN])
}

/**
 * Specifically enforces teacher role.
 */
export async function requireTeacher(): Promise<AuthenticatedUser> {
  return requireUser([Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN])
}

/**
 * Destroys current session and clears cookie.
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (token) {
      await db.session.delete({ where: { token } }).catch(() => {})
      cookieStore.delete(SESSION_COOKIE_NAME)
    }
  } catch (error) {
    console.error("Error destroying session:", error)
  }
}

function formatAuthDbError(error: unknown, defaultMessage: string): string {
  const msg = error instanceof Error ? error.message : String(error)
  if (
    msg.includes("Server selection timeout") ||
    msg.includes("timed out") ||
    msg.includes("InternalError") ||
    msg.includes("I/O error") ||
    (error && typeof error === "object" && "code" in error && (error as { code: unknown }).code === "P2010")
  ) {
    return "Database connection temporarily timed out. Please check your internet connection and try again."
  }
  return defaultMessage
}

/**
 * Signs in a user by email & password.
 */
export async function loginWithEmail(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; error?: string; user?: AuthenticatedUser }> {
  try {
    const normalizedEmail = email.trim().toLowerCase()
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    })

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    if (user.status !== UserStatus.ACTIVE) {
      return { success: false, error: "Your account has been suspended or deactivated" }
    }

    const isValid = await verifyPassword(plainPassword, user.passwordHash)
    if (!isValid) {
      return { success: false, error: "Invalid email or password" }
    }

    await createSession(user.id)
    return { success: true, user }
  } catch (error) {
    console.error("loginWithEmail error:", error)
    return {
      success: false,
      error: formatAuthDbError(error, "Failed to sign in. Please verify your credentials and try again."),
    }
  }
}

/**
 * Registers a new student account and automatically enrolls them in a starter course.
 */
export async function registerStudent({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}): Promise<{ success: boolean; error?: string; user?: AuthenticatedUser }> {
  try {
    const normalizedEmail = email.trim().toLowerCase()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return { success: false, error: "An account with this email address already exists" }
    }

    const passwordHash = await hashPassword(password)

    // Create student user with profile
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: Role.STUDENT,
        profile: {
          create: {
            headline: "Student at TechGration",
            timezone: "Asia/Kolkata",
          },
        },
      },
      include: {
        profile: true,
      },
    })

    // Auto-enroll in the first available active course
    const firstCourse = await db.course.findFirst({
      where: { isPublished: true },
    })

    if (firstCourse) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: firstCourse.id,
          progressPct: 0,
        },
      }).catch(() => {})
    }

    await createSession(user.id)
    return { success: true, user }
  } catch (error) {
    console.error("registerStudent error:", error)
    return {
      success: false,
      error: formatAuthDbError(error, "Failed to create account. Please try again."),
    }
  }
}

/**
 * 1-Click Demo Login Helper
 */
export async function demoLogin(
  role: "student" | "teacher" | "admin" = "student"
): Promise<{ success: boolean; error?: string; user?: AuthenticatedUser }> {
  try {
    const targetEmail =
      role === "student"
        ? "student@techgration.com"
        : role === "teacher"
        ? "jaykumar0305@gmail.com"
        : "admin@techgration.live"

    let user: AuthenticatedUser | null = null
    try {
      user = await db.user.findUnique({
        where: { email: targetEmail },
        include: { profile: true },
      })

      if (!user && role === "teacher") {
        user = await db.user.findFirst({
          where: { OR: [{ email: "jaykumar0305@gmail.com" }, { email: "teacher@techgration.com" }] },
          include: { profile: true },
        })
      } else if (!user && role === "admin") {
        user = await db.user.findFirst({
          where: { OR: [{ email: "admin@techgration.live" }, { email: "admin@techgration.com" }] },
          include: { profile: true },
        })
      }
    } catch (dbFindErr) {
      console.warn("DB lookup timed out during demo login, falling back to mock session:", dbFindErr)
    }

    if (!user) {
      try {
        const passwordHash = await hashPassword(role === "teacher" ? "Teacher@2026!" : "Demo@2026!")
        const createdUser = await db.user.create({
          data: {
            email: targetEmail,
            name: role === "teacher" ? "Dr. Vikram Joshi" : role === "admin" ? "System Admin" : "Aarav Sharma",
            passwordHash,
            role: role === "teacher" ? Role.TEACHER : role === "admin" ? Role.ADMIN : Role.STUDENT,
            profile: {
              create: {
                headline: role === "teacher" ? "Lead Cloud Architect & Instructor" : "Platform Administrator",
                timezone: "Asia/Kolkata",
              },
            },
          },
          include: { profile: true },
        })
        await createSession(createdUser.id)
        return { success: true, user: createdUser }
      } catch {
        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE_NAME, `demo-${role}-token-` + Date.now(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: SESSION_MAX_AGE_SECONDS,
        })
        return {
          success: true,
          user: {
            id: "demo-user-" + role,
            name: role === "teacher" ? "Dr. Vikram Joshi" : role === "admin" ? "System Admin" : "Aarav Sharma",
            email: targetEmail,
            role: role === "teacher" ? Role.TEACHER : role === "admin" ? Role.ADMIN : Role.STUDENT,
            status: UserStatus.ACTIVE,
            passwordHash: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            invitedById: null,
            profile: null,
          },
        }
      }
    }

    await createSession(user.id)
    return { success: true, user }
  } catch (error) {
    console.error("demoLogin error:", error)
    return {
      success: false,
      error: formatAuthDbError(error, "Could not sign in with demo account. Please try again."),
    }
  }
}
