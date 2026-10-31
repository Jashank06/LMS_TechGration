import "dotenv/config"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const IOT_COURSE_ID = "6ad8bc73229083f2fa45edaf" // IOT & Robotics
const STUDENT_EMAIL = "mirzamuaz606@gmail.com"

async function main() {
  console.log("=== ENROLLING MUAZBAIG NADEEMBAIG MIRZA IN IOT & ROBOTICS ===")

  const user = await db.user.findFirst({
    where: { email: STUDENT_EMAIL },
    include: { profile: true, enrollments: true },
  })

  if (!user) {
    throw new Error(`User with email ${STUDENT_EMAIL} not found!`)
  }
  console.log(`✓ Found Student: "${user.name}" (${user.id})`)

  const iotCourse = await db.course.findUnique({
    where: { id: IOT_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!iotCourse) throw new Error("IOT & Robotics Course not found!");

  // 1. Update Profile
  await db.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: "TechGration Scholar • AI & IoT Robotics",
      learningGoals:
        "Master Artificial Intelligence, Deep Learning, Embedded Systems & IoT Robotics",
    },
    create: {
      userId: user.id,
      headline: "TechGration Scholar • AI & IoT Robotics",
      learningGoals:
        "Master Artificial Intelligence, Deep Learning, Embedded Systems & IoT Robotics",
      timezone: "Asia/Kolkata",
    },
  })
  console.log(`✓ Profile updated for ${user.name}`)

  // 2. Enroll in IOT & Robotics (secondary) and refresh AI (primary, top of dashboard)
  const enrollmentsToSet = [
    {
      courseId: IOT_COURSE_ID,
      title: iotCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: AI_COURSE_ID,
      title: "Artificial Intelligence & Modern Deep Learning Systems",
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
      console.log(`✓ Refreshed enrollment in "${item.title}" to ACTIVE`)
    }
  }

  // 3. Welcome Notification for IOT
  const notifTitle = `🎉 Welcome to IOT & Robotics!`
  const notifMessage = `Welcome ${user.name}! You are now enrolled in IOT & Robotics alongside your Artificial Intelligence program. Access your curriculum and live classes anytime.`

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

  // 4. Verification
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
