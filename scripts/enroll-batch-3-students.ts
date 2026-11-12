import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const CYBER_COURSE_ID = "6ad63bbe32e6d7bb3b75d8db" // Cyber Security & Ethical Hacking
const DS_COURSE_ID = "6ad3e6c1327ee4bd613509e2" // Data Science
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
    name: "Tanishka soni",
    email: "tanishik2611@gmail.com",
    phone: "+919238920671",
    headline: "TechGration Scholar • AI & Cybersecurity",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Network Security & Ethical Hacking",
    courses: [
      { courseId: CYBER_COURSE_ID, isPrimary: false },
      { courseId: AI_COURSE_ID, isPrimary: true },
    ],
  },
  {
    name: "NITISH KUMAR",
    email: "nitishkumar15615738@gmail.com",
    phone: "+918814852098",
    headline: "TechGration Scholar • AI & Data Science",
    learningGoals:
      "Master Artificial Intelligence, Deep Neural Networks, Statistical Modeling, and Data Science",
    courses: [
      { courseId: DS_COURSE_ID, isPrimary: false },
      { courseId: AI_COURSE_ID, isPrimary: true },
    ],
  },
  {
    name: "Devraj Gurjar",
    email: "dr4210699@gmail.com",
    phone: "+919202676805",
    headline: "TechGration Scholar • Artificial Intelligence",
    learningGoals:
      "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
    courses: [
      { courseId: AI_COURSE_ID, isPrimary: true },
    ],
  },
]

async function main() {
  console.log("=== BATCH ENROLLING 3 STUDENTS ===")

  // Verify all courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const cyberCourse = await db.course.findUnique({
    where: { id: CYBER_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!cyberCourse) throw new Error("Cyber Security Course not found!");

  const dsCourse = await db.course.findUnique({
    where: { id: DS_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!dsCourse) throw new Error("Data Science Course not found!");

  console.log(`✓ Verified Course: "${aiCourse.title}"`)
  console.log(`✓ Verified Course: "${cyberCourse.title}"`)
  console.log(`✓ Verified Course: "${dsCourse.title}"`)

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

    // 3. Enroll in courses with priority timestamps
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

      let cTitle = aiCourse.title
      if (c.courseId === CYBER_COURSE_ID) cTitle = cyberCourse.title
      if (c.courseId === DS_COURSE_ID) cTitle = dsCourse.title
      enrolledTitles.push(cTitle)
      console.log(`  ✓ Enrolled in "${cTitle}" (Primary: ${c.isPrimary})`)
    }

    // 4. In-app Welcome Notification
    const isMultiCourse = s.courses.length > 1
    const notifTitle = isMultiCourse
      ? `🎉 Welcome to TechGration Learning Portal!`
      : `🎉 Welcome to ${aiCourse.title}!`

    const notifMessage = isMultiCourse
      ? `Welcome ${s.name}! You are enrolled in ${enrolledTitles.join(" & ")}. Access your curriculum and live classes anytime.`
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
  console.log("FINAL BATCH ENROLLMENT SUMMARY:")
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
    console.error("Batch enrollment failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
