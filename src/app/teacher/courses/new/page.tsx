"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageTransition } from "@/components/motion/page-transition"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CourseThumbnailUploader } from "@/components/teacher/course-thumbnail-uploader"
import { LiveCourseCardPreview } from "@/components/teacher/live-course-card-preview"
import { triggerBrandCelebration } from "@/components/motion/celebration"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Cloud,
  Code2,
  Cpu,
  Shield,
  Layers,
  Terminal,
  Smartphone,
  Video,
  ListPlus,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check,
  Plus,
  HelpCircle,
  Clock,
  BookOpen,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

const CATEGORIES = [
  { id: "Cloud Engineering", name: "Cloud Engineering", icon: Cloud, desc: "Kubernetes, AWS, Distributed Systems" },
  { id: "Full-Stack Development", name: "Full-Stack Web", icon: Code2, desc: "Next.js, React, Node.js & TypeScript" },
  { id: "AI & Machine Learning", name: "AI & Machine Learning", icon: Cpu, desc: "PyTorch, LLMs, Neural Networks & RAG" },
  { id: "Security & DevSecOps", name: "Cybersecurity", icon: Shield, desc: "Zero-Trust, IAM, Network Defense" },
  { id: "DevOps & Infrastructure", name: "DevOps & CI/CD", icon: Terminal, desc: "Docker, Terraform, Observability" },
  { id: "Mobile Architecture", name: "Mobile Development", icon: Smartphone, desc: "Flutter, React Native & Swift" },
]

const SKILL_LEVELS = [
  { id: "BEGINNER", label: "Beginner", desc: "No prior experience required" },
  { id: "INTERMEDIATE", label: "Intermediate", desc: "Fundamental coding knowledge" },
  { id: "ADVANCED", label: "Advanced", desc: "Production & architecture depth" },
  { id: "ALL_LEVELS", label: "All Levels", desc: "Comprehensive step-by-step track" },
]

const DELIVERY_FORMATS = [
  { id: "HYBRID", label: "Hybrid Bootcamp", desc: "Live mentor classes + self-paced recorded labs" },
  { id: "LIVE_INTERACTIVE", label: "Live Interactive Only", desc: "Live real-time classes with instructor reviews" },
  { id: "SELF_PACED", label: "Self-Paced Recorded", desc: "Recorded video lessons with self-guided labs" },
]

const SUGGESTED_OUTCOMES_BY_CATEGORY: Record<string, string[]> = {
  "Cloud Engineering": [
    "Architect and deploy multi-region Kubernetes clusters with Helm",
    "Implement Zero-Trust VPC network topologies and Calico policies",
    "Automate cloud infrastructure with declarative Terraform blueprints",
    "Build high-throughput event-driven microservices with gRPC",
  ],
  "Full-Stack Development": [
    "Build scalable full-stack applications with Next.js App Router and React Server Components",
    "Design type-safe end-to-end APIs with PostgreSQL, Prisma, and Zod validation",
    "Implement secure JWT and OAuth authentication flows with session management",
    "Deploy production workloads on modern serverless edge infrastructures",
  ],
  "AI & Machine Learning": [
    "Train and fine-tune Large Language Models (LLMs) with LoRA and PEFT",
    "Architect production Retrieval-Augmented Generation (RAG) pipelines with hybrid search",
    "Implement deep neural networks and transfer learning pipelines in PyTorch",
    "Deploy high-throughput model serving clusters with vLLM and quantization",
  ],
  "Security & DevSecOps": [
    "Implement Zero-Trust access control and role-based policy enforcement",
    "Conduct container image vulnerability scanning and automated remediation",
    "Architect secure cloud perimeters with Cloudflare, WAF, and DDoS mitigation",
    "Audit IAM privileges and cryptographic key rotation pipelines",
  ],
}

