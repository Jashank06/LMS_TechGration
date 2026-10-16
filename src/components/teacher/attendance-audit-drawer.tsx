"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { History, Clock, ArrowRight, User } from "lucide-react"
import { type AttendanceAuditLog } from "@/server/services/teacher-mock-data"

interface AttendanceAuditDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  audits: AttendanceAuditLog[]
}

export function AttendanceAuditDrawer({
  open,
  onOpenChange,
  audits,
}: AttendanceAuditDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 space-y-4 shadow-2xl">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-brand-teal" />
            <span>Attendance Append-Only Audit History</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {audits.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No modifications recorded yet for this session.
            </div>
          ) : (
            audits.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{log.studentName}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <Badge variant="outline" className="text-[10px]">
                    {log.previousStatus}
                  </Badge>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="outline" className="text-[10px] bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border-brand-teal/30">
                    {log.newStatus}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-[11px] italic bg-background/60 p-2 rounded-lg border border-border/50">
                  &quot;{log.reason}&quot;
                </p>

                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Changed by: {log.changedBy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
