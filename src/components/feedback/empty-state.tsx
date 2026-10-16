import * as React from "react"
import { LucideIcon, Inbox, Sparkles, FolderOpen, Search, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  actionComponent?: React.ReactNode
  variant?: "default" | "search" | "courses" | "assignments"
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionComponent,
  variant = "default",
  className = "",
}: EmptyStateProps) {
  const ResolvedIcon =
    variant === "search"
      ? Search
      : variant === "courses"
      ? BookOpen
      : variant === "assignments"
      ? FolderOpen
      : Icon

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/50 ${className}`}
    >
      {/* Decorative ambient backdrop */}
      <div className="absolute w-32 h-32 rounded-full bg-brand-teal/5 blur-2xl pointer-events-none" />

      {/* Emblem / Icon frame */}
      <div className="relative mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-muted/80 border border-border shadow-sm text-brand-ink dark:text-brand-cyan">
        <ResolvedIcon className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-40" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-teal" />
        </span>
      </div>

      <h3 className="text-base font-semibold text-foreground tracking-tight max-w-md">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}

      {actionComponent && <div className="mt-5">{actionComponent}</div>}

      {!actionComponent && actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Button asChild size="sm">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button onClick={onAction} size="sm">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
