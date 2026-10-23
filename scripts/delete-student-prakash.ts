import "dotenv/config"
import { db } from "../src/server/db"

async function main() {
  const email = "9913957335prakash@gmail.com"
  console.log(`Searching for student with email: ${email}...`)

  const user = await db.user.findFirst({
    where: { email },
    include: {
      profile: true,
      enrollments: true,
      notifications: true,
      sessions: true,
    },
  })

  if (!user) {
    console.log(`Student with email ${email} not found!`)
    return
  }

  console.log(`Found student: ${user.name} (ID: ${user.id})`)

  // Delete related records explicitly to guarantee full clean-up
  const delNotifs = await db.notification.deleteMany({ where: { userId: user.id } })
  console.log(`Deleted notifications: ${delNotifs.count}`)

  const delEnrollments = await db.enrollment.deleteMany({ where: { userId: user.id } })
  console.log(`Deleted enrollments: ${delEnrollments.count}`)

  const delSessions = await db.session.deleteMany({ where: { userId: user.id } })
  console.log(`Deleted sessions: ${delSessions.count}`)

  const delProfile = await db.userProfile.deleteMany({ where: { userId: user.id } })
  console.log(`Deleted profile: ${delProfile.count}`)

  const delUser = await db.user.delete({ where: { id: user.id } })
  console.log(`Successfully deleted user: ${delUser.name} (${delUser.email})`)

  // Verify deletion
  const check = await db.user.findUnique({ where: { id: user.id } })
  if (!check) {
    console.log("✓ Deletion verified: Student record completely removed from MongoDB.")
  } else {
    console.warn("⚠️ Warning: Student record still exists.")
  }
}

main()
  .catch((e) => {
    console.error("Deletion failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
