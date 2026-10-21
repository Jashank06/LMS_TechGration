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

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DEFAULT_PASSWORD = "TechGration@2026"
const STUDENT_EMAIL = "satyam.26scse1180218@galgotiasuniversity.ac.in"
const STUDENT_NAME = "Satyam Tiwari"
const STUDENT_PHONE = "+919599473592"

async function uploadThumbnail(): Promise<string> {
  const localImageRelative = "public/brand/DSA_Python.png"
  const localImagePath = path.resolve(process.cwd(), localImageRelative)

  if (!fs.existsSync(localImagePath)) {
    console.warn(`Local image ${localImagePath} not found, falling back to /brand/DSA_Python.png`)
    return "/brand/DSA_Python.png"
  }

  try {
    console.log("Uploading course thumbnail to Cloudinary...")
    const res = await cloudinary.uploader.upload(localImagePath, {
      folder: "techgration_lms/courses",
      public_id: `course_dsa_python_${Date.now()}`,
      overwrite: true,
      resource_type: "image",
      tags: ["techgration", "course_thumbnail", "dsa_python"],
      transformation: [
        { width: 1280, height: 720, crop: "fill", gravity: "auto" },
        { quality: "auto:good", fetch_format: "auto" },
      ],
    })
    console.log("Cloudinary upload successful:", res.secure_url)
    return res.secure_url
  } catch (err) {
    console.warn("Cloudinary upload failed, falling back to local /brand/DSA_Python.png:", err)
    return "/brand/DSA_Python.png"
  }
}

