"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  FolderTree,
  FolderPlus,
  Trash2,
  Tag,
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Folder,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryItem {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  parentId?: string | null
  skills: string[]
  tags: string[]
  displayOrder: number
  courseCount: number
  subcategories: CategoryItem[]
}

export default function CategoriesGovernancePage() {
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [parentId, setParentId] = React.useState<string>("none")
  const [skillsStr, setSkillsStr] = React.useState("")
  const [tagsStr, setTagsStr] = React.useState("")

  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (err) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleNameChange = (val: string) => {
    setName(val)
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const skills = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const tags = tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          parentId: parentId === "none" ? null : parentId,
          skills,
          tags,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Failed to create category", { description: data.error })
        return
      }

      toast.success("Category created successfully!")
      setDialogOpen(false)
      setName("")
      setSlug("")
      setDescription("")
      setSkillsStr("")
      setTagsStr("")
      setParentId("none")
      fetchCategories()
    } catch (err) {
      toast.error("Network error while creating category")
    }
  }

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Deletion Blocked by Guard", { description: data.error })
        return
      }

      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (err) {
      toast.error("Failed to delete category")
    }
  }

  // Filter root categories
  const rootCategories = categories.filter((c) => !c.parentId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Curriculum Categories & Taxonomy Governance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organize learning tracks, subcategories, skill competencies, and enforce course link deletion guards.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Category</span>
        </Button>
      </div>

      {/* Deletion Guard Banner */}
      <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3 text-xs text-muted-foreground">
        <AlertTriangle className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Active Deletion Guard:</span> Categories with active
          courses or child subcategories cannot be deleted without reassigning the associated curricula first.
        </div>
      </div>

      {/* Categories Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-teal" />
            <span>Loading categories from MongoDB...</span>
          </div>
        ) : rootCategories.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No categories defined yet.</div>
        ) : (
          rootCategories.map((cat) => {
            const childCategories = categories.filter((c) => c.parentId === cat.id)
            return (
              <Card key={cat.id} className="border-border/80 card-shine overflow-hidden">
                <CardHeader className="bg-muted/20 py-4 px-6 border-b border-border/60">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-teal/15 flex items-center justify-center text-brand-ink dark:text-brand-cyan">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">{cat.name}</h3>
                          <Badge variant="outline" className="text-[11px] font-mono">
                            {cat.slug}
                          </Badge>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className="bg-brand-teal/15 text-brand-cyan border border-brand-teal/30">
                        {cat.courseCount} Active Courses
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-muted-foreground hover:text-destructive p-2 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Skill Badges */}
                  {cat.skills && cat.skills.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-muted-foreground">Target Skills:</span>
                      {cat.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs font-medium">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Subcategories Subsection */}
                  {childCategories.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                        Subcategories ({childCategories.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {childCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-foreground block">{sub.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{sub.slug}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(sub)}
                              className="text-muted-foreground hover:text-destructive p-1.5 h-7 w-7"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Curriculum Category</DialogTitle>
            <DialogDescription>Define a new domain or subcategory for course classification.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="catName">Category Name</Label>
              <Input
                id="catName"
                required
                placeholder="e.g. Generative AI & Agents"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catSlug">URL Slug</Label>
              <Input
                id="catSlug"
                required
                placeholder="generative-ai-agents"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catParent">Parent Category (Optional)</Label>
              <Select value={parentId} onValueChange={(val) => setParentId(val || "")}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Top-Level Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-Level Category)</SelectItem>
                  {rootCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc">Description</Label>
              <Textarea
                id="catDesc"
                placeholder="Brief curriculum description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catSkills">Skills (comma-separated)</Label>
              <Input
                id="catSkills"
                placeholder="e.g. Python, PyTorch, RAG, LangChain"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl">
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
