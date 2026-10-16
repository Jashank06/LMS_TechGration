"use client"

import * as React from "react"
import { AlertTriangle, Clock, XCircle } from "lucide-react"

interface ConflictWarningBannerProps {
  conflictType: "HOST_CLASH" | "COURSE_CLASH" | "BOTH"
  message: string
  conflictingSessions: {
    id: string
    title: string
    startsAt: string
    endsAt: string
  }[]
}

export function ConflictWarningBanner({
  conflictType,
  message,
  conflictingSessions,
}: ConflictWarningBannerProps) {
  return (
    <div
      role="alert"
      className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive-foreground text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center gap-2 font-bold text-destructive">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>
          {conflictType === "BOTH"
            ? "Critical Schedule Conflict (Host & Course Clash)"
            : conflictType === "HOST_CLASH"
            ? "Instructor Host Conflict (You already have a class scheduled)"
            : "Course Batch Conflict (Another session is scheduled for this course)"}
        </span>
      </div>

      <p className="text-foreground/90 leading-relaxed">{message}</p>

      {conflictingSessions.length > 0 && (
        <div className="pt-1 space-y-1">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase">
            Overlapping Session(s):
          </div>
          {conflictingSessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-background/80 border border-destructive/20 text-foreground text-[11px]"
            >
              <Clock className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="font-semibold truncate">{s.title}</span>
              <span className="text-muted-foreground ml-auto font-mono">
                {new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                {new Date(s.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-muted-foreground italic">
        💡 Suggestion: Please choose a different start time or adjust session duration to avoid overlap.
      </div>
    </div>
  )
}
