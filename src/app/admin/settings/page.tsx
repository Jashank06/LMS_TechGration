"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Settings,
  Palette,
  Shield,
  Mail,
  HardDrive,
  Video,
  CreditCard,
  Layers,
  AlertOctagon,
  UserCheck,
  Award,
  Globe,
  Bell,
  Archive,
  Activity,
  Save,
  RefreshCw,
  Server,
  Database,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function PlatformSettingsPage() {
  const [settings, setSettings] = React.useState<Record<string, Record<string, any>>>({})
  const [loading, setLoading] = React.useState(true)
  const [savingSection, setSavingSection] = React.useState<string | null>(null)
  const [activeSection, setActiveSection] = React.useState("branding")

  const sectionsList = [
    { id: "branding", label: "1. Branding & Identity", icon: Palette },
    { id: "auth", label: "2. Authentication & Security", icon: Shield },
    { id: "email", label: "3. Email & SMTP", icon: Mail },
    { id: "storage", label: "4. Storage & Media (S3)", icon: HardDrive },
    { id: "video", label: "5. Video Streaming & Hosting", icon: Video },
    { id: "payment", label: "6. Payment & Taxation", icon: CreditCard },
    { id: "integrations", label: "7. Third-Party Integrations", icon: Layers },
    { id: "maintenance", label: "8. Maintenance Mode", icon: AlertOctagon },
    { id: "roles", label: "9. Default Roles & Access", icon: UserCheck },
    { id: "certificates", label: "10. Certificates & Badges", icon: Award },
    { id: "localization", label: "11. Localization & Timezone", icon: Globe },
    { id: "notifications", label: "12. Notification Preferences", icon: Bell },
    { id: "retention", label: "13. Retention & Data Policy", icon: Archive },
    { id: "telemetry", label: "14. System Health & Telemetry", icon: Activity },
  ]

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      }
    } catch (err) {
      toast.error("Failed to load platform settings")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleUpdateField = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const handleSaveSection = async (section: string) => {
    try {
      setSavingSection(section)
      const values = settings[section] || {}

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, values }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(`Saved configurations for [${section}]`)
      } else {
        toast.error("Failed to save settings", { description: data.error })
      }
    } catch (err) {
      toast.error("Network error while saving settings")
    } finally {
      setSavingSection(null)
    }
  }

  const s = settings[activeSection] || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Settings & Governance Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centrally manage environment policies, authentication rules, storage buckets, and integrations across 14 sections.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => handleSaveSection(activeSection)}
          disabled={savingSection !== null}
          className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold shadow-sm"
        >
          {savingSection === activeSection ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar (1 Col) */}
        <Card className="lg:col-span-1 border-border/80 p-2 space-y-1">
          {sectionsList.map((sec) => {
            const Icon = sec.icon
            const isActive = activeSection === sec.id
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  isActive
                    ? "bg-brand-teal/15 text-brand-ink dark:text-brand-cyan border border-brand-teal/30 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-brand-teal" : ""}`} />
                <span className="truncate">{sec.label}</span>
              </button>
            )
          })}
        </Card>

        {/* Section Forms (3 Cols) */}
        <Card className="lg:col-span-3 border-border/80">
          <CardHeader className="border-b border-border/60 bg-muted/20 py-4 px-6">
            <CardTitle className="text-base font-bold capitalize">
              {sectionsList.find((sec) => sec.id === activeSection)?.label}
            </CardTitle>
            <CardDescription className="text-xs">
              Live database configurations persisted in MongoDB platform_settings collection.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
                <span>Loading configuration values from MongoDB...</span>
              </div>
            ) : activeSection === "branding" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Portal Title</Label>
                  <Input
                    value={s.platform_name || ""}
                    onChange={(e) => handleUpdateField("branding", "platform_name", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Brand Tagline</Label>
                  <Input
                    value={s.tagline || ""}
                    onChange={(e) => handleUpdateField("branding", "tagline", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Electric Teal Brand Token</Label>
                  <Input
                    value={s.primary_color || "#00D6D6"}
                    onChange={(e) => handleUpdateField("branding", "primary_color", e.target.value)}
                    className="rounded-xl font-mono text-xs w-40"
                  />
                </div>
              </div>
            ) : activeSection === "auth" ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={s.password_min_length || 8}
                    onChange={(e) => handleUpdateField("auth", "password_min_length", Number(e.target.value))}
                    className="rounded-xl w-36"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <div>
                    <Label className="font-semibold text-xs">Require Special Symbols</Label>
                    <p className="text-[11px] text-muted-foreground">Mandates @$!%*?& symbols in passwords</p>
                  </div>
                  <Switch
                    checked={s.require_special_character ?? true}
                    onCheckedChange={(checked) => handleUpdateField("auth", "require_special_character", checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                  <div>
                    <Label className="font-semibold text-xs">Self-Registration Allowed</Label>
                    <p className="text-[11px] text-muted-foreground">Enables public student account signups</p>
                  </div>
                  <Switch
                    checked={s.self_registration_enabled ?? true}
                    onCheckedChange={(checked) => handleUpdateField("auth", "self_registration_enabled", checked)}
                  />
                </div>
              </div>
            ) : activeSection === "email" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>SMTP Host</Label>
                  <Input
                    value={s.smtp_host || "localhost"}
                    onChange={(e) => handleUpdateField("email", "smtp_host", e.target.value)}
                    className="rounded-xl font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={s.smtp_port || 1025}
                    onChange={(e) => handleUpdateField("email", "smtp_port", Number(e.target.value))}
                    className="rounded-xl font-mono text-xs w-36"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Default From Email</Label>
                  <Input
                    value={s.smtp_from || "TechGration LMS <noreply@techgration.com>"}
                    onChange={(e) => handleUpdateField("email", "smtp_from", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            ) : activeSection === "maintenance" ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <div>
                    <Label className="font-bold text-amber-500 text-xs">Activate Maintenance Mode</Label>
                    <p className="text-[11px] text-foreground/80 mt-0.5">
                      Restricts access to super-administrators and shows maintenance banner to learners.
                    </p>
                  </div>
                  <Switch
                    checked={s.maintenance_mode_active ?? false}
                    onCheckedChange={(checked) => handleUpdateField("maintenance", "maintenance_mode_active", checked)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Public Downtime Message</Label>
                  <Textarea
                    value={s.maintenance_message || "System maintenance in progress. We will return shortly."}
                    onChange={(e) => handleUpdateField("maintenance", "maintenance_message", e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            ) : activeSection === "telemetry" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-brand-teal/30 flex items-start gap-3">
                  <Database className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-foreground">
                      MongoDB Replica Set Engine Active
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cluster: <code className="font-mono text-brand-teal font-bold">mongodb://localhost:27017</code> (ReplicaSet: rs0)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/60 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Database Engine</span>
                        <span className="font-bold text-foreground">MongoDB 7.0 Jammy</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">ORM Provider</span>
                        <span className="font-bold text-foreground">Prisma 6.19 (MongoDB)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Node.js Runtime</span>
                        <span className="font-bold text-foreground">v22.22.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(s).map(([key, val]) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="capitalize font-semibold text-xs">{key.replace(/_/g, " ")}</Label>
                    <Input
                      value={typeof val === "object" ? JSON.stringify(val) : val?.toString() || ""}
                      onChange={(e) => handleUpdateField(activeSection, key, e.target.value)}
                      className="rounded-xl text-xs font-mono"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-border/60 flex justify-end">
              <Button
                onClick={() => handleSaveSection(activeSection)}
                disabled={savingSection !== null}
                className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl"
              >
                Save {sectionsList.find((sec) => sec.id === activeSection)?.label.split(".")[1]}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
