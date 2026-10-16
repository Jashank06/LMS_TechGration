import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/server/db"
import { requireAdmin, getCurrentUser } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"
import { isLastSuperAdmin } from "@/server/rbac/permissions"
import { Role, UserStatus } from "@prisma/client"

export async function GET(req: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || "ALL"
    const status = searchParams.get("status") || "ALL"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role !== "ALL" && Object.values(Role).includes(role as Role)) {
      where.role = role as Role
    }

    if (status !== "ALL" && Object.values(UserStatus).includes(status as UserStatus)) {
      where.status = status as UserStatus
    }

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        enrollmentsCount: u._count.enrollments,
        phone: u.profile?.phone,
        headline: u.profile?.headline,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Users GET error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role).default(Role.STUDENT),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  headline: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, role, password, headline } = validation.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const plainPassword = password || "Temp@" + Math.random().toString(36).substring(2, 8) + "!"
    const passwordHash = await bcrypt.hash(plainPassword, 10)

    const newUser = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        role,
        status: UserStatus.ACTIVE,
        passwordHash,
        profile: {
          create: {
            headline: headline || "Member of TechGration LMS",
            timezone: "Asia/Kolkata",
          },
        },
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "USER_CREATE",
      resource: "USER",
      resourceId: newUser.id,
      details: { createdEmail: normalizedEmail, role },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      temporaryPassword: password ? undefined : plainPassword,
    })
  } catch (error: any) {
    console.error("User POST error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

const updateUserSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(Role).optional(),
  resetPassword: z.boolean().optional(),
})

export async function PATCH(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { id, status, role, resetPassword } = validation.data

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Super Admin Protection Logic:
    // If target is Super Admin and is being suspended/deactivated or demoted
    if (
      (status === UserStatus.SUSPENDED || status === UserStatus.DEACTIVATED || (role && role !== Role.SUPER_ADMIN)) &&
      targetUser.role === Role.SUPER_ADMIN
    ) {
      const isLast = await isLastSuperAdmin(targetUser.id)
      if (isLast) {
        return NextResponse.json(
          { error: "Protection Guard: The last active Super Administrator cannot be suspended, deactivated, or demoted." },
          { status: 403 }
        )
      }
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (role) updateData.role = role

    let newTempPassword: string | undefined
    if (resetPassword) {
      newTempPassword = "Reset@" + Math.random().toString(36).substring(2, 8) + "!"
      updateData.passwordHash = await bcrypt.hash(newTempPassword, 10)
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "USER_UPDATE",
      resource: "USER",
      resourceId: updated.id,
      details: {
        targetEmail: updated.email,
        updatedFields: { status, role, passwordReset: resetPassword },
      },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
      newTempPassword,
    })
  } catch (error: any) {
    console.error("User PATCH error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
