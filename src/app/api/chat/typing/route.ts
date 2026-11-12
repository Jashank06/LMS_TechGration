import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"

// Ephemeral in-memory store for typing status with auto-expiration
interface TyperState {
  userId: string
  userName: string
  role: string
  timestamp: number
}

const typingRegistry = new Map<string, Map<string, TyperState>>()

function cleanExpiredTypers(conversationId: string) {
  const typers = typingRegistry.get(conversationId)
  if (!typers) return []

  const now = Date.now()
  const active: TyperState[] = []

  for (const [uid, state] of typers.entries()) {
    if (now - state.timestamp < 3500) {
      active.push(state)
    } else {
      typers.delete(uid)
    }
  }

  if (typers.size === 0) {
    typingRegistry.delete(conversationId)
  }

  return active
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 })
    }

    const activeTypers = cleanExpiredTypers(conversationId).filter(
      (t) => t.userId !== user.id
    )

    return NextResponse.json({
      success: true,
      typingUsers: activeTypers.map((t) => ({
        id: t.userId,
        name: t.userName,
        role: t.role,
      })),
      isTyping: activeTypers.length > 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { conversationId, isTyping } = body

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 })
    }

    let typers = typingRegistry.get(conversationId)
    if (!typers) {
      typers = new Map()
      typingRegistry.set(conversationId, typers)
    }

    if (isTyping) {
      typers.set(user.id, {
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: Date.now(),
      })
    } else {
      typers.delete(user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
