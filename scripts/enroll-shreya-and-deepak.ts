import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const VLSI_COURSE_ID = "6adb4c3c216fe9e61957bdb2" // VLSI Design
const DEFAULT_PASSWORD = "TechGration@2026"

interface StudentConfig {
  name: string
  email: string
  phone: string
  headline: string
  learningGoals: string
  courses: {
    courseId: string
    isPrimary: boolean
  }[]
}

const STUDENTS: StudentConfig[] = [
  {
    name: "Shreya Manharbhai Padhiyar",
    email: "shreyapadhiyar2605@gmail.com",
    phone: "+919213533200",
    headline: "TechGration Scholar • AI & VLSI Design",
    learningGoals: "Master Artificial Intelligence, Deep Learning, Digital IC Design & VLSI Architecture",
    courses: [
      { courseId: VLSI_COURSE_ID, isPrimary: false },
      { courseId: AI_COURSE_ID, isPrimary: true },
    ],
  },
  {
    name: "Deepakkumar Chetankumar Patel",
    email: "deeps100208@gmail.com",
    phone: "+919099042222",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
    courses: [
      { courseId: AI_COURSE_ID, isPrimary: true },
    ],
  },
]

async function main() {
  console.log("=== ENROLLING SHREYA & DEEPAK ===")

  // Verify courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const vlsiCourse = await db.course.findUnique({
    where: { id: VLSI_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!vlsiCourse) throw new Error("VLSI Course not found!");

  console.log(`✓ Verified AI: "${aiCourse.title}"`)
  console.log(`✓ Verified VLSI: "${vlsiCourse.title}"`)

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

    // 3. Enroll in courses
    const enrolledTitles: string[] = []
    for (const c of s.courses) {
      const lastAccessedAt = c.isPrimary
        ? new Date(Date.now() + 10000)
        : new Date()

      const existingEnrollment = await db.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: c.courseId,
        },
      })

      if (!existingEnrollment) {
        await db.enrollment.create({
          data: {
            userId: user.id,
            courseId: c.courseId,
            status: "ACTIVE",
            progressPct: 0,
            enrolledAt: new Date(),
            lastAccessedAt,
          },
        })
      } else {
        await db.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: "ACTIVE",
            lastAccessedAt,
          },
        })
      }

      const cTitle = c.courseId === AI_COURSE_ID ? aiCourse.title : vlsiCourse.title
      enrolledTitles.push(cTitle)
      console.log(`  ✓ Enrolled in "${cTitle}" (Primary: ${c.isPrimary})`)
    }

    // 4. Welcome Notification
    const isMultiCourse = s.courses.length > 1
    const notifTitle = isMultiCourse
      ? `🎉 Welcome to TechGration Learning Portal!`
      : `🎉 Welcome to ${aiCourse.title}!`

    const notifMessage = isMultiCourse
      ? `Welcome ${s.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${vlsiCourse.title}. Access your curriculum and live classes anytime.`
      : `Welcome ${s.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`

    const notifHref = isMultiCourse
      ? `/student/dashboard`
      : `/student/courses/${AI_COURSE_ID}`

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
          href: notifHref,
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
      courses: enrolledTitles.join(" + "),
      status: "ACTIVE",
    })
  }

  console.log("\n========================================================")
  console.log("FINAL ENROLLMENT VERIFICATION:")
  console.table(
    results.map((r, idx) => ({
      "#": idx + 1,
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Password: r.password,
      Courses: r.courses,
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
