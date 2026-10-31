import "dotenv/config"
import fs from "fs"
import path from "path"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary"
import { db } from "../src/server/db"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dozazvcec",
  api_key: process.env.CLOUDINARY_API_KEY || "979932955859291",
  api_secret: process.env.CLOUDINARY_API_SECRET || "2CytyqGhLXQpSDFdD1uoRa5tEZI",
  secure: true,
})

const ADMIN_ID = "6acea351533d6b57ff7c53ff"
const TEACHER_ID = "6acea351533d6b57ff7c5401"
const DEFAULT_PASSWORD = "TechGration@2026"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const ML_COURSE_ID = "6ad3e60d327ee4bd613509df" // Machine Learning
const CYBER_COURSE_ID = "6ad63bbe32e6d7bb3b75d8db" // Cyber Security & Ethical Hacking

const STUDENT = {
  name: "Sondarva prit",
  email: "pritsondarva11@gmail.com",
  phone: "+919016412851",
  headline: "TechGration Scholar • AI, Data Analytics & Cybersecurity",
  learningGoals:
    "Master Artificial Intelligence, Data Analytics, Machine Learning, and Cyber Security",
}

async function uploadThumbnail(): Promise<string> {
  const imagePath = path.resolve(process.cwd(), "public/Data Analytics_Back.png")
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found at: ${imagePath}`)
  }

  console.log("Uploading Data Analytics_Back.png to Cloudinary...")
  const res = await cloudinary.uploader.upload(imagePath, {
    folder: "techgration_lms/courses",
    public_id: `course_data_analytics_${Date.now()}`,
    overwrite: true,
    resource_type: "image",
    tags: ["techgration", "course_thumbnail", "data_analytics"],
    transformation: [
      { width: 1280, height: 720, crop: "fill", gravity: "auto" },
      { quality: "auto:good", fetch_format: "auto" },
    ],
  })
  console.log("✓ Cloudinary Upload Success! CDN URL:", res.secure_url)
  return res.secure_url
}

async function main() {
  console.log("=== ONBOARDING DATA ANALYTICS COURSE & SONDARVA PRIT ===")

  // 1. Verify Existing Courses
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!aiCourse) throw new Error("AI Course not found!");

  const mlCourse = await db.course.findUnique({
    where: { id: ML_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!mlCourse) throw new Error("Machine Learning Course not found!");

  const cyberCourse = await db.course.findUnique({
    where: { id: CYBER_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true },
  })
  if (!cyberCourse) throw new Error("Cyber Security Course not found!");

  console.log(`✓ Verified AI: "${aiCourse.title}"`)
  console.log(`✓ Verified ML: "${mlCourse.title}"`)
  console.log(`✓ Verified Cyber: "${cyberCourse.title}"`)

  // 2. Upload Thumbnail to Cloudinary
  const cdnThumbnailUrl = await uploadThumbnail()

  // 3. Create/Approve Data Analytics Course
  let dataAnalyticsCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { equals: "Data Analytics", mode: "insensitive" } },
        { slug: { startsWith: "data-analytics" } },
      ],
    },
  })

  if (!dataAnalyticsCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `data-analytics-${slugSuffix}`
    console.log(`Creating course "Data Analytics" (slug: ${slug})...`)

    dataAnalyticsCourse = await db.course.create({
      data: {
        slug,
        title: "Data Analytics",
        subtitle:
          "Master Python, SQL, Power BI, Advanced Excel, and Business Intelligence Analytics",
        description:
          "A comprehensive professional curriculum in Data Analytics and Business Intelligence. Master exploratory data analysis (EDA), data wrangling with Python (Pandas, NumPy), relational databases & SQL querying, interactive dashboards with Power BI & Tableau, statistical modeling, and data-driven business decision making.",
        thumbnailUrl: cdnThumbnailUrl,
        category: "Data Analytics",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorId: TEACHER_ID,
        createdById: TEACHER_ID,
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Master exploratory data analysis (EDA) and data wrangling using Python (Pandas, NumPy)",
          "Write complex SQL queries, aggregations, window functions, and relational data models",
          "Build high-impact interactive business dashboards in Power BI and Tableau",
          "Apply statistical hypothesis testing, data visualization principles, and KPI analytics",
          "Solve end-to-end industry business analytics case studies from raw data to executive insights",
          "Earn the official TechGration Data Analytics Professional Credential",
        ],
        prerequisites: [
          "Basic analytical mindset and curiosity to work with data",
          "Foundational familiarity with spreadsheets or basic computer operations",
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
    console.log(`✓ Created & Approved Data Analytics Course: "${dataAnalyticsCourse.title}" (${dataAnalyticsCourse.id})`)
  } else {
    console.log(`✓ Found existing Data Analytics course: "${dataAnalyticsCourse.title}" (${dataAnalyticsCourse.id})`)
    dataAnalyticsCourse = await db.course.update({
      where: { id: dataAnalyticsCourse.id },
      data: {
        thumbnailUrl: cdnThumbnailUrl,
        approvalStatus: "APPROVED",
        isPublished: true,
        category: "Data Analytics",
        instructorId: TEACHER_ID,
        createdById: TEACHER_ID,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
    console.log(`✓ Updated Data Analytics course thumbnail and status to APPROVED.`)
  }

  // 4. Create User & Profile
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

  // 5. Enroll in 4 Courses with priority ordering
  const enrollmentsToSet = [
    {
      courseId: cyberCourse.id,
      title: cyberCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: mlCourse.id,
      title: mlCourse.title,
      lastAccessedAt: new Date(Date.now() + 10000),
    },
    {
      courseId: dataAnalyticsCourse.id,
      title: dataAnalyticsCourse.title,
      lastAccessedAt: new Date(Date.now() + 20000),
    },
    {
      courseId: aiCourse.id,
      title: aiCourse.title,
      lastAccessedAt: new Date(Date.now() + 30000), // Primary track (top of dashboard)
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

  // 6. In-App Welcome Notification
  const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
  const notifMessage = `Welcome ${STUDENT.name}! You are enrolled in ${aiCourse.title} (Primary Track), ${dataAnalyticsCourse.title}, ${mlCourse.title}, and ${cyberCourse.title}. Access your curriculum and live classes anytime.`

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

  // 7. Verify
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
