import { NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/server/db"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN || ""

    // 1. Zoom URL Validation Challenge (Handshake)
    if (body.event === "endpoint.url_validation") {
      const plainToken = body.payload?.plainToken
      if (!plainToken) {
        return NextResponse.json({ error: "Missing plainToken" }, { status: 400 })
      }

      // If secret token is configured, compute HMAC SHA-256
      // Otherwise echo back with simple hash
      const hash = crypto
        .createHmac("sha256", secretToken || "techgration-zoom-secret")
        .update(plainToken)
        .digest("hex")

      return NextResponse.json({
        plainToken,
        encryptedToken: hash,
      })
    }

    // 2. Validate Zoom Signature (if secret token is provided)
    const zoomSignature = request.headers.get("x-zm-signature")
    const timestamp = request.headers.get("x-zm-request-timestamp")
    if (secretToken && zoomSignature && timestamp) {
      const message = `v0:${timestamp}:${rawBody}`
      const expectedSignature = `v0=${crypto
        .createHmac("sha256", secretToken)
        .update(message)
        .digest("hex")}`

      if (zoomSignature !== expectedSignature) {
        console.warn("Zoom webhook signature mismatch")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // 3. Handle Recording Completed Event
    if (body.event === "recording.completed") {
      const obj = body.payload?.object
      const rawMeetingId = obj?.id ? String(obj.id) : ""
      const shareUrl = obj?.share_url
      const topic = obj?.topic || ""

      console.log(`[Zoom Webhook] Recording completed for Meeting ID: ${rawMeetingId}, Topic: "${topic}"`)

      if (rawMeetingId || topic) {
        // Find matching live class by meetingId or meetingUrl substring
        const liveClass = await db.liveClass.findFirst({
          where: {
            OR: [
              ...(rawMeetingId
                ? [
                    { meetingId: rawMeetingId },
                    { meetingId: rawMeetingId.replace(/\s+/g, "") },
                    { meetingUrl: { contains: rawMeetingId } },
                  ]
                : []),
              ...(topic ? [{ title: { contains: topic, mode: "insensitive" as const } }] : []),
            ],
          },
          orderBy: { startsAt: "desc" },
        })

        if (liveClass) {
          const finalUrl = shareUrl || liveClass.recordingUrl
          if (finalUrl) {
            await db.liveClass.update({
              where: { id: liveClass.id },
              data: {
                recordingUrl: finalUrl,
                status: "COMPLETED",
              },
            })
            console.log(`[Zoom Webhook] ✅ Linked recording to LiveClass ${liveClass.id} ("${liveClass.title}")`)
          }
        } else {
          console.warn(`[Zoom Webhook] No matching LiveClass found for meeting ${rawMeetingId}`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Zoom webhook processing error:", error)
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 })
  }
}
