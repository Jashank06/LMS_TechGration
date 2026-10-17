"use client"

import * as React from "react"
import Image from "next/image"
import {
  UploadCloud,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Sparkles,
  ImageIcon,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface CourseThumbnailUploaderProps {
  value: string
  onChange: (url: string) => void
  courseTitle?: string
}

const PRESET_COVERS = [
  {
    name: "TechGration AI Special",
    category: "Official AI",
    url: "/brand/AI.png",
    color: "from-brand-teal/30 to-blue-600/40",
  },
  {
    name: "TechGration Campus",
    category: "Platform Brand",
    url: "/brand/og-image.png",
    color: "from-teal-500/30 to-emerald-600/40",
  },
  {
    name: "Cloud & DevOps",
    category: "Cloud",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&auto=format&fit=crop",
    color: "from-cyan-500/20 to-blue-600/30",
  },
  {
    name: "Full-Stack Next.js",
    category: "Web Dev",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1280&auto=format&fit=crop",
    color: "from-teal-500/20 to-emerald-600/30",
  },
  {
    name: "AI & Neural Networks",
    category: "AI & ML",
    url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1280&auto=format&fit=crop",
    color: "from-purple-500/20 to-indigo-600/30",
  },
  {
    name: "Cybersecurity & IAM",
    category: "Security",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1280&auto=format&fit=crop",
    color: "from-amber-500/20 to-rose-600/30",
  },
]

export function CourseThumbnailUploader({
  value,
  onChange,
  courseTitle,
}: CourseThumbnailUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = React.useState(false)
  const [customUrl, setCustomUrl] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, or AVIF).")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file exceeds 10MB limit. Please upload a smaller image.")
      return
    }

    setIsUploading(true)
    setUploadProgress("Optimizing image buffer...")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append(
        "courseSlug",
        (courseTitle || "course")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 30)
      )

      setUploadProgress("Uploading to Cloudinary CDN...")
      const res = await fetch("/api/teacher/courses/upload-thumbnail", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed")
      }

      onChange(data.url)
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

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim())
      setShowUrlInput(false)
      setCustomUrl("")
      toast.success("Custom thumbnail URL applied!")
    }
  }

  const isCloudinary = Boolean(value && value.includes("cloudinary.com"))

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Upload Dropzone / Preview Area */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-border/80 bg-card/60 shadow-sm backdrop-blur-md">
          {/* 16:9 Image Preview Frame */}
          <div className="relative aspect-video w-full bg-muted/40 overflow-hidden">
            <Image
              src={value}
              alt="Course Thumbnail Preview"
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />

            {/* Gradient Overlay & Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity flex flex-col justify-between p-4">
              {/* Badges in top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10">
                  {isCloudinary ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Cloudinary CDN Active</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Custom Cover Set</span>
                    </>
                  )}
                </div>

                <span className="text-[10px] font-mono text-white/70 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  16:9 (1280x720)
                </span>
              </div>

              {/* Action buttons at bottom */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="text-white text-xs truncate max-w-[60%] opacity-80">
                  {value.split("/").pop() || "Course Thumbnail"}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs font-medium bg-black/60 text-white border-white/20 hover:bg-black/80 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    <span>Change Image</span>
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => onChange("")}
                    className="h-8 text-xs font-medium bg-red-600/80 hover:bg-red-600 text-white shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Remove</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
                <span className="text-xs font-medium">{uploadProgress}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center text-center gap-3 select-none ${
            isDragging
              ? "border-brand-teal bg-brand-teal/10 scale-[1.01] shadow-teal-glow"
              : "border-border/80 hover:border-brand-teal/60 bg-card/40 hover:bg-card/70"
          }`}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin text-brand-teal" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">{uploadProgress}</p>
                <p className="text-[11px] text-muted-foreground">Generating high-definition WebP transforms...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 text-brand-teal flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  Drag & drop your course cover image here, or{" "}
                  <span className="text-brand-teal underline underline-offset-2">browse files</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Supports high-res PNG, JPG, WebP, or AVIF • Recommended 16:9 ratio (1280x720) • Max 10MB
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                <Sparkles className="w-3 h-3 text-brand-teal" />
                <span>Powered by Cloudinary Auto-WebP CDN</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Presets and URL Fallback Strip */}
      <div className="pt-2 border-t border-border/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Palette className="w-3.5 h-3.5 text-brand-teal" />
            <span>Or select a curated pro cover preset:</span>
          </div>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-muted-foreground hover:text-brand-teal font-medium transition-colors"
          >
            {showUrlInput ? "Hide custom URL input" : "Paste custom image URL instead"}
          </button>
        </div>

        {/* 4 Curated Preset Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_COVERS.map((preset) => {
            const isSelected = value === preset.url
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChange(preset.url)
                  toast.success(`Selected "${preset.name}" cover preset!`)
                }}
                className={`relative group rounded-xl overflow-hidden border p-1 text-left transition-all ${
                  isSelected
                    ? "border-brand-teal ring-2 ring-brand-teal/40 shadow-sm"
                    : "border-border/70 hover:border-brand-teal/50 hover:shadow-xs"
                }`}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={preset.url}
                    alt={preset.name}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${preset.color} opacity-40`} />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-teal text-brand-charcoal flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="p-1.5">
                  <span className="block text-[11px] font-semibold text-foreground truncate">
                    {preset.name}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    {preset.category}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Optional Custom URL Input */}
        {showUrlInput && (
          <div className="flex gap-2 pt-2 animate-in fade-in duration-200">
            <Input
              placeholder="https://example.com/cover.png or /brand/og-image.png"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="text-xs h-9"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleApplyUrl}
              className="shrink-0 h-9 text-xs"
            >
              Apply URL
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
