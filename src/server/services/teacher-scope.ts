import type { Prisma } from "@prisma/client"

/**
 * Prisma `where` fragment that matches records owned by a teacher.
 * Uses the real FK (instructorId) and falls back to the denormalised display name so
 * legacy rows keep working until scripts/backfill-instructor-ids.ts has been run.
 */
export function ownedByTeacher(user: { id: string; name: string }) {
  return {
    OR: [{ instructorId: user.id }, { instructorName: user.name }],
  } satisfies Prisma.CourseWhereInput & Prisma.LiveClassWhereInput
}

export function isStaff(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}
