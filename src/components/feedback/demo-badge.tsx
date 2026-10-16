import * as React from "react"
import { Database } from "lucide-react"

export function DemoDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 ${className}`}
      title="This view contains demonstration seed records"
    >
      <Database className="w-3 h-3 text-amber-500" />
      <span>Demo Data</span>
    </span>
  )
}
