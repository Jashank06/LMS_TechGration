"use client"

import * as React from "react"
import Image from "next/image"
import {
  Sparkles,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Eye,
  Layers,
  CheckCircle2,
  Tv,
  LayoutGrid,
  Camera,
  UploadCloud,
  Loader2,
  ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface LiveCourseCardPreviewProps {
  title: string
  code: string
  subtitle: string
  category: string
  level: string
  format: string
  thumbnailUrl: string
  durationHours: number
  instructorName?: string
  onThumbnailChange?: (url: string) => void
  courseTitle?: string
}

export function LiveCourseCardPreview({
  title,
  code,
  subtitle,
  category,
  level,
  format,
  thumbnailUrl,
  durationHours,
  instructorName = "Faculty Instructor",
  onThumbnailChange,
  courseTitle,
}: LiveCourseCardPreviewProps) {
  const [viewMode, setViewMode] = React.useState<"card" | "hero">("card")
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUploadFile = async (file: File) => {
    if (!onThumbnailChange) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, or AVIF).")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file exceeds 10MB limit. Please upload a smaller image.")
      return
    }

    setIsUploading(true)
    setUploadProgress("Uploading to Cloudinary...")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append(
        "courseSlug",
        (courseTitle || title || "course")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 30)
      )

      const res = await fetch("/api/teacher/courses/upload-thumbnail", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed")
      }

      onThumbnailChange(data.url)
      toast.success("Cover image uploaded to Cloudinary CDN successfully!")
    } catch (err: any) {
      console.error("Upload error:", err)
      toast.error(err.message || "Could not upload image to Cloudinary.")
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0])
    }
  }

  const displayTitle = title.trim() || "Untitled Course Title"
  const displaySubtitle =
    subtitle.trim() || "Course subtitle and value proposition for students will appear here..."
  const displayThumb = thumbnailUrl || "/brand/og-image.png"

  const formatLabels: Record<string, string> = {
    HYBRID: "Hybrid (Live + Recorded)",
    LIVE_INTERACTIVE: "Live Interactive Only",
    SELF_PACED: "Self-Paced Recorded",
  }

  const levelColors: Record<string, { bg: string; text: string }> = {
    BEGINNER: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "Beginner" },
    INTERMEDIATE: { bg: "bg-blue-500/15 text-blue-400 border-blue-500/30", text: "Intermediate" },
    ADVANCED: { bg: "bg-purple-500/15 text-purple-400 border-purple-500/30", text: "Advanced" },
    ALL_LEVELS: { bg: "bg-brand-teal/15 text-brand-teal border-brand-teal/30", text: "All Levels" },
  }

  const currentLevel = levelColors[level] || levelColors.ALL_LEVELS

  return (
    <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-5 space-y-4 shadow-sm">
      {/* Header bar with Student View Indicator and Mode Toggle */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-brand-teal" />
            <span>Live Student Preview</span>
          </span>
        </div>

        {/* View Switcher (Catalog Card vs Detail Hero) */}
        <div className="flex rounded-lg border border-border/70 bg-background/60 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === "card"
                ? "bg-brand-teal text-brand-charcoal font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3 h-3 inline-block mr-1" />
            <span>Catalog Card</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("hero")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === "hero"
                ? "bg-brand-teal text-brand-charcoal font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tv className="w-3 h-3 inline-block mr-1" />
            <span>Detail Hero</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Real-time simulation of how your course will render in students&apos; curriculum views:
      </p>

      {/* Hidden File Input for Direct Upload */}
      {onThumbnailChange && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* VIEW 1: Catalog Marketplace Card Preview */}
      {viewMode === "card" && (
        <div className="group relative rounded-3xl border border-border/90 bg-card/90 overflow-hidden shadow-md transition-all max-w-sm mx-auto">
          {/* Card Thumbnail with Drag & Drop & Direct Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative aspect-video w-full bg-neutral-900 overflow-hidden transition-all ${
              isDragging ? "ring-2 ring-brand-teal scale-[1.01]" : ""
            }`}
          >
            <Image
              src={displayThumb}
              alt="Thumbnail preview"
              fill
              sizes="400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Top Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${currentLevel.bg}`}
              >
                {currentLevel.text}
              </span>
            </div>
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-teal text-brand-charcoal backdrop-blur-md shadow-xs">
                {category}
              </span>
            </div>

            {/* Direct Upload Button Overlay */}
            {onThumbnailChange && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm opacity-90 hover:opacity-100 hover:scale-105"
                title="Click to upload course image"
              >
                <Camera className="w-3 h-3 text-brand-teal" />
                <span>Change Image</span>
              </button>
            )}

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
                <span className="text-[11px] font-medium">{uploadProgress}</span>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                By <strong className="text-foreground">{instructorName}</strong>
              </span>
              <span suppressHydrationWarning className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                {code}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                {displayTitle}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {displaySubtitle}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-teal" />
                <span>{durationHours} Hours</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                <span>{formatLabels[format] || "Curriculum"}</span>
              </div>
            </div>

            {/* Mock CTA Button */}
            <button
              type="button"
              disabled
              className="w-full h-8 rounded-xl bg-brand-teal/15 hover:bg-brand-teal/25 text-brand-teal font-semibold text-xs flex items-center justify-center gap-1.5 border border-brand-teal/30 cursor-default"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: Course Detail Hero Banner Preview */}
      {viewMode === "hero" && (
        <div className="relative rounded-2xl border border-border/90 bg-card/90 overflow-hidden shadow-md p-4 space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="relative aspect-21/9 w-full rounded-xl overflow-hidden bg-neutral-900"
          >
            <Image
              src={displayThumb}
              alt="Hero Preview"
              fill
              sizes="500px"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent flex flex-col justify-end p-3 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-brand-teal text-brand-charcoal">
                  {category}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                  {currentLevel.text}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white line-clamp-1">{displayTitle}</h3>
            </div>

            {onThumbnailChange && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Camera className="w-3 h-3 text-brand-teal" />
                <span>Change Image</span>
              </button>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20">
                <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
                <span className="text-[11px] font-medium">{uploadProgress}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
              {displaySubtitle}
            </p>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Course Status:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready for Students
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Brand Covers Bar */}
      {onThumbnailChange && (
        <div className="pt-2 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-semibold flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-brand-teal" />
              <span>Quick Brand Covers:</span>
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] text-brand-teal hover:underline flex items-center gap-1 font-semibold"
            >
              <UploadCloud className="w-3 h-3" />
              <span>Upload File</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                onThumbnailChange("/brand/AI.png")
                toast.success("Applied 'AI Special' cover!")
              }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                thumbnailUrl === "/brand/AI.png"
                  ? "border-brand-teal bg-brand-teal/15 text-foreground font-bold"
                  : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-brand-teal" />
              <span>AI Poster</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onThumbnailChange("/brand/og-image.png")
                toast.success("Applied 'TechGration Campus' cover!")
              }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                thumbnailUrl === "/brand/og-image.png"
                  ? "border-brand-teal bg-brand-teal/15 text-foreground font-bold"
                  : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Campus Hub</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onThumbnailChange(
                  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&auto=format&fit=crop"
                )
                toast.success("Applied 'Cloud Earth' cover!")
              }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                thumbnailUrl.includes("photo-1451187580459")
                  ? "border-brand-teal bg-brand-teal/15 text-foreground font-bold"
                  : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Cloud Earth</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
