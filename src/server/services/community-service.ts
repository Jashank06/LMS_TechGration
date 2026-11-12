import { db } from "@/server/db"
import { Role, PostCategory, PostPriority } from "@prisma/client"

export interface CreatePostParams {
  authorId: string
  title: string
  content: string
  category: PostCategory
  priority?: PostPriority
  isPinned?: boolean
  courseId?: string | null
  bannerUrl?: string | null
  actionUrl?: string | null
  actionLabel?: string | null
  rescheduledStartsAt?: Date | string | null
  meetingUrl?: string | null
}

export interface GetPostsOptions {
  userId?: string
  role?: string
  courseId?: string | null
  category?: PostCategory | "ALL"
  search?: string
  limit?: number
}

/**
 * Creates a new broadcast community post.
 * Strictly restricted to instructors and administrators.
 */
export async function createCommunityPost(params: CreatePostParams) {
  const author = await db.user.findUnique({
    where: { id: params.authorId },
    include: { profile: true },
  })

  if (!author) {
    throw new Error("Author not found")
  }

  const isInstructor =
    author.role === Role.TEACHER ||
    author.role === Role.ADMIN ||
    author.role === Role.SUPER_ADMIN

  if (!isInstructor) {
    throw new Error("Unauthorized. Only course instructors and administrators can publish community posts.")
  }

  const authorRoleTitle =
    author.profile?.headline ||
    (author.role === Role.TEACHER ? "Course Instructor" : "Administrator")

  const post = await db.communityPost.create({
    data: {
      title: params.title.trim(),
      content: params.content.trim(),
      category: params.category,
      priority: params.priority || PostPriority.NORMAL,
      isPinned: Boolean(params.isPinned),
      courseId: params.courseId ? params.courseId : null,
      authorId: author.id,
      authorName: author.name,
      authorRole: authorRoleTitle,
      bannerUrl: params.bannerUrl?.trim() || null,
      actionUrl: params.actionUrl?.trim() || null,
      actionLabel: params.actionLabel?.trim() || null,
      rescheduledStartsAt: params.rescheduledStartsAt
        ? new Date(params.rescheduledStartsAt)
        : null,
      meetingUrl: params.meetingUrl?.trim() || null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          profile: { select: { avatarUrl: true, headline: true } },
        },
      },
      course: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  return post
}

/**
 * Retrieves community posts with optional filters for course, category, and keyword search.
 */
export async function getCommunityPosts(options: GetPostsOptions = {}) {
  const { userId, role, courseId, category, search, limit = 50 } = options

  const where: any = {}

  // Category filter
  if (category && category !== "ALL") {
    where.category = category
  }

  // Course scope
  if (courseId) {
    where.OR = [{ courseId }, { courseId: null }]
  } else if (userId && role === Role.STUDENT) {
    // If student, show global announcements + announcements for courses student is enrolled in
    const enrollments = await db.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { courseId: true },
    })
    const enrolledIds = enrollments.map((e) => e.courseId)
    where.OR = [{ courseId: { in: enrolledIds } }, { courseId: null }]
  }

  // Text search
  if (search && search.trim().length > 0) {
    const q = search.trim()
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
          { authorName: { contains: q, mode: "insensitive" } },
        ],
      },
    ]
  }

  const posts = await db.communityPost.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          profile: { select: { avatarUrl: true, headline: true } },
        },
      },
      course: {
        select: { id: true, title: true, thumbnailUrl: true },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  })

  return posts
}

/**
 * Fetches top pinned posts for dashboard alert banner.
 */
export async function getPinnedCommunityPosts(userId?: string) {
  let courseFilter: any = {}

  if (userId) {
    const enrollments = await db.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      select: { courseId: true },
    })
    const enrolledIds = enrollments.map((e) => e.courseId)
    courseFilter = {
      OR: [{ courseId: { in: enrolledIds } }, { courseId: null }],
    }
  }

  return db.communityPost.findMany({
    where: {
      isPinned: true,
      ...courseFilter,
    },
    include: {
      course: { select: { id: true, title: true } },
      author: { select: { name: true, profile: { select: { avatarUrl: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })
}

/**
 * Toggles an emoji reaction on a post.
 */
export async function togglePostReaction(postId: string, userId: string, emoji: string) {
  const post = await db.communityPost.findUnique({
    where: { id: postId },
  })

  if (!post) throw new Error("Post not found")

  const reactions: Record<string, string[]> =
    (post.reactions as Record<string, string[]>) || {}

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

  const updated = await db.communityPost.update({
    where: { id: postId },
    data: { reactions },
  })

  return updated.reactions
}

/**
 * Adds a comment or question under a community post.
 */
export async function addPostComment(postId: string, authorId: string, content: string) {
  const author = await db.user.findUnique({
    where: { id: authorId },
    include: { profile: true },
  })

  if (!author) throw new Error("User not found")

  const comment = await db.postComment.create({
    data: {
      postId,
      authorId: author.id,
      authorName: author.name,
      authorRole:
        author.role === Role.TEACHER
          ? "Instructor"
          : author.role === Role.ADMIN
          ? "Admin"
          : "Student",
      authorAvatarUrl: author.profile?.avatarUrl ?? null,
      content: content.trim(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          role: true,
          profile: { select: { avatarUrl: true } },
        },
      },
    },
  })

  return comment
}

/**
 * Deletes a community post.
 */
export async function deleteCommunityPost(
  postId: string,
  requesterId: string,
  requesterRole: Role
) {
  const post = await db.communityPost.findUnique({
    where: { id: postId },
  })

  if (!post) throw new Error("Post not found")

  const isStaff = requesterRole === Role.ADMIN || requesterRole === Role.SUPER_ADMIN
  const isAuthor = post.authorId === requesterId

  if (!isStaff && !isAuthor) {
    throw new Error("You do not have permission to delete this post.")
  }

  await db.communityPost.delete({
    where: { id: postId },
  })

  return { success: true }
}
