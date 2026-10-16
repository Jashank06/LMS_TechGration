import { NextResponse } from "next/server"
import { db } from "@/server/db"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { MeetingPlatform, LiveClassStatus } from "@prisma/client"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const { customMeetUrl } = body
    const meetUrl = customMeetUrl?.trim() || "https://meet.google.com/jan-hnzk-nhf"
    const instructorName = session.user.name || course.instructorName || "Jay Kumar"

    // Generate upcoming classes on Tuesdays (day 2), Thursdays (day 4), Saturdays (day 6) at 8:00 PM IST
    const now = new Date()
    const targetDays = [2, 4, 6] // Tuesday, Thursday, Saturday
    const sessionsToCreate = []

    let checkDate = new Date(now)
    checkDate.setDate(checkDate.getDate() + 1) // start from tomorrow

    const topics = [
      {
        title: "Live Class: Modern AI Foundations & Linear Algebra Intuition",
        desc: "Interactive lecture covering high-dimensional geometry, tensor operations, and GPU development setups.",
      },
      {
        title: "Live Class: Deep Neural Networks & PyTorch Tensor Mechanics",
        desc: "Hands-on coding session: multi-layer perceptrons, backpropagation gradients, and loss landscape optimization.",
      },
      {
        title: "Live Class: Convolutional Neural Networks & Feature Extraction",
        desc: "Building CNN pipelines, transfer learning with ResNet, and medical imaging computer vision.",
      },
      {
        title: "Live Class: Transformer Architecture & Scaled Dot-Product Attention",
        desc: "Self-attention matrices (Q, K, V), multi-head attention heads, and positional encoding mathematics.",
      },
      {
        title: "Live Class: Parameter-Efficient Fine-Tuning (PEFT) & LoRA",
        desc: "Fine-tuning open-source LLMs on custom enterprise instruction datasets using low-rank adapters.",
      },
      {
        title: "Live Class: Production RAG Systems & Hybrid Vector Search",
        desc: "Document chunking, dense vector indexing, BM25 hybrid search, and cross-encoder rerankers.",
      },
    ]

    let topicIdx = 0
    while (sessionsToCreate.length < 6 && topicIdx < topics.length) {
      const dayOfWeek = checkDate.getDay()
      if (targetDays.includes(dayOfWeek)) {
        // Set to 8:00 PM IST (14:30 UTC)
        const startsAt = new Date(checkDate)
        startsAt.setUTCHours(14, 30, 0, 0)

        // 90 minutes duration -> 9:30 PM IST (16:00 UTC)
        const endsAt = new Date(startsAt)
        endsAt.setMinutes(endsAt.getMinutes() + 90)

        const topic = topics[topicIdx]
        sessionsToCreate.push({
          courseId,
          title: topic.title,
          description: topic.desc,
          instructorName,
          instructorId: session.user.id,
          startsAt,
          endsAt,
          timezone: "Asia/Kolkata",
          meetingUrl: meetUrl,
          platform: MeetingPlatform.GOOGLE_MEET,
          status: LiveClassStatus.SCHEDULED,
        })
        topicIdx++
      }
      checkDate.setDate(checkDate.getDate() + 1)
    }

    await db.liveClass.createMany({
      data: sessionsToCreate,
    })

    return NextResponse.json({
      success: true,
      message: `Generated ${sessionsToCreate.length} weekly live classes on Tuesdays, Thursdays & Saturdays!`,
      createdCount: sessionsToCreate.length,
    })
  } catch (error) {
    console.error("Generate timetable error:", error)
    return NextResponse.json(
      { error: "Failed to generate weekly timetable" },
      { status: 500 }
    )
  }
}
