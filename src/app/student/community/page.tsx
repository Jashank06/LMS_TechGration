import * as React from "react"
import { Metadata } from "next"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"
import { getCommunityPosts, getPinnedCommunityPosts } from "@/server/services/community-service"
import { StudentCommunityClient } from "./student-community-client"

export const metadata: Metadata = {
  title: "Community Feed & Notice Board — TechGration LMS",
  description: "Official cohort announcements, class reschedule updates, festive occasions, and exclusive learning resources.",
}

export default async function StudentCommunityPage() {
  const user = await requireStudent()

  const [rawPosts, rawPinnedPosts, enrollments] = await Promise.all([
    getCommunityPosts({
      userId: user.id,
      role: user.role,
      limit: 40,
    }),
    getPinnedCommunityPosts(user.id),
    db.enrollment.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ])

  // Serialize posts
  const posts = rawPosts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    priority: p.priority,
    isPinned: p.isPinned,
    authorId: p.authorId,
    authorName: p.authorName,
    authorRole: p.authorRole,
    bannerUrl: p.bannerUrl,
    actionUrl: p.actionUrl,
    actionLabel: p.actionLabel,
    rescheduledStartsAt: p.rescheduledStartsAt ? p.rescheduledStartsAt.toISOString() : null,
    meetingUrl: p.meetingUrl,
    viewsCount: p.viewsCount,
    reactions: p.reactions as Record<string, string[]>,
    createdAt: p.createdAt.toISOString(),
    author: {
      id: p.author.id,
      name: p.author.name,
      role: p.author.role,
      profile: p.author.profile
        ? {
            avatarUrl: p.author.profile.avatarUrl,
            headline: p.author.profile.headline,
          }
        : null,
    },
    course: p.course
      ? {
          id: p.course.id,
          title: p.course.title,
          thumbnailUrl: p.course.thumbnailUrl,
        }
      : null,
    comments: p.comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.authorName,
      authorRole: c.authorRole,
      authorAvatarUrl: c.authorAvatarUrl,
      createdAt: c.createdAt.toISOString(),
      author: {
        id: c.author.id,
        name: c.author.name,
        role: c.author.role,
        profile: c.author.profile ? { avatarUrl: c.author.profile.avatarUrl } : null,
      },
    })),
  }))

  const pinnedPosts = rawPinnedPosts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category,
    priority: p.priority,
    authorName: p.authorName,
    meetingUrl: p.meetingUrl,
    rescheduledStartsAt: p.rescheduledStartsAt ? p.rescheduledStartsAt.toISOString() : null,
    course: p.course ? { id: p.course.id, title: p.course.title } : null,
    author: p.author ? { name: p.author.name, profile: p.author.profile } : null,
  }))

  const enrolledCourses = enrollments
    .map((e) => e.course)
    .filter((c): c is { id: string; title: string } => Boolean(c))

  return (
    <StudentCommunityClient
      currentUser={{
        id: user.id,
        name: user.name,
        role: user.role,
      }}
      initialPosts={posts}
      pinnedPosts={pinnedPosts}
      enrolledCourses={enrolledCourses}
    />
  )
}
