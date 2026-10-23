import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DSA_CPP_COURSE_ID = "6ad3e689327ee4bd613509e1" // DSA in C++
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Mehul Kushwah",
  email: "kushwahmehul89@gmail.com",
  phone: "+916355967919",
  headline: "TechGration Scholar • AI & DSA in C++",
  learningGoals: "Master Machine Learning, Deep Neural Networks, and Advanced Data Structures & Algorithms in C++",
}

async function main() {
  console.log("=== ENROLLING MEHUL KUSHWAH IN AI & DSA IN C++ ===")

  // Verify both courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const dsaCourse = await db.course.findUnique({
    where: { id: DSA_CPP_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })
  if (!dsaCourse) throw new Error("DSA in C++ Course not found!");

  console.log(`Verified AI Course: "${aiCourse.title}" (${aiCourse.id})`)
  console.log(`Verified DSA Course: "${dsaCourse.title}" (${dsaCourse.id})`)

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

  // 2. Upsert UserProfile
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

  // 3. Enroll in DSA in C++ (secondary) and AI (primary, highest lastAccessedAt)
  const coursesToEnroll = [
    {
      course: dsaCourse,
      lastAccessedAt: new Date(),
    },
    {
      course: aiCourse,
      lastAccessedAt: new Date(Date.now() + 10000), // AI prioritized as primary
    },
  ]

  for (const item of coursesToEnroll) {
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: item.course.id,
      },
    })

    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: item.course.id,
          status: "ACTIVE",
          progressPct: 0,
          enrolledAt: new Date(),
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`✓ Enrolled in "${item.course.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`✓ Updated enrollment in "${item.course.title}" to ACTIVE`)
    }
  }

  // 4. Welcome Notification
  const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
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
        message: `Welcome ${STUDENT.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${dsaCourse.title}. Access your curriculum and live classes anytime.`,
        href: `/student/dashboard`,
        read: false,
      },
    })
    console.log(`✓ Welcome notification sent`)
  }

  // 5. Verification Query
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
  console.log("VERIFIED ENROLLMENT:")
  console.log(JSON.stringify(verified, null, 2))
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
