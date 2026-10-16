"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

export interface ActivityDay {
  day: string
  minutes: number
  label: string
}

const defaultZeroWeeklyData: ActivityDay[] = [
  { day: "Mon", minutes: 0, label: "0m" },
  { day: "Tue", minutes: 0, label: "0m" },
  { day: "Wed", minutes: 0, label: "0m" },
  { day: "Thu", minutes: 0, label: "0m" },
  { day: "Fri", minutes: 0, label: "0m" },
  { day: "Sat", minutes: 0, label: "0m" },
  { day: "Sun", minutes: 0, label: "0m" },
]

export function WeeklyActivityChart({ data = defaultZeroWeeklyData }: { data?: ActivityDay[] }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-44 w-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Loading activity visualization...
      </div>
    )
  }

  // Ensure fixed proportional domain so Y-axis labels never squish together when minutes = 0
  const maxMinutes = Math.max(60, ...data.map((d) => d.minutes))
  const isZeroOrStandard = maxMinutes <= 60
  const yTicks = isZeroOrStandard ? [0, 15, 30, 45, 60] : undefined

  return (
    <div className="h-44 w-full select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="barTealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D6D6" stopOpacity={1} />
              <stop offset="100%" stopColor="#00AEB8" stopOpacity={0.65} />
            </linearGradient>
            <linearGradient id="barHoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={1} />
              <stop offset="100%" stopColor="#00D6D6" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.35} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 500 }}
          />
          <YAxis
            domain={[0, maxMinutes]}
            ticks={yTicks}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            unit="m"
            width={34}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 214, 214, 0.08)", radius: 6 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload
                return (
                  <div className="rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-2.5 shadow-xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <span className="w-2 h-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(0,214,214,0.8)]" />
                      <span>{item.day}</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Study Time:{" "}
                      <strong className="text-foreground font-semibold">
                        {item.minutes > 0 ? item.label : "0 mins"}
                      </strong>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="minutes"
            fill="url(#barTealGrad)"
            radius={[6, 6, 2, 2]}
            maxBarSize={28}
            animationDuration={800}
            animationEasing="ease-out"
            background={{ fill: "rgba(120, 120, 120, 0.07)", radius: 6 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

