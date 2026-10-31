import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const ADMIN_ID = "6acea351533d6b57ff7c53ff"
const TEACHER_ID = "6acea351533d6b57ff7c5401"
const DEFAULT_PASSWORD = "TechGration@2026"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const JAVA_THUMBNAIL =
  "https://res.cloudinary.com/dozazvcec/image/upload/v1793197559/techgration_lms/courses/course_dsa_java_1793197556749.jpg"

const STUDENT = {
  name: "yashraj vishnu pathak",
  email: "yashrajvishnupathak@gmail.com",
  phone: "+919503240811",
  headline: "TechGration Scholar • AI & DSA in Java",
  learningGoals:
    "Master Artificial Intelligence, Deep Learning, and Data Structures & Algorithms in Java",
}

async function main() {
  console.log("=== ONBOARDING DSA IN JAVA COURSE & YASHRAJ VISHNU PATHAK ===")

  // 1. Verify AI Course
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");
  console.log(`✓ Verified AI: "${aiCourse.title}"`)

  // 2. Check or Create "DSA in Java" Course
  let dsaJavaCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { equals: "DSA in Java", mode: "insensitive" } },
        { slug: { startsWith: "dsa-in-java" } },
      ],
    },
  })

  if (!dsaJavaCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `dsa-in-java-${slugSuffix}`
    console.log(`Creating course "DSA in Java" (slug: ${slug})...`)

    dsaJavaCourse = await db.course.create({
      data: {
        slug,
        title: "DSA in Java",
        subtitle:
          "Master Data Structures, Algorithms, Time-Space Complexity, and Coding Interviews in Java",
        description:
          "A rigorous and hands-on curriculum in Data Structures and Algorithms using modern Java. Master arrays, strings, linked lists, stacks, queues, trees, graphs, dynamic programming, sorting, searching, recursion, and FAANG-style competitive coding and interview problem solving.",
        thumbnailUrl: JAVA_THUMBNAIL,
        category: "Computer Science & Algorithms",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorId: TEACHER_ID,
        createdById: TEACHER_ID,
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Master core and advanced data structures: Arrays, LinkedLists, Trees, Heaps, and Graphs in Java",
          "Implement efficient algorithms: Two Pointers, Sliding Window, Backtracking, and Dynamic Programming",
          "Analyze time and space complexity using Big-O asymptotic notation with precision",
          "Write clean, idiomatic, and robust Object-Oriented Java solutions for coding assessments",
          "Solve real-world coding interview problems with optimal algorithmic approaches",
          "Earn the official TechGration DSA in Java Professional Credential",
        ],
        prerequisites: [
          "Basic understanding of programming fundamentals (variables, loops, conditionals)",
          "Curiosity for problem solving and algorithmic reasoning",
        ],
        isPublished: true,
        isFeatured: false,
        approvalStatus: "APPROVED",
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
        submittedAt: new Date(),
        price: 0,
        currency: "INR",
      },
    })
    console.log(`✓ Created & Approved Course: "${dsaJavaCourse.title}" (${dsaJavaCourse.id})`)
  } else {
    console.log(`✓ Found existing Course: "${dsaJavaCourse.title}" (${dsaJavaCourse.id})`)
    dsaJavaCourse = await db.course.update({
      where: { id: dsaJavaCourse.id },
      data: {
        approvalStatus: "APPROVED",
        isPublished: true,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
  }

  // 3. Create User & Profile
  const cleanEmail = STUDENT.email.toLowerCase().trim()
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    STUDENT.name
  )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

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
  console.log(`✓ Profile saved (Phone: ${profile.phone})`)

  // 4. Enroll in DSA in Java (secondary) + AI (primary, highest lastAccessedAt)
  const enrollmentsToSet = [
    {
      courseId: dsaJavaCourse.id,
      title: dsaJavaCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: aiCourse.id,
      title: aiCourse.title,
      lastAccessedAt: new Date(Date.now() + 10000), // AI prioritized as primary
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
      console.log(`✓ Enrolled in "${item.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: item.lastAccessedAt,
        },
      })
      console.log(`✓ Updated enrollment in "${item.title}" to ACTIVE`)
    }
  }

  // 5. In-app Welcome Notification
  const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
  const notifMessage = `Welcome ${STUDENT.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${dsaJavaCourse.title}. Access your curriculum and live classes anytime.`

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

  // 6. Final Verification
  const verified = await db.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      enrollments: {
        include: {
          course: {
            select: { id: true, title: true, approvalStatus: true, isPublished: true, thumbnailUrl: true },
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
    password: DEFAULT_PASSWORD,
    courses: verified?.enrollments.map((e) => ({
      title: e.course.title,
      status: e.course.approvalStatus,
      thumbnailUrl: e.course.thumbnailUrl,
    })),
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
