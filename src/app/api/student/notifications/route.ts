import { NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { db } from "@/server/db"

export async function GET() {
  try {
    const auth = await getSession()
    if (!auth) {
      return NextResponse.json({ notifications: [], unreadCount: 0 })
    }

    const notifications = await db.notification.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const unreadCount = await db.notification.count({
      where: { userId: auth.user.id, read: false },
    })

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        href: n.href || "/student/dashboard",
        read: n.read,
        unread: !n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error("Student notifications API error:", error)
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getSession()
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { notificationId, markAll = false } = body

    if (markAll) {
      await db.notification.updateMany({
        where: { userId: auth.user.id, read: false },
        data: { read: true },
      })
    } else if (notificationId) {
      await db.notification.updateMany({
        where: { id: notificationId, userId: auth.user.id },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notifications read error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
