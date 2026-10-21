"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

/**
 * Validates assignment existence, active student enrollment,
 * and guards against overwriting graded/in-review submissions.
 */
export async function validateAssignmentSubmission(
  assignmentId: string,
  userId: string
): Promise<
  | {
      allowed: true
      assignment: { id: string; courseId: string; dueAt: Date }
      targetStatus: "LATE" | "SUBMITTED"
    }
  | { allowed: false; error: string }
> {
  const asgn = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, courseId: true, dueAt: true },
  })

  if (!asgn) {
    return { allowed: false, error: "Assignment not found." }
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: asgn.courseId,
      },
    },
    select: { status: true },
  })

  if (!enrollment || (enrollment.status !== "ACTIVE" && enrollment.status !== "COMPLETED")) {
    return {
      allowed: false,
      error: "You must have an active enrollment in this course to submit deliverables.",
    }
  }

  const existing = await db.assignmentSubmission.findUnique({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId,
      },
    },
    select: {
      id: true,
      status: true,
      marksAwarded: true,
    },
  })

  if (existing) {
    if (existing.status === "GRADED" || existing.marksAwarded !== null) {
      return {
        allowed: false,
        error: "This assignment has already been evaluated and graded. Submissions cannot be overwritten.",
      }
    }
    if (existing.status === "IN_REVIEW") {
      return {
        allowed: false,
        error: "This assignment is currently under faculty review. Submissions are temporarily locked.",
      }
    }
  }

  const isLate = new Date() > new Date(asgn.dueAt)
  const targetStatus = isLate ? "LATE" : "SUBMITTED"

  return { allowed: true, assignment: asgn, targetStatus }
}

function invalidateAssignmentCaches(assignmentId: string, courseId?: string) {
  revalidatePath(`/student/assignments/${assignmentId}`)
  revalidatePath("/student/assignments")
  revalidatePath("/student/dashboard")
  revalidatePath("/student/leaderboard")
  revalidatePath("/student/rewards")
  if (courseId) {
    revalidatePath(`/student/courses/${courseId}`)
  }
  revalidatePath("/teacher/assignments")
  revalidatePath(`/teacher/assignments/${assignmentId}/grade`)
}

export async function submitAssignmentAction(assignmentId: string, formData: FormData) {
  const user = await requireStudent()
  const content = (formData.get("content") as string) || ""
  const fileUrl = (formData.get("fileUrl") as string) || ""

  if (!content.trim() && !fileUrl.trim()) {
    return { success: false, error: "Please enter your submission text or repository link." }
  }

  const validation = await validateAssignmentSubmission(assignmentId, user.id)
  if (!validation.allowed) {
    return { success: false, error: validation.error }
  }

  const { assignment, targetStatus } = validation

  // Create or update submission
  await db.assignmentSubmission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId: user.id,
      },
    },
    update: {
      studentNotes: content.trim(),
      fileUrl: fileUrl.trim() || null,
      status: targetStatus,
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: user.id,
      studentNotes: content.trim(),
      fileUrl: fileUrl.trim() || null,
      status: targetStatus,
      submittedAt: new Date(),
    },
  })

  invalidateAssignmentCaches(assignmentId, assignment.courseId)
  redirect(`/student/assignments/${assignmentId}`)
}

export async function quickSubmitAssignmentAction(
  assignmentId: string,
  data: { content?: string; fileUrl?: string }
) {
  const user = await requireStudent()
  const content = (data.content || "").trim()
  const fileUrl = (data.fileUrl || "").trim()

  if (!content && !fileUrl) {
    return { success: false, error: "Please provide either project links or architectural notes." }
  }

  const validation = await validateAssignmentSubmission(assignmentId, user.id)
  if (!validation.allowed) {
    return { success: false, error: validation.error }
  }

  const { assignment, targetStatus } = validation

  await db.assignmentSubmission.upsert({
    where: {
      assignmentId_userId: {
        assignmentId,
        userId: user.id,
      },
    },
    update: {
      studentNotes: content,
      fileUrl: fileUrl || null,
      status: targetStatus,
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: user.id,
      studentNotes: content,
      fileUrl: fileUrl || null,
      status: targetStatus,
      submittedAt: new Date(),
    },
  })

  invalidateAssignmentCaches(assignmentId, assignment.courseId)
  return { success: true }
}
