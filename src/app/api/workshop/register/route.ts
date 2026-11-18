import { NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db"
import { syncLeadToGoogleSheet } from "@/server/services/google-sheets"

const WORKSHOP_DOMAINS = [
  "Artificial Intelligence & Gen AI",
  "Machine Learning",
  "Cyber Security & Ethical Hacking",
  "Data Analytics",
  "Cloud and DevOps",
  "UI/UX Developer",
  "Full Stack Developer",
  "Data Science",
  "DSA in Python",
  "DSA in Java",
  "DSA in C++",
  "App Development",
  "VLSI Design",
  "IoT & Robotics",
  "AutoCAD & MATLAB",
  "HR & Finance",
  "Leadership & Management",
  "Digital Marketing and Growth",
] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    const { name, phone, college, interestedDomain, workshopName } = body

    const resolvedWorkshopName =
      typeof workshopName === "string" && workshopName.trim().length > 0
        ? workshopName.trim().slice(0, 120)
        : "Python Fundamentals Workshop"

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 })
    }

    // Clean phone number (strip spaces, dashes, +91)
    const cleanedPhone = String(phone || "").replace(/[^0-9]/g, "")
    const normalizedPhone = cleanedPhone.length > 10 ? cleanedPhone.slice(-10) : cleanedPhone

    if (!normalizedPhone || normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      )
    }

    if (!college || typeof college !== "string" || college.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your college name." }, { status: 400 })
    }

    if (!interestedDomain || typeof interestedDomain !== "string") {
      return NextResponse.json(
        { error: "Please select your domain of interest." },
        { status: 400 }
      )
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null
    const userAgent = req.headers.get("user-agent") || null

    // 1. Save lead in MongoDB
    const lead = await db.workshopLead.create({
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        college: college.trim(),
        interestedDomain: interestedDomain.trim(),
        workshopName: resolvedWorkshopName,
        source: "WhatsApp / Direct Link",
        ipAddress,
        userAgent,
      },
    })

    // 2. Sync to Google Sheets
    const synced = await syncLeadToGoogleSheet({
      name: lead.name,
      phone: lead.phone,
      college: lead.college,
      interestedDomain: lead.interestedDomain,
      workshopName: lead.workshopName,
      source: lead.source,
      createdAt: lead.createdAt,
    })

    if (synced) {
      await db.workshopLead
        .update({
          where: { id: lead.id },
          data: { syncedToSheets: true, sheetsSyncedAt: new Date() },
        })
        .catch(() => {})
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        college: lead.college,
        interestedDomain: lead.interestedDomain,
      },
      message: "Registration successful! Welcome to the workshop.",
    })
  } catch (error: any) {
    console.error("[WorkshopRegister] Error saving lead:", error)
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    workshop: "Python Fundamentals Workshop",
    domains: WORKSHOP_DOMAINS,
  })
}
