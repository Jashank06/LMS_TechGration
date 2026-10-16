import * as React from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ErrorStateProps {
  title?: string
  message?: string
  requestId?: string
  onRetry?: () => void
  showHome?: boolean
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while processing your request. Please try again.",
  requestId,
  onRetry,
  showHome = true,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 ${className}`}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {message}
      </p>

      {requestId && (
        <code className="mt-3 px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-foreground border border-border">
          Reference ID: {requestId}
        </code>
      )}

      <div className="mt-6 flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="default" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </Button>
        )}
        {showHome && (
          <Button asChild size="sm" variant="outline" className="gap-2">
            <a href="/">
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
