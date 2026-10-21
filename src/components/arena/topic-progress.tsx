"use client"

import { TOPIC_LABELS } from "@/lib/arena-constants"

interface TopicProgressProps {
  topicProgress: Record<string, number>
  totalByTopic?: Record<string, number>
}

export function TopicProgress({ topicProgress }: TopicProgressProps) {
  const topics = Object.entries(topicProgress).sort((a, b) => b[1] - a[1])

  if (topics.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        Start solving problems to see your topic progress
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {topics.map(([topic, count]) => (
        <div key={topic} className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground w-32 truncate">
            {TOPIC_LABELS[topic] || topic}
          </span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all"
              style={{ width: `${Math.min(100, count * 10)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-foreground w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}
