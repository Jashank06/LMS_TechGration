"use client"

import * as React from "react"
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react"
import {
  MONACO_LANGUAGE_MAP,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/lib/arena-constants"
import {
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Code2,
  Sparkles,
  Cloud,
  CloudCheck,
  Type,
  MapPin,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface CodeEditorProps {
  language: SupportedLanguage
  onLanguageChange: (lang: SupportedLanguage) => void
  code: string
  onCodeChange: (code: string) => void
  starterCode: Record<string, string>
  problemSlug: string
  initialDraftCode?: string | null
  initialDraftLanguage?: string | null
  readOnly?: boolean
  saveStatus?: "saved" | "saving" | "unsaved"
  onRun?: () => void
  onSubmit?: () => void
  onManualSave?: () => void
}

type MonacoTheme = "vs-dark" | "monokai" | "hc-black" | "vs"

const THEME_OPTIONS: { id: MonacoTheme; label: string }[] = [
  { id: "vs-dark", label: "Dark+" },
  { id: "monokai", label: "Monokai" },
  { id: "hc-black", label: "High Contrast" },
  { id: "vs", label: "Light" },
]

export function CodeEditor({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  starterCode,
  problemSlug,
  initialDraftCode,
  initialDraftLanguage,
  readOnly = false,
  saveStatus = "saved",
  onRun,
  onSubmit,
  onManualSave,
}: CodeEditorProps) {
  const [copied, setCopied] = React.useState(false)
  const [theme, setTheme] = React.useState<MonacoTheme>("vs-dark")
  const [fontSize, setFontSize] = React.useState<number>(14)
  const [showMinimap, setShowMinimap] = React.useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false)
  const [showConfirmReset, setShowConfirmReset] = React.useState<boolean>(false)

  const editorRef = React.useRef<any>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const storageKey = `arena_code_v2_${problemSlug}_${language}`

  // Initialize draft code on load (Priority: DB draft > localStorage > starterCode)
  const hasInitialized = React.useRef(false)
  React.useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (initialDraftLanguage && SUPPORTED_LANGUAGES.includes(initialDraftLanguage as any)) {
      onLanguageChange(initialDraftLanguage as SupportedLanguage)
    }

    if (initialDraftCode) {
      onCodeChange(initialDraftCode)
      return
    }

    const savedLocal = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null
    if (savedLocal) {
      onCodeChange(savedLocal)
    } else {
      onCodeChange(starterCode[language] || "")
    }
  }, [initialDraftCode, initialDraftLanguage, language, onCodeChange, onLanguageChange, starterCode, storageKey])

  // Local storage auto-sync backup
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (code && typeof window !== "undefined") {
        localStorage.setItem(storageKey, code)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [code, storageKey])

  // Setup Monokai theme definition
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "88846f", fontStyle: "italic" },
        { token: "keyword", foreground: "f92672", fontStyle: "bold" },
        { token: "string", foreground: "e6db74" },
        { token: "number", foreground: "ae81ff" },
        { token: "type", foreground: "66d9ef" },
        { token: "identifier", foreground: "f8f8f2" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#f8f8f2",
        "editorCursor.foreground": "#f8f8f0",
        "editor.lineHighlightBackground": "#2d2d30",
        "editorLineNumber.foreground": "#858585",
      },
    })
  }

  // Handle Editor On Mount + Keybindings
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Keybinding: Ctrl+Enter / Cmd+Enter => Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun()
    })

    // Keybinding: Ctrl+Shift+Enter / Cmd+Shift+Enter => Submit Solution
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onSubmit) onSubmit()
    })

    // Keybinding: Ctrl+S / Cmd+S => Manual Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onManualSave) onManualSave()
    })
  }

  // Global ESC key listener to exit fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  const handleReset = () => {
    const starter = starterCode[language] || ""
    onCodeChange(starter)
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`arena_code_${problemSlug}_${language}`)
      localStorage.removeItem(`arena_code_v2_${problemSlug}_${language}`)
    }
    setShowConfirmReset(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument")?.run()
    }
  }

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, code)
    }
    onLanguageChange(newLang)
    const newStorageKey = `arena_code_v2_${problemSlug}_${newLang}`
    const saved = typeof window !== "undefined" ? localStorage.getItem(newStorageKey) : null
    onCodeChange(saved || starterCode[newLang] || "")
  }

  const zoomIn = () => setFontSize((prev) => Math.min(22, prev + 1))
  const zoomOut = () => setFontSize((prev) => Math.max(12, prev - 1))

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 transition-all",
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none border-none h-screen w-screen"
          : "h-full w-full"
      )}
    >
      {/* ─── High-Tech IDE Toolbar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-white/10 shrink-0 flex-wrap gap-2">
        {/* Left: Language & Theme Selectors */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="bg-[#333333] hover:bg-[#3c3c3c] text-white/95 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <div className="relative hidden sm:flex items-center gap-1 bg-[#333333] px-2 py-1 rounded-lg border border-white/10 text-xs">
            <Palette className="w-3.5 h-3.5 text-white/50" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as MonacoTheme)}
              className="bg-transparent text-white/90 text-xs font-medium focus:outline-none cursor-pointer"
            >
              {THEME_OPTIONS.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#252526] text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cloud Auto-Save Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-white/60 bg-white/5 border border-white/5">
            {saveStatus === "saving" ? (
              <>
                <Cloud className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Cloud Saved</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-white/40" />
                <span>Unsaved</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1">
          {/* Font Size Zoom Controls */}
          <div className="hidden sm:flex items-center bg-[#333333] rounded-lg border border-white/10 px-1 py-0.5 text-white/70">
            <button
              onClick={zoomOut}
              className="px-1.5 py-0.5 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              title="Zoom Out (A-)"
            >
              A-
            </button>
            <span className="text-[10px] text-white/40 font-mono px-1">{fontSize}px</span>
            <button
              onClick={zoomIn}
              className="px-1.5 py-0.5 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              title="Zoom In (A+)"
            >
              A+
            </button>
          </div>

          {/* Format / Beautify Code */}
          <button
            onClick={handleFormatCode}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title="Format Code"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">Format</span>
          </button>

          {/* Minimap Toggle */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={cn(
              "p-1.5 rounded-md text-xs transition-colors cursor-pointer",
              showMinimap ? "bg-teal-500/20 text-teal-300" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
            title={showMinimap ? "Hide Minimap" : "Show Minimap"}
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Code */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── Confirmation Modal for Reset ─────────────────────────── */}
      {showConfirmReset && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-[#252526] border border-white/15 rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              Reset Code to Starter Template?
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              This will discard your current modifications for {LANGUAGE_LABELS[language]} and revert back to the
              initial problem starter code.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-sm cursor-pointer"
              >
                Reset Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Monaco Editor Container ───────────────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[language] || "plaintext"}
          value={code}
          onChange={(v) => onCodeChange(v || "")}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
            minimap: { enabled: showMinimap },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            readOnly,
            suggest: { showKeywords: true },
            quickSuggestions: { other: true, comments: false, strings: false },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            formatOnPaste: true,
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* ─── Status / Shortcut Footer Indicator ───────────────────── */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a1a] border-t border-white/5 text-[11px] text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span>{LANGUAGE_LABELS[language]}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline font-mono">UTF-8</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="hidden md:inline">Ctrl+Enter: Run</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Ctrl+Shift+Enter: Submit</span>
        </div>
      </div>
    </div>
  )
}
