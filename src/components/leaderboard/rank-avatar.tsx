"use client"

import * as React from "react"

const GRADIENTS = [
  "from-cyan-400 to-teal-500",
  "from-blue-500 to-indigo-600",
  "from-fuchsia-500 to-purple-600",
  "from-rose-400 to-red-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-blue-600",
  "from-violet-500 to-purple-700",
]

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

interface RankAvatarProps {
  name: string
  src?: string | null
  seed?: string
  size?: number
  className?: string
}

export function RankAvatar({ name, src, seed, size = 40, className = "" }: RankAvatarProps) {
  const [failed, setFailed] = React.useState(false)
  const gradient = GRADIENTS[hash(seed || name) % GRADIENTS.length]
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center text-white font-bold bg-gradient-to-br ${gradient} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
      aria-label={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{initialsOf(name)}</span>
      )}
    </div>
  )
}
