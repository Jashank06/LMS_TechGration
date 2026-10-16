"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  FileText,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Terminal,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Sheet } from "@/components/ui/sheet"

interface AuditLogItem {
  id: string
  actorId?: string | null
  actorEmail: string
  actorRole?: string | null
  action: string
  resource: string
  resourceId?: string | null
  details?: any
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("ALL")
  const [resourceFilter, setResourceFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)

  // Drawer detail state
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        search,
        action: actionFilter,
        resource: resourceFilter,
        page: page.toString(),
        limit: "20",
      })
      const res = await fetch(`/api/admin/audit-logs?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.total)
      }
    } catch (err) {
      toast.error("Failed to load audit logs")
    } finally {
      setLoading(false)
    }
  }, [search, actionFilter, resourceFilter, page])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleExportCSV = () => {
    if (logs.length === 0) return
    const headers = ["Timestamp", "Actor Email", "Role", "Action", "Resource", "IP Address", "Details"]
    const rows = logs.map((l) => [
      new Date(l.createdAt).toISOString(),
      l.actorEmail,
      l.actorRole || "N/A",
      l.action,
      l.resource,
      l.ipAddress || "N/A",
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `security_audit_logs_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Exported audit logs to CSV")
  }

  const getActionBadge = (action: string) => {
    if (action.includes("FAILED") || action.includes("BLOCKED") || action.includes("DELETE")) {
      return <Badge className="bg-destructive/15 text-destructive border border-destructive/25 font-mono text-[10px]">{action}</Badge>
    }
    if (action.includes("APPROVE") || action.includes("SUCCESS")) {
      return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono text-[10px]">{action}</Badge>
    }
    return <Badge className="bg-brand-teal/15 text-brand-cyan border border-brand-teal/25 font-mono text-[10px]">{action}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Immutable Security Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tamper-proof append-only ledger tracking all administrative access, curriculum decisions, and user changes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-2 border-border/80 hover:border-brand-teal/40"
        >
          <Download className="w-4 h-4 text-brand-teal" />
          <span>Export Compliance CSV</span>
        </Button>
      </div>

      {/* Security Immutability Guarantee Banner */}
      <div className="p-4 rounded-xl bg-card border border-brand-teal/30 shadow-sm flex items-start gap-3 text-xs">
        <Lock className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Write-Only Immutability Guarantee Active</span>
            <Badge className="bg-brand-teal/15 text-brand-cyan text-[10px]">Zero Update/Delete API</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            This security collection is append-only. No administrative mutation endpoint exists to edit, alter, or purge audit
            records, fulfilling SOC2 and ISO compliance requirements.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by actor, action type, resource, or IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-40">
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  if (val) setActionFilter(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</SelectItem>
                  <SelectItem value="AUTH_LOGIN_FAILED">AUTH_LOGIN_FAILED</SelectItem>
                  <SelectItem value="USER_CREATE">USER_CREATE</SelectItem>
                  <SelectItem value="USER_UPDATE">USER_UPDATE</SelectItem>
                  <SelectItem value="COURSE_REVIEW_APPROVE">COURSE_APPROVE</SelectItem>
                  <SelectItem value="RBAC_PERMISSIONS_UPDATE">RBAC_UPDATE</SelectItem>
                  <SelectItem value="PLATFORM_SETTING_UPDATE">SETTINGS_UPDATE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="sm" onClick={fetchLogs} className="p-2.5 h-10 rounded-xl">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-border/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action Event</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead>Client IP</TableHead>
              <TableHead className="text-right">Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
                    <span>Loading audit stream from MongoDB...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No security events found matching query.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex flex-col font-mono text-[11px]">
                      <span className="font-semibold text-foreground">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-foreground">{log.actorEmail}</span>
                      {log.actorRole && (
                        <span className="text-[10px] text-muted-foreground uppercase">{log.actorRole}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">{log.resource}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ipAddress || "127.0.0.1"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLog(log)
                        setDrawerOpen(true)
                      }}
                      className="text-xs gap-1.5 h-8 text-brand-teal hover:bg-brand-teal/10"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-border/80 text-xs text-muted-foreground">
          <span>
            Showing {logs.length} of {totalCount} total audit records
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 px-2.5 rounded-lg"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="font-medium text-foreground">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 px-2.5 rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* JSON Payload Inspection Drawer */}
      <Sheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Audit Event Metadata"
        description={selectedLog ? `Event ID: ${selectedLog.id}` : ""}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-bold text-brand-teal">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actor:</span>
                <span className="text-foreground">{selectedLog.actorEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resource:</span>
                <span className="text-foreground">{selectedLog.resource} ({selectedLog.resourceId || "global"})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="text-foreground">{selectedLog.ipAddress || "127.0.0.1"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="text-foreground">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-muted-foreground uppercase text-[11px] block">
                Structured Payload JSON:
              </span>
              <pre className="p-4 rounded-xl bg-black/60 border border-border/80 text-brand-teal overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            {selectedLog.userAgent && (
              <div className="space-y-1.5">
                <span className="font-bold text-muted-foreground uppercase text-[11px] block">
                  Client User-Agent:
                </span>
                <p className="p-3 rounded-xl bg-muted/30 border border-border text-muted-foreground text-[10px] break-all">
                  {selectedLog.userAgent}
                </p>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
