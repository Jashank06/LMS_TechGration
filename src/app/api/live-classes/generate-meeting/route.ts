import { NextResponse } from "next/server"
import { getTeacherSession } from "@/server/services/teacher-auth"
import {
  createZoomMeeting,
  createGoogleMeetRoom,
  createTechGrationClassroom,
} from "@/server/services/meeting-engine"

export async function POST(request: Request) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { platform = "ZOOM", topic, startsAt, durationMinutes, courseTitle } = body

    let meeting

    if (platform === "ZOOM") {
      meeting = await createZoomMeeting({
        topic: topic || "Live Class Session",
        startsAt,
        durationMinutes: durationMinutes || 90,
        instructorName: session.user.name || "Vineet Sir",
        courseTitle: courseTitle || "Artificial Intelligence & Modern Deep Learning Systems",
      })
    } else if (platform === "GOOGLE_MEET") {
      meeting = createGoogleMeetRoom({
        topic: topic || "Live Class Session",
        startsAt,
        instructorName: session.user.name || "Vineet Sir",
        courseTitle: courseTitle || "Artificial Intelligence & Modern Deep Learning Systems",
      })
    } else {
      meeting = createTechGrationClassroom({
        topic: topic || "Live Class Session",
        startsAt,
        instructorName: session.user.name || "Vineet Sir",
        courseTitle: courseTitle || "Artificial Intelligence & Modern Deep Learning Systems",
      })
    }

    return NextResponse.json({
      success: true,
      meeting,
    })
  } catch (error) {
    console.error("Generate meeting API error:", error)
    return NextResponse.json({ error: "Failed to generate meeting link" }, { status: 500 })
  }
}
