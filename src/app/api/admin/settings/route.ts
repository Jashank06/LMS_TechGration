import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/server/db"
import { requireAdmin } from "@/server/auth/session"
import { logAuditEvent } from "@/server/audit/audit-logger"

export async function GET() {
  try {
    await requireAdmin()

    const allSettings = await db.platformSetting.findMany({
      orderBy: { key: "asc" },
    })

    // Group settings by section: { [section]: { [key]: value } }
    const grouped: Record<string, Record<string, any>> = {}

    for (const s of allSettings) {
      if (!grouped[s.section]) {
        grouped[s.section] = {}
      }
      grouped[s.section][s.key] = s.value
    }

    return NextResponse.json({ settings: grouped })
  } catch (error: any) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Failed to fetch platform settings" }, { status: 500 })
  }
}

const saveSettingsSchema = z.object({
  section: z.string().min(1),
  values: z.record(z.string(), z.any()),
})

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin()
    const body = await req.json()
    const validation = saveSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 })
    }

    const { section, values } = validation.data

    for (const [key, val] of Object.entries(values)) {
      await db.platformSetting.upsert({
        where: { key },
        update: {
          value: val,
          updatedById: adminUser.id,
          updatedAt: new Date(),
        },
        create: {
          section,
          key,
          value: val,
          updatedById: adminUser.id,
        },
      })
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    await logAuditEvent({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      action: "PLATFORM_SETTING_UPDATE",
      resource: "SETTINGS",
      details: { section, keysUpdated: Object.keys(values) },
      ipAddress,
    })

    return NextResponse.json({
      success: true,
      message: `Settings for [${section}] updated successfully`,
    })
  } catch (error: any) {
    console.error("Settings POST error:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
