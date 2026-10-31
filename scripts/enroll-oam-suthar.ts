import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const AUTOCAD_COURSE_ID = "6adb81474a550cde562bd0cd" // AutoCAD Design
const MATLAB_COURSE_ID = "6adb81484a550cde562bd0ce" // MATLAB & Simulink
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENT = {
  name: "Oam Shaileshkumar Suthar",
  email: "oamsuthar32@gmail.com",
  phone: "+919727060426",
  altPhone: "+919427060426",
  college: "L.D. College of Engineering",
  branch: "Civil Engineering",
  year: "1st Year",
  headline: "Civil Engineering Scholar • L.D. College of Engineering",
  education: "Civil Engineering (1st Year) • L.D. College of Engineering",
  bio: "Civil Engineering student at L.D. College of Engineering (1st Year). Alternate contact: +91 94270 60426.",
  learningGoals:
    "Master Artificial Intelligence, Computer-Aided Design (AutoCAD), and Numerical Computing & Simulation (MATLAB)",
}

async function main() {
  console.log("=== ENROLLING OAM SHAILESHKUMAR SUTHAR: AI, AUTOCAD & MATLAB ===")

  // 1. Verify courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const autocadCourse = await db.course.findUnique({
    where: { id: AUTOCAD_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!autocadCourse) throw new Error("AutoCAD Course not found!");

  const matlabCourse = await db.course.findUnique({
    where: { id: MATLAB_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!matlabCourse) throw new Error("MATLAB Course not found!");

  console.log(`✓ Verified AI: "${aiCourse.title}"`)
  console.log(`✓ Verified AutoCAD: "${autocadCourse.title}"`)
  console.log(`✓ Verified MATLAB: "${matlabCourse.title}"`)

  const cleanEmail = STUDENT.email.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    STUDENT.name
  )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

  // 2. Upsert User
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

  // 3. Upsert UserProfile with education, bio, and phone
  const profile = await db.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: STUDENT.headline,
      education: STUDENT.education,
      bio: STUDENT.bio,
      avatarUrl,
      phone: STUDENT.phone,
      timezone: "Asia/Kolkata",
      learningGoals: STUDENT.learningGoals,
    },
    create: {
      userId: user.id,
      headline: STUDENT.headline,
      education: STUDENT.education,
      bio: STUDENT.bio,
      avatarUrl,
      phone: STUDENT.phone,
      timezone: "Asia/Kolkata",
      learningGoals: STUDENT.learningGoals,
    },
  })
  console.log(`✓ Profile created/updated: Phone ${profile.phone}, Education: ${profile.education}`)

  // 4. Enrollments: MATLAB, AutoCAD, and AI (AI on top with newest lastAccessedAt)
  const enrollmentsToSet = [
    {
      courseId: matlabCourse.id,
      title: matlabCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: autocadCourse.id,
      title: autocadCourse.title,
      lastAccessedAt: new Date(Date.now() + 10000),
    },
    {
      courseId: aiCourse.id,
      title: aiCourse.title,
      lastAccessedAt: new Date(Date.now() + 20000), // Primary track (top of dashboard)
    },
  ]

  for (const item of enrollmentsToSet) {
    const existing = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: item.courseId,
      },
    })

    if (!existing) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: item.courseId,
          status: "ACTIVE",
          progressPct: 0,
          enrolledAt: new Date(),
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`  ✓ Enrolled in "${item.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`  ✓ Refreshed enrollment in "${item.title}" to ACTIVE`)
    }
  }

  // 5. In-app Welcome Notification
  const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
  const notifMessage = `Welcome ${STUDENT.name}! You are enrolled in ${aiCourse.title} (Primary Track), ${autocadCourse.title}, and ${matlabCourse.title}. Access your curriculum and live classes anytime.`

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
        href: `/student/dashboard`,
        read: false,
      },
    })
    console.log(`✓ Welcome notification sent`)
  }

  // 6. Verify
  const verified = await db.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, approvalStatus: true, isPublished: true },
          },
        },
        orderBy: { lastAccessedAt: "desc" },
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
    education: verified?.profile?.education,
    bio: verified?.profile?.bio,
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
