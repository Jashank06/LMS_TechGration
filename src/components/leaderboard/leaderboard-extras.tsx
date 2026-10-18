"use client"

import * as React from "react"
import Link from "next/link"
import { Compass, Trophy, FileCheck2, HelpCircle, Medal } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CourseSwitcher({
  courses,
  activeId,
  basePath,
}: {
  courses: Array<{ id: string; title: string }>
  activeId: string
  basePath: string
}) {
  if (courses.length <= 1) return null
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-pan-x scroll-smooth pb-1 -mx-1 px-1" role="tablist" aria-label="Select course">
      {courses.map((c) => {
        const active = c.id === activeId
        return (
          <Link
            key={c.id}
            href={`${basePath}?course=${c.id}`}
            role="tab"
            aria-selected={active}
            scroll={false}
            className={`whitespace-nowrap min-h-[44px] flex items-center text-xs font-bold px-4 py-2 rounded-xl border transition-all shrink-0 ${
              active
                ? "bg-foreground text-background border-foreground shadow-md"
                : "bg-card/70 text-muted-foreground border-border/70 hover:text-foreground hover:border-foreground/30 active:bg-muted"
            }`}
          >
            {c.title}
          </Link>
        )
      })}
    </div>
  )
}

function GhostPodium() {
  const cols = [
    { h: 90, tone: "from-slate-300/40 to-slate-400/20" },
    { h: 120, tone: "from-amber-300/50 to-amber-500/20" },
    { h: 70, tone: "from-orange-300/40 to-orange-500/20" },
  ]
  return (
    <div className="flex items-end justify-center gap-3" aria-hidden>
      {cols.map((c, i) => (
        <div key={i} className="flex flex-col items-center gap-2 w-20">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground/60 font-bold">?</div>
          <div className={`w-full rounded-t-xl bg-gradient-to-b ${c.tone} border border-border/50`} style={{ height: c.h }} />
        </div>
      ))}
    </div>
  )
}

export function HowRankingWorks() {
  return (
    <details className="group rounded-2xl border border-border/70 bg-card/60 p-4 text-xs text-muted-foreground">
      <summary className="cursor-pointer list-none flex items-center gap-2 font-bold text-foreground">
        <Medal className="w-4 h-4 text-amber-500" />
        <span>How ranking works</span>
        <span className="ml-auto text-[10px] font-semibold text-muted-foreground group-open:hidden">Show</span>
        <span className="ml-auto text-[10px] font-semibold text-muted-foreground hidden group-open:inline">Hide</span>
      </summary>
      <ul className="mt-3 space-y-1.5 leading-relaxed">
        <li className="flex gap-2"><FileCheck2 className="w-3.5 h-3.5 mt-0.5 text-orange-500 shrink-0" /><span>Assignment marks count only after your teacher grades them.</span></li>
        <li className="flex gap-2"><HelpCircle className="w-3.5 h-3.5 mt-0.5 text-purple-500 shrink-0" /><span>For each quiz, your best attempt counts.</span></li>
        <li className="flex gap-2"><Trophy className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" /><span>Total marks decide the rank. If marks are equal, higher accuracy wins, then whoever scored first.</span></li>
        <li className="flex gap-2"><Compass className="w-3.5 h-3.5 mt-0.5 text-cyan-500 shrink-0" /><span>Arrows show rank change compared to 7 days ago.</span></li>
      </ul>
    </details>
  )
}

export function LeaderboardEmpty({
  kind,
  catalogHref = "/student/catalog",
}: {
  kind: "no-courses" | "no-scores" | "teacher-no-courses"
  catalogHref?: string
}) {
  const content = {
    "no-courses": {
      title: "Join a course to enter the leaderboard",
      body: "The leaderboard is built from your course marks. Enroll in a course to see how you rank with your classmates.",
    },
    "no-scores": {
      title: "The podium is still empty",
      body: "The leaderboard opens as soon as the first assignment or quiz is evaluated in this course. Be the first on the board!",
    },
    "teacher-no-courses": {
      title: "No courses to rank yet",
      body: "Create a course and publish assignments or quizzes. Rankings appear after students get evaluated.",
    },
  }[kind]

  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 sm:p-14 text-center space-y-6">
      <GhostPodium />
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">{content.title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{content.body}</p>
      </div>
      {kind === "no-courses" && (
        <Button asChild className="rounded-xl font-bold">
          <Link href={catalogHref}>
            <Compass className="w-4 h-4 mr-2" />
            <span>Explore Courses</span>
          </Link>
        </Button>
      )}
    </div>
  )
}
