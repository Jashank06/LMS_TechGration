"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  BookOpen,
  Video,
  FileCheck2,
  HelpCircle,
  Trophy,
  Award,
  Settings,
  LayoutDashboard,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const navigationItems = [
    { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, category: "Navigation" },
    { title: "My Enrolled Courses", href: "/student/my-courses", icon: BookOpen, category: "Navigation" },
    { title: "Course Catalog", href: "/student/catalog", icon: Compass, category: "Navigation" },
    { title: "Course Leaderboard", href: "/student/leaderboard", icon: Trophy, category: "Performance" },
    { title: "Quizzes & Tests", href: "/student/quizzes", icon: HelpCircle, category: "Assessments" },
    { title: "Assignments Workspace", href: "/student/assignments", icon: FileCheck2, category: "Assessments" },
    { title: "Live Classes Schedule", href: "/student/live-classes", icon: Video, category: "Classes" },
    { title: "Certificates Center", href: "/student/certificates", icon: Award, category: "Credentials" },
    { title: "Profile & Settings", href: "/student/settings", icon: Settings, category: "Account" },
  ]

  const filtered = navigationItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (href: string) => {
    onOpenChange(false)
    setQuery("")
    router.push(href)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-xl border-border bg-card shadow-2xl">
        <DialogTitle className="sr-only">Quick Navigation Search</DialogTitle>
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, course, or shortcut... (e.g. 'AWS', 'Live', 'Quiz')"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching pages or courses found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-foreground hover:bg-accent/80 hover:text-accent-foreground transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-secondary text-muted-foreground group-hover:text-brand-ink dark:group-hover:text-brand-teal group-hover:bg-brand-teal/10 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                </button>
              )
            })
          )}
        </div>

        <div className="border-t border-border bg-muted/40 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Tip: Press <kbd className="font-mono bg-background px-1 py-0.5 rounded border border-border">⌘K</kbd> anywhere to search</span>
          <span>TechGration LMS</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
