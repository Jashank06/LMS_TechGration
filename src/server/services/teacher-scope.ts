import type { Prisma } from "@prisma/client"

export function isStaff(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

export interface TeacherUserScopeInput {
  id: string
  name: string
  role?: string | null
}

/**
 * Returns Prisma CourseWhereInput that matches records owned by a teacher,
 * or universal empty scope ({}) if the user is staff/admin.
 */
export function getTeacherCourseScope(user: TeacherUserScopeInput): Prisma.CourseWhereInput {
  if (isStaff(user.role)) {
    return {}
  }

  const trimmedName = (user.name || "").trim()
  const firstName = trimmedName.split(" ")[0] || ""
  const isObjectId = Boolean(user.id && /^[0-9a-fA-F]{24}$/.test(user.id))

  const orConditions: Prisma.CourseWhereInput[] = []

  if (isObjectId) {
    orConditions.push({ instructorId: user.id })
  }

  if (trimmedName.length > 0) {
    orConditions.push({
      instructorName: { contains: trimmedName, mode: "insensitive" },
    })
  }

  if (firstName.length >= 3 && firstName.toLowerCase() !== trimmedName.toLowerCase()) {
    orConditions.push({
      instructorName: { contains: firstName, mode: "insensitive" },
    })
  }

  return orConditions.length > 0 ? { OR: orConditions } : { id: "none" }
}

/**
 * Returns Prisma LiveClassWhereInput that matches classes owned by a teacher,
 * or universal empty scope ({}) if the user is staff/admin.
 */
export function getTeacherLiveClassScope(user: TeacherUserScopeInput): Prisma.LiveClassWhereInput {
  if (isStaff(user.role)) {
    return {}
  }

  const trimmedName = (user.name || "").trim()
  const firstName = trimmedName.split(" ")[0] || ""
  const isObjectId = Boolean(user.id && /^[0-9a-fA-F]{24}$/.test(user.id))

  const orConditions: Prisma.LiveClassWhereInput[] = []

  if (isObjectId) {
    orConditions.push({ instructorId: user.id })
  }

  if (trimmedName.length > 0) {
    orConditions.push({
      instructorName: { contains: trimmedName, mode: "insensitive" },
    })
  }

  if (firstName.length >= 3 && firstName.toLowerCase() !== trimmedName.toLowerCase()) {
    orConditions.push({
      instructorName: { contains: firstName, mode: "insensitive" },
    })
  }

  return orConditions.length > 0 ? { OR: orConditions } : { id: "none" }
}

/**
 * Backwards compatible legacy ownedByTeacher helper
 */
export function ownedByTeacher(user: TeacherUserScopeInput): Prisma.CourseWhereInput & Prisma.LiveClassWhereInput {
  if (isStaff(user.role)) {
    return {} as Prisma.CourseWhereInput & Prisma.LiveClassWhereInput
  }

  const trimmedName = (user.name || "").trim()
  const firstName = trimmedName.split(" ")[0] || ""
  const isObjectId = Boolean(user.id && /^[0-9a-fA-F]{24}$/.test(user.id))

  const orConditions: Array<{
    instructorId?: string
    instructorName?: string | { equals?: string; contains?: string; mode?: Prisma.QueryMode }
  }> = []

  if (isObjectId) {
    orConditions.push({ instructorId: user.id })
  }

  if (trimmedName.length > 0) {
    orConditions.push({
      instructorName: { contains: trimmedName, mode: "insensitive" },
    })
  }

  if (firstName.length >= 3 && firstName.toLowerCase() !== trimmedName.toLowerCase()) {
    orConditions.push({
      instructorName: { contains: firstName, mode: "insensitive" },
    })
  }

  return (orConditions.length > 0 ? { OR: orConditions } : { id: "none" }) as unknown as Prisma.CourseWhereInput & Prisma.LiveClassWhereInput
}
