"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface AnalyticsChartsProps {
  analytics: {
    monthlyEnrollments: any[]
    courseCompletionRates: any[]
    weeklyAttendance: any[]
    gradeDistribution: any[]
    gradingWorkload: any[]
  }
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* Chart 1: Enrollment Growth Over Time */}
      <Card className="shadow-card border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Learner Enrollment Growth (6-Month Trend)</CardTitle>
          <CardDescription className="text-xs">
            Monthly aggregate enrollments across all assigned cloud engineering courses.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.monthlyEnrollments}>
              <defs>
                <linearGradient id="tealGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D6D6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00D6D6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252D33" opacity={0.3} />
              <XAxis dataKey="month" stroke="#66727D" fontSize={11} tickLine={false} />
              <YAxis stroke="#66727D" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171C20",
                  borderColor: "#252D33",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#00D6D6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tealGlow)"
                name="Total Enrollments"
              />
              <Area
                type="monotone"
                dataKey="activeStudents"
                stroke="#18E6E6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                name="Active Students"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 2: Course Completion Rates & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Course Completion Rates */}
        <Card className="shadow-card border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Curriculum Completion Rates</CardTitle>
            <CardDescription className="text-xs">
              Percentage of learners completing vs. actively progressing per course.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.courseCompletionRates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#252D33" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} stroke="#66727D" fontSize={11} />
                <YAxis dataKey="course" type="category" stroke="#66727D" fontSize={10} width={110} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171C20",
                    borderColor: "#252D33",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="completionRate" fill="#00D6D6" radius={[0, 4, 4, 0]} name="Completed %" />
                <Bar dataKey="inProgressRate" fill="#00757E" radius={[0, 4, 4, 0]} name="In Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Assessment Grade Distribution */}
        <Card className="shadow-card border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Assessment Grade Distribution</CardTitle>
            <CardDescription className="text-xs">
              Student scoring frequency across grade performance tiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D33" opacity={0.3} />
                <XAxis dataKey="grade" stroke="#66727D" fontSize={10} tickLine={false} />
                <YAxis stroke="#66727D" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171C20",
                    borderColor: "#252D33",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="count" fill="#00D6D6" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Weekly Attendance Trends & Grading Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Attendance Trends */}
        <Card className="shadow-card border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Weekly Live Session Attendance</CardTitle>
            <CardDescription className="text-xs">
              Session-by-session presence, tardiness, and absence rates.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D33" opacity={0.3} />
                <XAxis dataKey="session" stroke="#66727D" fontSize={11} tickLine={false} />
                <YAxis stroke="#66727D" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171C20",
                    borderColor: "#252D33",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="presentPct" fill="#16A675" radius={[4, 4, 0, 0]} name="Present %" />
                <Line type="monotone" dataKey="latePct" stroke="#E6A23C" strokeWidth={2} name="Late %" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Grading Turnaround Workload */}
        <Card className="shadow-card border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Assignment Grading Turnaround</CardTitle>
            <CardDescription className="text-xs">
              Weekly submissions evaluated and average grading speed (hours).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.gradingWorkload}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252D33" opacity={0.3} />
                <XAxis dataKey="week" stroke="#66727D" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#66727D" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#E6A23C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171C20",
                    borderColor: "#252D33",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar yAxisId="left" dataKey="graded" fill="#00D6D6" radius={[4, 4, 0, 0]} name="Submissions Graded" />
                <Line yAxisId="right" type="monotone" dataKey="avgTurnaroundHours" stroke="#E6A23C" strokeWidth={2} name="Avg Turnaround (Hrs)" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
