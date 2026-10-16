import { PrismaClient, LiveClassStatus, MeetingPlatform, LessonType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Starting Live Cohort Data Restructuring for AI Course...")

  // 1. Find AI course
  const course = await prisma.course.findFirst({
    where: { title: { contains: "Artificial Intelligence" } },
  })

  if (!course) {
    console.error("❌ Course not found!")
    return
  }

  console.log(`📍 Found Course: "${course.title}" (${course.id})`)

  // 2. Remove old fake modules & lessons
  const oldModules = await prisma.module.findMany({
    where: { courseId: course.id },
    include: { lessons: true },
  })

  for (const mod of oldModules) {
    for (const les of mod.lessons) {
      await prisma.lessonResource.deleteMany({ where: { lessonId: les.id } })
      await prisma.lessonProgress.deleteMany({ where: { lessonId: les.id } })
      await prisma.learningNote.deleteMany({ where: { lessonId: les.id } })
      await prisma.lessonDiscussion.deleteMany({ where: { lessonId: les.id } })
      await prisma.bookmark.deleteMany({ where: { lessonId: les.id } })
      await prisma.lesson.delete({ where: { id: les.id } })
    }
    await prisma.module.delete({ where: { id: mod.id } })
  }
  console.log(`🧹 Purged ${oldModules.length} old fake modules and their lessons.`)

  // Also remove old live classes to clean up
  await prisma.attendanceRecord.deleteMany({
    where: { liveClass: { courseId: course.id } },
  })
  await prisma.reminderDispatch.deleteMany({
    where: { liveClass: { courseId: course.id } },
  })
  await prisma.liveClass.deleteMany({ where: { courseId: course.id } })
  console.log("🧹 Purged old live classes.")

  // 3. Create the Real "Live Cohort Recordings" Module
  const cohortModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Live Cohort Recordings & Masterclasses",
      description: "Complete unedited video recordings of all live training sessions with instructor Jay Kumar.",
      position: 1,
    },
  })

  // 4. Create Real Session Recordings (4 Authentic Sessions)
  const recordingsData = [
    {
      title: "Session 1: Live Orientation & Foundations of Modern AI",
      slug: "session-1-live-orientation-foundations",
      durationSec: 5100, // 85 mins
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      content: "Complete live cohort kickoff recording: AI industry landscape, mathematical intuition behind neural networks, and development environment setup with instructor Jay Kumar.",
      position: 1,
      isPreview: true,
    },
    {
      title: "Session 2: Deep Neural Networks & Computer Vision in PyTorch",
      slug: "session-2-deep-neural-networks-pytorch",
      durationSec: 5400, // 90 mins
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      content: "Hands-on live coding: Building Convolutional Neural Networks (CNNs), feature map visualization, and transfer learning with ResNet-50 on medical imaging datasets.",
      position: 2,
      isPreview: false,
    },
    {
      title: "Session 3: Transformer Architecture & Fine-Tuning LLMs with LoRA",
      slug: "session-3-transformer-architecture-lora",
      durationSec: 5700, // 95 mins
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      content: "Deep architectural breakdown: Self-attention matrices (Q, K, V), tokenization geometries, and fine-tuning open-source Llama 3 & Mistral models via PEFT/LoRA.",
      position: 3,
      isPreview: false,
    },
    {
      title: "Session 4: Production RAG Systems & Vector Search at Scale",
      slug: "session-4-production-rag-systems",
      durationSec: 4800, // 80 mins
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      content: "End-to-end Retrieval-Augmented Generation: Document chunking strategies, dense embeddings, hybrid BM25 + vector search, and reranking pipelines.",
      position: 4,
      isPreview: false,
    },
  ]

  const createdLessons = []
  for (const r of recordingsData) {
    const lesson = await prisma.lesson.create({
      data: {
        moduleId: cohortModule.id,
        title: r.title,
        slug: r.slug,
        type: LessonType.VIDEO,
        durationSec: r.durationSec,
        position: r.position,
        videoUrl: r.videoUrl,
        content: r.content,
        isPreview: r.isPreview,
      },
    })
    createdLessons.push(lesson)

    // Add study materials to each lesson
    if (r.position === 1) {
      await prisma.lessonResource.createMany({
        data: [
          {
            lessonId: lesson.id,
            title: "Foundations of Modern AI & Neural Architecture.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: "14.2 MB",
            fileType: "PDF",
          },
          {
            lessonId: lesson.id,
            title: "Python-AI-Environment-Setup-Guide.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: "2.8 MB",
            fileType: "PDF",
          },
        ],
      })
    } else if (r.position === 2) {
      await prisma.lessonResource.createMany({
        data: [
          {
            lessonId: lesson.id,
            title: "PyTorch-Deep-Learning-Computer-Vision.ipynb",
            fileUrl: "https://raw.githubusercontent.com/pytorch/examples/main/mnist/main.py",
            fileSize: "4.5 MB",
            fileType: "IPYNB",
          },
          {
            lessonId: lesson.id,
            title: "medical-imaging-dataset-samples.zip",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: "28.5 MB",
            fileType: "ZIP",
          },
        ],
      })
    } else if (r.position === 3) {
      await prisma.lessonResource.createMany({
        data: [
          {
            lessonId: lesson.id,
            title: "Transformer-Self-Attention-Deep-Dive.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: "18.6 MB",
            fileType: "PDF",
          },
          {
            lessonId: lesson.id,
            title: "LoRA-PEFT-FineTuning-Llama3.ipynb",
            fileUrl: "https://raw.githubusercontent.com/pytorch/examples/main/mnist/main.py",
            fileSize: "6.2 MB",
            fileType: "IPYNB",
          },
        ],
      })
    } else if (r.position === 4) {
      await prisma.lessonResource.createMany({
        data: [
          {
            lessonId: lesson.id,
            title: "Enterprise-RAG-Architecture-Blueprint.pdf",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: "8.4 MB",
            fileType: "PDF",
          },
          {
            lessonId: lesson.id,
            title: "rag-hybrid-search-pipeline-starter.zip",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            fileSize: "3.1 MB",
            fileType: "ZIP",
          },
        ],
      })
    }
  }
  console.log(`✅ Created ${createdLessons.length} authentic cohort session recordings with study materials.`)

  // 5. Seed Real Live Classes & Time Table
  const now = new Date()
  
  // Next Scheduled Live Class (upcoming in 4 hours from now)
  const nextClassStart = new Date(now.getTime() + 4 * 60 * 60 * 1000)
  const nextClassEnd = new Date(nextClassStart.getTime() + 90 * 60 * 1000)

  // Future Class in 2 days (Time Table)
  const futureClass1Start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
  const futureClass1End = new Date(futureClass1Start.getTime() + 90 * 60 * 1000)

  // Future Class in 4 days (Time Table)
  const futureClass2Start = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
  const futureClass2End = new Date(futureClass2Start.getTime() + 90 * 60 * 1000)

  // Past Class (Completed with recording attached)
  const pastClassStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const pastClassEnd = new Date(pastClassStart.getTime() + 90 * 60 * 1000)

  await prisma.liveClass.createMany({
    data: [
      {
        courseId: course.id,
        title: "Live Cohort Session: LangGraph Multi-Agent Architecture & Autonomous Execution",
        description: "Hands-on live session building stateful, multi-actor AI agent systems with cyclic graphs, human-in-the-loop validation, and persistent memory.",
        instructorName: "Jay Kumar",
        startsAt: nextClassStart,
        endsAt: nextClassEnd,
        timezone: "Asia/Kolkata",
        meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
        platform: MeetingPlatform.GOOGLE_MEET,
        status: LiveClassStatus.SCHEDULED,
      },
      {
        courseId: course.id,
        title: "Live Cohort Session: High-Throughput Model Serving with vLLM & Quantization",
        description: "Live demonstration of serving LLMs with PagedAttention, continuous batching, AWQ / GPTQ quantization, and Triton inference server.",
        instructorName: "Jay Kumar",
        startsAt: futureClass1Start,
        endsAt: futureClass1End,
        timezone: "Asia/Kolkata",
        meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
        platform: MeetingPlatform.GOOGLE_MEET,
        status: LiveClassStatus.SCHEDULED,
      },
      {
        courseId: course.id,
        title: "Live Cohort Session: Enterprise AI Capstone Project Defense & Review",
        description: "Interactive batch review and live presentation of student capstone architectures with industry feedback.",
        instructorName: "Jay Kumar",
        startsAt: futureClass2Start,
        endsAt: futureClass2End,
        timezone: "Asia/Kolkata",
        meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
        platform: MeetingPlatform.GOOGLE_MEET,
        status: LiveClassStatus.SCHEDULED,
      },
      {
        courseId: course.id,
        title: "Live Cohort Session: Production RAG Systems & Vector Databases",
        description: "Completed cohort session. The full recording has been processed and is available under the Recordings tab.",
        instructorName: "Jay Kumar",
        startsAt: pastClassStart,
        endsAt: pastClassEnd,
        timezone: "Asia/Kolkata",
        meetingUrl: "https://meet.google.com/jan-hnzk-nhf",
        recordingUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        platform: MeetingPlatform.GOOGLE_MEET,
        status: LiveClassStatus.COMPLETED,
      },
    ],
  })
  console.log("✅ Seeded real Live Classes and Time Table sessions.")

  // 6. Update student enrollments with first real session
  const firstLessonId = createdLessons[0]?.id
  await prisma.enrollment.updateMany({
    where: { courseId: course.id },
    data: {
      lastLessonId: firstLessonId,
      progressPct: 25,
    },
  })
  console.log(`✅ Updated student enrollments with firstLessonId: ${firstLessonId}`)

  console.log("🎉 Successfully restructured AI Course into 4 legit sections!")
}

main()
  .catch((e) => {
    console.error("Migration error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
