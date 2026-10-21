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
const DSA_PYTHON_ID = "6ad77a4c0b2b9874d3ba65eb" // Data Structures & Algorithms in Python
const DEFAULT_PASSWORD = "TechGration@2026"
const ADMIN_ID = "6acea351533d6b57ff7c53ff"

interface StudentInput {
  name: string
  email: string
  phone: string
  assignedCourseTitle: string
  assignedCourseId?: string
  headline: string
  learningGoals: string
}

const STUDENTS: StudentInput[] = [
  {
    name: "Sakshamsingh Dev",
    email: "sakshamsingh123dev@gmail.com",
    phone: "+919693052171",
    assignedCourseTitle: "Data Structures & Algorithms in Python",
    assignedCourseId: DSA_PYTHON_ID,
    headline: "TechGration Scholar • AI & Python DSA",
    learningGoals: "Master Artificial Intelligence, Deep Learning and Data Structures & Algorithms in Python",
  },
  {
    name: "Rushi",
    email: "nil.hirani78@gmail.com",
    phone: "+919925291342",
    assignedCourseTitle: "IOT & Robotics",
    headline: "TechGration Scholar • AI & IoT Robotics",
    learningGoals: "Master Artificial Intelligence, Edge Computing and IoT & Autonomous Robotics",
  },
  {
    name: "Kirtan Jethva",
    email: "kirtanjethva104@gmail.com",
    phone: "+919898715448",
    assignedCourseTitle: "IOT & Robotics",
    headline: "TechGration Scholar • AI & IoT Robotics",
    learningGoals: "Master Artificial Intelligence, Embedded Systems and IoT & Autonomous Robotics",
  },
]

