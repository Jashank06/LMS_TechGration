import { Suspense } from "react"
import { Metadata } from "next"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Create Account — TechGration LMS",
  description: "Join TechGration LMS to enroll in engineering courses, live classes, and industry certifications.",
}

export default function RegisterPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-sm text-muted-foreground">Loading registration portal...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
