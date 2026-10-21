import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/server/auth"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign In — TechGration LMS",
  description: "Sign in to access your courses, live classes, assignments, and verified certificates on TechGration LMS.",
}

export default async function LoginPage() {
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
      <LoginForm />
    </div>
  )
}
