import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DEFAULT_PASSWORD = "TechGration@2026"

interface StudentConfig {
  name: string
  email: string
  phone: string
  headline: string
  learningGoals: string
}

const STUDENTS: StudentConfig[] = [
  {
    name: "Adarsh longre",
    email: "adarshlongre@gmail.com",
    phone: "+919201020734",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals:
      "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
  },
  {
    name: "Nihar Mehta",
    email: "2000016974@karnavatiuniversity.edu.in",
    phone: "+919054352287",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals:
      "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
  },
]

async function main() {
  console.log("=== ENROLLING ADARSH LONGRE & NIHAR MEHTA IN ARTIFICIAL INTELLIGENCE ===")

  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found!`)
  }

  const results = []

  for (const student of STUDENTS) {
    const cleanEmail = student.email.toLowerCase().trim()
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      student.name
    )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

    // 1. Upsert User
    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: student.name,
        role: "STUDENT",
        status: "ACTIVE",
        passwordHash,
      },
      create: {
        email: cleanEmail,
        name: student.name,
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
        headline: student.headline,
        avatarUrl,
        phone: student.phone,
        timezone: "Asia/Kolkata",
        learningGoals: student.learningGoals,
      },
      create: {
        userId: user.id,
        headline: student.headline,
        avatarUrl,
        phone: student.phone,
        timezone: "Asia/Kolkata",
        learningGoals: student.learningGoals,
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
    const notifMessage = `Welcome ${student.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`

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
          href: `/student/courses/${aiCourse.id}`,
          read: false,
        },
      })
      console.log(`✓ Welcome notification sent`)
    }

    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: student.phone,
      enrolledCourse: aiCourse.title,
      enrollmentId: enrollment.id,
      status: user.status,
    })
  }

  console.log("\n========================================================")
  console.log("FINAL ENROLLMENT VERIFICATION:")
  console.log(JSON.stringify(results, null, 2))
  console.log("========================================================")
}

main()
  .catch((err) => {
    console.error("Enrollment failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