async function uploadThumbnail(): Promise<string> {
  const localImageRelative = "public/brand/iot_robotics.jpg"
  const localImagePath = path.resolve(process.cwd(), localImageRelative)

  if (fs.existsSync(localImagePath)) {
    try {
      console.log("Uploading IOT & Robotics thumbnail to Cloudinary...")
      const res = await cloudinary.uploader.upload(localImagePath, {
        folder: "techgration_lms/courses",
        public_id: `course_iot_robotics_${Date.now()}`,
        overwrite: true,
        resource_type: "image",
        tags: ["techgration", "course_thumbnail", "iot_robotics"],
        transformation: [
          { width: 1280, height: 720, crop: "fill", gravity: "auto" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      })
      console.log("Cloudinary upload successful:", res.secure_url)
      return res.secure_url
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local /brand/iot_robotics.jpg:", err)
      return "/brand/iot_robotics.jpg"
    }
  }

  return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1280&auto=format&fit=crop"
}

async function main() {
  console.log("=== STARTING ONBOARDING FOR 3 STUDENTS & IOT ROBOTICS COURSE ===")

  // 1. Verify Artificial Intelligence Course
  const aiCourse = await db.course.findUnique({
    where: { id: AI_COURSE_ID },
    select: { id: true, title: true },
  })
  if (!aiCourse) {
    throw new Error(`AI Course (${AI_COURSE_ID}) not found in database!`)
  }
  console.log(`Verified AI Course: "${aiCourse.title}" (${aiCourse.id})`)

  // 2. Verify DSA in Python Course
  let dsaCourse = await db.course.findUnique({
    where: { id: DSA_PYTHON_ID },
    select: { id: true, title: true },
  })
  if (!dsaCourse) {
    dsaCourse = await db.course.findFirst({
      where: {
        OR: [
          { title: { contains: "Data Structures & Algorithms in Python", mode: "insensitive" } },
          { title: { contains: "DSA in Python", mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true },
    })
  }
  if (!dsaCourse) {
    throw new Error("DSA in Python course not found!")
  }
  console.log(`Verified DSA Course: "${dsaCourse.title}" (${dsaCourse.id})`)

  // 3. Find or Create IOT & Robotics Course
  let iotCourse = await db.course.findFirst({
    where: {
      OR: [
        { title: { contains: "IOT & Robotics", mode: "insensitive" } },
        { title: { contains: "IoT and Robotics", mode: "insensitive" } },
        { title: { contains: "Robotics", mode: "insensitive" } },
      ],
    },
  })

  if (!iotCourse) {
    const thumbnailUrl = await uploadThumbnail()
    const slugSuffix = Math.random().toString(36).substring(2, 10)
    const slug = `iot-robotics-${slugSuffix}`
    console.log(`Creating course "IOT & Robotics" (slug: ${slug})...`)

    iotCourse = await db.course.create({
      data: {
        title: "IOT & Robotics",
        slug,
        subtitle: "Master Internet of Things, Embedded Systems, Sensors, Microcontrollers, and Autonomous Robotics",
        description: "A hands-on professional curriculum in Internet of Things (IoT) and Robotics. Covers Arduino, ESP32, Raspberry Pi, sensor integration, actuator control, IoT communication protocols (MQTT, HTTP, BLE), cloud telemetry, Edge AI, and autonomous mobile robot system engineering.",
        thumbnailUrl,
        category: "IoT & Robotics",
        level: "ALL_LEVELS",
        format: "HYBRID",
        instructorName: "Vineet Sir",
        instructorTitle: "Senior Course Instructor",
        durationHours: 24,
        outcomes: [
          "Design and build IoT systems using ESP32, Arduino, and Raspberry Pi",
          "Interface real-world sensors (temperature, ultrasonic, IMU, LiDAR) and actuators",
          "Implement secure wireless communication protocols: MQTT, HTTP REST, BLE, and WebSocket",
          "Connect edge devices to cloud IoT platforms for live telemetry and data streaming",
          "Construct and program autonomous mobile robots with obstacle avoidance and motor control",
          "Earn the official TechGration IOT & Robotics Professional Credential",
        ],
        prerequisites: [
          "Basic programming knowledge (C/C++ or Python)",
          "Foundational interest in electronics, microcontrollers, and hardware",
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
    console.log(`Created & Approved IOT & Robotics Course: "${iotCourse.title}" (${iotCourse.id})`)
  } else {
    console.log(`Found existing IOT & Robotics course: "${iotCourse.title}" (${iotCourse.id})`)
    // Ensure approved and published
    iotCourse = await db.course.update({
      where: { id: iotCourse.id },
      data: {
        approvalStatus: "APPROVED",
        isPublished: true,
        reviewedById: ADMIN_ID,
        reviewedAt: new Date(),
      },
    })
    console.log(`Updated IOT & Robotics status to APPROVED & Published.`)
  }

  // 4. Create and Enroll Each Student
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const s of STUDENTS) {
    console.log(`\n--- Processing Student: ${s.name} (${s.email}) ---`)
    const cleanEmail = s.email.toLowerCase().trim()
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.name)}&backgroundColor=0ea5e9,6366f1,8b5cf6,ec4899,f59e0b`

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
    console.log(`User confirmed: ${user.name} (${user.id})`)

    // Upsert UserProfile
    await db.userProfile.upsert({
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
    console.log(`Profile updated for ${user.name}`)

    // Determine target secondary course
    const secondaryCourseId = s.assignedCourseTitle.toLowerCase().includes("python") || s.assignedCourseTitle.toLowerCase().includes("dsa")
      ? dsaCourse.id
      : iotCourse.id
    const secondaryCourseTitle = s.assignedCourseTitle.toLowerCase().includes("python") || s.assignedCourseTitle.toLowerCase().includes("dsa")
      ? dsaCourse.title
      : iotCourse.title

    // Enroll in AI (PRIORITY: TOP POSITION with newest lastAccessedAt)
    // Then secondary course
    const enrollmentsToSet = [
      {
        courseId: secondaryCourseId,
        title: secondaryCourseTitle,
        lastAccessedAt: new Date(), // Secondary course
      },
      {
        courseId: aiCourse.id,
        title: aiCourse.title,
        lastAccessedAt: new Date(Date.now() + 10000), // Main Priority course (newest timestamp)
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
        console.log(`-> Enrolled in "${item.title}"`)
      } else {
        await db.enrollment.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            lastAccessedAt: item.lastAccessedAt,
          },
        })
        console.log(`-> Updated enrollment in "${item.title}" to ACTIVE (Priority timestamp refreshed)`)
      }
    }

    // Welcome Notification
    const notifTitle = "Welcome to TechGration Learning Portal! 🚀"
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
          message: `Welcome ${s.name}! You are enrolled in ${aiCourse.title} (Primary Track) and ${secondaryCourseTitle}. Access your curriculum and live classes anytime.`,
          href: "/student/dashboard",
          read: false,
        },
      })
      console.log(`-> Notification created for ${s.name}`)
    }
  }

  // 5. Verification query of all three students
  console.log("\n=== VERIFYING FINAL STUDENT RECORDS IN DATABASE ===")
  const verifiedStudents = await db.user.findMany({
    where: {
      email: {
        in: STUDENTS.map((s) => s.email.toLowerCase().trim()),
      },
    },
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
            },
          },
        },
        orderBy: { lastAccessedAt: "desc" },
      },
    },
  })

  for (const stu of verifiedStudents) {
    console.log(`\nStudent: ${stu.name} (${stu.email}) | Role: ${stu.role} | Status: ${stu.status}`)
    console.log(`Phone: ${stu.profile?.phone} | Headline: ${stu.profile?.headline}`)
    console.log("Enrolled Courses (in priority order):")
    stu.enrollments.forEach((e, idx) => {
      console.log(`  ${idx + 1}. [${idx === 0 ? "PRIMARY PRIORITY" : "ASSIGNED"}] ${e.course.title} (Status: ${e.status}, Approval: ${e.course.approvalStatus})`)
    })
  }

  console.log("\n=== ALL 3 STUDENTS REGISTERED & COURSES CONFIGURED SUCCESSFULLY ===")
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error("FATAL ERROR:", e)
    process.exit(1)
  })
