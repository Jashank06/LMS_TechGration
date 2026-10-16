import { Metadata } from "next"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Create Account — TechGration LMS",
  description: "Join TechGration LMS to enroll in engineering courses, live classes, and industry certifications.",
}

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create student account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start your learning journey with hands-on labs and live classes.
        </p>
      </div>

      <RegisterForm />
    </div>
  )
}
