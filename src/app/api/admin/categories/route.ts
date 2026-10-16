import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function GET() {
  try {
    await requireAdmin()

    const categories = await db.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        children: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
    })

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        parentId: c.parentId,
        skills: c.skills,
        tags: c.tags,
        displayOrder: c.displayOrder,
        courseCount: c._count.courses,
        subcategories: c.children,
      })),
    })
  } catch (error: any) {
    console.error("Categories GET error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = categorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, slug, description, icon, parentId, skills, tags, displayOrder } = validation.data

    const existingSlug = await db.category.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 })
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        icon: icon || "Folder",
        parentId: parentId || null,
        skills,
        tags,
        displayOrder,
      },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "CATEGORY_CREATE",
      resource: "CATEGORY",
      resourceId: category.id,
      details: { name, slug },
      ipAddress,
    })

    return NextResponse.json({ success: true, category })
  } catch (error: any) {
    console.error("Category POST error:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 })
    }

    // Deletion Guard: Check if category has active courses linked
    const courseCount = await db.course.count({
      where: { categoryId: id },
    })

    if (courseCount > 0) {
      return NextResponse.json(
        {
          error: `Deletion Guard Blocked: This category has ${courseCount} course(s) linked to it. You must reassign or remove courses before deleting.`,
        },
        { status: 403 }
      )
    }

    // Also check if category has children subcategories
    const childCount = await db.category.count({
      where: { parentId: id },
    })

    if (childCount > 0) {
      return NextResponse.json(
        {
          error: `Deletion Guard Blocked: This category has ${childCount} subcategories. Please reassign or delete subcategories first.`,
        },
        { status: 403 }
      )
    }

    const deleted = await db.category.delete({
      where: { id },
    })

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "CATEGORY_DELETE",
      resource: "CATEGORY",
      resourceId: id,
      details: { name: deleted.name },
      ipAddress,
    })

    return NextResponse.json({ success: true, message: "Category deleted" })
  } catch (error: any) {
    console.error("Category DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
