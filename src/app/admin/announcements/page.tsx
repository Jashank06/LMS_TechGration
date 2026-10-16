"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Megaphone,
  PlusCircle,
  Trash2,
  Users,
  GraduationCap,
  Laptop,
  Calendar,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface AnnouncementItem {
  id: string
  title: string
  body: string
  targetRole: "ALL" | "STUDENT" | "TEACHER"
  publishedAt: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [targetRole, setTargetRole] = React.useState<"ALL" | "STUDENT" | "TEACHER">("ALL")

  const fetchAnnouncements = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/announcements")
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements)
      }
    } catch (err) {
      toast.error("Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, targetRole }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Broadcast failed", { description: data.error })
        return
      }

      toast.success("Announcement broadcasted successfully!")
      setDialogOpen(false)
      setTitle("")
      setBody("")
      setTargetRole("ALL")
      fetchAnnouncements()
    } catch (err) {
      toast.error("Network error while creating announcement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this announcement?")) return

    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Announcement removed")
        fetchAnnouncements()
      }
    } catch (err) {
      toast.error("Failed to delete")
    }
  }

  const getTargetBadge = (role: string) => {
    switch (role) {
      case "STUDENT":
        return <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> Students Only</Badge>
      case "TEACHER":
        return <Badge className="bg-blue-500/15 text-blue-400 text-[10px] gap-1"><Laptop className="w-3 h-3" /> Teachers Only</Badge>
      default:
        return <Badge className="bg-brand-teal/15 text-brand-cyan text-[10px] gap-1"><Users className="w-3 h-3" /> Everyone</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Announcements & Operational Broadcasts
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Dispatch urgent updates, system notices, and targeted broadcasts to student and faculty portals.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Broadcast</span>
        </Button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
            <span>Loading announcements from MongoDB...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No active announcements broadcasted yet.
          </div>
        ) : (
          announcements.map((item) => (
            <Card key={item.id} className="border-border/80 card-shine overflow-hidden">
              <CardHeader className="py-4 px-6 bg-muted/20 border-b border-border/60">
                <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-teal/15 flex items-center justify-center text-brand-ink dark:text-brand-cyan shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Published {new Date(item.publishedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {getTargetBadge(item.targetRole)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-xs text-foreground/90 leading-relaxed">
                {item.body}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Broadcast Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Broadcast Platform Announcement</DialogTitle>
            <DialogDescription>
              Create a high-visibility banner announcement visible to learners or instructors.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Headline Title</Label>
              <Input
                required
                placeholder="e.g. Scheduled Maintenance Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Target Audience</Label>
              <Select
                value={targetRole}
                onValueChange={(val) => { if (val) setTargetRole(val as any) }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Everyone (Global Portal Banner)</SelectItem>
                  <SelectItem value="STUDENT">Students Only</SelectItem>
                  <SelectItem value="TEACHER">Teachers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Detailed Announcement Message</Label>
              <Textarea
                required
                rows={4}
                placeholder="Write message details..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl">
                Broadcast Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
