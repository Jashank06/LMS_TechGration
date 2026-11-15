import { NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db"

export async function GET(req: NextRequest) {
  try {
    const leads = await db.workshopLead.findMany({
      orderBy: { createdAt: "desc" },
    })

    const format = req.nextUrl.searchParams.get("format")

    if (format === "csv") {
      const headers = [
        "ID",
        "Submission Date (IST)",
        "Student Name",
        "WhatsApp / Phone",
        "College / Institution",
        "Interested Domain",
        "Workshop",
        "Synced to Sheets",
      ]

      const rows = leads.map((l) => [
        `"${l.id}"`,
        `"${l.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}"`,
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.phone}"`,
        `"${l.college.replace(/"/g, '""')}"`,
        `"${l.interestedDomain.replace(/"/g, '""')}"`,
        `"${l.workshopName}"`,
        `"${l.syncedToSheets ? "YES" : "NO"}"`,
      ])

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="TechGration_Workshop_Leads_${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({
      total: leads.length,
      leads,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
