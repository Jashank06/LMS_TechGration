"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { loginWithEmail, registerStudent, demoLogin as authDemoLogin, destroySession } from "@/server/auth"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

function isRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  return "digest" in error && typeof (error as { digest?: unknown }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
}

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validation = loginSchema.safeParse({ email, password })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input",
      }
    }

    const result = await loginWithEmail(validation.data.email, validation.data.password)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath("/", "layout")
    
    if (result.user?.role === "TEACHER") {
      redirect("/teacher/dashboard")
    } else if (result.user?.role === "ADMIN" || result.user?.role === "SUPER_ADMIN") {
      redirect("/admin/dashboard")
    } else {
      redirect("/student/dashboard")
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("loginAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign in. Please try again.",
    }
  }
}

export async function registerAction(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validation = registerSchema.safeParse({ name, email, password })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input",
      }
    }

    const result = await registerStudent(validation.data)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath("/", "layout")
    redirect("/student/dashboard")
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("registerAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed. Please try again.",
    }
  }
}

export async function demoLoginAction(role: "student" | "teacher" | "admin" = "student") {
  try {
    const result = await authDemoLogin(role)
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath("/", "layout")

    if (role === "teacher") {
      redirect("/teacher/dashboard")
    } else if (role === "admin") {
      redirect("/admin/dashboard")
    } else {
      redirect("/student/dashboard")
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    console.error("demoLoginAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not sign in with demo account. Please try again.",
    }
  }
}

export async function logoutAction() {
  try {
    await destroySession()
  } catch (err) {
    console.error("logoutAction error:", err)
  }
  revalidatePath("/", "layout")
  redirect("/login")
}
