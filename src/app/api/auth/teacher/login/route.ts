import { NextResponse } from "next/server"
import { loginTeacher } from "@/server/services/teacher-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await loginTeacher({
      email: body.email,
      password: body.password,
      isDemo: Boolean(body.isDemo || body.demo),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Login failed" }, { status: 401 })
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error: any) {
    console.error("Teacher login API error:", error)
    const errorMsg = error?.message || ""
    if (
      errorMsg.includes("Server selection timeout") ||
      errorMsg.includes("InternalError") ||
      error?.code === "P2010"
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection timeout. Please verify that your current IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address).",
        },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
