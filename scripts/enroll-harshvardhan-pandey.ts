import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const CYBER_COURSE_ID = "6ad63bbe32e6d7bb3b75d8db" // Cyber Security & Ethical Hacking
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Harshvardhan Pandey",
  email: "krishanmp77@gmail.com",
  phone: "+919118526252",
  headline: "TechGration Scholar • AI & Cyber Security",
  learningGoals:
    "Master Artificial Intelligence, Deep Learning, Network Security & Ethical Hacking",
  courses: [
    { courseId: AI_COURSE_ID, isPrimary: true },
    { courseId: CYBER_COURSE_ID, isPrimary: false },
  ],
}

async function main() {
  console.log("=== ENROLLING HARSHVARDHAN PANDEY IN AI & CYBER SECURITY ===")

  // Validate courses exist
  const courses = await db.course.findMany({
    where: {
      id: { in: [AI_COURSE_ID, CYBER_COURSE_ID] },
    },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (courses.length !== 2) {
    throw new Error(`One or more courses not found! Found: ${courses.map((c) => c.title).join(", ")}`)
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

  // 3. Upsert Enrollments
  for (const c of STUDENT.courses) {
    const targetCourse = courses.find((item) => item.id === c.courseId)!
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: c.courseId,
      },
    })

    let enrollment
    if (!existingEnrollment) {
      enrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: c.courseId,
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

    // 4. Welcome Notification
    const notifTitle = `🎉 Welcome to ${targetCourse.title}!`
    const notifMessage = `Welcome ${STUDENT.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`

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
    },
  })

  console.log("\n========================================================")
  console.log("FINAL ENROLLMENT VERIFICATION:")
  console.log({
    id: verified?.id,
    name: verified?.name,
    email: verified?.email,
    phone: verified?.profile?.phone,
    status: verified?.status,
    enrolledCourses: verified?.enrollments.map((e) => ({
      courseId: e.courseId,
      courseTitle: e.course.title,
      enrollmentId: e.id,
      status: e.status,
    })),
  })
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
