import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const ML_COURSE_ID = "6ad3e60d327ee4bd613509df" // Machine Learning
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Shivani Vijay Jadhav",
  email: "sjadhav4544@gmail.com",
  phone: "+918421790519",
  headline: "TechGration Scholar • AI & Machine Learning",
  learningGoals:
    "Master Artificial Intelligence, Deep Neural Networks, and Machine Learning Algorithms",
}

async function main() {
  console.log("=== ENROLLING SHIVANI VIJAY JADHAV: AI & MACHINE LEARNING ===")

  // Verify both courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const mlCourse = await db.course.findUnique({
    where: { id: ML_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })
  if (!mlCourse) throw new Error("Machine Learning Course not found!");

  console.log(`✓ Verified AI: "${aiCourse.title}"`)
  console.log(`✓ Verified ML: "${mlCourse.title}"`)

  const cleanEmail = STUDENT.email.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    STUDENT.name
  )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

  // 1. Upsert User
  const user = await db.user.upsert({
    where: { email: cleanEmail },
    update: {
      name: STUDENT.name,
      role: "STUDENT",
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      email: cleanEmail,
      name: STUDENT.name,
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  })
  console.log(`✓ User record created/updated: ${user.name} (ID: ${user.id})`)

  // 2. Upsert Profile
  const profile = await db.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: STUDENT.headline,
      avatarUrl,
      phone: STUDENT.phone,
      timezone: "Asia/Kolkata",
      learningGoals: STUDENT.learningGoals,
    },
    create: {
      userId: user.id,
      headline: STUDENT.headline,
      avatarUrl,
      phone: STUDENT.phone,
      timezone: "Asia/Kolkata",
      learningGoals: STUDENT.learningGoals,
    },
  })
  console.log(`✓ Profile created/updated: Phone ${profile.phone}`)

  // 3. Enrollments: ML (secondary) + AI (primary, highest lastAccessedAt)
  const enrollmentsToSet = [
    {
      courseId: mlCourse.id,
      title: mlCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: aiCourse.id,
      title: aiCourse.title,
      lastAccessedAt: new Date(Date.now() + 10000), // AI prioritized as primary
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
      console.log(`✓ Updated enrollment in "${item.title}" to ACTIVE`)
    }
  }

  // 4. In-app Welcome Notification
  const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
  const notifMessage = `Welcome ${STUDENT.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${mlCourse.title}. Access your curriculum and live classes anytime.`

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

  // 5. Final Verification
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
    password: DEFAULT_PASSWORD,
    courses: verified?.enrollments.map((e) => e.course.title),
    status: verified?.status,
  })
  console.log("========================================================")
}

main()
  .catch((e) => {
    console.error("Enrollment failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
