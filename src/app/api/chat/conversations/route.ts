import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import {
  getStudentConversations,
  getTeacherConversations,
  getOrCreateConversation,
  getUnreadChatCount,
  VINEET_SIR_ID,
} from "@/server/services/chat-service"
import { Role } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const filterCourseId = searchParams.get("courseId")
    const isTeacher = user.role === Role.TEACHER || user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN

    let conversations
    if (isTeacher) {
      conversations = await getTeacherConversations(user.id, filterCourseId)
    } else {
      conversations = await getStudentConversations(user.id)
    }

    const unreadCount = await getUnreadChatCount(user.id, isTeacher)

    return NextResponse.json({
      success: true,
      conversations,
      unreadCount,
    })
  } catch (error: any) {
    console.error("Fetch conversations error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { courseId, teacherId = VINEET_SIR_ID } = body

    // Only students can initiate conversations with teachers
    const studentId = user.id
    const conversation = await getOrCreateConversation(studentId, teacherId, courseId)

    return NextResponse.json({
      success: true,
      conversation,
    })
  } catch (error: any) {
    console.error("Create conversation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create conversation" },
      { status: 400 }
    )
  }
}