async function main() {
  console.log("=== STARTING SETUP FOR DSA IN PYTHON & SATYAM TIWARI ===")

  // 1. Check if AI Course exists
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found in database!`)
  }
  console.log(`Verified AI Course: "${aiCourse.title}" (${aiCourse.id})`)

  // 2. Upload thumbnail or get URL
  const thumbnailUrl = await uploadThumbnail()

  // 3. Create or find "Data Structures & Algorithms in Python" course
  let dsaCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { contains: "Data Structures & Algorithms in Python", mode: "insensitive" } },
        { title: { contains: "DSA in Python", mode: "insensitive" } },
      ],
    },
  })

  const adminUser = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  })

  if (!dsaCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `data-structures-algorithms-in-python-${slugSuffix}`
    console.log(`Creating new course: "Data Structures & Algorithms in Python" (slug: ${slug})...`)

    dsaCourse = await db.course.create({
      data: {
        title: "Data Structures & Algorithms in Python",
        slug,
        subtitle: "Master Core Data Structures, Algorithms, Complexity Analysis, and High-Impact Coding Problem Solving",
        description: "Master Data Structures & Algorithms in Python from the ground up. This comprehensive curriculum covers core data structures (Arrays, Linked Lists, Stacks, Queues, Trees, Binary Search Trees, Heaps, Graphs, and Hash Maps), asymptotic analysis (Big-O notation), divide-and-conquer, dynamic programming, greedy algorithms, sorting & searching, and rigorous technical interview problem solving.",
        thumbnailUrl,
        category: "Cloud Engineering",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Master core data structures: Arrays, Linked Lists, Stacks, Queues, Trees, Heaps, and Graphs in Python",
          "Analyze algorithmic time and space complexity with Big-O notation",
          "Implement fundamental algorithms: Sorting, Searching, Recursion, and Backtracking",
          "Master Dynamic Programming, Greedy Algorithms, and Graph Traversal (BFS, DFS, Dijkstra)",
          "Solve industry-level coding problems for technical interview rounds at top tech companies",
          "Earn the official TechGration Data Structures & Algorithms in Python Professional Credential",
        ],
        prerequisites: [
          "Foundational knowledge of Python programming syntax and functions",
          "Basic mathematical reasoning and problem-solving mindset",
        ],
        isPublished: true,
        isFeatured: false,
        approvalStatus: "APPROVED",
        reviewedById: adminUser?.id || "6acea351533d6b57ff7c53ff",
        reviewedAt: new Date(),
        submittedAt: new Date(),
        price: 0,
        currency: "INR",
      },
    })
    console.log(`Created DSA Python Course: "${dsaCourse.title}" (${dsaCourse.id})`)
  } else {
    console.log(`Found existing course: "${dsaCourse.title}" (${dsaCourse.id})`)
    // Update thumbnail and ensure approved/published
    dsaCourse = await db.course.update({
      where: { id: dsaCourse.id },
      data: {
        thumbnailUrl,
        approvalStatus: "APPROVED",
        isPublished: true,
      },
    })
  }

  // 4. Create/Upsert User Satyam Tiwari
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const cleanEmail = STUDENT_EMAIL.toLowerCase().trim()
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(STUDENT_NAME)}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

  console.log(`Creating/Upserting user "${STUDENT_NAME}" (${cleanEmail})...`)
  const user = await db.user.upsert({
    where: { email: cleanEmail },
    update: {
      name: STUDENT_NAME,
      role: "STUDENT",
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      email: cleanEmail,
      name: STUDENT_NAME,
      passwordHash,
      role: "STUDENT",
      status: "ACTIVE",
    },
  })
  console.log(`User confirmed: ${user.name} (${user.id})`)

  // 5. Upsert UserProfile
  await db.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: "TechGration Scholar • AI & Python DSA",
      avatarUrl,
      phone: STUDENT_PHONE,
      timezone: "Asia/Kolkata",
      learningGoals: "Master Artificial Intelligence and Data Structures & Algorithms in Python",
    },
    create: {
      userId: user.id,
      headline: "TechGration Scholar • AI & Python DSA",
      avatarUrl,
      phone: STUDENT_PHONE,
      timezone: "Asia/Kolkata",
      learningGoals: "Master Artificial Intelligence and Data Structures & Algorithms in Python",
    },
  })
  console.log("User Profile saved.")

  // 6. Enroll in AI (Priority Course) and DSA in Python
  const enrollCourses = [
    { id: aiCourse.id, title: aiCourse.title, isPriority: true },
    { id: dsaCourse.id, title: dsaCourse.title, isPriority: false },
  ]

  for (const c of enrollCourses) {
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: c.id,
      },
    })

    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: c.id,
          status: "ACTIVE",
          progressPct: 0,
          enrolledAt: new Date(),
          lastAccessedAt: c.isPriority ? new Date(Date.now() + 1000) : new Date(),
        },
      })
      console.log(`Created enrollment in "${c.title}"`)
    } else {
      await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: "ACTIVE",
          lastAccessedAt: c.isPriority ? new Date(Date.now() + 1000) : existingEnrollment.lastAccessedAt,
        },
      })
      console.log(`Updated enrollment in "${c.title}" to ACTIVE`)
    }
  }

  // 7. Create welcome notification
  const existingNotif = await db.notification.findFirst({
    where: {
      userId: user.id,
      title: { contains: "Welcome to TechGration" },
    },
  })

  if (!existingNotif) {
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to TechGration Learning Portal! 🚀",
        message: `Welcome Satyam! You have been enrolled in Artificial Intelligence & Modern Deep Learning Systems and Data Structures & Algorithms in Python.`,
        href: "/student/dashboard",
        read: false,
      },
    })
    console.log("In-app welcome notification created.")
  }

  // 8. Verification query
  const verifiedUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              approvalStatus: true,
              isPublished: true,
              thumbnailUrl: true,
            },
          },
        },
      },
    },
  })

  console.log("=== ENROLLMENT VERIFICATION COMPLETED ===")
  console.log(JSON.stringify(verifiedUser, null, 2))
}

main()
  .then(() => {
    console.log("SUCCESS!")
    process.exit(0)
  })
  .catch((e) => {
    console.error("ERROR:", e)
    process.exit(1)
  })
