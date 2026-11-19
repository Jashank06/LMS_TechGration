import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const AUTOCAD_COURSE_ID = "6adb81474a550cde562bd0cd" // AutoCAD Design
const MATLAB_COURSE_ID = "6adb81484a550cde562bd0ce" // MATLAB & Simulink
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
    name: "Keshav Parashar",
    email: "keshavparasharrkr14@gmail.com",
    phone: "+918171860638",
    headline: "TechGration Scholar • AI, AutoCAD & MATLAB",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Computer-Aided Design (AutoCAD), and Numerical Computing & Simulation (MATLAB)",
    courseIds: [MATLAB_COURSE_ID, AUTOCAD_COURSE_ID, AI_COURSE_ID],
  },
  {
    name: "Vikrant Kumar",
    email: "amanrajpuriya12345@gmail.com",
    phone: "+919306587675",
    headline: "TechGration Scholar • AI, AutoCAD & MATLAB",
    learningGoals:
      "Master Artificial Intelligence, Deep Learning, Computer-Aided Design (AutoCAD), and Numerical Computing & Simulation (MATLAB)",
    courseIds: [MATLAB_COURSE_ID, AUTOCAD_COURSE_ID, AI_COURSE_ID],
  },
]

async function main() {
  console.log("=== ENROLLING KESHAV PARASHAR & VIKRANT KUMAR IN AI, AUTOCAD & MATLAB ===")

  const courses = await db.course.findMany({
    where: {
      id: { in: [AI_COURSE_ID, AUTOCAD_COURSE_ID, MATLAB_COURSE_ID] },
    },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (courses.length !== 3) {
    throw new Error(`One or more courses not found! Found: ${courses.map((c) => c.title).join(", ")}`)
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
    const enrolledDetails: { courseTitle: string; enrollmentId: string }[] = []

    for (let i = 0; i < student.courseIds.length; i++) {
      const courseId = student.courseIds[i]
      const targetCourse = courses.find((c) => c.id === courseId)!
      const existingEnrollment = await db.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: courseId,
        },
      })

      const lastAccessedAt = new Date(Date.now() + i * 10000)

      let enrollment
      if (!existingEnrollment) {
        enrollment = await db.enrollment.create({
          data: {
            userId: user.id,
            courseId: courseId,
            status: "ACTIVE",
            progressPct: 0,
            enrolledAt: new Date(),
            lastAccessedAt,
          },
        })
        console.log(`✓ Created ACTIVE enrollment for "${targetCourse.title}" (ID: ${enrollment.id})`)
      } else {
        enrollment = await db.enrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: "ACTIVE",
            lastAccessedAt,
          },
        })
        console.log(`✓ Updated enrollment to ACTIVE for "${targetCourse.title}" (ID: ${enrollment.id})`)
      }

      enrolledDetails.push({ courseTitle: targetCourse.title, enrollmentId: enrollment.id })

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
      enrolledCourses: enrolledDetails,
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
