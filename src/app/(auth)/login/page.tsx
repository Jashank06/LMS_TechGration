import { Metadata } from "next"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign In — TechGration LMS",
  description: "Sign in to access your courses, live classes, assignments, and verified certificates on TechGration LMS.",
}

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your courses, upcoming live sessions, and progress.
        </p>
      </div>

      <LoginForm />
    </div>
  )
}
