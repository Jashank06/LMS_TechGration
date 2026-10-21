"use client"

import * as React from "react"
import { Plus, X, RotateCcw, Terminal, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TestCaseItem {
  id: string
  input: string
  expectedOutput: string
  isCustom?: boolean
}

interface InteractiveTestcasesProps {
  initialSamples: { id: string; input: string; expectedOutput: string }[]
  testCases: TestCaseItem[]
  onTestCasesChange: (cases: TestCaseItem[]) => void
  activeCaseIndex: number
  onSelectCaseIndex: (index: number) => void
}

export function InteractiveTestcases({
  initialSamples,
  testCases,
  onTestCasesChange,
  activeCaseIndex,
  onSelectCaseIndex,
}: InteractiveTestcasesProps) {
  const currentCase = testCases[activeCaseIndex] || testCases[0]

  const handleUpdateInput = (val: string) => {
    const updated = [...testCases]
    if (!updated[activeCaseIndex]) return
    updated[activeCaseIndex] = { ...updated[activeCaseIndex], input: val }
    onTestCasesChange(updated)
  }

  const handleUpdateExpected = (val: string) => {
    const updated = [...testCases]
    if (!updated[activeCaseIndex]) return
    updated[activeCaseIndex] = { ...updated[activeCaseIndex], expectedOutput: val }
    onTestCasesChange(updated)
  }

  const handleAddCase = () => {
    if (testCases.length >= 8) return // safety cap
    const newCase: TestCaseItem = {
      id: `custom_${Date.now()}`,
      input: "",
      expectedOutput: "",
      isCustom: true,
    }
    const updated = [...testCases, newCase]
    onTestCasesChange(updated)
    onSelectCaseIndex(updated.length - 1)
  }

  const handleRemoveCase = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (testCases.length <= 1) return
    const updated = testCases.filter((_, i) => i !== indexToRemove)
    onTestCasesChange(updated)
    if (activeCaseIndex >= updated.length) {
      onSelectCaseIndex(updated.length - 1)
    }
  }

  const handleResetToSamples = () => {
    onTestCasesChange(
      initialSamples.map((s, i) => ({
        id: s.id || `sample_${i}`,
        input: s.input,
        expectedOutput: s.expectedOutput,
        isCustom: false,
      }))
    )
    onSelectCaseIndex(0)
  }

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {testCases.map((tc, idx) => {
            const isActive = idx === activeCaseIndex
            return (
              <div
                key={tc.id}
                onClick={() => onSelectCaseIndex(idx)}
                className={cn(
                  "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0",
                  isActive
                    ? "bg-white/20 text-white font-bold border border-white/20 shadow-xs"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <span>{tc.isCustom ? `Custom ${idx + 1}` : `Case ${idx + 1}`}</span>

                {tc.isCustom && (
                  <button
                    onClick={(e) => handleRemoveCase(idx, e)}
                    className="opacity-60 hover:opacity-100 p-0.5 rounded hover:bg-white/10"
                    title="Remove case"
                  >
                    <X className="w-3 h-3 text-rose-400" />
                  </button>
                )}
              </div>
            )
          })}

          {testCases.length < 8 && (
            <button
              onClick={handleAddCase}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-teal-400 hover:bg-teal-500/10 border border-dashed border-white/20 hover:border-teal-500/40 transition-all cursor-pointer shrink-0"
              title="Add Custom Test Case"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Case</span>
            </button>
          )}
        </div>

        <button
          onClick={handleResetToSamples}
          className="hidden sm:flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          title="Reset back to default problem samples"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Cases</span>
        </button>
      </div>

      {/* Editor for current case */}
      {currentCase && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                Stdin Input
              </span>
              <span className="text-[10px] text-white/40 font-mono">Editable</span>
            </div>
            <textarea
              value={currentCase.input}
              onChange={(e) => handleUpdateInput(e.target.value)}
              placeholder="Enter stdin for this test case..."
              className="w-full h-24 p-3 rounded-xl bg-[#121214] border border-white/10 text-xs font-mono text-white/95 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Expected Output {currentCase.isCustom ? "(Optional)" : ""}
              </span>
            </div>
            <textarea
              value={currentCase.expectedOutput}
              onChange={(e) => handleUpdateExpected(e.target.value)}
              placeholder={currentCase.isCustom ? "Optional: expected stdout to compare against..." : "Expected stdout"}
              className="w-full h-16 p-3 rounded-xl bg-[#121214] border border-white/10 text-xs font-mono text-white/80 resize-none focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}
