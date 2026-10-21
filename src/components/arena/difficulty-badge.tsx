"use client"

import { cn } from "@/lib/utils"

const difficultyConfig = {
  EASY: { label: "Easy", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  MEDIUM: { label: "Medium", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  HARD: { label: "Hard", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
}

interface DifficultyBadgeProps {
  difficulty: "EASY" | "MEDIUM" | "HARD"
  size?: "sm" | "md"
  className?: string
}

export function DifficultyBadge({ difficulty, size = "sm", className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty] || difficultyConfig.EASY
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold border rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
