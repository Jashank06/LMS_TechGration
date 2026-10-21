import * as React from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireStudent } from "@/server/auth"
import { getDuelRoomState } from "@/server/services/duel-service"
import { DuelRoomWorkspace } from "@/components/arena/duels/duel-room-workspace"

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  return {
    title: `⚔️ Live Duel Room (${code}) — TechGration Battle Arena`,
    description: `1v1 competitive coding battle room ${code} on TechGration.`,
  }
}

export default async function DuelRoomPage({ params }: PageProps) {
  const user = await requireStudent()
  const { code } = await params

  if (!code) notFound()

  let room = null
  try {
    room = await getDuelRoomState(code, user.id)
  } catch (err) {
    notFound()
  }

  if (!room) notFound()

  return <DuelRoomWorkspace initialRoom={room} currentUserId={user.id} />
}
