import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Solanki Girja Bharatbhai",
  email: "9664720297solankitejpal@gmail.com",
  phone: "+919664720297",
  headline: "TechGration Scholar • Artificial Intelligence",
  learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
}

async function main() {
  console.log("=== ENROLLING SOLANKI GIRJA BHARATBHAI IN ARTIFICIAL INTELLIGENCE ===")

  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found!`)
  }

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

  // 3. Upsert Enrollment
  const existingEnrollment = await db.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: aiCourse.id,
    },
  })

  let enrollment
  if (!existingEnrollment) {
    enrollment = await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: aiCourse.id,
        status: "ACTIVE",
        progressPct: 0,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
      },
    })
    console.log(`✓ Created ACTIVE enrollment (ID: ${enrollment.id})`)
  } else {
    enrollment = await db.enrollment.update({
      where: { id: existingEnrollment.id },
      data: {
        status: "ACTIVE",
        lastAccessedAt: new Date(),
      },
    })
    console.log(`✓ Updated enrollment to ACTIVE (ID: ${enrollment.id})`)
  }

  // 4. Welcome Notification
  const notifTitle = `🎉 Welcome to ${aiCourse.title}!`
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
        message: `Welcome ${STUDENT.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`,
        href: `/student/courses/${aiCourse.id}`,
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
            select: { id: true, title: true },
          },
        },
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
