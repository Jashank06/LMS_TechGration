import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const ADMIN_ID = "6acea351533d6b57ff7c53ff"
const DEFAULT_PASSWORD = "TechGration@2026"

const AUTOCAD_THUMBNAIL =
  "https://res.cloudinary.com/dozazvcec/image/upload/v1792770309/techgration_lms/courses/course_autocad_1792770307456.jpg"
const MATLAB_THUMBNAIL =
  "https://res.cloudinary.com/dozazvcec/image/upload/v1792770311/techgration_lms/courses/course_matlab_1792770310311.jpg"

const STUDENT = {
  name: "MAKWANA NAYAN SURESHBHAI",
  email: "nayanmakwana0609@gmail.com",
  phone: "+919316693345",
  headline: "TechGration Scholar • AI, AutoCAD & MATLAB",
  learningGoals:
    "Master Artificial Intelligence, Computer-Aided Design (AutoCAD), and Numerical Computing & Simulation (MATLAB)",
}

async function main() {
  console.log("=== ONBOARDING MAKWANA NAYAN: AI & AUTOCAD & MATLAB ===")

  // 1. Verify Artificial Intelligence Course
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found in database!`)
  }
  console.log(`✓ Verified AI Course: "${aiCourse.title}" (${aiCourse.id})`)

  // 2. Check or Create AutoCAD Course
  let autocadCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { contains: "AutoCAD", mode: "insensitive" } },
        { slug: { contains: "autocad", mode: "insensitive" } },
      ],
    },
  })

  if (!autocadCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `autocad-design-${slugSuffix}`
    console.log(`Creating course "AutoCAD Design" (slug: ${slug})...`)

    autocadCourse = await db.course.create({
      data: {
        slug,
        title: "AutoCAD Design",
        subtitle:
          "Master 2D Drafting, 3D Modeling, Engineering Drawings, and Architectural Design",
        description:
          "A comprehensive industry-aligned curriculum in Computer-Aided Design (CAD) using AutoCAD. Master 2D precision drafting, geometric constraints, layers & blocks, dimensioning standards, 3D solid and surface modeling, rendering, and technical blueprint preparation for engineering disciplines.",
        thumbnailUrl: AUTOCAD_THUMBNAIL,
        category: "Engineering & CAD",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Master 2D precision drafting, geometric construction, and dimensioning standards",
          "Create, organize, and manage complex drawings using layers, blocks, and dynamic attributes",
          "Develop 3D solid models, isometric views, surface geometries, and realistic renders",
          "Produce industry-ready blueprints complying with international drafting standards",
          "Earn the official TechGration AutoCAD Design Professional Credential",
        ],
        prerequisites: [
          "Foundational interest in technical drawing, drafting, or design",
          "Basic computer operational skills",
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
    console.log(`✓ Created & Approved AutoCAD Course: "${autocadCourse.title}" (${autocadCourse.id})`)
  } else {
    console.log(`✓ Found existing AutoCAD course: "${autocadCourse.title}" (${autocadCourse.id})`)
    autocadCourse = await db.course.update({
      where: { id: autocadCourse.id },
      data: {
        approvalStatus: "APPROVED",
        isPublished: true,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
  }

  // 3. Check or Create MATLAB Course
  let matlabCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { contains: "MATLAB", mode: "insensitive" } },
        { slug: { contains: "matlab", mode: "insensitive" } },
      ],
    },
  })

  if (!matlabCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `matlab-simulink-${slugSuffix}`
    console.log(`Creating course "MATLAB & Simulink" (slug: ${slug})...`)

    matlabCourse = await db.course.create({
      data: {
        slug,
        title: "MATLAB & Simulink",
        subtitle:
          "Master Numerical Computing, Data Analysis, Algorithm Development, and System Simulation",
        description:
          "An industry-standard hands-on curriculum in MATLAB and Simulink. Master matrix computing, numerical analysis, scientific data visualization, control systems, signal processing algorithms, and dynamic system modeling with Simulink.",
        thumbnailUrl: MATLAB_THUMBNAIL,
        category: "Computational Science",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Master MATLAB matrix operations, vectorization, functions, and mathematical computing",
          "Build sophisticated data visualizations, 2D/3D plots, and statistical analyses",
          "Design and simulate dynamic engineering systems using Simulink block diagrams",
          "Implement digital signal processing, control systems, and automated numerical workflows",
          "Earn the official TechGration MATLAB & Simulink Professional Credential",
        ],
        prerequisites: [
          "Basic mathematics and linear algebra fundamentals",
          "Interest in numerical computation and engineering simulation",
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
    console.log(`✓ Created & Approved MATLAB Course: "${matlabCourse.title}" (${matlabCourse.id})`)
  } else {
    console.log(`✓ Found existing MATLAB course: "${matlabCourse.title}" (${matlabCourse.id})`)
    matlabCourse = await db.course.update({
      where: { id: matlabCourse.id },
      data: {
        approvalStatus: "APPROVED",
        isPublished: true,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
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
  console.log(`✓ User record saved (ID: ${user.id})`)

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

  // 5. Enrollments: MATLAB, AutoCAD, and AI (AI on top with newest lastAccessedAt)
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

  // 6. In-app Welcome Notification
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

  // 7. Verify
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
