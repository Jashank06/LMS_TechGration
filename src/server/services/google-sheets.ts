export interface WorkshopLeadData {
  name: string
  phone: string
  college: string
  interestedDomain: string
  workshopName?: string
  source?: string
  createdAt?: Date
}

/**
 * Synchronizes lead data to a Google Sheet via Google Apps Script Webhook.
 * Returns true if successful or gracefully false if webhook is unconfigured.
 */
export async function syncLeadToGoogleSheet(lead: WorkshopLeadData): Promise<boolean> {
  const webhookUrl =
    process.env.GOOGLE_SHEET_WEBHOOK_URL ||
    process.env.WORKSHOP_GOOGLE_SHEET_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    console.log(
      "[GoogleSheets] Webhook URL not configured. Lead stored in MongoDB. Add GOOGLE_SHEET_WEBHOOK_URL to .env to enable instant live sync."
    )
    return false
  }

  try {
    const payload = {
      timestamp: (lead.createdAt || new Date()).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "medium",
      }),
      name: lead.name,
      phone: lead.phone,
      college: lead.college,
      interestedDomain: lead.interestedDomain,
      workshopName: lead.workshopName || "Python Fundamentals Workshop",
      source: lead.source || "WhatsApp / Direct Link",
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    })

    if (!response.ok) {
      console.warn(`[GoogleSheets] Webhook returned HTTP ${response.status}`)
      return false
    }

    console.log(`[GoogleSheets] Lead for ${lead.name} (${lead.phone}) synced to Google Sheet successfully!`)
    return true
  } catch (err: any) {
    console.error("[GoogleSheets] Failed to send lead to webhook:", err.message)
    return false
  }
}
