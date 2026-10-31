import "dotenv/config"
import { db } from "../src/server/db"

const ADMIN_ID = "6acea351533d6b57ff7c53ff"
const TEACHER_ID = "6acea351533d6b57ff7c5401"
const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const LEADERSHIP_THUMBNAIL =
  "https://res.cloudinary.com/dozazvcec/image/upload/v1793285856/techgration_lms/courses/course_leadership_1793285854237.jpg"

const STUDENT_EMAIL = "gunjalsaisha07@gmail.com"

async function main() {
  console.log("=== ONBOARDING LEADERSHIP & MANAGEMENT COURSE & ENROLLING GUNJAL SAISHA ===")

  // 1. Verify Gunjal saisha user
  const user = await db.user.findFirst({
    where: { email: STUDENT_EMAIL },
    include: { profile: true, enrollments: true },
  })

  if (!user) {
    throw new Error(`User with email ${STUDENT_EMAIL} not found!`)
  }
  console.log(`✓ Found Student: "${user.name}" (${user.id})`)

  // 2. Check or Create Leadership & Management Course
  let leadershipCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { equals: "Leadership & Management", mode: "insensitive" } },
        { slug: { startsWith: "leadership-management" } },
      ],
    },
  })

  if (!leadershipCourse) {
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `leadership-management-${slugSuffix}`
    console.log(`Creating course "Leadership & Management" (slug: ${slug})...`)

    leadershipCourse = await db.course.create({
      data: {
        slug,
        title: "Leadership & Management",
        subtitle:
          "Master Strategic Leadership, People Management, Executive Communication, and Team Performance",
        description:
          "A transformative executive curriculum in Leadership & Management designed for modern engineering and technology leaders. Master team empowerment, emotional intelligence, strategic organizational thinking, conflict mediation, agile team dynamics, executive presence, and driving high-performance outcomes.",
        thumbnailUrl: LEADERSHIP_THUMBNAIL,
        category: "Leadership & Management",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorId: TEACHER_ID,
        createdById: TEACHER_ID,
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Master situational leadership styles, emotional intelligence, and team motivation principles",
          "Implement Agile frameworks, OKR goal setting, and strategic delivery roadmaps",
          "Excel at executive communication, stakeholder management, and high-stakes negotiation",
          "Build psychological safety, foster innovation, and resolve team conflict proactively",
          "Navigate organizational transformation and lead cross-functional global teams",
          "Earn the official TechGration Leadership & Management Professional Credential",
        ],
        prerequisites: [
          "Desire to grow leadership, management, and team collaboration capabilities",
          "Openness to professional self-reflection and communication development",
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
    console.log(`✓ Created & Approved Course: "${leadershipCourse.title}" (${leadershipCourse.id})`)
  } else {
    console.log(`✓ Found existing Course: "${leadershipCourse.title}" (${leadershipCourse.id})`)
    leadershipCourse = await db.course.update({
      where: { id: leadershipCourse.id },
      data: {
        approvalStatus: "APPROVED",
        isPublished: true,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
  }

  // 3. Update User Profile
  await db.userProfile.upsert({
    where: { userId: user.id },
    update: {
      headline: "TechGration Scholar • AI & Leadership Management",
      learningGoals:
        "Master Artificial Intelligence, Deep Learning, Strategic Leadership & Team Management",
    },
    create: {
      userId: user.id,
      headline: "TechGration Scholar • AI & Leadership Management",
      learningGoals:
        "Master Artificial Intelligence, Deep Learning, Strategic Leadership & Team Management",
      timezone: "Asia/Kolkata",
    },
  })
  console.log(`✓ Updated User Profile for ${user.name}`)

  // 4. Enroll in Leadership & Management (secondary) and refresh AI (primary, top of dashboard)
  const enrollmentsToSet = [
    {
      courseId: leadershipCourse.id,
      title: leadershipCourse.title,
      lastAccessedAt: new Date(),
    },
    {
      courseId: AI_COURSE_ID,
      title: "Artificial Intelligence & Modern Deep Learning Systems",
      lastAccessedAt: new Date(Date.now() + 10000), // Primary track on top
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
      console.log(`✓ Refreshed enrollment in "${item.title}" to ACTIVE`)
    }
  }

  // 5. In-app Welcome Notification for Leadership course
  const notifTitle = `🎉 Welcome to Leadership & Management!`
  const notifMessage = `Welcome ${user.name}! You are now enrolled in Leadership & Management alongside your Artificial Intelligence program. Access your curriculum and live classes anytime.`

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
    headline: verified?.profile?.headline,
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
    console.error("Operation failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
