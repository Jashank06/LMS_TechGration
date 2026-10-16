"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { db } from "@/server/db"

export async function submitAssignmentAction(assignmentId: string, formData: FormData) {
  const user = await requireStudent()
  const content = (formData.get("content") as string) || ""
  const fileUrl = (formData.get("fileUrl") as string) || ""

  if (!content.trim() && !fileUrl.trim()) {
    return { success: false, error: "Please enter your submission text or repository link." }
  }

  const asgn = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { courseId: true },
  })

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
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: user.id,
      studentNotes: content.trim(),
      fileUrl: fileUrl.trim() || null,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  })

  revalidatePath(`/student/assignments/${assignmentId}`)
  revalidatePath("/student/assignments")
  revalidatePath("/student/dashboard")
  if (asgn?.courseId) {
    revalidatePath(`/student/courses/${asgn.courseId}`)
  }

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

  const asgn = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { courseId: true },
  })

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
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      userId: user.id,
      studentNotes: content,
      fileUrl: fileUrl || null,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  })

  revalidatePath(`/student/assignments/${assignmentId}`)
  revalidatePath("/student/assignments")
  revalidatePath("/student/dashboard")
  if (asgn?.courseId) {
    revalidatePath(`/student/courses/${asgn.courseId}`)
  }

  return { success: true }
}
