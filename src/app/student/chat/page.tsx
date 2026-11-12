import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import {
  getStudentConversations,
  getUnreadChatCount,
} from "@/server/services/chat-service"
import { StudentChatClient } from "./student-chat-client"

export const metadata: Metadata = {
  title: "Instructor Chat — TechGration LMS",
  description: "Connect directly with your allotted course instructor for 1-on-1 doubt solving and mentoring.",
}

export default async function StudentChatPage() {
  const user = await requireStudent()

  const [rawConversations, unreadCount] = await Promise.all([
    getStudentConversations(user.id),
    getUnreadChatCount(user.id, false),
  ])

  // Serializing for client component
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
      id: c.teacher.id,
      name: c.teacher.name,
      email: c.teacher.email,
      role: c.teacher.role,
      avatarUrl: c.teacher.profile?.avatarUrl ?? null,
      headline: c.teacher.profile?.headline ?? "Lead Course Instructor",
    },
    student: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.profile?.avatarUrl ?? null,
    },
    course: c.course
      ? {
          id: c.course.id,
          title: c.course.title,
          thumbnailUrl: c.course.thumbnailUrl,
          instructorName: c.course.instructorName,
          instructorTitle: c.course.instructorTitle,
        }
      : null,
  }))

  return (
    <StudentChatClient
      currentUserId={user.id}
      initialConversations={conversations}
      initialUnreadCount={unreadCount}
    />
  )
}