export default function NewCourseWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = React.useState(false)

  // Step 1: Identity & Catalog
  const [title, setTitle] = React.useState("")
  const [code, setCode] = React.useState("TG-CS599")
  const [category, setCategory] = React.useState("Cloud Engineering")
  const [level, setLevel] = React.useState("ALL_LEVELS")
  const [format, setFormat] = React.useState("HYBRID")
  const [subtitle, setSubtitle] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    // Generate randomized course code on client after hydration to avoid SSR mismatch
    const prefixes = ["TG-CS", "TG-AI", "TG-DEV", "TG-SEC", "TG-SYS"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    setCode(`${prefix}${Math.floor(100 + Math.random() * 899)}`)
  }, [])

  // Step 2: Media Assets & Cloudinary
  const [thumbnailUrl, setThumbnailUrl] = React.useState("/brand/AI.png")
  const [promoVideoUrl, setPromoVideoUrl] = React.useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  const [durationHours, setDurationHours] = React.useState(24)

  // Step 3: Outcomes & Prerequisites
  const [outcomeInput, setOutcomeInput] = React.useState("")
  const [outcomes, setOutcomes] = React.useState<string[]>([
    "Master core distributed infrastructure design patterns",
    "Deploy multi-region automated Kubernetes clusters",
  ])

  const [prereqInput, setPrereqInput] = React.useState("")
  const [prerequisites, setPrerequisites] = React.useState<string[]>([
    "Basic Linux networking & terminal familiarity",
    "Foundational understanding of containers",
  ])

  const generateNewCode = () => {
    const prefixes = ["TG-CS", "TG-AI", "TG-DEV", "TG-SEC", "TG-SYS"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    setCode(`${prefix}${Math.floor(100 + Math.random() * 899)}`)
  }

  const addOutcome = (text?: string) => {
    const valueToAdd = (text || outcomeInput).trim()
    if (valueToAdd && !outcomes.includes(valueToAdd)) {
      setOutcomes([...outcomes, valueToAdd])
      if (!text) setOutcomeInput("")
    }
  }

  const removeOutcome = (index: number) => {
    setOutcomes(outcomes.filter((_, i) => i !== index))
  }

  const addPrereq = (text?: string) => {
    const valueToAdd = (text || prereqInput).trim()
    if (valueToAdd && !prerequisites.includes(valueToAdd)) {
      setPrerequisites([...prerequisites, valueToAdd])
      if (!text) setPrereqInput("")
    }
  }

  const removePrereq = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index))
  }

  const handleSubmitCourse = async (submitForApproval: boolean) => {
    if (!title.trim()) {
      toast.error("Please enter a course title")
      setCurrentStep(1)
      return
    }

    if (!description.trim()) {
      toast.error("Please provide a course description")
      setCurrentStep(1)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim(),
          category,
          level,
          format,
          subtitle: subtitle.trim(),
          description: description.trim(),
          thumbnailUrl,
          promoVideoUrl,
          durationHours: Number(durationHours) || 12,
          outcomes,
          prerequisites,
          submitForApproval,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to create course")
        setLoading(false)
        return
      }

      triggerBrandCelebration()
      toast.success(
        submitForApproval
          ? "Course submitted for Admin Governance Approval!"
          : "Course draft saved successfully!"
      )
      router.push(`/teacher/courses/${data.course.id}/builder`)
    } catch {
      toast.error("Network error while creating course")
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: "Identity & Catalog", desc: "Title, discipline & format" },
    { num: 2, label: "Media & Branding", desc: "Cloudinary cover & trailer" },
    { num: 3, label: "Learning Outcomes", desc: "Academic criteria & targets" },
    { num: 4, label: "Review & Publish", desc: "Governance verification" },
  ]

  const suggestedOutcomes = SUGGESTED_OUTCOMES_BY_CATEGORY[category] || []

  // Check YouTube preview validity
  const getYouTubeEmbed = (url: string) => {
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const id = url.split("v=")[1]?.split("&")[0]
        return `https://www.youtube.com/embed/${id}`
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0]
        return `https://www.youtube.com/embed/${id}`
      }
    } catch {
      return null
    }
    return null
  }

  const ytEmbed = getYouTubeEmbed(promoVideoUrl)

  return (
    <PageTransition className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="rounded-xl border-border/80">
            <Link href="/teacher/courses">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Course Creation Studio
              </h1>
              <Badge variant="outline" className="text-[10px] uppercase font-mono border-brand-teal/40 text-brand-teal">
                v2.0
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Author curriculum metadata, upload Cloudinary assets, and preview live student cards.
            </p>
          </div>
        </div>

        {/* Mobile Preview Toggle */}
        <div className="block lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
            className="w-full text-xs font-semibold gap-1.5 border-border"
          >
            <Eye className="w-3.5 h-3.5 text-brand-teal" />
            <span>{mobilePreviewOpen ? "Hide Student Preview" : "View Live Student Card"}</span>
          </Button>
        </div>
      </div>

      {/* Modern Stepper Progression Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {steps.map((st) => {
          const isActive = currentStep === st.num
          const isDone = currentStep > st.num
          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setCurrentStep(st.num)}
              className={`p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 ${
                isActive
                  ? "border-brand-teal/80 bg-brand-teal/10 shadow-sm ring-1 ring-brand-teal/40"
                  : isDone
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                  : "border-border/70 bg-card/60 text-muted-foreground hover:bg-card/90"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform ${
                  isActive
                    ? "bg-brand-teal text-brand-charcoal shadow-sm scale-105"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
              </div>
              <div className="min-w-0">
                <span
                  className={`block text-xs font-bold truncate ${
                    isActive ? "text-foreground" : isDone ? "text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {st.label}
                </span>
                <span className="block text-[10px] text-muted-foreground truncate hidden sm:block">
                  {st.desc}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Split-Screen Workspace (Left: Form Wizard, Right: Sticky Student Card Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form Wizard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* STEP 1: IDENTITY & CATALOG INFO */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Step 1: Course Identity & Catalog Info</span>
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define the title, academic discipline, and delivery methodology for learners.
                  </p>
                </div>

                {/* Course Title & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="title" className="text-xs font-bold text-foreground">
                        Course Title <span className="text-brand-teal">*</span>
                      </Label>
                      <span className="text-[10px] text-muted-foreground">
                        {title.length}/80 chars
                      </span>
                    </div>
                    <Input
                      id="title"
                      placeholder="e.g. Distributed Cloud Systems with Go & Kubernetes"
                      value={title}
                      maxLength={80}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-10 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="code" className="text-xs font-bold text-foreground">
                        Course Code
                      </Label>
                      <button
                        type="button"
                        onClick={generateNewCode}
                        className="text-[10px] text-brand-teal hover:underline flex items-center gap-0.5"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Random</span>
                      </button>
                    </div>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="font-mono text-xs uppercase h-10 rounded-xl tracking-wider"
                    />
                  </div>
                </div>

                {/* Subtitle / Tagline */}
                <div className="space-y-1.5">
                  <Label htmlFor="subtitle" className="text-xs font-bold text-foreground">
                    Subtitle / Value Proposition
                  </Label>
                  <Input
                    id="subtitle"
                    placeholder="One-sentence hook summarizing what students will build..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="text-xs h-10 rounded-xl"
                  />
                </div>

                {/* Course Cover Image (Cloudinary CDN Uploader) */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Course Cover Image</span>
                        <span className="text-[10px] font-normal text-muted-foreground">(Cloudinary CDN)</span>
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Upload custom 16:9 banner or select an official TechGration cover.
                      </p>
                    </div>
                    <span className="text-[11px] text-brand-teal font-medium hidden sm:inline-block">
                      Auto-WebP 1280x720
                    </span>
                  </div>

                  <CourseThumbnailUploader
                    value={thumbnailUrl}
                    onChange={(url) => setThumbnailUrl(url)}
                    courseTitle={title}
                  />
                </div>

                {/* Visual Category Selection Cards */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">
                    Academic Discipline / Category
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon
                      const isSelected = category === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "border-brand-teal bg-brand-teal/10 shadow-sm ring-1 ring-brand-teal/50"
                              : "border-border/70 bg-card/60 hover:bg-card/90"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                                isSelected ? "bg-brand-teal text-brand-charcoal" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold truncate text-foreground">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 block">
                            {cat.desc}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Skill Level & Delivery Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Skill Level */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">Target Skill Level</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SKILL_LEVELS.map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setLevel(lvl.id)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            level === lvl.id
                              ? "border-brand-teal bg-brand-teal/15 text-foreground font-semibold shadow-xs"
                              : "border-border/70 bg-card text-muted-foreground hover:text-foreground text-xs"
                          }`}
                        >
                          <span className="text-xs block font-bold">{lvl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Format */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">Delivery Format</Label>
                    <div className="space-y-1.5">
                      {DELIVERY_FORMATS.map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setFormat(fmt.id)}
                          className={`w-full p-2 rounded-xl border text-left transition-all ${
                            format === fmt.id
                              ? "border-brand-teal bg-brand-teal/10 text-foreground font-semibold shadow-xs"
                              : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="text-xs font-bold">{fmt.label}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{fmt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="desc" className="text-xs font-bold text-foreground">
                    Comprehensive Course Description <span className="text-brand-teal">*</span>
                  </Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    placeholder="Provide an architectural overview of what students will master, lab infrastructure requirements, and career outcomes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-xs rounded-xl resize-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 2: MEDIA ASSETS & CLOUDINARY UPLOAD */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Step 2: Media Assets & Visual Branding</span>
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Upload your high-definition cover image to Cloudinary and attach video preview trailers.
                  </p>
                </div>

                {/* Cloudinary Drag-and-Drop Image Uploader */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Course Cover Image (Cloudinary CDN)
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      Auto-converts to 16:9 WebP
                    </span>
                  </div>

                  <CourseThumbnailUploader
                    value={thumbnailUrl}
                    onChange={(url) => setThumbnailUrl(url)}
                    courseTitle={title}
                  />
                </div>

                {/* Promotional Video Trailer */}
                <div className="space-y-2">
                  <Label htmlFor="video" className="text-xs font-bold text-foreground">
                    Promotional Trailer URL (YouTube, Vimeo, or MP4)
                  </Label>
                  <Input
                    id="video"
                    value={promoVideoUrl}
                    onChange={(e) => setPromoVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="text-xs h-10 rounded-xl"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Free preview trailer accessible to prospective students on the catalog view.
                  </p>

                  {/* YouTube Embed Live Preview */}
                  {ytEmbed && (
                    <div className="mt-2 rounded-2xl overflow-hidden border border-border/80 bg-black/40 aspect-video w-full max-w-md">
                      <iframe
                        src={ytEmbed}
                        title="Promotional Video Trailer"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                {/* Estimated Curriculum Duration & Weekly Effort */}
                <div className="p-4 rounded-2xl border border-border/80 bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="duration" className="text-xs font-bold text-foreground">
                        Estimated Curriculum Duration
                      </Label>
                      <p className="text-[11px] text-muted-foreground">Total lecture & lab hours</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-brand-teal">{durationHours}</span>
                      <span className="text-xs text-muted-foreground ml-1">Hours Total</span>
                    </div>
                  </div>

                  <input
                    id="duration"
                    type="range"
                    min={4}
                    max={120}
                    step={2}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-teal"
                  />

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Pacing: ~{(durationHours / 6).toFixed(1)} hrs/week over 6 weeks</span>
                    <span>Self-paced or Live Batch mode</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: OUTCOMES & CRITERIA */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Step 3: Learning Outcomes & Prerequisites</span>
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Articulate specific competencies students will acquire upon program completion.
                  </p>
                </div>

                {/* Suggested Outcomes Bank */}
                {suggestedOutcomes.length > 0 && (
                  <div className="p-4 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Curated {category} Competency Suggestions (Click to add):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedOutcomes.map((sug, i) => {
                        const isAdded = outcomes.includes(sug)
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={isAdded}
                            onClick={() => addOutcome(sug)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-all flex items-center gap-1 ${
                              isAdded
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 opacity-60 cursor-default"
                                : "border-brand-teal/30 bg-card hover:bg-brand-teal/15 text-foreground hover:border-brand-teal"
                            }`}
                          >
                            <Plus className="w-3 h-3 text-brand-teal" />
                            <span>{sug}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Learning Outcomes List */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-foreground">
                    What will learners achieve? (Key Outcomes)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Configure production Calico network policies..."
                      value={outcomeInput}
                      onChange={(e) => setOutcomeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOutcome())}
                      className="text-xs h-10 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={() => addOutcome()}
                      size="sm"
                      className="shrink-0 h-10 text-xs px-4 bg-brand-teal text-brand-charcoal font-semibold"
                    >
                      <ListPlus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-2 mt-2">
                    {outcomes.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 text-xs shadow-xs"
                      >
                        <span className="flex items-center gap-2 text-foreground font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOutcome(idx)}
                          className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="space-y-3 pt-3 border-t border-border/60">
                  <Label className="text-xs font-bold text-foreground">
                    Prerequisites / Prior Knowledge Required
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Familiarity with basic Linux CLI & Git workflows..."
                      value={prereqInput}
                      onChange={(e) => setPrereqInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPrereq())}
                      className="text-xs h-10 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={() => addPrereq()}
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-10 text-xs px-4"
                    >
                      <ListPlus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-2 mt-2">
                    {prerequisites.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/70 text-xs"
                      >
                        <span className="text-muted-foreground font-medium">• {item}</span>
                        <button
                          type="button"
                          onClick={() => removePrereq(idx)}
                          className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & GOVERNANCE SUBMISSION */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="border-b border-border/60 pb-3">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Step 4: Curriculum Review & Submission</span>
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confirm your course details before publishing or queuing for administrative governance.
                  </p>
                </div>

                {/* Apple-style Curriculum Spec Card */}
                <div className="p-5 rounded-3xl border border-border/90 bg-muted/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-foreground">{title || "Untitled Course"}</h4>
                    <Badge variant="outline" className="font-mono">{code}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Category</span>
                      <strong className="text-foreground">{category}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Level</span>
                      <strong className="text-foreground">{level}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Format</span>
                      <strong className="text-foreground">{format}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border/60">
                      <span className="text-[10px] text-muted-foreground block">Duration</span>
                      <strong className="text-foreground">{durationHours} Hours</strong>
                    </div>
                  </div>
                </div>

                {/* Quality Checklist */}
                <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-2.5 text-xs">
                  <span className="font-bold text-foreground block">Readiness Quality Checklist:</span>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-foreground">Course identity & code verified ({code})</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-foreground">
                        {thumbnailUrl.includes("cloudinary.com")
                          ? "Cloudinary 16:9 optimized cover attached"
                          : "Custom cover image verified"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-foreground">{outcomes.length} Learning outcomes articulated</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-foreground">Modules and lesson builder unlocks immediately upon saving</span>
                    </div>
                  </div>
                </div>

                {/* Governance Notification Box */}
                <div className="p-4 rounded-2xl border border-brand-teal/30 bg-brand-teal/5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-foreground">Next Step: Interactive Visual Builder</span>
                    <p className="text-muted-foreground leading-relaxed">
                      Saving your course opens the Drag-and-Drop Curriculum Builder where you can upload lesson videos, write lecture notes, attach lab code, and create auto-graded assessments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer Controls */}
            <div className="pt-6 border-t border-border/60 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="rounded-xl text-xs h-9"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
              ) : (
                <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs h-9">
                  <Link href="/teacher/courses">Cancel</Link>
                </Button>
              )}

              <div className="flex items-center gap-2">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (currentStep === 1 && !title.trim()) {
                        toast.error("Please enter a course title")
                        return
                      }
                      setCurrentStep(currentStep + 1)
                    }}
                    className="rounded-xl text-xs h-9 px-4 bg-brand-teal text-brand-charcoal font-semibold shadow-teal-glow"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => handleSubmitCourse(false)}
                      className="rounded-xl text-xs h-9"
                    >
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl text-xs h-9 px-4 shadow-teal-glow gap-1.5 bg-brand-teal text-brand-charcoal font-bold"
                      disabled={loading}
                      onClick={() => handleSubmitCourse(true)}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Publish & Open Builder</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Live Student Preview Canvas (5 Cols) */}
        <div className={`lg:col-span-5 lg:sticky lg:top-24 space-y-4 ${mobilePreviewOpen ? "block" : "hidden lg:block"}`}>
          <LiveCourseCardPreview
            title={title}
            code={code}
            subtitle={subtitle}
            category={category}
            level={level}
            format={format}
            thumbnailUrl={thumbnailUrl}
            durationHours={durationHours}
            instructorName="Faculty Instructor"
            onThumbnailChange={(url) => setThumbnailUrl(url)}
            courseTitle={title}
          />
        </div>
      </div>
    </PageTransition>
  )
}
