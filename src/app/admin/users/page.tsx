"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Download,
  Shield,
  ShieldAlert,
  GraduationCap,
  Laptop,
  Crown,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  KeyRound,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserItem {
  id: string
  name: string
  email: string
  role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN"
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
  createdAt: string
  enrollmentsCount: number
  phone?: string
  headline?: string
}

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<UserItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newRole, setNewRole] = React.useState<string>("STUDENT")
  const [newHeadline, setNewHeadline] = React.useState("")
  const [tempPasswordAlert, setTempPasswordAlert] = React.useState<string | null>(null)

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
        page: page.toString(),
        limit: "10",
      })
      const res = await fetch(`/api/admin/users?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.total)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          headline: newHeadline,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Creation failed", { description: data.error })
        return
      }

      toast.success("User created successfully!")
      if (data.temporaryPassword) {
        setTempPasswordAlert(data.temporaryPassword)
      } else {
        setCreateDialogOpen(false)
      }

      setNewName("")
      setNewEmail("")
      setNewHeadline("")
      fetchUsers()
    } catch (err) {
      toast.error("Error creating user")
    }
  }

  const handleUpdateStatus = async (user: UserItem, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Status update blocked", { description: data.error })
        return
      }

      toast.success(`User marked as ${newStatus}`)
      fetchUsers()
    } catch (err) {
      toast.error("Error updating status")
    }
  }

  const handleUpdateRole = async (user: UserItem, updatedRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: updatedRole }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Role update failed", { description: data.error })
        return
      }

      toast.success(`Role changed to ${updatedRole}`)
      fetchUsers()
    } catch (err) {
      toast.error("Error updating role")
    }
  }

  const handleResetPassword = async (user: UserItem) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, resetPassword: true }),
      })

      const data = await res.json()
      if (res.ok && data.newTempPassword) {
        setTempPasswordAlert(data.newTempPassword)
        toast.success("Password reset generated")
      }
    } catch (err) {
      toast.error("Error resetting password")
    }
  }

  const handleExportCSV = () => {
    if (users.length === 0) {
      toast.info("No user data to export")
      return
    }

    const headers = ["ID", "Name", "Email", "Role", "Status", "Enrollments", "Created At"]
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.status,
      u.enrollmentsCount,
      new Date(u.createdAt).toISOString(),
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `techgration_users_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Exported users to CSV")
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/30 gap-1"><Crown className="w-3 h-3" /> Super Admin</Badge>
      case "ADMIN":
        return <Badge className="bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30 gap-1"><ShieldCheck className="w-3 h-3" /> Admin</Badge>
      case "TEACHER":
        return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 gap-1"><Laptop className="w-3 h-3" /> Teacher</Badge>
      default:
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1"><GraduationCap className="w-3 h-3" /> Student</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">Active</Badge>
      case "SUSPENDED":
        return <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/25">Suspended</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground border border-border">Deactivated</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            User Management & Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse institutional accounts, manage permissions, suspend accounts, and export roster data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2 border-border/80 hover:border-brand-teal/40"
          >
            <Download className="w-4 h-4 text-brand-teal" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setTempPasswordAlert(null)
              setCreateDialogOpen(true)
            }}
            className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add / Invite User</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9 h-10 border-border/80 focus:border-brand-teal rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-36">
                <Select
                  value={roleFilter}
                  onValueChange={(val) => {
                    if (val) setRoleFilter(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="TEACHER">Teachers</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-36">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    if (val) setStatusFilter(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchUsers}
                className="p-2.5 h-10 rounded-xl text-muted-foreground hover:text-foreground"
                title="Refresh table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <Card className="border-border/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Information</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Courses Enrolled</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
                    <span>Loading users from MongoDB...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No users found matching your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                      {u.headline && (
                        <span className="text-[11px] text-muted-foreground/70 truncate max-w-xs">
                          {u.headline}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell>{getStatusBadge(u.status)}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{u.enrollmentsCount} courses</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        className="h-8 w-8 p-0 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl">
                        <DropdownMenuItem onClick={() => handleResetPassword(u)} className="cursor-pointer gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-brand-teal" />
                          <span>Reset Password</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(u, "SUSPENDED")}
                            className="text-amber-500 focus:bg-amber-500/10 cursor-pointer gap-2"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Suspend Account</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(u, "ACTIVE")}
                            className="text-emerald-500 focus:bg-emerald-500/10 cursor-pointer gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Activate Account</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateRole(u, "STUDENT")} className="cursor-pointer">
                          Set Role: Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(u, "TEACHER")} className="cursor-pointer">
                          Set Role: Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRole(u, "ADMIN")} className="cursor-pointer">
                          Set Role: Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-border/80 text-xs text-muted-foreground">
          <span>
            Showing {users.length} of {totalCount} total accounts
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Invite New Institutional User</DialogTitle>
            <DialogDescription>
              Create a learner or educator account with automatic temporary password credentials.
            </DialogDescription>
          </DialogHeader>

          {tempPasswordAlert ? (
            <div className="p-4 rounded-xl bg-brand-teal/15 border border-brand-teal/30 space-y-3">
              <div className="flex items-center gap-2 text-brand-ink dark:text-brand-cyan font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Temporary Password Generated</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this credential with the user. They will be prompted to change it upon first login:
              </p>
              <div className="p-3 bg-black/40 rounded-lg font-mono text-sm font-bold text-brand-teal select-all text-center">
                {tempPasswordAlert}
              </div>
              <Button
                className="w-full bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold"
                onClick={() => {
                  setTempPasswordAlert(null)
                  setCreateDialogOpen(false)
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Institutional Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="ramesh@techgration.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Portal Role</Label>
                <Select value={newRole} onValueChange={(val) => { if (val) setNewRole(val) }}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student (Learner)</SelectItem>
                    <SelectItem value="TEACHER">Teacher (Instructor)</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headline">Headline / Department</Label>
                <Input
                  id="headline"
                  placeholder="e.g. Computer Science Undergraduate"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl"
                >
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
