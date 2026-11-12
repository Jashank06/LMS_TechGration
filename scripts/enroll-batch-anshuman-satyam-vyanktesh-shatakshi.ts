import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DSA_CPP_COURSE_ID = "6ad3e689327ee4bd613509e1" // DSA in C++
const VLSI_COURSE_ID = "6adb4c3c216fe9e61957bdb2" // VLSI Design
const FULLSTACK_COURSE_ID = "6ad3e649327ee4bd613509e0" // FullStack Development
const DEFAULT_PASSWORD = "TechGration@2026"

interface StudentConfig {
  name: string
  email: string
  phone: string
  headline: string
  learningGoals: string
  courseIds: string[]
}

const STUDENTS: StudentConfig[] = [
  {
    name: "Anshuman maurya",
    email: "avanishmaurya1980@gmail.com",
    phone: "+918887519761",
    headline: "TechGration Scholar • AI & DSA in C++",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Data Structures & Algorithms in C++",
    courseIds: [AI_COURSE_ID, DSA_CPP_COURSE_ID],
  },
  {
    name: "Satyam kumar Maurya",
    email: "satyam27m@gamil.com",
    phone: "+916387169370",
    headline: "TechGration Scholar • AI & DSA in C++",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Data Structures & Algorithms in C++",
    courseIds: [AI_COURSE_ID, DSA_CPP_COURSE_ID],
  },
  {
    name: "Vyanktesh Balasaheb Shete",
    email: "sheteraman37@gmail.com",
    phone: "+919623409761",
    headline: "TechGration Scholar • AI & VLSI Design",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Digital IC Design & VLSI Architecture",
    courseIds: [AI_COURSE_ID, VLSI_COURSE_ID],
  },
  {
    name: "Shatakshi",
    email: "shatakshim580@gmail.com",
    phone: "+918882397262",
    headline: "TechGration Scholar • AI & Full-Stack Development",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Next.js, TypeScript & Full-Stack Systems",
    courseIds: [AI_COURSE_ID, FULLSTACK_COURSE_ID],
  },
]

async function main() {
  console.log("=== ENROLLING BATCH OF 4 STUDENTS ===")

  const allCourseIds = Array.from(new Set(STUDENTS.flatMap((s) => s.courseIds)))
  const courses = await db.course.findMany({
    where: {
      id: { in: allCourseIds },
    },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (courses.length !== allCourseIds.length) {
    throw new Error(`Some courses were not found in the database!`)
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

    // 3. Upsert Enrollments
    const enrolledTitles: string[] = []
    const enrollmentIds: string[] = []

    for (const courseId of student.courseIds) {
      const targetCourse = courses.find((c) => c.id === courseId)!
      const existingEnrollment = await db.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: courseId,
        },
      })

      let enrollment
      if (!existingEnrollment) {
        enrollment = await db.enrollment.create({
          data: {
            userId: user.id,
            courseId: courseId,
            status: "ACTIVE",
            progressPct: 0,
            enrolledAt: new Date(),
            lastAccessedAt: new Date(),
          },
        })
        console.log(`✓ Created ACTIVE enrollment for "${targetCourse.title}" (ID: ${enrollment.id})`)
      } else {
        enrollment = await db.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: "ACTIVE",
            lastAccessedAt: new Date(),
          },
        })
        console.log(`✓ Updated enrollment to ACTIVE for "${targetCourse.title}" (ID: ${enrollment.id})`)
      }

      enrolledTitles.push(targetCourse.title)
      enrollmentIds.push(enrollment.id)

      // 4. Welcome Notification
      const notifTitle = `🎉 Welcome to ${targetCourse.title}!`
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
            href: `/student/courses/${targetCourse.id}`,
            read: false,
          },
        })
        console.log(`✓ Welcome notification sent for ${targetCourse.title}`)
      }
    }

    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: student.phone,
      enrolledCourses: enrolledTitles,
      enrollmentIds,
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
