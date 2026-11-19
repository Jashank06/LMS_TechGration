import "dotenv/config"
import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

const EMAIL = "kushwahmehul89@gmail.com"
const DEFAULT_PASSWORD = "TechGration@2026"

async function main() {
  console.log(`=== RESETTING PASSWORD FOR ${EMAIL} ===`)

  const user = await db.user.findUnique({
    where: { email: EMAIL.toLowerCase().trim() },
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

  if (!user) {
    throw new Error(`User with email ${EMAIL} not found!`)
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
    },
  })

  // Verify bcrypt match
  const isMatch = await bcrypt.compare(DEFAULT_PASSWORD, passwordHash)

  console.log("✓ Password reset successfully!")
  console.log("Verification:", {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    status: updatedUser.status,
    role: updatedUser.role,
    passwordVerified: isMatch,
    enrolledCourses: user.enrollments.map((e) => e.course.title),
    phone: user.profile?.phone,
  })
}

main()
  .catch((err) => {
    console.error("Password reset failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
