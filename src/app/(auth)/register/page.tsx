import { Suspense } from "react"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/server/auth"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Create Account — TechGration LMS",
  description: "Join TechGration LMS to enroll in engineering courses, live classes, and industry certifications.",
}

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) {
    if (user.role === "TEACHER") {
      redirect("/teacher/dashboard")
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      redirect("/admin/dashboard")
    } else {
      redirect("/student/dashboard")
    }
  }

  return (
    <div className="w-full">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-sm text-muted-foreground">Loading registration portal...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
