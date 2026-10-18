import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"
import { getStudentRewardStatus, SWAG_CATALOG } from "@/server/services/rewards"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [rewardStatus, enrollmentsCount, completedLessonsCount, certificatesCount, passedAttemptsCount] =
      await Promise.all([
        getStudentRewardStatus(user.id),
        db.enrollment.count({ where: { userId: user.id } }),
        db.lessonProgress.count({ where: { userId: user.id, status: "COMPLETED" } }),
        db.certificate.count({ where: { userId: user.id } }),
        db.assessmentAttempt.count({ where: { userId: user.id, passed: true } }),
      ])

    const milestones = [
      {
        id: "enrolled-scholar",
        title: "Enrolled Scholar",
        subtitle: `${enrollmentsCount} Active ${enrollmentsCount === 1 ? "Course" : "Courses"}`,
        rarity: "COMMON",
        emoji: "🚀",
        isUnlocked: enrollmentsCount > 0,
        unlockedDate: enrollmentsCount > 0 ? "Active" : null,
        criteria: "Enrolled in at least 1 verified course",
      },
      {
        id: "first-step",
        title: "First Step Pioneer",
        subtitle: `${completedLessonsCount} Completed ${completedLessonsCount === 1 ? "Lesson" : "Lessons"}`,
        rarity: "RARE",
        emoji: "⚡",
        isUnlocked: completedLessonsCount > 0,
        unlockedDate: completedLessonsCount > 0 ? "Unlocked" : null,
        criteria: "Complete at least 1 course lesson module",
      },
      {
        id: "quiz-whiz",
        title: "Assessment Ace",
        subtitle: `${passedAttemptsCount} Passed ${passedAttemptsCount === 1 ? "Quiz" : "Quizzes"}`,
        rarity: "EPIC",
        emoji: "🧠",
        isUnlocked: passedAttemptsCount > 0,
        unlockedDate: passedAttemptsCount > 0 ? "Passed" : null,
        criteria: "Pass a timed course evaluation",
      },
      {
        id: "certified-engineer",
        title: "Certified Engineer",
        subtitle: `${certificatesCount} Issued ${certificatesCount === 1 ? "Credential" : "Credentials"}`,
        rarity: "LEGENDARY",
        emoji: "🎓",
        isUnlocked: certificatesCount > 0,
        unlockedDate: certificatesCount > 0 ? "Certified" : null,
        criteria: "Complete 100% of an enrolled curriculum",
      },
      {
        id: "champion-swag",
        title: "Cohort Champion",
        subtitle: rewardStatus.eligibility.isChampion ? "Rank #1 Unlocked" : "Rank #1 Required",
        rarity: "MYTHIC",
        emoji: "🏆",
        isUnlocked: rewardStatus.eligibility.isChampion,
        unlockedDate: rewardStatus.eligibility.isChampion ? "Eligible" : null,
        criteria: "Achieve #1 position on the Course Leaderboard",
      },
    ]

    return NextResponse.json({
      success: true,
      eligibility: rewardStatus.eligibility,
      claims: rewardStatus.claims,
      catalog: SWAG_CATALOG,
      milestones,
    })
  } catch (error: any) {
    console.error("Student rewards API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to load rewards" },
      { status: 500 }
    )
  }
}
