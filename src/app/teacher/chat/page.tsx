import * as React from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getTeacherSession } from "@/server/services/teacher-auth"
import {
  getTeacherConversations,
  getUnreadChatCount,
} from "@/server/services/chat-service"
import { TeacherChatClient } from "./teacher-chat-client"

export const metadata: Metadata = {
  title: "Student Messages & Doubts — TechGration Instructor Portal",
  description: "Direct 1-on-1 student doubt resolution and mentoring desk.",
}

export default async function TeacherChatPage() {
  const session = await getTeacherSession()
  if (!session || !session.user) {
    redirect("/teacher/login")
  }

  const [rawConversations, unreadCount] = await Promise.all([
    getTeacherConversations(session.user.id),
    getUnreadChatCount(session.user.id, true),
  ])

  const conversations = rawConversations.map((c: any) => ({
    id: c.id,
    studentId: c.studentId,
    teacherId: c.teacherId,
    courseId: c.courseId,
    status: c.status,
    lastMessageText: c.lastMessageText,
    lastMessageAt: c.lastMessageAt.toISOString(),
    unreadCountStudent: c.unreadCountStudent,
    unreadCountTeacher: c.unreadCountTeacher,
    teacher: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
      headline: session.user.headline,
    },
    student: {
      id: c.student.id,
      name: c.student.name,
      email: c.student.email,
      avatarUrl: c.student.profile?.avatarUrl ?? null,
      headline: c.student.profile?.headline ?? "Enrolled Student",
    },
    course: c.course
      ? {
          id: c.course.id,
          title: c.course.title,
          thumbnailUrl: c.course.thumbnailUrl,
        }
      : null,
  }))

  return (
    <TeacherChatClient
      currentUserId={session.user.id}
      initialConversations={conversations}
      initialUnreadCount={unreadCount}
    />
  )
}
