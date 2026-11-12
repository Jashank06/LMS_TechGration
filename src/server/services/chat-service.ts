import { db } from "@/server/db"
import { Role, MessageStatus, ConversationStatus } from "@prisma/client"

export const VINEET_SIR_ID = "6acea351533d6b57ff7c5401"

export interface ChatAttachmentMetaItem {
  url: string
  name: string
  size: number
  type: string
}

export interface SendMessageParams {
  senderId: string
  conversationId: string
  text?: string
  codeSnippet?: string | null
  codeLanguage?: string | null
  attachments?: string[]
  attachmentMeta?: ChatAttachmentMetaItem[]
  voiceNoteUrl?: string | null
  voiceNoteDuration?: number | null
}

/**
 * Ensures or retrieves a 1-on-1 direct conversation between a Student and their Teacher.
 * Enforces the strict rule: Students can ONLY message assigned instructors.
 */
export async function getOrCreateConversation(
  studentId: string,
  teacherId: string = VINEET_SIR_ID,
  courseId?: string | null
) {
  // 1. Verify user roles
  const [student, teacher] = await Promise.all([
    db.user.findUnique({ where: { id: studentId }, select: { id: true, role: true, name: true } }),
    db.user.findUnique({ where: { id: teacherId }, select: { id: true, role: true, name: true } }),
  ])

  if (!student) throw new Error("Student not found")
  if (!teacher) throw new Error("Teacher not found")

  // Strict Security Rule: Peer-to-peer student messaging is forbidden
  if (student.role === Role.STUDENT && teacher.role === Role.STUDENT) {
    throw new Error("Peer-to-peer student messaging is strictly disabled. You can only message your assigned instructors.")
  }

  // 2. Check if a conversation already exists
  let conversation = await db.conversation.findFirst({
    where: {
      studentId,
      teacherId,
      courseId: courseId ?? undefined,
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              avatarUrl: true,
              headline: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          instructorName: true,
          instructorTitle: true,
        },
      },
    },
  })

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        studentId,
        teacherId,
        courseId: courseId ?? undefined,
        status: ConversationStatus.ACTIVE,
        lastMessageText: null,
        lastMessageAt: new Date(),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profile: {
              select: {
                avatarUrl: true,
                headline: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            instructorName: true,
            instructorTitle: true,
          },
        },
      },
    })
  }

  return conversation
}

/**
 * Returns all instructor conversations for a student, auto-ensuring
 * their enrolled course conversations with Vineet Sir exist.
 */
export async function getStudentConversations(studentId: string) {
  // 1. Fetch student enrollments
  const enrollments = await db.enrollment.findMany({
    where: { userId: studentId, status: "ACTIVE" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          instructorId: true,
          instructorName: true,
        },
      },
    },
    orderBy: { lastAccessedAt: "desc" },
  })

  // Ensure conversation exists for primary course
  if (enrollments.length > 0) {
    const primaryEnrollment = enrollments[0]
    const assignedTeacherId = primaryEnrollment.course.instructorId || VINEET_SIR_ID
    await getOrCreateConversation(studentId, assignedTeacherId, primaryEnrollment.course.id).catch(() => {})
  } else {
    // If not enrolled in specific courses yet, provide default channel to Vineet Sir
    await getOrCreateConversation(studentId, VINEET_SIR_ID, null).catch(() => {})
  }

  // 2. Query all student conversations
  const conversations = await db.conversation.findMany({
    where: { studentId },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              avatarUrl: true,
              headline: true,
            },
          },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          instructorName: true,
          instructorTitle: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  })

  return conversations
}

/**
 * Returns all student conversations for an instructor / teacher.
 */
export async function getTeacherConversations(teacherId: string, courseId?: string | null) {
  const whereClause: any = {
    teacherId,
  }

  if (courseId) {
    whereClause.courseId = courseId
  }

  const conversations = await db.conversation.findMany({
    where: whereClause,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              avatarUrl: true,
              headline: true,
              phone: true,
            },
          },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  })

  return conversations
}

/**
 * Sends a message in a conversation.
 * Strictly verifies sender & receiver roles to ensure students can only message teachers.
 */
