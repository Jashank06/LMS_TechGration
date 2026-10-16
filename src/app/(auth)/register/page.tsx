import { Metadata } from "next"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Create Account — TechGration LMS",
  description: "Join TechGration LMS to enroll in engineering courses, live classes, and industry certifications.",
}

export default function RegisterPage() {
  return (
    <div className="w-full">
      <RegisterForm />
    </div>
  )
}
