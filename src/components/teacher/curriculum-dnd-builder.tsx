"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LessonEditorModal } from "./lesson-editor-modal"
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Plus,
  Video,
  FileText,
  HelpCircle,
  CheckSquare,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Play,
} from "lucide-react"
import { toast } from "sonner"
import { type TeacherModule, type TeacherLesson } from "@/server/services/teacher-mock-data"

interface CurriculumDndBuilderProps {
  courseId: string
  initialModules: TeacherModule[]
  onModulesChange: (modules: TeacherModule[]) => void
}

// Sortable Lesson Item Row
function SortableLessonItem({
  lesson,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  lesson: TeacherLesson
  index: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
  }

  const TypeIcon = {
    VIDEO: Video,
    READING: FileText,
    QUIZ: HelpCircle,
    ASSIGNMENT: CheckSquare,
  }[lesson.type] || Video

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card hover:border-brand-teal/40 transition-all select-none shadow-subtle group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted text-muted-foreground group-hover:text-foreground touch-none"
          title="Drag to reorder lesson"
          aria-label="Drag to reorder lesson"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
          <TypeIcon className="w-3.5 h-3.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-foreground truncate">{lesson.title}</span>
            {lesson.isPreview && (
              <Badge variant="outline" className="text-[10px] bg-brand-teal/10 text-brand-ink dark:text-brand-cyan border-brand-teal/30">
                Free Preview
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{lesson.type}</span>
            <span>•</span>
            <span>{Math.round(lesson.durationSec / 60)} mins</span>
            {lesson.videoUrl && (
              <>
                <span>•</span>
                <span className="text-brand-ink dark:text-brand-cyan flex items-center gap-0.5">
                  <Play className="w-2.5 h-2.5" /> Video attached
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reorder and Edit Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Keyboard reorder fallback buttons */}
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
          title="Move lesson up"
          aria-label="Move lesson up"
        >
          <MoveUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
          title="Move lesson down"
          aria-label="Move lesson down"
        >
          <MoveDown className="w-3 h-3" />
        </button>

        <Button size="icon-sm" variant="ghost" onClick={onEdit} title="Edit Lesson Details">
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onDelete} className="text-muted-foreground hover:text-destructive" title="Delete Lesson">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}

// Sortable Module Container
function SortableModuleCard({
  module,
  index,
  total,
  onModuleChange,
  onDeleteModule,
  onMoveUp,
  onMoveDown,
  onOpenLessonEditor,
}: {
  module: TeacherModule
  index: number
  total: number
  onModuleChange: (mod: TeacherModule) => void
  onDeleteModule: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onOpenLessonEditor: (modId: string, lesson: TeacherLesson | null) => void
}) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleInput, setTitleInput] = React.useState(module.title)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : "auto",
    opacity: isDragging ? 0.6 : 1,
  }

  // DND for lessons inside this module
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = module.lessons.findIndex((l) => l.id === active.id)
    const newIndex = module.lessons.findIndex((l) => l.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(module.lessons, oldIndex, newIndex).map((les, idx) => ({
        ...les,
        position: idx + 1,
      }))
      onModuleChange({ ...module, lessons: reordered })
    }
  }

  const handleMoveLesson = (lesIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? lesIndex - 1 : lesIndex + 1
    if (targetIndex < 0 || targetIndex >= module.lessons.length) return
    const reordered = arrayMove(module.lessons, lesIndex, targetIndex).map((les, idx) => ({
      ...les,
      position: idx + 1,
    }))
    onModuleChange({ ...module, lessons: reordered })
  }

  const handleDeleteLesson = (lesId: string) => {
    const filtered = module.lessons.filter((l) => l.id !== lesId)
    onModuleChange({ ...module, lessons: filtered })
    toast.success("Lesson deleted")
  }

  const handleSaveTitle = () => {
    setIsEditingTitle(false)
    if (titleInput.trim()) {
      onModuleChange({ ...module, title: titleInput.trim() })
    }
  }

  return (
    <Card ref={setNodeRef} style={style} className="border-border shadow-card overflow-hidden">
      {/* Module Header Bar */}
      <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Module Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-muted text-muted-foreground touch-none"
            title="Drag to reorder module"
            aria-label="Drag to reorder module"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                className="h-8 text-xs font-bold"
                autoFocus
              />
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="font-bold text-sm text-foreground cursor-pointer hover:text-brand-ink dark:hover:text-brand-cyan transition-colors truncate"
              title="Click to rename module"
            >
              {module.title}
            </div>
          )}

          <Badge variant="outline" className="text-[10px] hidden sm:inline">
            {module.lessons.length} {module.lessons.length === 1 ? "Lesson" : "Lessons"}
          </Badge>
        </div>

        {/* Module Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move module up"
            aria-label="Move module up"
          >
            <MoveUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
            title="Move module down"
            aria-label="Move module down"
          >
            <MoveDown className="w-3.5 h-3.5" />
          </button>

          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onDeleteModule}
            className="text-muted-foreground hover:text-destructive"
            title="Delete Module"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-muted-foreground hover:text-foreground ml-1"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Module Lessons List */}
      {!collapsed && (
        <CardContent className="p-4 space-y-3 bg-card">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={module.lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {module.lessons.map((lesson, lesIdx) => (
                  <SortableLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    index={lesIdx}
                    total={module.lessons.length}
                    onEdit={() => onOpenLessonEditor(module.id, lesson)}
                    onDelete={() => handleDeleteLesson(lesson.id)}
                    onMoveUp={() => handleMoveLesson(lesIdx, "up")}
                    onMoveDown={() => handleMoveLesson(lesIdx, "down")}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Lesson Button inside module */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenLessonEditor(module.id, null)}
            className="w-full border-dashed border-border hover:border-brand-teal/50 hover:bg-brand-teal/5 text-xs text-muted-foreground hover:text-foreground gap-1.5 h-9"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lesson to {module.title}</span>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export function CurriculumDndBuilder({
  courseId,
  initialModules,
  onModulesChange,
}: CurriculumDndBuilderProps) {
  const [modules, setModules] = React.useState<TeacherModule[]>(initialModules)
  const [editingModalState, setEditingModalState] = React.useState<{
    open: boolean
    moduleId: string | null
    lesson: TeacherLesson | null
  }>({
    open: false,
    moduleId: null,
    lesson: null,
  })

  React.useEffect(() => {
    setModules(initialModules)
  }, [initialModules])

  // DND for modules
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = modules.findIndex((m) => m.id === active.id)
    const newIndex = modules.findIndex((m) => m.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(modules, oldIndex, newIndex).map((mod, idx) => ({
        ...mod,
        position: idx + 1,
      }))
      setModules(reordered)
      onModulesChange(reordered)
      saveReorderedModules(reordered)
    }
  }

  const handleMoveModule = (modIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? modIdx - 1 : modIdx + 1
    if (targetIdx < 0 || targetIdx >= modules.length) return
    const reordered = arrayMove(modules, modIdx, targetIdx).map((mod, idx) => ({
      ...mod,
      position: idx + 1,
    }))
    setModules(reordered)
    onModulesChange(reordered)
    saveReorderedModules(reordered)
  }

  const saveReorderedModules = async (updatedModules: TeacherModule[]) => {
    try {
      await fetch(`/api/teacher/courses/${courseId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MODULES",
          modules: updatedModules.map((m) => ({ id: m.id, position: m.position })),
        }),
      })
      toast.success("Curriculum order synchronized")
    } catch {
      toast.error("Failed to sync module order")
    }
  }

  const handleAddModule = () => {
    const newMod: TeacherModule = {
      id: "mod-" + Date.now(),
      courseId,
      title: `Module ${modules.length + 1}: New Curriculum Unit`,
      position: modules.length + 1,
      lessons: [],
    }
    const updated = [...modules, newMod]
    setModules(updated)
    onModulesChange(updated)
    toast.success("New module added")
  }

  const handleDeleteModule = (modId: string) => {
    const updated = modules.filter((m) => m.id !== modId)
    setModules(updated)
    onModulesChange(updated)
    toast.success("Module removed")
  }

  const handleUpdateModule = (updatedMod: TeacherModule) => {
    const updated = modules.map((m) => (m.id === updatedMod.id ? updatedMod : m))
    setModules(updated)
    onModulesChange(updated)
  }

  const handleSaveLessonModal = (lessonData: Partial<TeacherLesson>) => {
    if (!editingModalState.moduleId) return

    const targetModule = modules.find((m) => m.id === editingModalState.moduleId)
    if (!targetModule) return

    let updatedLessons = [...targetModule.lessons]

    if (editingModalState.lesson) {
      // Update existing
      updatedLessons = updatedLessons.map((l) =>
        l.id === editingModalState.lesson?.id ? ({ ...l, ...lessonData } as TeacherLesson) : l
      )
    } else {
      // Create new lesson
      const newLesson: TeacherLesson = {
        id: "les-" + Date.now(),
        moduleId: editingModalState.moduleId,
        title: lessonData.title || "New Lesson",
        slug: (lessonData.title || "new-lesson").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: lessonData.type || "VIDEO",
        durationSec: lessonData.durationSec || 600,
        position: targetModule.lessons.length + 1,
        videoUrl: lessonData.videoUrl,
        content: lessonData.content,
        isPreview: Boolean(lessonData.isPreview),
        resources: [],
      }
      updatedLessons.push(newLesson)
    }

    handleUpdateModule({ ...targetModule, lessons: updatedLessons })
    toast.success("Lesson saved successfully")
  }

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleModuleDragEnd}
      >
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {modules.map((mod, modIdx) => (
              <SortableModuleCard
                key={mod.id}
                module={mod}
                index={modIdx}
                total={modules.length}
                onModuleChange={handleUpdateModule}
                onDeleteModule={() => handleDeleteModule(mod.id)}
                onMoveUp={() => handleMoveModule(modIdx, "up")}
                onMoveDown={() => handleMoveModule(modIdx, "down")}
                onOpenLessonEditor={(modId, lesson) =>
                  setEditingModalState({ open: true, moduleId: modId, lesson })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Module Trigger */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddModule}
        className="w-full h-12 border-dashed border-border hover:border-brand-teal text-sm font-semibold gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4 text-brand-teal" />
        <span>Add New Curriculum Module</span>
      </Button>

      {/* Lesson Editor Modal */}
      <LessonEditorModal
        open={editingModalState.open}
        onOpenChange={(open) => setEditingModalState((prev) => ({ ...prev, open }))}
        lesson={editingModalState.lesson}
        onSave={handleSaveLessonModal}
      />
    </div>
  )
}
