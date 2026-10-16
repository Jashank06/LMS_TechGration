import { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign In — TechGration LMS",
  description: "Sign in to access your courses, live classes, assignments, and verified certificates on TechGration LMS.",
}

export default function LoginPage() {
  return (
    <div className="w-full">
      <LoginForm />
    </div>
  )
}