export async function sendChatMessage({
  senderId,
  conversationId,
  text,
  codeSnippet,
  codeLanguage,
  attachments = [],
  attachmentMeta,
  voiceNoteUrl,
  voiceNoteDuration,
}: SendMessageParams) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      student: { select: { id: true, role: true } },
      teacher: { select: { id: true, role: true } },
    },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  // Determine receiver
  let receiverId: string
  const isSenderStudent = senderId === conversation.studentId

  if (isSenderStudent) {
    receiverId = conversation.teacherId
    if (conversation.teacher.role === Role.STUDENT) {
      throw new Error("Cannot message another student.")
    }
  } else {
    receiverId = conversation.studentId
  }

  const cleanedText = (text || "").trim()
  const displaySnippet = cleanedText
    ? cleanedText.slice(0, 120)
    : voiceNoteUrl
    ? `🎙️ Voice message (${Math.floor((voiceNoteDuration || 0) / 60)}:${String(Math.floor((voiceNoteDuration || 0) % 60)).padStart(2, "0")})`
    : attachments.length > 0
    ? `📎 Attached file${attachments.length > 1 ? "s" : ""}`
    : "New message"

  // Prepare create payload
  const createData: any = {
    conversationId,
    senderId,
    receiverId,
    text: cleanedText,
    codeSnippet: codeSnippet?.trim() || null,
    codeLanguage: codeLanguage?.trim() || (codeSnippet ? "python" : null),
    attachments,
    voiceNoteUrl: voiceNoteUrl || null,
    voiceNoteDuration: typeof voiceNoteDuration === "number" ? Math.round(voiceNoteDuration) : null,
    status: MessageStatus.SENT,
  }

  if (attachmentMeta && Array.isArray(attachmentMeta) && attachmentMeta.length > 0) {
    createData.attachmentMeta = attachmentMeta
  }

  // Create message with graceful fallback
  let message
  try {
    message = await db.chatMessage.create({
      data: createData,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            profile: {
              select: {
                avatarUrl: true,
                headline: true,
              },
            },
          },
        },
      },
    })
  } catch (err: any) {
    if (err?.message?.includes("attachmentMeta")) {
      delete createData.attachmentMeta
      message = await db.chatMessage.create({
        data: createData,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
              profile: {
                select: {
                  avatarUrl: true,
                  headline: true,
                },
              },
            },
          },
        },
      })
    } else {
      throw err
    }
  }

  // Update conversation last message & unread counters
  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageText: displaySnippet,
      lastMessageAt: new Date(),
      lastSenderId: senderId,
      ...(isSenderStudent
        ? { unreadCountTeacher: { increment: 1 } }
        : { unreadCountStudent: { increment: 1 } }),
    },
  })

  return message
}

/**
 * Marks messages in a conversation as read by the reader.
 */
export async function markConversationAsRead(conversationId: string, readerId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation) return { count: 0 }

  const isReaderStudent = readerId === conversation.studentId

  // Update messages where receiver is this reader
  const updateResult = await db.chatMessage.updateMany({
    where: {
      conversationId,
      receiverId: readerId,
      status: { not: MessageStatus.READ },
    },
    data: {
      status: MessageStatus.READ,
      readAt: new Date(),
    },
  })

  // Clear unread counter on conversation
  await db.conversation.update({
    where: { id: conversationId },
    data: isReaderStudent ? { unreadCountStudent: 0 } : { unreadCountTeacher: 0 },
  })

  return { count: updateResult.count }
}

/**
 * Retrieves paginated messages for a conversation.
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  limit: number = 60
) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation || (conversation.studentId !== userId && conversation.teacherId !== userId)) {
    throw new Error("Unauthorized access to this conversation")
  }

  const messages = await db.chatMessage.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
          profile: {
            select: {
              avatarUrl: true,
              headline: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  })

  return messages
}

/**
 * Toggles an emoji reaction on a message.
 */
export async function toggleMessageReaction(messageId: string, userId: string, emoji: string) {
  const message = await db.chatMessage.findUnique({
    where: { id: messageId },
  })

  if (!message) throw new Error("Message not found")

  const reactions: Record<string, string[]> =
    (message.reactions as Record<string, string[]>) || {}

  const currentUsers = reactions[emoji] || []
  const hasReacted = currentUsers.includes(userId)

  if (hasReacted) {
    reactions[emoji] = currentUsers.filter((id) => id !== userId)
    if (reactions[emoji].length === 0) {
      delete reactions[emoji]
    }
  } else {
    reactions[emoji] = [...currentUsers, userId]
  }

  const updated = await db.chatMessage.update({
    where: { id: messageId },
    data: { reactions },
  })

  return updated.reactions
}

/**
 * Total unread message count for badge indicators.
 */
export async function getUnreadChatCount(userId: string, isTeacher: boolean = false) {
  const result = await db.conversation.aggregate({
    where: isTeacher ? { teacherId: userId } : { studentId: userId },
    _sum: {
      unreadCountTeacher: true,
      unreadCountStudent: true,
    },
  })

  const count = isTeacher
    ? result._sum.unreadCountTeacher || 0
    : result._sum.unreadCountStudent || 0

  return count
}
