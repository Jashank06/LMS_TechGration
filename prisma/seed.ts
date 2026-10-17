import { PrismaClient, Role, UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Purging all fake, mock, and seeded data from MongoDB...")

  // Delete all records in correct order
  await prisma.auditLog.deleteMany({})
  await prisma.paymentTransaction.deleteMany({})
  await prisma.coupon.deleteMany({})
  await prisma.platformSetting.deleteMany({})
  await prisma.rolePermission.deleteMany({})
  await prisma.announcement.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.certificate.deleteMany({})
  await prisma.attendanceRecord.deleteMany({})
  await prisma.liveClass.deleteMany({})
  await prisma.assignmentSubmission.deleteMany({})
  await prisma.assignment.deleteMany({})
  await prisma.attemptAnswer.deleteMany({})
  await prisma.assessmentAttempt.deleteMany({})
  await prisma.questionOption.deleteMany({})
  await prisma.question.deleteMany({})
  await prisma.assessment.deleteMany({})
  await prisma.lessonDiscussion.deleteMany({})
  await prisma.learningNote.deleteMany({})
  await prisma.bookmark.deleteMany({})
  await prisma.lessonProgress.deleteMany({})
  await prisma.enrollment.deleteMany({})
  await prisma.lessonResource.deleteMany({})
  await prisma.lesson.deleteMany({})
  await prisma.module.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.category.deleteMany({ where: { parentId: { not: null } } })
  await prisma.category.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.userProfile.deleteMany({})
  await prisma.user.deleteMany({})

  console.log("✨ All fake/seeded data completely removed!")

  // Password hashes
  const adminPasswordHash = bcrypt.hashSync("Techgration.live", 10)
  const teacherPasswordHash = bcrypt.hashSync("Teacher@123", 10)
  const studentPasswordHash = bcrypt.hashSync("Student@123", 10)

  // 1. Clean Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@techgration.live",
      passwordHash: adminPasswordHash,
      name: "Platform Administrator",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          headline: "System Administrator",
          bio: "Platform operations & academic management.",
          timezone: "Asia/Kolkata",
        },
      },
    },
  })

  // 2. Clean Teacher User
  const teacher = await prisma.user.create({
    data: {
      email: "jaykumar0305@gmail.com",
      passwordHash: teacherPasswordHash,
      name: "Faculty Instructor",
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          headline: "Senior Course Instructor",
          bio: "Curriculum designer and instructor.",
          timezone: "Asia/Kolkata",
        },
      },
    },
  })

  // 3. Clean Student User
  const student = await prisma.user.create({
    data: {
      email: "student@techgration.com",
      passwordHash: studentPasswordHash,
      name: "Enrolled Student",
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          headline: "Student Learner",
          bio: "Student pursuing technical certifications.",
          timezone: "Asia/Kolkata",
        },
      },
    },
  })

  console.log("✅ Initialized 3 clean foundational accounts:")
  console.log(`  - Admin   : ${admin.email} (Password: Admin@123)`)
  console.log(`  - Teacher : ${teacher.email} (Password: Teacher@123)`)
  console.log(`  - Student : ${student.email} (Password: Student@123)`)
  console.log("🎉 Database is now 100% clean with ZERO dummy courses, enrollments, or classes!")
}

main()
  .catch((e) => {
    console.error("Error executing clean reset:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
