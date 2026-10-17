import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getSession } from "@/server/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params

    const liveClass = await db.liveClass.findUnique({
      where: { id: classId },
    })

    if (!liveClass || liveClass.status === "CANCELLED") {
      return NextResponse.redirect(new URL("/student/dashboard", _request.url))
    }

    // Best-effort attendance marking if user is authenticated
    try {
      const auth = await getSession()
      if (auth && auth.user && auth.user.role === "STUDENT") {
        await db.attendanceRecord.upsert({
          where: {
            liveClassId_userId: {
              liveClassId: liveClass.id,
              userId: auth.user.id,
            },
          },
          update: {
            markedAt: new Date(),
            status: "PRESENT",
          },
          create: {
            liveClassId: liveClass.id,
            userId: auth.user.id,
            status: "PRESENT",
            markedAt: new Date(),
          },
        })
      }
    } catch (attendanceErr) {
      console.warn("Attendance recording non-blocking error:", attendanceErr)
    }

    // Redirect to the actual meeting URL (Zoom, Google Meet, or WebRTC Classroom)
    const targetUrl = liveClass.meetingUrl?.trim() || "https://us06web.zoom.us"
    return NextResponse.redirect(targetUrl, 307)
  } catch (err) {
    console.error("Join gateway error:", err)
    return NextResponse.redirect(new URL("/student/dashboard", _request.url))
  }
}
