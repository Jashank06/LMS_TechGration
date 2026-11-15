import { db } from "../src/server/db"
import { getClassRecipients } from "../src/server/services/live-class-mailer"

async function main() {
  const courseId = "6ad283b4e196d0b8fbfb9eae"
  const instructorId = "6acea351533d6b57ff7c5401"

  console.log("==================================================")
  console.log("🎥 PUBLISHING AI CLASS 5 & CLASS 6 RECORDINGS")
  console.log("==================================================")

  // 1. Update Class 5
  const class5Id = "6af6d6ff001d810b9f0e459b"
  const class5DurationSec = 3256 // 54m 16s
  const class5StartsAt = new Date("2026-11-13T12:30:00.000Z")
  const class5EndsAt = new Date(class5StartsAt.getTime() + class5DurationSec * 1000)

  const updatedClass5 = await db.liveClass.update({
    where: { id: class5Id },
    data: {
      recordingUrl: "/Recordings/AI/AI_Class_5.mp4",
      status: "COMPLETED",
      endsAt: class5EndsAt,
      description:
        "Official high-definition recording of Live Class 5 covering Advanced Deep Learning Architectures, Model Fine-Tuning, and Production AI Pipelines with Vineet Sir.",
    },
  })
  console.log("✅ Class 5 LiveClass updated:", updatedClass5.title, "->", updatedClass5.recordingUrl)

  // 2. Update Class 6
  const class6Id = "6af852103f29003bfe7f3dc5"
  const class6DurationSec = 3516 // 58m 36s
  const class6StartsAt = new Date("2026-11-14T12:30:00.000Z")
  const class6EndsAt = new Date(class6StartsAt.getTime() + class6DurationSec * 1000)

  const updatedClass6 = await db.liveClass.update({
    where: { id: class6Id },
    data: {
      recordingUrl: "/Recordings/AI/AI_Class_6.mp4",
      status: "COMPLETED",
      endsAt: class6EndsAt,
      description:
        "Official high-definition recording of Live Class 6 covering Deep Learning, CNNs, Transformers, and Practical Model Architectures with Vineet Sir.",
    },
  })
  console.log("✅ Class 6 LiveClass updated:", updatedClass6.title, "->", updatedClass6.recordingUrl)

  // 3. Mark old pre-Diwali placeholder as CANCELLED to prevent duplicate listing
  await db.liveClass.updateMany({
    where: {
      id: "6aef07d28f2ab2101c1926fd",
    },
    data: {
      status: "CANCELLED",
    },
  })
  console.log("✅ Older duplicate pre-Diwali slot marked CANCELLED.")

  // 4. Fetch enrolled students to notify
  const students = await getClassRecipients(courseId)
  console.log(`Found ${students.length} enrolled students.`)

  if (students.length > 0) {
    const notifications = [
      ...students.map((s) => ({
        userId: s.id,
        title: "🎥 AI Live Class 5 Recording Published",
        message:
          "HD Recording for Class 5 (Advanced Deep Learning Architectures & Fine-Tuning) is now live in your Course Hub with interactive bookmarks.",
        href: "/student/courses/6ad283b4e196d0b8fbfb9eae?tab=recordings",
      })),
      ...students.map((s) => ({
        userId: s.id,
        title: "🎥 AI Live Class 6 Recording Published",
        message:
          "HD Recording for Class 6 (Transformers, Self-Attention & PyTorch Pipelines) is now live in your Course Hub with interactive bookmarks.",
        href: "/student/courses/6ad283b4e196d0b8fbfb9eae?tab=recordings",
      })),
    ]

    const notifyResult = await db.notification.createMany({
      data: notifications,
    })
    console.log(`✅ Created ${notifyResult.count} student in-app notifications.`)
  }

  // 5. Post Community Announcement
  try {
    const post = await db.communityPost.create({
      data: {
        authorId: instructorId,
        authorName: "Vineet Sir",
        authorRole: "TEACHER",
        courseId,
        title: "🎥 AI Live Classes 5 & 6 Recordings are Now Live! 🚀",
        content:
          "Dear Learners,\n\nThe official high-definition recordings of our weekend live sessions are now available in the portal:\n\n• Class 5: Advanced Deep Learning Architectures, Model Fine-Tuning & PyTorch Optimization (54 mins)\n• Class 6: Transformers, Self-Attention Mechanisms & Production AI Pipelines (58 mins)\n\nBoth sessions include smart topic bookmarks, chapter seeking, and course progress tracking. Access them directly under the Recordings tab in your Course Hub.",
        category: "IMPORTANT_NOTICE",
        priority: "NORMAL",
        isPinned: false,
        actionUrl: "/student/courses/6ad283b4e196d0b8fbfb9eae?tab=recordings",
        actionLabel: "Watch Recordings in Course Hub",
      },
    })
    console.log("✅ Community Post published:", post.id)
  } catch (err: any) {
    console.error("Warning: could not post community announcement:", err.message)
  }

  console.log("\n🎉 BOTH CLASS 5 & CLASS 6 RECORDINGS SUCCESSFULLY PUBLISHED!")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
