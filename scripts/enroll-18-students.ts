import bcrypt from "bcryptjs"
import { db } from "../src/server/db"

interface StudentSeed {
  name: string
  email: string
  headline?: string
}

const COURSE_ID = "6ad283b4e196d0b8fbfb9eae" // Artificial Intelligence & Modern Deep Learning Systems
const DEFAULT_PASSWORD = "TechGration@2026"

const STUDENTS: StudentSeed[] = [
  { name: "Nakul Sharma", email: "nakulsharma8952@gmail.com" },
  { name: "Priyanshi Gupta", email: "priyanshigupta63760@gmail.com" },
  { name: "Rishika Raman Jha", email: "rishikaramanjha@gmail.com" },
  { name: "Sneha Kamboj", email: "snehakamboj003@gmail.com" },
  { name: "Gayatri Mohanty", email: "mohantyg724@gmail.com" },
  { name: "Tanmay Sharma", email: "tanmaysharma.ai09@gmail.com" },
  { name: "Niharika Rajput", email: "rniharika125@gmail.com" },
  { name: "Divyansh Namdev", email: "2600839@medicaps.ac.in" },
  { name: "Anas Warsi", email: "anaswarsi7476@gmail.com" },
  { name: "Nishant Singh", email: "nishantsinghrajput2612@gmail.com" },
  { name: "Priyanka Singh", email: "lilcanny877@gmail.com" },
  { name: "Yashi Jain", email: "yashijain0510@gmail.com" },
  { name: "Aayush Rawal", email: "rawal.aayush07@gmail.com" },
  { name: "Pragya Gupta", email: "guptapragya1602@gmail.com" },
  { name: "Hriturajsingh A", email: "hriturajsingh9a30@gmail.com" },
  { name: "Raisatyam", email: "raisatyam547@gmail.com" },
  { name: "Safalsingh", email: "safalsingh5002@gmail.com" },
  { name: "S Mujahid", email: "s04mujahid@gmail.com" },
]

async function main() {
  console.log(`Starting enrollment of ${STUDENTS.length} students into course ${COURSE_ID}...`)

  const course = await db.course.findUnique({
    where: { id: COURSE_ID },
    select: { id: true, title: true },
  })

  if (!course) {
    throw new Error(`Course with ID ${COURSE_ID} not found!`)
  }

  console.log(`Target Course Found: "${course.title}"`)

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  const results = []

  for (const student of STUDENTS) {
    const cleanEmail = student.email.toLowerCase().trim()
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

    // 1. Upsert User
    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: student.name,
        role: "STUDENT",
        status: "ACTIVE",
        passwordHash,
      },
      create: {
        email: cleanEmail,
        name: student.name,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
      },
    })

    // 2. Upsert Profile
    await db.userProfile.upsert({
      where: { userId: user.id },
      update: {
        headline: "AI & Deep Learning Fellow • TechGration LMS",
        avatarUrl,
        timezone: "Asia/Kolkata",
        learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
      },
      create: {
        userId: user.id,
        headline: "AI & Deep Learning Fellow • TechGration LMS",
        avatarUrl,
        timezone: "Asia/Kolkata",
        learningGoals: "Master Machine Learning, Deep Neural Networks & Transformer Architectures",
      },
    })

    // 3. Upsert Enrollment
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: COURSE_ID,
      },
    })

    if (!existingEnrollment) {
      await db.enrollment.create({
        data: {
          userId: user.id,
          courseId: COURSE_ID,
          status: "ACTIVE",
          progressPct: 0,
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        },
      })
    } else {
      await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: { status: "ACTIVE" },
      })
    }

    // 4. Create in-app Welcome Notification
    const existingNotif = await db.notification.findFirst({
      where: {
        userId: user.id,
        title: { contains: "Welcome to Artificial Intelligence" },
      },
    })

    if (!existingNotif) {
      await db.notification.create({
        data: {
          userId: user.id,
          title: `🎉 Welcome to ${course.title}!`,
          message: `You have been officially enrolled by TechGration Technologies. Start your learning journey today!`,
          href: `/student/courses/${COURSE_ID}`,
          read: false,
        },
      })
    }

    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
      password: DEFAULT_PASSWORD,
      course: course.title,
      status: "ACTIVE",
    })
  }

  console.log(`\nSuccessfully enrolled all ${results.length} students!\n`)
  console.table(
    results.map((r, i) => ({
      "#": i + 1,
      Name: r.name,
      Email: r.email,
      Password: r.password,
      Status: r.status,
    }))
  )
}

main()
  .catch((e) => {
    console.error("Error during enrollment:", e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
