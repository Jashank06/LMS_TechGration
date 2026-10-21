import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { gradeSubmissionSchema } from "@/server/schemas/teacher-schemas"
import { getTeacherSession } from "@/server/services/teacher-auth"
import { getTeacherCourseScope } from "@/server/services/teacher-scope"
import { db } from "@/server/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized teacher access required" }, { status: 401 })
    }

    const { assignmentId } = await params
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get("submissionId")

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
        submissions: {
          include: { user: true },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Verify course authorization via teacher scope
    const courseScope = getTeacherCourseScope(session.user)
    const courseAuthorized = await db.course.findFirst({
      where: {
        id: assignment.courseId,
        ...courseScope,
      },
      select: { id: true },
    })

    if (!courseAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permissions to manage or grade this course's assignments." },
        { status: 403 }
      )
    }

    const submissions = assignment.submissions
    let currentSubmissionRaw = submissions[0]

    if (submissionId) {
      const found = submissions.find((s) => s.id === submissionId)
      if (found) currentSubmissionRaw = found
    }

    const currentIndex = submissions.findIndex((s) => s.id === currentSubmissionRaw?.id)

    const isCurrentLate = currentSubmissionRaw
      ? currentSubmissionRaw.status === "LATE" || currentSubmissionRaw.submittedAt > assignment.dueAt
      : false

    const currentSubmission = currentSubmissionRaw
      ? {
          id: currentSubmissionRaw.id,
          assignmentId: currentSubmissionRaw.assignmentId,
          studentId: currentSubmissionRaw.userId,
          studentName: currentSubmissionRaw.user.name,
          studentEmail: currentSubmissionRaw.user.email,
          studentAvatar: "/brand/avatar-default.png",
          submittedAt: currentSubmissionRaw.submittedAt.toISOString(),
          isLate: isCurrentLate,
          latePenaltyPct: 0,
          status: currentSubmissionRaw.status,
          studentNotes: currentSubmissionRaw.studentNotes || "",
          codeLanguage: "yaml",
          submittedCodeSnippet: "",
          attachedFiles: currentSubmissionRaw.fileUrl ? [currentSubmissionRaw.fileUrl] : [],
          marksAwarded: currentSubmissionRaw.marksAwarded,
          feedback: currentSubmissionRaw.feedback,
          gradedAt: currentSubmissionRaw.gradedAt?.toISOString(),
          rubricScores: [],
        }
      : null

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        courseTitle: assignment.course.title,
        instructions: assignment.instructions,
        maxMarks: assignment.maxMarks,
        dueAt: assignment.dueAt.toISOString(),
        totalSubmissions: submissions.length,
      },
      currentSubmission,
      currentIndex,
      totalSubmissions: submissions.length,
      submissionsList: submissions.map((s, idx) => ({
        id: s.id,
        index: idx + 1,
        studentName: s.user.name,
        studentAvatar: "/brand/avatar-default.png",
        status: s.status,
        marksAwarded: s.marksAwarded,
        isLate: s.status === "LATE" || s.submittedAt > assignment.dueAt,
      })),
    })
  } catch (error) {
    console.error("Grade submission get API error:", error)
    return NextResponse.json({ error: "Failed to load submission" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getTeacherSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized teacher access required" }, { status: 401 })
    }

    const { assignmentId } = await params
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: { submissions: true },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Verify course authorization via teacher scope
    const courseScope = getTeacherCourseScope(session.user)
    const courseAuthorized = await db.course.findFirst({
      where: {
        id: assignment.courseId,
        ...courseScope,
      },
      select: { id: true },
    })

    if (!courseAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permissions to manage or grade this course's assignments." },
        { status: 403 }
      )
    }

    const json = await request.json()
    const parsed = gradeSubmissionSchema.parse(json)

    if (parsed.marksAwarded > assignment.maxMarks) {
      return NextResponse.json(
        { error: `Marks awarded cannot exceed maximum marks (${assignment.maxMarks})` },
        { status: 400 }
      )
    }

    const submission = await db.assignmentSubmission.update({
      where: { id: parsed.submissionId },
      data: {
        marksAwarded: parsed.marksAwarded,
        feedback: parsed.feedback,
        status: parsed.isDraft ? "IN_REVIEW" : "GRADED",
        gradedAt: new Date(),
      },
    })

    // If grade is published, generate a real in-app notification for the student
    if (!parsed.isDraft) {
      const feedbackSnippet = parsed.feedback.trim()
      const truncatedFeedback =
        feedbackSnippet.length > 80 ? `${feedbackSnippet.slice(0, 80)}...` : feedbackSnippet

      await db.notification.create({
        data: {
          userId: submission.userId,
          title: `Assignment Graded: ${assignment.title}`,
          message: `Your submission received ${parsed.marksAwarded} / ${assignment.maxMarks} marks.${
            truncatedFeedback ? ` Remarks: "${truncatedFeedback}"` : ""
          }`,
          href: `/student/assignments/${assignmentId}`,
          read: false,
        },
      })
    }

    // Invalidate affected student and teacher routes
    revalidatePath(`/student/assignments/${assignmentId}`)
    revalidatePath("/student/assignments")
    revalidatePath("/student/dashboard")
    revalidatePath("/student/leaderboard")
    revalidatePath("/student/rewards")
    if (assignment.courseId) {
      revalidatePath(`/student/courses/${assignment.courseId}`)
    }
    revalidatePath("/teacher/assignments")
    revalidatePath(`/teacher/assignments/${assignmentId}/grade`)

    const gradedSubmissions = await db.assignmentSubmission.count({
      where: { assignmentId, status: "GRADED" },
    })
    const pendingGrading = await db.assignmentSubmission.count({
      where: { assignmentId, status: { not: "GRADED" } },
    })

    return NextResponse.json({
      success: true,
      message: parsed.isDraft
        ? "Draft saved successfully."
        : "Grade and feedback published! Student notified.",
      submission: {
        ...submission,
        rubricScores: parsed.rubricScores || [],
      },
      assignmentStats: {
        gradedSubmissions,
        pendingGrading,
      },
    })
  } catch (error) {
    console.error("Grade submission update API error:", error)
    return NextResponse.json({ error: "Failed to update grade" }, { status: 500 })
  }
}
