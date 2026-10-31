import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const CLOUD_COURSE_ID = "6ad3e6e3327ee4bd613509e3" // Cloud Computing and DevOps
const FULLSTACK_COURSE_ID = "6ad3e649327ee4bd613509e0" // FullStack Development
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Krisha Maheshbhai Timbadiya",
  email: "krishatimbadiya5@gmail.com",
  phone: "+919213481599",
  headline: "TechGration Scholar • AI, Cloud & FullStack",
  learningGoals:
    "Master Artificial Intelligence, Cloud Computing & DevOps, and FullStack Development",
}

async function main() {
  console.log("=== ENROLLING KRISHA TIMBADIYA: AI, CLOUD & FULLSTACK ===")

  // 1. Verify courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const cloudCourse = await db.course.findUnique({
    where: { id: CLOUD_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!cloudCourse) throw new Error("Cloud Computing Course not found!");

  const fullstackCourse = await db.course.findUnique({
    where: { id: FULLSTACK_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!fullstackCourse) throw new Error("FullStack Course not found!");

  console.log(`✓ Verified AI: "${aiCourse.title}"`)
  console.log(`✓ Verified Cloud: "${cloudCourse.title}"`)
  console.log(`✓ Verified FullStack: "${fullstackCourse.title}"`)

  const cleanEmail = STUDENT.email.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    STUDENT.name
  )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

  // 2. Upsert User
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

  // 3. Upsert UserProfile
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

  // 4. Enroll in 3 courses with priority order: FullStack, Cloud, and AI (AI on top)
  const enrollmentsToSet = [
    {
      courseId: fullstackCourse.id,
      title: fullstackCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: cloudCourse.id,
      title: cloudCourse.title,
      lastAccessedAt: new Date(Date.now() + 10000),
    },
    {
      courseId: aiCourse.id,
      title: aiCourse.title,
      lastAccessedAt: new Date(Date.now() + 20000), // Primary track (top of dashboard)
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
      console.log(`  ✓ Enrolled in "${item.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`  ✓ Refreshed enrollment in "${item.title}" to ACTIVE`)
    }
  }

  // 5. In-app Welcome Notification
  const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
  const notifMessage = `Welcome ${STUDENT.name}! You are enrolled in ${aiCourse.title} (Primary Track), ${cloudCourse.title}, and ${fullstackCourse.title}. Access your curriculum and live classes anytime.`

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

  // 6. Verify
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
