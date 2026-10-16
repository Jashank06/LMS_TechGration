"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  HelpCircle,
  Clock,
  Sparkles,
  Award,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { generateQuizTemplate, parseQuizSpreadsheet } from "@/lib/excel-quiz-parser"

interface QuestionDraft {
  prompt: string
  points: number
  explanation: string
  options: Array<{
    label: string
    isCorrect: boolean
  }>
}

interface CreateQuizModalProps {
  courseId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateQuizModal({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: CreateQuizModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [parsingExcel, setParsingExcel] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState("15")
  const [passingPct, setPassingPct] = React.useState("70")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [questions, setQuestions] = React.useState<QuestionDraft[]>([
    {
      prompt: "",
      points: 10,
      explanation: "",
      options: [
        { label: "", isCorrect: true },
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
        { label: "", isCorrect: false },
      ],
    },
  ])

  // Quick preset template for rapid quiz creation
  const handleApplyAIPreset = () => {
    setTitle("Neural Architectures & Transformer Attention Quiz")
    setDescription("Validate core comprehension of scaled dot-product attention, residual connections, and token embeddings.")
    setTimeLimitMinutes("20")
    setPassingPct("75")
    setQuestions([
      {
        prompt: "Why are residual skip connections critical in deep transformer backbones?",
        points: 10,
        explanation: "Skip connections provide identity gradient flow paths during backpropagation, avoiding vanishing gradients.",
        options: [
          { label: "They eliminate the need for GPU VRAM during training", isCorrect: false },
          { label: "They allow uninterrupted gradient flow to earlier layers, combating vanishing gradients", isCorrect: true },
          { label: "They compress vocabulary embeddings by 50%", isCorrect: false },
          { label: "They disable dropout during inference automatically", isCorrect: false },
        ],
      },
      {
        prompt: "What is the computational complexity of standard self-attention with respect to sequence length N?",
        points: 10,
        explanation: "Self-attention computes pair-wise dot products across all N tokens with all N tokens, leading to O(N^2) complexity.",
        options: [
          { label: "O(N) - Linear", isCorrect: false },
          { label: "O(N log N) - Log-linear", isCorrect: false },
          { label: "O(N^2) - Quadratic", isCorrect: true },
          { label: "O(1) - Constant", isCorrect: false },
        ],
      },
    ])
    toast.success("AI Architecture preset loaded!")
  }

  const handleDownloadTemplate = () => {
    try {
      generateQuizTemplate()
      toast.success("Excel template downloaded (techgration_quiz_mcq_template.xlsx)")
    } catch (err) {
      console.error("Template download error:", err)
      toast.error("Failed to download template")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParsingExcel(true)
    try {
      const { questions: parsedQuestions, errors } = await parseQuizSpreadsheet(file)

      if (parsedQuestions.length === 0) {
        toast.error(errors[0] || "Could not parse any valid questions from file.")
        return
      }

      setQuestions(parsedQuestions)
      toast.success(`Successfully imported ${parsedQuestions.length} questions from Excel!`)

      if (errors.length > 0) {
        console.warn("Excel parser warnings:", errors)
      }
    } catch (err) {
      console.error("Excel import error:", err)
      toast.error("Failed to parse Excel file")
    } finally {
      setParsingExcel(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        prompt: "",
        points: 10,
        explanation: "",
        options: [
          { label: "", isCorrect: true },
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
          { label: "", isCorrect: false },
        ],
      },
    ])
  }

  const handleRemoveQuestion = (qIdx: number) => {
    if (questions.length <= 1) {
      toast.error("At least one question is required")
      return
    }
    setQuestions(questions.filter((_, idx) => idx !== qIdx))
  }

  const handleQuestionChange = (qIdx: number, field: "prompt" | "explanation" | "points", value: string | number) => {
    const updated = [...questions]
    updated[qIdx] = { ...updated[qIdx], [field]: value }
    setQuestions(updated)
  }

  const handleOptionChange = (qIdx: number, optIdx: number, label: string) => {
    const updated = [...questions]
    const updatedOptions = [...updated[qIdx].options]
    updatedOptions[optIdx] = { ...updatedOptions[optIdx], label }
    updated[qIdx] = { ...updated[qIdx], options: updatedOptions }
    setQuestions(updated)
  }

  const handleSetCorrectOption = (qIdx: number, correctOptIdx: number) => {
    const updated = [...questions]
    const updatedOptions = updated[qIdx].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === correctOptIdx,
    }))
    updated[qIdx] = { ...updated[qIdx], options: updatedOptions }
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please enter a quiz title")
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.prompt.trim()) {
        toast.error(`Question ${i + 1} prompt cannot be empty`)
        return
      }
      const validOptions = q.options.filter((o) => o.label.trim())
      if (validOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 non-empty options`)
        return
      }
      const hasCorrect = q.options.some((o) => o.isCorrect && o.label.trim())
      if (!hasCorrect) {
        toast.error(`Question ${i + 1} must have a marked correct option`)
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          timeLimitMinutes: Number(timeLimitMinutes) || 15,
          passingPct: Number(passingPct) || 70,
          questions: questions.map((q) => ({
            prompt: q.prompt.trim(),
            points: Number(q.points) || 10,
            explanation: q.explanation.trim() || null,
            options: q.options
              .filter((o) => o.label.trim())
              .map((o) => ({
                label: o.label.trim(),
                isCorrect: o.isCorrect,
              })),
          })),
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success("Quiz published and linked to course!")
        setTitle("")
        setDescription("")
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to create quiz")
      }
    } catch (err) {
      console.error("Quiz create error:", err)
      toast.error("Network error while creating quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Create Course Quiz & Assessment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Construct a timed scenario-based multiple-choice evaluation with automatic marks calculation, pass criteria, and bulk spreadsheet upload.
          </DialogDescription>
        </DialogHeader>

        {/* Excel Bulk Import & Presets Toolbar */}
        <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Bulk Excel / CSV MCQ Import</p>
              <p className="text-[11px] text-muted-foreground">Upload spreadsheet with questions, options, & answers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="rounded-xl text-[11px] h-8 px-2.5 font-semibold text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3 h-3 mr-1 text-emerald-500" />
              <span>Get Excel Template</span>
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={parsingExcel}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl text-[11px] h-8 px-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {parsingExcel ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 mr-1" />
                  <span>Upload Spreadsheet</span>
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={handleApplyAIPreset}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>AI Preset</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Title & Description */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="quizTitle" className="text-xs font-bold text-foreground">
                Quiz Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quizTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Consensus & Raft Protocol Quiz"
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quizDesc" className="text-xs font-bold text-foreground">
                Description & Objectives (Optional)
              </Label>
              <Input
                id="quizDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of what competencies are validated in this assessment..."
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>
          </div>

          {/* Time Limit & Passing Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="timeLimit" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-500" />
                <span>Duration (Minutes)</span>
              </Label>
              <Input
                id="timeLimit"
                type="number"
                min="5"
                max="180"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passMark" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Passing Threshold (%)</span>
              </Label>
              <Input
                id="passMark"
                type="number"
                min="30"
                max="100"
                value={passingPct}
                onChange={(e) => setPassingPct(e.target.value)}
                className="rounded-xl h-10 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>
          </div>

          {/* Questions Builder Section */}
          <div className="space-y-4 pt-3 border-t border-border/70">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Questions ({questions.length})
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Select the radio button next to the correct answer. Points will automatically be computed.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="rounded-xl text-xs h-8 px-3 font-semibold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Question</span>
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-2xl border border-border/80 bg-background/80 space-y-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-secondary text-foreground">
                      Question #{qIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Marks / Points:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={q.points}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, "points", Number(e.target.value))
                          }
                          className="w-14 h-7 px-1.5 rounded-md border border-border bg-background text-xs text-center font-bold"
                        />
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-1">
                    <Input
                      value={q.prompt}
                      onChange={(e) =>
                        handleQuestionChange(qIdx, "prompt", e.target.value)
                      }
                      placeholder={`Enter question prompt...`}
                      className="rounded-xl h-9 text-xs sm:text-sm bg-card border-border/80"
                      required
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Answer Choices:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            opt.isCorrect
                              ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                              : "border-border/80 bg-card"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-opt-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) =>
                              handleOptionChange(qIdx, optIdx, e.target.value)
                            }
                            placeholder={`Option ${optIdx + 1}${opt.isCorrect ? " (Correct Answer)" : ""}`}
                            className="flex-1 bg-transparent border-0 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                            required
                          />
                          {opt.isCorrect && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1 pt-1">
                    <Input
                      value={q.explanation}
                      onChange={(e) =>
                        handleQuestionChange(qIdx, "explanation", e.target.value)
                      }
                      placeholder="Explanation revealed to students after submitting (Optional)..."
                      className="rounded-xl h-8 text-[11px] bg-card border-border/80 text-muted-foreground"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl text-xs h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl text-xs h-10 px-5 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Publishing Quiz...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  <span>Publish Quiz</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
