"use client"

import * as React from "react"
import katex from "katex"
import { Copy, Check } from "lucide-react"

interface StatementMathRendererProps {
  content: string
  className?: string
}

/**
 * High-fidelity mathematical and markdown renderer for coding problem statements.
 * Supports LaTeX math expressions ($...$ and $$...$$), code fences, and markdown formatting.
 */
export function StatementMathRenderer({ content, className = "" }: StatementMathRendererProps) {
  const renderedHtml = React.useMemo(() => {
    if (!content) return ""

    let text = content

    // 1. Extract and render display math: $$ math $$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-3 overflow-x-auto text-center">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })}</div>`
      } catch {
        return `<div class="my-2 font-mono text-xs text-amber-400">$$${math}$$</div>`
      }
    })

    // 2. Extract and render inline math: $ math $ (ensuring not matched across multiple lines or empty)
    text = text.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })
        return `${prefix}<span class="inline-math">${rendered}</span>`
      } catch {
        return `${prefix}<span class="font-mono text-xs text-amber-400">$${math}$</span>`
      }
    })

    // 3. Code fences: ```lang ... ```
    text = text.replace(
      /```(\w*)\n([\s\S]*?)```/g,
      (_, lang, code) =>
        `<div class="relative rounded-xl overflow-hidden border border-border/80 bg-muted/40 my-3">
          ${lang ? `<div class="px-3 py-1 bg-muted/80 text-[10px] font-mono uppercase text-muted-foreground border-b border-border/60">${lang}</div>` : ""}
          <pre class="p-3 text-[12px] font-mono leading-relaxed overflow-x-auto text-foreground/90 whitespace-pre"><code>${code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</code></pre>
        </div>`
    )

    // 4. Inline code: `code`
    text = text.replace(
      /`([^`\n]+)`/g,
      '<code class="px-1.5 py-0.5 rounded-md bg-muted text-[12px] font-mono text-teal-600 dark:text-teal-400 font-semibold border border-border/50">$1</code>'
    )

    // 5. Headings: ### Title
    text = text.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-foreground mt-4 mb-1.5">$1</h4>')
    text = text.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-foreground mt-5 mb-2">$1</h3>')

    // 6. Bold & Italics
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-foreground/90">$1</em>')

    // 7. Bullet lists: - Item or * Item
    text = text.replace(
      /(?:^|\n)[-*] (.*)/g,
      '<div class="flex items-start gap-2 my-1 text-xs text-muted-foreground"><span class="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span><span>$1</span></div>'
    )

    // 8. Paragraphs and line breaks
    const paragraphs = text.split(/\n{2,}/)
    return paragraphs
      .map((p) => {
        const trimmed = p.trim()
        if (!trimmed) return ""
        if (
          trimmed.startsWith("<div") ||
          trimmed.startsWith("<h3") ||
          trimmed.startsWith("<h4") ||
          trimmed.startsWith("<pre")
        ) {
          return trimmed
        }
        return `<p class="text-xs sm:text-sm text-foreground/85 leading-relaxed my-2">${trimmed.replace(/\n/g, "<br/>")}</p>`
      })
      .join("")
  }, [content])

  return (
    <div
      className={`arena-math-statement prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}
