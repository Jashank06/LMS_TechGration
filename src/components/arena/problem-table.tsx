"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Filter, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import { DifficultyBadge } from "./difficulty-badge"
import { TOPIC_LABELS } from "@/lib/arena-constants"
import { Input } from "@/components/ui/input"

interface Problem {
  id: string
  slug: string
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  topics: string[]
  xpReward: number
  acceptanceRate: number
  isSolved: boolean
  isDailyChallenge: boolean
}

interface ProblemTableProps {
  initialProblems: Problem[]
}

export function ProblemTable({ initialProblems }: ProblemTableProps) {
  const [problems, setProblems] = React.useState(initialProblems)
  const [search, setSearch] = React.useState("")
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>("ALL")
  const [topicFilter, setTopicFilter] = React.useState<string>("ALL")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filtered = React.useMemo(() => {
    let result = problems
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.title.toLowerCase().includes(q))
    }
    if (difficultyFilter !== "ALL") {
      result = result.filter((p) => p.difficulty === difficultyFilter)
    }
    if (topicFilter !== "ALL") {
      result = result.filter((p) => p.topics.includes(topicFilter))
    }
    if (statusFilter === "solved") {
      result = result.filter((p) => p.isSolved)
    } else if (statusFilter === "unsolved") {
      result = result.filter((p) => !p.isSolved)
    }
    return result
  }, [problems, search, difficultyFilter, topicFilter, statusFilter])

  // Collect unique topics
  const allTopics = React.useMemo(() => {
    const set = new Set<string>()
    problems.forEach((p) => p.topics.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [problems])

  const filterButtonClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? "bg-foreground text-background shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((d) => (
            <button key={d} onClick={() => setDifficultyFilter(d)} className={filterButtonClass(difficultyFilter === d)}>
              {d === "ALL" ? "All" : d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "solved", "unsolved"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={filterButtonClass(statusFilter === s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Topic filter pills */}
      {allTopics.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setTopicFilter("ALL")} className={filterButtonClass(topicFilter === "ALL")}>
            All Topics
          </button>
          {allTopics.map((t) => (
            <button key={t} onClick={() => setTopicFilter(t)} className={filterButtonClass(topicFilter === t)}>
              {TOPIC_LABELS[t] || t}
            </button>
          ))}
        </div>
      )}

      {/* Problems list */}
      <div className="rounded-2xl border border-border/80 bg-card/50 backdrop-blur-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">No problems match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((problem, i) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link
                  href={`/student/arena/${problem.slug}`}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-muted/50 transition-colors group"
                >
                  {/* Solved indicator */}
                  <div className="flex-shrink-0">
                    {problem.isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Title + topics */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand-teal truncate">
                      {problem.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {problem.topics.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {TOPIC_LABELS[t] || t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <DifficultyBadge difficulty={problem.difficulty} />

                  {/* Acceptance rate */}
                  <span className="hidden sm:block text-xs text-muted-foreground font-medium w-14 text-right">
                    {problem.acceptanceRate}%
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {problems.length} problems
      </p>
    </div>
  )
}
