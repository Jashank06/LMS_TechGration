import { db } from "@/server/db"
import { getClassRecipients } from "@/server/services/live-class-mailer"

async function main() {
  const classId = "6ae5dad0c4f20c990e876a1a"
  const courseId = "6ad283b4e196d0b8fbfb9eae"

  // ffprobe exact duration: 3786.28 seconds (63 mins 6 seconds)
  const durationSec = 3786
  const startsAt = new Date("2026-10-31T12:30:00.000Z") // 6:00 PM IST
  const endsAt = new Date(startsAt.getTime() + durationSec * 1000 + 283) // 7:33:06 PM IST

  console.log("1. Updating LiveClass 4 in database...")
  const updated = await db.liveClass.update({
    where: { id: classId },
    data: {
      recordingUrl: "/Recordings/AI/Recording_Class_4.mp4",
      status: "COMPLETED",
      platform: "ZOOM",
      endsAt,
      description: "Official high-definition recording of Live Class 4 covering Deep Learning Architectures, Sequence Models, and Advanced Attention Mechanisms with Vineet Sir.",
    },
    select: {
      id: true,
      title: true,
      courseId: true,
      startsAt: true,
      endsAt: true,
      status: true,
      recordingUrl: true,
      platform: true,
      description: true,
    },
  })

  console.log("✅ LiveClass updated successfully:")
  console.log(JSON.stringify(updated, null, 2))

  console.log("\n2. Fetching enrolled students to send in-app notification...")
  const students = await getClassRecipients(courseId)
  console.log(`Found ${students.length} enrolled students.`)

  if (students.length > 0) {
    const notifyResult = await db.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: "🎥 AI Live Class 4 Recording Published",
        message: "Recording for Class 4 is now live. Watch the session directly in your portal with interactive bookmarks.",
        href: "/student/courses/6ad283b4e196d0b8fbfb9eae?tab=recordings",
      })),
    })
    console.log(`✅ Created ${notifyResult.count} student in-app notifications.`)
  }

  console.log("\n🎉 AI CLASS 4 RECORDING SUCCESSFULLY PUBLISHED!")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FATAL ERROR:", err)
    process.exit(1)
  })
