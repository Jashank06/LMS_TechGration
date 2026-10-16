"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

export function ThemeToggle({
  variant = "button",
  className = "",
}: {
  variant?: "button" | "segmented"
  className?: string
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg bg-muted/60 animate-pulse ${className}`} />
    )
  }

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center gap-1 p-1 rounded-lg bg-muted/70 border border-border/80 ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={theme === "light"}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            theme === "light"
              ? "bg-background text-foreground shadow-sm shadow-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={theme === "dark"}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            theme === "dark"
              ? "bg-background text-foreground shadow-sm shadow-black/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          aria-pressed={theme === "system"}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            theme === "system"
              ? "bg-background text-foreground shadow-sm shadow-black/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>System</span>
        </button>
      </div>
    )
  }

  // Default compact toggle button
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      title={`Current: ${theme}. Click to switch theme`}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="w-4 h-4 text-brand-cyan transition-transform rotate-0" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500 transition-transform rotate-0" />
      )}
    </button>
  )
}
