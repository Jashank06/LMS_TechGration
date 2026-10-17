"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Users,
  Sparkles,
  Radio,
} from "lucide-react"

export interface LiveClassItem {
  id: string
  title: string
  description: string
  courseTitle: string
  teacherName: string
  startsAt: string
  endsAt: string
  meetingUrl: string
  status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED"
  recordingUrl?: string | null
  attendanceStatus?: string
  isJoinable: boolean
}

export function LiveClassesClient({
  classes,
  timezone,
}: {
  classes: LiveClassItem[]
  timezone: string
}) {
  const [activeTab, setActiveTab] = React.useState<"UPCOMING" | "PAST">("UPCOMING")

  const upcomingClasses = classes.filter((c) => c.status === "SCHEDULED" || c.status === "LIVE")
  const pastClasses = classes.filter((c) => c.status === "COMPLETED")

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-1.5 text-xs">
          <button
            onClick={() => setActiveTab("UPCOMING")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "UPCOMING"
                ? "bg-brand-teal text-brand-charcoal shadow-md shadow-brand-teal/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upcoming Live Classes ({upcomingClasses.length})
          </button>
          <button
            onClick={() => setActiveTab("PAST")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "PAST"
                ? "bg-brand-teal text-brand-charcoal shadow-md shadow-brand-teal/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Past Sessions & Recordings ({pastClasses.length})
          </button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-brand-teal" />
          <span>Timezone: <strong className="text-foreground font-semibold">{timezone}</strong></span>
        </div>
      </div>

      {activeTab === "UPCOMING" ? (
        <div className="space-y-4">
          {upcomingClasses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-md">
                <Video className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No upcoming live classes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your instructors will post class schedules here before live sessions begin.
                </p>
              </div>
            </div>
          ) : (
            upcomingClasses.map((cls) => {
              const startDate = new Date(cls.startsAt)
              const formattedDate = startDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
              const formattedTime = startDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })

              const isLive = cls.status === "LIVE"

              return (
                <div
                  key={cls.id}
                  className={`p-6 rounded-3xl border bg-card/80 backdrop-blur-xl shadow-xs transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 ${
                    isLive
                      ? "border-amber-500/50 bg-amber-500/5 shadow-[0_8px_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30"
                      : "border-border/80 hover:border-brand-teal/50 hover:shadow-[0_8px_25px_-5px_rgba(0,214,214,0.15)]"
                  }`}
                >
                  <div className="space-y-2.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          isLive
                            ? "bg-amber-500 text-black animate-pulse font-extrabold flex items-center gap-1.5"
                            : "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                        }`}
                      >
                        {isLive && <Radio className="w-3 h-3" />}
                        <span>{isLive ? "Live Broadcast Now" : "Scheduled"}</span>
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {cls.courseTitle}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {cls.title}
                    </h3>

                    {cls.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {cls.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Instructor: <strong className="text-foreground font-semibold">{cls.teacherName}</strong></span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-center gap-2">
                    <Button
                      asChild
                      className="w-full sm:w-auto font-bold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-11 px-6 rounded-xl shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4 mr-2" />
                        <span>Join Live Classroom</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                      </a>
                    </Button>

                    <span className="text-[11px] text-muted-foreground text-center font-medium">
                      Direct Zoom / Meet Room Link
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        /* Past Classes & Recordings */
        <div className="space-y-4">
          {pastClasses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/60 backdrop-blur-md space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-brand-teal mx-auto shadow-md">
                <PlayCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No past recordings yet</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Recorded class sessions will be archived here for on-demand playback.
                </p>
              </div>
            </div>
          ) : (
            pastClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl shadow-xs flex items-center justify-between gap-4 hover:border-brand-teal/40 transition-all"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Attendance: {cls.attendanceStatus || "Attended"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium truncate">
                      {cls.courseTitle}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground">{cls.title}</h4>
                </div>

                <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold rounded-xl border-border/80 shrink-0 hover:bg-brand-teal hover:text-brand-charcoal transition-all">
                  <PlayCircle className="w-3.5 h-3.5 mr-1.5 text-brand-teal" />
                  <span>Watch Recording</span>
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
