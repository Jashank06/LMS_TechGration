import { db } from "@/server/db"
import { Role, UserStatus } from "@prisma/client"

export const AVAILABLE_PERMISSIONS = [
  { key: "users:read", category: "Users", label: "View User Profiles & Roster" },
  { key: "users:create", category: "Users", label: "Create / Invite New Users" },
  { key: "users:edit", category: "Users", label: "Edit User Information & Roles" },
  { key: "users:suspend", category: "Users", label: "Suspend or Deactivate Accounts" },
  { key: "users:delete", category: "Users", label: "Permanently Delete Users" },
  { key: "courses:read", category: "Courses", label: "Browse Course Catalog & Details" },
  { key: "courses:create", category: "Courses", label: "Author New Courses & Modules" },
  { key: "courses:edit", category: "Courses", label: "Edit Curriculum & Lesson Media" },
  { key: "courses:approve", category: "Courses", label: "Approve / Reject Course Submissions" },
  { key: "courses:delete", category: "Courses", label: "Delete / Unpublish Courses" },
  { key: "categories:manage", category: "Curriculum", label: "Manage Categories, Skills & Tags" },
  { key: "enrollments:read", category: "Enrollments", label: "View Learner Enrollments & Progress" },
  { key: "enrollments:create", category: "Enrollments", label: "Manually Enroll Students" },
  { key: "enrollments:cancel", category: "Enrollments", label: "Cancel Student Enrollments" },
  { key: "enrollments:bulk_import", category: "Enrollments", label: "Execute Bulk CSV Enrollment Imports" },
  { key: "billing:read", category: "Billing", label: "View Financial Transactions & Ledgers" },
  { key: "billing:manage", category: "Billing", label: "Manage Course Pricing & Coupon Codes" },
  { key: "reports:read", category: "Reports", label: "View Analytics Dashboards & Charts" },
  { key: "reports:export", category: "Reports", label: "Export Statistical Data to CSV" },
  { key: "announcements:create", category: "Announcements", label: "Broadcast System Announcements" },
  { key: "announcements:delete", category: "Announcements", label: "Archive or Delete Announcements" },
  { key: "audit:read", category: "Security", label: "Inspect Immutable Security Audit Logs" },
  { key: "settings:read", category: "Settings", label: "View Platform Environment Configurations" },
  { key: "settings:edit", category: "Settings", label: "Update Platform Configurations & Policies" },
]

export async function hasPermission(role: Role, permissionKey: string): Promise<boolean> {
  // Super Admin always has full bypass authority
  if (role === Role.SUPER_ADMIN) {
    return true
  }

  const record = await db.rolePermission.findUnique({
    where: {
      role_permission: {
        role,
        permission: permissionKey,
      },
    },
  })

  return record?.granted ?? false
}

/**
 * Super Admin Protection Logic:
 * Checks whether the given user is the last active Super Admin.
 * Prevents system lockout.
 */
export async function isLastSuperAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  })

  if (user?.role !== Role.SUPER_ADMIN) {
    return false
  }

  const activeSuperAdminCount = await db.user.count({
    where: {
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  })

  return activeSuperAdminCount <= 1
}
