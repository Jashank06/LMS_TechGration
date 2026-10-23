import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const ADMIN_ID = "6acea351533d6b57ff7c53ff"
const DEFAULT_PASSWORD = "TechGration@2026"
const VLSI_THUMBNAIL = "https://res.cloudinary.com/dozazvcec/image/upload/v1792756736/techgration_lms/courses/course_vlsi_1792756734426.jpg"

interface StudentEntry {
  name: string
  email: string
  phone: string
  headline: string
  learningGoals: string
}

const STUDENTS: StudentEntry[] = [
  {
    name: "Ishika baldaniya",
    email: "ishikabaldaniya10@gmail.com",
    phone: "+919213402583",
    headline: "TechGration Scholar • AI & VLSI Design",
    learningGoals: "Master Artificial Intelligence, Deep Learning, Digital IC Design & VLSI Architecture",
  },
  {
    name: "Rana Anvevsha HiteshKumar",
    email: "anvesharana1977@gmail.com",
    phone: "+919925991977",
    headline: "TechGration Scholar • AI & VLSI Design",
    learningGoals: "Master Artificial Intelligence, Deep Learning, Digital IC Design & VLSI Architecture",
  },
]

async function main() {
  console.log("=== STARTING ONBOARDING FOR AI & VLSI STUDENTS ===")

  // 1. Verify Artificial Intelligence Course
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found in database!`)
  }
  console.log(`✓ Verified AI Course: "${aiCourse.title}" (${aiCourse.id})`)

  // 2. Check or Create VLSI Course
  let vlsiCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { contains: "VLSI", mode: "insensitive" } },
        { slug: { contains: "vlsi", mode: "insensitive" } },
      ],
    },
  })

  if (!vlsiCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `vlsi-design-${slugSuffix}`
    console.log(`Creating course "VLSI Design" (slug: ${slug})...`)

    vlsiCourse = await db.course.create({
      data: {
        slug,
        title: "VLSI Design",
        subtitle: "Master Digital IC Design, Verilog HDL, CMOS Circuit Design, and Semiconductor Architecture",
        description:
          "A comprehensive industry-standard curriculum in Very Large Scale Integration (VLSI) and Semiconductor Design. Learn digital logic synthesis, Verilog & SystemVerilog HDL, CMOS inverter & circuit fundamentals, ASIC flow, FPGA implementation, timing analysis (STA), and modern silicon chip design principles.",
        thumbnailUrl: VLSI_THUMBNAIL,
        category: "VLSI & Semiconductor",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Design and verify complex digital integrated circuits using Verilog and SystemVerilog",
          "Understand CMOS layout, digital logic synthesis, and semiconductor physics principles",
          "Master Static Timing Analysis (STA) and clock domain crossing verification",
          "Implement and simulate digital architectures on modern FPGA prototyping platforms",
          "Navigate the complete ASIC design flow from RTL to GDSII fabrication readiness",
          "Earn the official TechGration VLSI Design Professional Credential",
        ],
        prerequisites: [
          "Basic digital electronics and logic gates understanding",
          "Foundational programming or hardware description interest",
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
    console.log(`✓ Created & Approved VLSI Course: "${vlsiCourse.title}" (${vlsiCourse.id})`)
  } else {
    console.log(`✓ Found existing VLSI course: "${vlsiCourse.title}" (${vlsiCourse.id})`)
    vlsiCourse = await db.course.update({
      where: { id: vlsiCourse.id },
      data: {
        approvalStatus: "APPROVED",
        isPublished: true,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
    console.log(`✓ Verified VLSI Course status is APPROVED & Published.`)
  }

  // 3. Create and Enroll Each Student
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const results = []

  for (const s of STUDENTS) {
    const cleanEmail = s.email.toLowerCase().trim()
    console.log(`\n--- Processing Student: ${s.name} (${cleanEmail}) ---`)

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      s.name
    )}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

    // Upsert User
    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: s.name,
        role: "STUDENT",
        status: "ACTIVE",
        passwordHash,
      },
      create: {
        email: cleanEmail,
        name: s.name,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
      },
    })
    console.log(`  ✓ User record saved (ID: ${user.id})`)

    // Upsert UserProfile
    const profile = await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: s.headline,
        avatarUrl,
        phone: s.phone,
        timezone: "Asia/Kolkata",
        learningGoals: s.learningGoals,
      },
      create: {
        userId: user.id,
        headline: s.headline,
        avatarUrl,
        phone: s.phone,
        timezone: "Asia/Kolkata",
        learningGoals: s.learningGoals,
      },
    })
    console.log(`  ✓ UserProfile saved (Phone: ${profile.phone})`)

    // Enrollments: VLSI (Secondary) and AI (Primary priority: newest timestamp)
    const enrollmentsToSet = [
      {
        courseId: vlsiCourse.id,
        title: vlsiCourse.title,
        lastAccessedAt: new Date(), // Secondary track
      },
      {
        courseId: aiCourse.id,
        title: aiCourse.title,
        lastAccessedAt: new Date(Date.now() + 10000), // Primary track (top position)
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

    // In-app Welcome Notification
    const notifTitle = `🎉 Welcome to TechGration Learning Portal!`
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
          message: `Welcome ${s.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${vlsiCourse.title}. Access your curriculum and live classes anytime.`,
          href: `/student/dashboard`,
          read: false,
        },
      })
      console.log(`  ✓ Welcome notification sent`)
    }

    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: profile.phone,
      password: DEFAULT_PASSWORD,
      primaryCourse: aiCourse.title,
      secondaryCourse: vlsiCourse.title,
      status: "ACTIVE",
    })
  }

  // 4. Final verification
  console.log("\n========================================================")
  console.log("FINAL ENROLLMENT VERIFICATION:")
  console.table(
    results.map((r, idx) => ({
      "#": idx + 1,
      Name: r.name,
      Email: r.email,
      Phone: r.phone,
      Password: r.password,
      "Primary Course": r.primaryCourse,
      "Secondary Course": r.secondaryCourse,
      Status: r.status,
    }))
  )
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
