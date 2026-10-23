import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DEFAULT_PASSWORD = "TechGration@2026"

interface StudentEntry {
  name: string
  email: string
  phone: string
  headline: string
  learningGoals: string
}

const NEW_STUDENTS: StudentEntry[] = [
  {
    name: "Prakash",
    email: "9913957335prakash@gmail.com",
    phone: "+919913957335",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
  },
  {
    name: "Kunal Sanjaybhai Hedau",
    email: "kunalhedau3624@gmail.com",
    phone: "+919724146040",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
  },
]

async function main() {
  console.log("=== ENROLLING 2 STUDENTS IN ARTIFICIAL INTELLIGENCE ===")

  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found in database!`)
  }

  console.log(`Verified Target Course: "${aiCourse.title}" (${aiCourse.id})`)
  console.log(`Status: ${aiCourse.approvalStatus}, Published: ${aiCourse.isPublished}`)

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const results = []

  for (const s of NEW_STUDENTS) {
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

    // 2. Upsert UserProfile
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
    console.log(`  ✓ UserProfile saved (Phone: ${profile.phone})`)

    // 3. Upsert Enrollment in AI Course
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
      console.log(`  ✓ Created new ACTIVE enrollment (ID: ${enrollment.id})`)
    } else {
      enrollment = await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: new Date(),
        },
      })
      console.log(`  ✓ Refreshed existing enrollment to ACTIVE (ID: ${enrollment.id})`)
    }

    // 4. In-app Welcome Notification
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
          message: `Welcome ${s.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`,
          href: `/student/courses/${aiCourse.id}`,
          read: false,
        },
      })
      console.log(`  ✓ Welcome notification created`)
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
  console.log("ENROLLMENT SUMMARY:")
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
