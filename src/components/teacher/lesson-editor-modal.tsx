"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Video,
  FileText,
  HelpCircle,
  CheckSquare,
  Play,
  Save,
  Trash2,
  Paperclip,
  ExternalLink,
} from "lucide-react"
import { type TeacherLesson } from "@/server/services/teacher-mock-data"

interface LessonEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: TeacherLesson | null
  onSave: (updated: Partial<TeacherLesson>) => void
}

export function LessonEditorModal({
  open,
  onOpenChange,
  lesson,
  onSave,
}: LessonEditorModalProps) {
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"VIDEO" | "READING" | "QUIZ" | "ASSIGNMENT">("VIDEO")
  const [durationSec, setDurationSec] = React.useState(600)
  const [videoUrl, setVideoUrl] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isPreview, setIsPreview] = React.useState(false)

  React.useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setType(lesson.type)
      setDurationSec(lesson.durationSec)
      setVideoUrl(lesson.videoUrl || "")
      setContent(lesson.content || "")
      setIsPreview(lesson.isPreview)
    } else {
      setTitle("")
      setType("VIDEO")
      setDurationSec(600)
      setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
      setContent("")
      setIsPreview(false)
    }
  }, [lesson, open])

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title,
      type,
      durationSec: Number(durationSec),
      videoUrl: type === "VIDEO" ? videoUrl : undefined,
      content,
      isPreview,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Video className="w-4 h-4 text-brand-teal" />
            <span>{lesson ? "Edit Lesson Item" : "Create New Lesson"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Lesson Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1.2 Multi-Stage Docker Builds & Distroless Containers"
              className="text-xs sm:text-sm h-9"
              required
            />
          </div>

          {/* Type & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Lesson Format</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-xs focus:ring-2 focus:ring-ring"
              >
                <option value="VIDEO" className="bg-popover text-popover-foreground">Video Lecture</option>
                <option value="READING" className="bg-popover text-popover-foreground">Reading Article</option>
                <option value="ASSIGNMENT" className="bg-popover text-popover-foreground">Hands-On Assignment</option>
                <option value="QUIZ" className="bg-popover text-popover-foreground">Knowledge Quiz</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Duration (Seconds)</Label>
              <Input
                type="number"
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
                min={0}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">
                ≈ {Math.round(durationSec / 60)} minutes
              </span>
            </div>
          </div>

          {/* Video URL & Live Player Preview */}
          {type === "VIDEO" && (
            <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Stream URL (MP4, HLS, or YouTube)</span>
                </Label>
              </div>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 text-xs font-mono"
              />

              {videoUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-border bg-black aspect-video max-h-52 w-full flex items-center justify-center">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Body Content / Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Markdown Content / Student Notes</Label>
            <Textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide lesson transcript, key terminal commands, or study guidelines..."
              className="text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Free Preview Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
            <div>
              <div className="font-semibold text-xs text-foreground">Free Course Preview</div>
              <div className="text-[11px] text-muted-foreground">
                Allow un-enrolled learners to view this lesson for free in the catalog.
              </div>
            </div>
            <Switch checked={isPreview} onCheckedChange={setIsPreview} />
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="shadow-sm gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Lesson</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
