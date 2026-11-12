import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getSession } from "@/server/auth"
import { computeClassWindowStatus } from "@/lib/live-class-utils"
import { recordLiveClassAttendance } from "@/server/services/course-progress"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params
    const { searchParams } = new URL(request.url)
    const isDirect = searchParams.get("direct") === "1"

    const liveClass = await db.liveClass.findUnique({
      where: { id: classId },
    })

    if (!liveClass || liveClass.status === "CANCELLED") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url))
    }

    // Best-effort attendance marking if user is authenticated student
    try {
      const auth = await getSession()
      if (auth && auth.user && (auth.user.role === "STUDENT" || !auth.user.role)) {
        await recordLiveClassAttendance(auth.user.id, liveClass.id)
      }
    } catch (attendanceErr) {
      console.warn("Attendance recording non-blocking error:", attendanceErr)
    }

    // Direct join (from authorized portal buttons) bypasses buffer lock
    if (!isDirect) {
      const windowStatus = computeClassWindowStatus(liveClass)
      if (!windowStatus.isJoinable) {
        if (windowStatus.isEnded) {
          return NextResponse.redirect(
            new URL("/student/live-classes?notice=concluded", request.url)
          )
        }
        return NextResponse.redirect(
          new URL(
            `/student/live-classes?notice=join_locked&opensAt=${encodeURIComponent(windowStatus.formattedOpenTime)}`,
            request.url
          )
        )
      }
    }

    // Redirect to the actual meeting URL (Zoom, Google Meet, or WebRTC Classroom)
    const targetUrl = liveClass.meetingUrl?.trim() || "https://us06web.zoom.us"
    return NextResponse.redirect(targetUrl, 307)
  } catch (err) {
    console.error("Join gateway error:", err)
    return NextResponse.redirect(new URL("/student/dashboard", request.url))
  }
}
