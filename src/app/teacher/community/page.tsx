import * as React from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { db } from "@/server/db"
import { getCommunityPosts } from "@/server/services/community-service"
import { TeacherCommunityClient } from "./teacher-community-client"

export const metadata: Metadata = {
  title: "Community & Notices Desk — TechGration Instructor Portal",
  description: "Broadcast class reschedule updates, festival greetings, milestones, and student resources.",
}

export default async function TeacherCommunityPage() {
  const session = await getTeacherSession()
  if (!session || !session.user) {
    redirect("/teacher/login")
  }

  const [rawPosts, courses] = await Promise.all([
    getCommunityPosts({
      userId: session.user.id,
      role: session.user.role,
      limit: 60,
    }),
    db.course.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: "asc" },
    }),
  ])

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

  return (
    <TeacherCommunityClient
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        avatarUrl: session.user.avatarUrl,
        headline: session.user.headline,
      }}
      initialPosts={posts}
      courses={courses}
    />
  )
}
