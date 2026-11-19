import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DATA_ANALYTICS_COURSE_ID = "6addef7b5237da4688755a16" // Data Analytics
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Ayush Pal",
  email: "ayushpal83558@gmail.com",
  phone: "+919274489564",
  headline: "TechGration Scholar • AI & Data Analytics",
  learningGoals:
    "Master Artificial Intelligence, Deep Learning, Business Intelligence, SQL, Power BI & Data Analytics",
  courses: [
    { courseId: DATA_ANALYTICS_COURSE_ID, isPrimary: false },
    { courseId: AI_COURSE_ID, isPrimary: true },
  ],
}

async function main() {
  console.log("=== ENROLLING AYUSH PAL IN AI & DATA ANALYTICS ===")

  const courses = await db.course.findMany({
    where: {
      id: { in: [AI_COURSE_ID, DATA_ANALYTICS_COURSE_ID] },
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
  for (let i = 0; i < STUDENT.courses.length; i++) {
    const c = STUDENT.courses[i]
    const targetCourse = courses.find((item) => item.id === c.courseId)!
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: c.courseId,
      },
    })

    const lastAccessedAt = new Date(Date.now() + i * 10000)

    let enrollment
    if (!existingEnrollment) {
      enrollment = await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: c.courseId,
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
