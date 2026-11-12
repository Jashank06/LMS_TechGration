import "dotenv/config"
import { db } from "../src/server/db"

const AI_COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const STUDENT_EMAIL = "tarangdhodi821@gmail.com"

async function main() {
  console.log("=== ENROLLING TARANGKUMAR IN ARTIFICIAL INTELLIGENCE ===")

  const user = await db.user.findUnique({
    where: { email: STUDENT_EMAIL },
    include: { profile: true },
  })

  if (!user) {
    throw new Error(`User with email ${STUDENT_EMAIL} not found!`)
  }

  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true, approvalStatus: true, isPublished: true },
  })

  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found!`)
  }

  // 1. Update Profile Headline & Learning Goals to include AI
  await db.userProfile.update({
    where: { userId: user.id },
    data: {
      headline: "TechGration Scholar • AI & Machine Learning",
      learningGoals:
        "Master Machine Learning, Deep Neural Networks, Transformer Architectures & Applied AI Systems",
    },
  })
  console.log(`✓ Updated UserProfile for AI & ML`)

  // 2. Create or Update Enrollment for AI
  const existingEnrollment = await db.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: aiCourse.id,
    },
  })

  let enrollment
  if (!existingEnrollment) {
    enrollment = await db.enrollment.create({
      data: {
        userId: user.id,
        courseId: aiCourse.id,
        status: "ACTIVE",
        progressPct: 0,
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
      },
    })
    console.log(`✓ Created ACTIVE AI enrollment (ID: ${enrollment.id})`)
  } else {
    enrollment = await db.enrollment.update({
      where: { id: existingEnrollment.id },
      data: {
        status: "ACTIVE",
        lastAccessedAt: new Date(),
      },
    })
    console.log(`✓ Updated AI enrollment to ACTIVE (ID: ${enrollment.id})`)
  }

  // 3. Welcome Notification for AI Course
  const notifTitle = `🎉 Welcome to ${aiCourse.title}!`
  const notifMessage = `Welcome ${user.name}! You have been officially enrolled by TechGration Technologies. Start your learning journey today!`

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
        href: `/student/courses/${aiCourse.id}`,
        read: false,
      },
    })
    console.log(`✓ Welcome notification sent for AI course`)
  }

  // 4. Verification Query
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
    headline: verified?.profile?.headline,
    enrolledCourses: verified?.enrollments.map((e) => ({
      courseTitle: e.course.title,
      courseId: e.courseId,
      enrollmentId: e.id,
      status: e.status,
    })),
  })
  console.log("========================================================")
}

main()
  .catch((err) => {
    console.error("AI Enrollment failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
