import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const CYBER_COURSE_ID = "6ad63bbe32e6d7bb3b75d8db" // Cyber Security & Ethical Hacking
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "ARJIT PUNIA",
  email: "arjit784@gmail.com",
  phone: "+918278147772",
  headline: "TechGration Scholar • Cyber Security & Ethical Hacking",
  learningGoals:
    "Master Cyber Security, Network Security, Penetration Testing & Ethical Hacking",
}

async function main() {
  console.log("=== ENROLLING ARJIT PUNIA IN CYBER SECURITY & ETHICAL HACKING ===")

  // Verify Cyber Security course
  const cyberCourse = await db.course.findUnique({
    where: { id: CYBER_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })
  if (!cyberCourse) throw new Error("Cyber Security Course not found!");

  console.log(`✓ Verified Course: "${cyberCourse.title}" (${cyberCourse.id})`)

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

  // 2. Upsert Profile
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
      courseId: cyberCourse.id,
    },
  })

  let enrollment
  if (!existingEnrollment) {
    enrollment = await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: cyberCourse.id,
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
  const notifTitle = `🎉 Welcome to ${cyberCourse.title}!`
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
        href: `/student/courses/${cyberCourse.id}`,
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
  console.log("FINAL ENROLLMENT VERIFICATION:")
  console.log({
    name: verified?.name,
    email: verified?.email,
    phone: verified?.profile?.phone,
    password: DEFAULT_PASSWORD,
    courses: verified?.enrollments.map((e) => e.course.title),
    status: verified?.status,
  })
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
