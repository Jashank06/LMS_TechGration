import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DEFAULT_PASSWORD = "TechGration@2026"

interface StudentInput {
  name: string
  email: string
  phone: string
  headline: string
  learningGoals: string
}

const STUDENTS: StudentInput[] = [
  {
    name: "Himanshu diwakar",
    email: "himanshu7351hd@gmail.com",
    phone: "+917351938188",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
  },
  {
    name: "Prachi Jadhao",
    email: "jadhaoprachi10@gmail.com",
    phone: "+918530037223",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
  },
]

async function main() {
  console.log("=== ENROLLING HIMANSHU DIWAKAR & PRACHI JADHAO IN AI ===")

  // Verify AI course
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  console.log(`✓ Verified Course: "${aiCourse.title}" (${aiCourse.id})`)

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const results = []

  for (const s of STUDENTS) {
    const cleanEmail = s.email.toLowerCase().trim()
    console.log(`\nProcessing: ${s.name} <${cleanEmail}> (Phone: ${s.phone})`)

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      s.name
    )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

    // 1. Upsert User
    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: s.name,
        role: "STUDENT",
        status: "ACTIVE",
        passwordHash,
      },
      create: {
        email: cleanEmail,
        name: s.name,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
      },
    })
    console.log(`  ✓ User record saved (ID: ${user.id})`)

    // 2. Upsert Profile
    const profile = await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: s.headline,
        avatarUrl,
        phone: s.phone,
        timezone: "Asia/Kolkata",
        learningGoals: s.learningGoals,
      },
      create: {
        userId: user.id,
        headline: s.headline,
        avatarUrl,
        phone: s.phone,
        timezone: "Asia/Kolkata",
        learningGoals: s.learningGoals,
      },
    })
    console.log(`  ✓ Profile saved (Phone: ${profile.phone})`)

    // 3. Upsert Enrollment
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: aiCourse.id,
      },
    })

    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: aiCourse.id,
          status: "ACTIVE",
          progressPct: 0,
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        },
      })
      console.log(`  ✓ Enrolled in "${aiCourse.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: new Date(),
        },
      })
      console.log(`  ✓ Updated enrollment in "${aiCourse.title}" to ACTIVE`)
    }

    // 4. Welcome Notification
    const notifTitle = `🎉 Welcome to ${aiCourse.title}!`
    const notifMessage = `Welcome ${s.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`

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
      console.log(`  ✓ Welcome notification sent`)
    }

    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: profile.phone,
      password: DEFAULT_PASSWORD,
      course: aiCourse.title,
      status: "ACTIVE",
    })
  }

  console.log("\n========================================================")
  console.log("FINAL ENROLLMENT SUMMARY:")
  console.table(
    results.map((r, idx) => ({
      "#": idx + 1,
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Password: r.password,
      Course: r.course,
      Status: r.status,
    }))
  )
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
