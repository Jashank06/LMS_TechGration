import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"

export interface InlineAlertProps {
  variant?: "info" | "success" | "warning" | "error"
  title?: string
  message?: React.ReactNode
  children?: React.ReactNode
  onDismiss?: () => void
  className?: string
}

export function InlineAlert({
  variant = "info",
  title,
  message,
  children,
  onDismiss,
  className = "",
}: InlineAlertProps) {
  const styles = {
    info: {
      wrapper: "bg-info/10 text-info-foreground border-info/25",
      icon: Info,
      iconColor: "text-info",
    },
    success: {
      wrapper: "bg-success/10 text-success-foreground border-success/25",
      icon: CheckCircle2,
      iconColor: "text-success",
    },
    warning: {
      wrapper: "bg-warning/10 text-warning-foreground border-warning/25",
      icon: AlertTriangle,
      iconColor: "text-warning",
    },
    error: {
      wrapper: "bg-destructive/10 text-destructive-foreground border-destructive/25",
      icon: AlertCircle,
      iconColor: "text-destructive",
    },
  }[variant]

  const Icon = styles.icon

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-sm ${styles.wrapper} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${styles.iconColor}`} />
      <div className="flex-1 min-w-0">
        {title && <h5 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-0.5">{title}</h5>}
        <div className="text-foreground/90 text-xs leading-relaxed">{children ?? message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
