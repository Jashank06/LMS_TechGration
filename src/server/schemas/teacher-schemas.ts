import { z } from "zod"

export const courseCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  code: z.string().min(2, "Course code required").max(16).default("TG-101"),
  subtitle: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).default("ALL_LEVELS"),
  format: z.enum(["SELF_PACED", "LIVE_INTERACTIVE", "HYBRID"]).default("HYBRID"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z.string().default("/brand/og-image.png"),
  promoVideoUrl: z.string().optional(),
  durationHours: z.number().int().min(1).default(12),
  outcomes: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  submitForApproval: z.boolean().default(false),
})

export const moduleReorderSchema = z.object({
  modules: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    })
  ),
})

export const lessonReorderSchema = z.object({
  moduleId: z.string(),
  lessons: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    })
  ),
})

export const lessonUpsertSchema = z.object({
  id: z.string().optional(),
  moduleId: z.string(),
  title: z.string().min(2, "Lesson title required"),
  type: z.enum(["VIDEO", "READING", "QUIZ", "ASSIGNMENT"]).default("VIDEO"),
  durationSec: z.number().int().min(0).default(600),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  isPreview: z.boolean().default(false),
  resources: z
    .array(
      z.object({
        title: z.string(),
        fileUrl: z.string(),
        fileSize: z.string(),
        fileType: z.string(),
      })
    )
    .optional(),
})

export const liveClassScheduleSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().default("Asia/Kolkata"),
  platform: z.enum(["ZOOM", "GOOGLE_MEET", "TEAMS", "CUSTOM"]).default("ZOOM"),
  meetingUrl: z.string().min(3, "Meeting URL or Room Link required"),
  meetingPasscode: z.string().optional(),
  hostKey: z.string().optional(),
  reminderOffsetsMin: z.array(z.number().int().min(5).max(120)).max(4).optional(),
  joinOpensMinBefore: z.number().int().min(0).max(60).optional(),
})

export const liveClassRescheduleSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().min(3, "Reschedule reason required"),
  notifyStudents: z.boolean().default(true),
})

export const liveClassCancelSchema = z.object({
  reason: z.string().min(3, "Cancellation reason required"),
  notifyStudents: z.boolean().default(true),
})

export const attendanceBulkMarkSchema = z.object({
  classId: z.string(),
  records: z.array(
    z.object({
      userId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      reason: z.string().optional(),
    })
  ),
})

export const gradeSubmissionSchema = z.object({
  submissionId: z.string(),
  marksAwarded: z.number().min(0),
  feedback: z.string().min(1, "Feedback is required"),
  status: z.enum(["SUBMITTED", "IN_REVIEW", "GRADED", "LATE"]).default("GRADED"),
  rubricScores: z
    .array(
      z.object({
        criterion: z.string(),
        score: z.number().min(0),
        maxScore: z.number().min(0),
      })
    )
    .optional(),
  isDraft: z.boolean().default(false),
})

export const studentNudgeSchema = z.object({
  studentId: z.string(),
  subject: z.string().min(3),
  message: z.string().min(10),
  actionUrl: z.string().optional(),
})
