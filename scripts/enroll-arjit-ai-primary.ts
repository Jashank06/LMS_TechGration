import "dotenv/config"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const CYBER_COURSE_ID = "6ad63bbe32e6d7bb3b75d8db" // Cyber Security & Ethical Hacking
const STUDENT_EMAIL = "arjit784@gmail.com"

async function main() {
  console.log("=== ENROLLING ARJIT PUNIA IN AI AS PRIMARY TRACK ===")

  const user = await db.user.findFirst({
    where: { email: STUDENT_EMAIL },
    include: { profile: true, enrollments: true },
  })

  if (!user) {
    throw new Error(`User with email ${STUDENT_EMAIL} not found!`)
  }
  console.log(`✓ Found Student: "${user.name}" (${user.id})`)

  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const cyberCourse = await db.course.findUnique({
    where: { id: CYBER_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!cyberCourse) throw new Error("Cyber Security Course not found!");

  // 1. Update Profile to reflect both tracks
  await db.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: "TechGration Scholar • AI & Cybersecurity",
      learningGoals:
        "Master Artificial Intelligence, Deep Learning, Network Security & Ethical Hacking",
    },
    create: {
      userId: user.id,
      headline: "TechGration Scholar • AI & Cybersecurity",
      learningGoals:
        "Master Artificial Intelligence, Deep Learning, Network Security & Ethical Hacking",
      timezone: "Asia/Kolkata",
    },
  })
  console.log(`✓ Profile updated for ${user.name}`)

  // 2. Enrollments: Cyber Security (secondary) + AI (primary, highest lastAccessedAt)
  const enrollmentsToSet = [
    {
      courseId: CYBER_COURSE_ID,
      title: cyberCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: AI_COURSE_ID,
      title: aiCourse.title,
      lastAccessedAt: new Date(Date.now() + 10000), // Primary on top
    },
  ]

  for (const item of enrollmentsToSet) {
    const existing = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: item.courseId,
      },
    })

    if (!existing) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: item.courseId,
          status: "ACTIVE",
          progressPct: 0,
          enrolledAt: new Date(),
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`✓ Enrolled in "${item.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`✓ Updated enrollment in "${item.title}" to ACTIVE (Priority timestamp set)`)
    }
  }

  // 3. Welcome Notification for AI Course
  const notifTitle = `🎉 Welcome to ${aiCourse.title}!`
  const notifMessage = `Welcome ${user.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${cyberCourse.title}. Access your curriculum and live classes anytime.`

  const existingNotif = await db.notification.findFirst({
    where: {
      userId: user.id,
      title: notifTitle,
    },
  })

  if (!existingNotif) {
    await db.notification.create({
      data: {
        userId: user.id,
        title: notifTitle,
        message: notifMessage,
        href: `/student/dashboard`,
        read: false,
      },
    })
    console.log(`✓ Welcome notification sent`)
  }

  // 4. Verification Query
  const verified = await db.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, approvalStatus: true, isPublished: true },
          },
        },
        orderBy: { lastAccessedAt: "desc" },
      },
      notifications: true,
    },
  })

  console.log("\n========================================================")
  console.log("FINAL ENROLLMENT VERIFICATION:")
  console.log({
    name: verified?.name,
    email: verified?.email,
    phone: verified?.profile?.phone,
    headline: verified?.profile?.headline,
    courses: verified?.enrollments.map((e) => e.course.title),
    status: verified?.status,
  })
  console.log("========================================================")
}

main()
  .catch((e) => {
    console.error("Operation failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
