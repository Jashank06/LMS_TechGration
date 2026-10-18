"use client"

import * as React from "react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateProfileAction, updatePasswordAction, revokeSessionAction } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InlineAlert } from "@/components/feedback/inline-alert"
import {
  User,
  Shield,
  Laptop,
  Bell,
  CheckCircle2,
  Loader2,
  Trash2,
  Camera,
  UploadCloud,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Sparkles,
  FileText,
  BadgeCheck,
  AlertCircle,
  Save,
} from "lucide-react"

interface SettingsClientProps {
  user: {
    id: string
    name: string
    email: string
    profile: {
      avatarUrl?: string | null
      headline?: string | null
      bio?: string | null
      phone?: string | null
      timezone?: string | null
      education?: string | null
      learningGoals?: string | null
    } | null
  }
  sessions: Array<{
    id: string
    userAgent: string | null
    createdAt: string
  }>
}

export function SettingsClient({ user, sessions }: SettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState<"profile" | "security" | "sessions" | "notifications">("profile")

  // Avatar state
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(user.profile?.avatarUrl ?? null)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // Profile form state
  const [isProfilePending, startProfileTransition] = useTransition()
  const [profileSuccess, setProfileSuccess] = React.useState(false)
  const [bioCharCount, setBioCharCount] = React.useState(user.profile?.bio?.length ?? 0)

  // Password state
  const [isPasswordPending, startPasswordTransition] = useTransition()
  const [passwordStatus, setPasswordStatus] = React.useState<{ error?: string; success?: boolean } | null>(null)

  // Compute initials
  const initials = React.useMemo(() => {
    if (!user.name) return "TG"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }, [user.name])

  // Handle Avatar Upload via Cloudinary API Route
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validations
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type", {
        description: "Please select a JPG, PNG, WebP, or GIF image.",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large", {
        description: "Maximum image size allowed is 5MB.",
      })
      return
    }

    // Instant local preview
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setIsUploadingAvatar(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/student/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photo.")
      }

      setAvatarUrl(data.avatarUrl)
      toast.success("Profile photo updated!", {
        description: "Your new avatar is live and synced across TechGration LMS.",
      })

      // Refresh server components (Topbar, Sidebar, Dashboard)
      router.refresh()
    } catch (err: any) {
      setAvatarPreview(null)
      toast.error("Upload failed", {
        description: err.message || "Could not upload image to Cloudinary.",
      })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Handle Avatar Removal
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return
    setIsDeletingAvatar(true)

    try {
      const res = await fetch("/api/student/avatar", {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove photo.")
      }

      setAvatarUrl(null)
      setAvatarPreview(null)
      toast.info("Profile photo removed", {
        description: "Reset to default branded initials fallback.",
      })

      router.refresh()
    } catch (err: any) {
      toast.error("Failed to remove avatar", {
        description: err.message,
      })
    } finally {
      setIsDeletingAvatar(false)
    }
  }

  // Handle Profile Form Submit
  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileSuccess(false)
    const formData = new FormData(e.currentTarget)
    startProfileTransition(async () => {
      const res = await updateProfileAction(formData)
      if (res.success) {
        setProfileSuccess(true)
        toast.success("Profile updated successfully", {
          description: "All changes saved to your permanent academic profile.",
        })
        router.refresh()
        setTimeout(() => setProfileSuccess(false), 3500)
      } else {
        toast.error("Failed to save changes", {
          description: "Please check your inputs and try again.",
        })
      }
    })
  }

  // Handle Password Submit
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordStatus(null)
    const formData = new FormData(e.currentTarget)
    startPasswordTransition(async () => {
      const res = await updatePasswordAction(formData)
      if (res.success) {
        setPasswordStatus({ success: true })
        toast.success("Password updated", {
          description: "Your security credentials have been successfully updated.",
        })
        e.currentTarget?.reset()
      } else {
        setPasswordStatus({ error: res.error })
        toast.error("Password update failed", {
          description: res.error,
        })
      }
    })
  }

  const currentDisplayAvatar = avatarPreview || avatarUrl

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-1.5 text-xs overflow-x-auto no-scrollbar touch-pan-x scroll-smooth shadow-xs">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === "profile"
              ? "bg-brand-teal text-brand-charcoal shadow-sm shadow-brand-teal/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === "security"
              ? "bg-brand-teal text-brand-charcoal shadow-sm shadow-brand-teal/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Password & Security</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === "sessions"
              ? "bg-brand-teal text-brand-charcoal shadow-sm shadow-brand-teal/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted"
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Active Sessions ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 ${
            activeTab === "notifications"
              ? "bg-brand-teal text-brand-charcoal shadow-sm shadow-brand-teal/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* 1.1 Hero Profile & Avatar Management Card */}
          <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-sm overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-brand-teal/10 rounded-full blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Avatar Column with Camera Overlay */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative group shrink-0">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-2 border-brand-teal/40 ring-4 ring-brand-teal/15 shadow-lg shadow-brand-teal/10 overflow-hidden transition-all duration-300 group-hover:ring-brand-teal/30">
                    {currentDisplayAvatar && (
                      <AvatarImage
                        src={currentDisplayAvatar}
                        alt={user.name}
                        className="object-cover h-full w-full"
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-brand-teal/25 via-cyan-500/20 to-teal-800/30 text-brand-charcoal dark:text-brand-teal text-2xl font-extrabold tracking-wider">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Uploading Spinner Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-3xl bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-teal mb-1" />
                      <span className="text-[10px] font-semibold tracking-wide">Uploading...</span>
                    </div>
                  )}

                  {/* Clickable Camera Overlay (Hover) */}
                  {!isUploadingAvatar && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10 backdrop-blur-xs"
                      title="Click to change photo"
                    >
                      <Camera className="w-5 h-5 mb-1 text-brand-teal" />
                      <span className="text-[11px] font-semibold">Change</span>
                    </button>
                  )}

                  {/* Live Status Pip */}
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card ring-1 ring-emerald-400 flex items-center justify-center"
                    title="Active Account"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </span>
                </div>

                {/* User Identity Info & Upload Controls */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                      {user.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-teal/15 text-brand-ink dark:text-brand-teal border border-brand-teal/30">
                      <BadgeCheck className="w-3 h-3" />
                      Student
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                    <span>{user.email}</span>
                  </p>

                  <p className="text-xs text-muted-foreground/80 max-w-md">
                    {user.profile?.headline || "TechGration LMS Enrolled Student"}
                  </p>

                  {/* Upload & Remove Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileSelect}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      aria-label="Upload profile image"
                    />

                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      size="sm"
                      className="h-11 sm:h-9 px-4 rounded-xl text-xs font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal shadow-sm shadow-brand-teal/20 transition-all w-full sm:w-auto justify-center"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                          <span>Upload New Photo</span>
                        </>
                      )}
                    </Button>

                    {avatarUrl && (
                      <Button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isDeletingAvatar || isUploadingAvatar}
                        variant="outline"
                        size="sm"
                        className="h-11 sm:h-9 px-3 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors w-full sm:w-auto justify-center"
                      >
                        {isDeletingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            <span>Remove</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cloudinary CDN Specs Badge */}
              <div className="hidden lg:flex flex-col items-end text-right border-l border-border/70 pl-6 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Storage & CDN
                </span>
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cloudinary Powered
                </span>
                <p className="text-[11px] text-muted-foreground max-w-[200px]">
                  Images automatically cropped around your face & delivered via high-speed global WebP CDN.
                </p>
              </div>
            </div>
          </div>

          {/* 1.2 Profile Edit Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {profileSuccess && (
              <InlineAlert
                variant="success"
                title="Profile Saved"
                message="Your student profile preferences have been updated successfully."
              />
            )}

            {/* Group 1: Personal Details */}
            <div className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-5 shadow-xs">
              <div className="border-b border-border/60 pb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-teal/10 text-brand-ink dark:text-brand-teal">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Personal Identity</h3>
                  <p className="text-[11px] text-muted-foreground">Your primary identification and contact coordinates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                    <User className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Full Name</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name}
                    required
                    placeholder="Enter your full name"
                    className="h-10 text-xs rounded-xl focus-visible:ring-brand-teal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium flex items-center justify-between text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Email Address</span>
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                      Verified Primary
                    </span>
                  </Label>
                  <Input
                    id="email"
                    defaultValue={user.email}
                    disabled
                    className="h-10 text-xs rounded-xl bg-muted/50 cursor-not-allowed text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                    <Phone className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Phone Number</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={user.profile?.phone || ""}
                    placeholder="+91 98765 43210"
                    className="h-10 text-xs rounded-xl focus-visible:ring-brand-teal"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="timezone" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                    <Globe className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Timezone (For Live Classes)</span>
                  </Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    defaultValue={user.profile?.timezone || "Asia/Kolkata"}
                    placeholder="e.g. Asia/Kolkata, UTC, America/New_York"
                    className="h-10 text-xs rounded-xl focus-visible:ring-brand-teal"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Career & Academic Aspirations */}
            <div className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-5 shadow-xs">
              <div className="border-b border-border/60 pb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Academic & Professional Background</h3>
                  <p className="text-[11px] text-muted-foreground">Information shared with instructors and classmates.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headline" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                  <Briefcase className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Professional Headline</span>
                </Label>
                <Input
                  id="headline"
                  name="headline"
                  defaultValue={user.profile?.headline || ""}
                  placeholder="e.g. Full-Stack Cloud Engineer & DevOps Enthusiast"
                  className="h-10 text-xs rounded-xl focus-visible:ring-brand-teal"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="learningGoals" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Learning Objectives & Target Certifications</span>
                </Label>
                <Input
                  id="learningGoals"
                  name="learningGoals"
                  defaultValue={user.profile?.learningGoals || ""}
                  placeholder="e.g. Master Next.js 16 architecture, AWS Certified Solutions Architect"
                  className="h-10 text-xs rounded-xl focus-visible:ring-brand-teal"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                    <FileText className="w-3.5 h-3.5 text-brand-teal" />
                    <span>About / Bio</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {bioCharCount} / 500 characters
                  </span>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={500}
                  defaultValue={user.profile?.bio || ""}
                  onChange={(e) => setBioCharCount(e.target.value.length)}
                  placeholder="Share your technical interests, coding journey, and projects with your instructors..."
                  className="w-full text-xs p-3.5 rounded-xl border border-border bg-background text-foreground focus:outline-brand-teal resize-none transition-colors"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-muted-foreground">
                All changes reflect across your student profile and live courses immediately.
              </p>

              <Button
                type="submit"
                disabled={isProfilePending}
                className="w-full sm:w-auto font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-11 sm:h-10 px-6 rounded-xl shadow-md shadow-brand-teal/20 transition-all justify-center"
              >
                {isProfilePending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <form onSubmit={handlePasswordSubmit} className="p-5 sm:p-7 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-6 max-w-xl shadow-xs">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-teal/10 text-brand-ink dark:text-brand-teal">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Change Password</h3>
              <p className="text-[11px] text-muted-foreground">Update your password regularly to keep your account safe.</p>
            </div>
          </div>

          {passwordStatus?.success && (
            <InlineAlert
              variant="success"
              title="Password Updated"
              message="Your password was changed successfully."
            />
          )}
          {passwordStatus?.error && (
            <InlineAlert
              variant="error"
              title="Update Failed"
              message={passwordStatus.error}
            />
          )}

          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs font-medium text-foreground">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="h-11 sm:h-10 text-base sm:text-xs rounded-xl focus-visible:ring-brand-teal"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-medium text-foreground">
              New Password (Min 8 Characters)
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="h-11 sm:h-10 text-base sm:text-xs rounded-xl focus-visible:ring-brand-teal"
            />
          </div>

          <Button
            type="submit"
            disabled={isPasswordPending}
            className="w-full sm:w-auto font-semibold bg-brand-teal hover:bg-brand-teal/90 text-brand-charcoal h-11 sm:h-10 px-6 rounded-xl shadow-md shadow-brand-teal/20 justify-center"
          >
            {isPasswordPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === "sessions" && (
        <div className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-4 shadow-xs">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-teal/10 text-brand-ink dark:text-brand-teal">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Active Browser Sessions</h3>
              <p className="text-[11px] text-muted-foreground">
                Devices currently authenticated into your student workspace.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {sessions.map((sess, idx) => (
              <div key={sess.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        {sess.userAgent || "macOS • Chrome Browser"}
                      </p>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Session Started: {new Date(sess.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {idx !== 0 && (
                  <form
                    action={async () => {
                      await revokeSessionAction(sess.id)
                      toast.info("Session revoked")
                      router.refresh()
                    }}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Revoke</span>
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Notification Toggles */}
      {activeTab === "notifications" && (
        <div className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-4 max-w-2xl shadow-xs">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-teal/10 text-brand-ink dark:text-brand-teal">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Notification Preferences</h3>
              <p className="text-[11px] text-muted-foreground">
                Control which class updates and course alerts you receive.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl border border-border/70 bg-secondary/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Live Class 15-Minute Countdown Alert</p>
                <p className="text-[11px] text-muted-foreground">Receive push and in-app alerts before live class starts.</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-brand-teal w-4 h-4" />
            </div>

            <div className="p-4 rounded-2xl border border-border/70 bg-secondary/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Faculty Assignment Grading & Feedback</p>
                <p className="text-[11px] text-muted-foreground">Notified immediately when your submission score is published.</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-brand-teal w-4 h-4" />
            </div>

            <div className="p-4 rounded-2xl border border-border/70 bg-secondary/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Q&A Discussion Mentions & Replies</p>
                <p className="text-[11px] text-muted-foreground">Alerts when an instructor responds to your lesson questions.</p>
              </div>
              <input type="checkbox" defaultChecked className="accent-brand-teal w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
