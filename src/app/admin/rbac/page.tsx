"use client"

import * as React from "react"
import { motion } from "motion/react"
import { toast } from "sonner"
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  Laptop,
  GraduationCap,
  Save,
  RotateCcw,
  AlertCircle,
  Lock,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

interface PermissionItem {
  key: string
  category: string
  label: string
}

export default function RbacManagementPage() {
  const [permissions, setPermissions] = React.useState<PermissionItem[]>([])
  const [matrix, setMatrix] = React.useState<Record<string, Record<string, boolean>>>({
    STUDENT: {},
    TEACHER: {},
    ADMIN: {},
    SUPER_ADMIN: {},
  })
  const [initialMatrix, setInitialMatrix] = React.useState<Record<string, Record<string, boolean>>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const fetchRbac = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/rbac")
      if (res.ok) {
        const data = await res.json()
        setPermissions(data.permissions)
        setMatrix(data.matrix)
        setInitialMatrix(JSON.parse(JSON.stringify(data.matrix)))
      }
    } catch (err) {
      toast.error("Failed to fetch RBAC matrix")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchRbac()
  }, [fetchRbac])

  const handleToggle = (role: string, permissionKey: string) => {
    if (role === "SUPER_ADMIN") return // Immutable

    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: !prev[role]?.[permissionKey],
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updates: Array<{ role: string; permission: string; granted: boolean }> = []

      for (const role of ["STUDENT", "TEACHER", "ADMIN"]) {
        for (const p of permissions) {
          const currentVal = matrix[role]?.[p.key] ?? false
          const initialVal = initialMatrix[role]?.[p.key] ?? false
          if (currentVal !== initialVal) {
            updates.push({
              role,
              permission: p.key,
              granted: currentVal,
            })
          }
        }
      }

      if (updates.length === 0) {
        toast.info("No permission modifications detected")
        setSaving(false)
        return
      }

      const res = await fetch("/api/admin/rbac", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Failed to save changes", { description: data.error })
        return
      }

      toast.success("Permission matrix saved!", {
        description: `Updated ${updates.length} permissions successfully.`,
      })
      setInitialMatrix(JSON.parse(JSON.stringify(matrix)))
    } catch (err) {
      toast.error("Network error while saving matrix")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setMatrix(JSON.parse(JSON.stringify(initialMatrix)))
    toast.info("Reverted unsaved changes")
  }

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)))

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Granular RBAC & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Database-backed access matrix governing functional capabilities across all 4 platform roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 border-border/80"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold shadow-sm"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-charcoal border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Matrix</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Super Admin Immutable Protection Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-foreground/90">
        <Crown className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-500 uppercase tracking-wide">
            Super Administrator Guard Active:
          </span>{" "}
          Super Administrator privileges are immutable and hard-locked to prevent system paralysis.
          The last active Super Admin cannot be deleted, deactivated, or demoted.
        </div>
      </div>

      {/* Permissions Matrix Tables by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryPermissions = permissions.filter((p) => p.category === category)
          return (
            <Card key={category} className="border-border/80 overflow-hidden">
              <CardHeader className="bg-muted/20 py-3 px-5 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm tracking-wide text-foreground uppercase">
                    {category} Capabilities
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {categoryPermissions.length} permissions mapped
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Permission Name & Scope</TableHead>
                      <TableHead className="text-center w-28">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-400">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Student</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-28">
                        <div className="flex items-center justify-center gap-1.5 text-blue-400">
                          <Laptop className="w-3.5 h-3.5" />
                          <span>Teacher</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-28">
                        <div className="flex items-center justify-center gap-1.5 text-brand-cyan">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-32">
                        <div className="flex items-center justify-center gap-1.5 text-amber-400">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Super Admin</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryPermissions.map((perm) => (
                      <TableRow key={perm.key}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs">{perm.label}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{perm.key}</span>
                          </div>
                        </TableCell>

                        {/* Student */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={matrix.STUDENT?.[perm.key] ?? false}
                              onCheckedChange={() => handleToggle("STUDENT", perm.key)}
                            />
                          </div>
                        </TableCell>

                        {/* Teacher */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={matrix.TEACHER?.[perm.key] ?? false}
                              onCheckedChange={() => handleToggle("TEACHER", perm.key)}
                            />
                          </div>
                        </TableCell>

                        {/* Admin */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={matrix.ADMIN?.[perm.key] ?? false}
                              onCheckedChange={() => handleToggle("ADMIN", perm.key)}
                            />
                          </div>
                        </TableCell>

                        {/* Super Admin (Locked ON) */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Granted</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
