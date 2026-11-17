"use client"

import * as React from "react"
import katex from "katex"

interface StatementMathRendererProps {
  content: string
  className?: string
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * High-fidelity mathematical and markdown renderer for coding problem statements.
 * Supports LaTeX math expressions ($...$ and $$...$$), code fences, inline code,
 * and safely escapes angle brackets like `<name>` or `vector<int>`.
 */
export function StatementMathRenderer({ content, className = "" }: StatementMathRendererProps) {
  const renderedHtml = React.useMemo(() => {
    if (!content) return ""

    const placeholders: string[] = []
    const store = (html: string) => {
      const idx = placeholders.length
      placeholders.push(html)
      return `\u0000PH_${idx}\u0000`
    }

    let text = content.replace(/\r\n/g, "\n")

    // 1. Code fences first (so math/markdown inside code is never altered)
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      store(
        `<div class="relative rounded-xl overflow-hidden border border-border/80 bg-muted/40 my-3">
          ${lang ? `<div class="px-3 py-1 bg-muted/80 text-[10px] font-mono uppercase text-muted-foreground border-b border-border/60">${escapeHtml(lang)}</div>` : ""}
          <pre class="p-3 text-[12px] font-mono leading-relaxed overflow-x-auto text-foreground/90 whitespace-pre"><code>${escapeHtml(code)}</code></pre>
        </div>`
      )
    )

    // 2. Inline code (safely escaping <name>, vector<int>, etc.)
    text = text.replace(/`([^`\n]+)`/g, (_, code) =>
      store(
        `<code class="px-1.5 py-0.5 rounded-md bg-muted text-[12px] font-mono text-teal-600 dark:text-teal-400 font-semibold border border-border/50">${escapeHtml(code)}</code>`
      )
    )

    // 3. Display math: $$ math $$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return store(
          `<div class="my-3 overflow-x-auto text-center">${katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
          })}</div>`
        )
      } catch {
        return store(`<div class="my-2 font-mono text-xs text-amber-400">$$${escapeHtml(math)}$$</div>`)
      }
    })

    // 4. Inline math: $ math $
    text = text.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })
        return `${prefix}${store(`<span class="inline-math">${rendered}</span>`)}`
      } catch {
        return `${prefix}${store(`<span class="font-mono text-xs text-amber-400">$${escapeHtml(math)}$</span>`)}`
      }
    })

    // 5. Escape raw HTML in remaining prose so <name>, a < b, etc. render literally
    text = escapeHtml(text)

    // 6. Headings: ### Title / ## Title
    text = text.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-foreground mt-4 mb-1.5">$1</h4>')
    text = text.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-foreground mt-5 mb-2">$1</h3>')

    // 7. Bold & Italics
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic text-foreground/90">$1</em>')

    // 8. Bullet lists: - Item or * Item
    text = text.replace(
      /(?:^|\n)[-*] (.*)/g,
      '<div class="flex items-start gap-2 my-1 text-xs text-muted-foreground"><span class="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span><span>$1</span></div>'
    )

    // 9. Paragraphs and line breaks
    const paragraphs = text.split(/\n{2,}/)
    let html = paragraphs
      .map((p) => {
        const trimmed = p.trim()
        if (!trimmed) return ""
        if (
          trimmed.startsWith("<div") ||
          trimmed.startsWith("<h3") ||
          trimmed.startsWith("<h4") ||
          trimmed.startsWith("<pre") ||
          /^\u0000PH_\d+\u0000$/.test(trimmed)
        ) {
          return trimmed
        }
        return `<p class="text-xs sm:text-sm text-foreground/85 leading-relaxed my-2">${trimmed.replace(/\n/g, "<br/>")}</p>`
      })
      .join("")

    // 10. Restore all placeholders
    html = html.replace(/\u0000PH_(\d+)\u0000/g, (_, idx) => placeholders[Number(idx)] ?? "")

    return html
  }, [content])

  return (
    <div
      className={`arena-math-statement prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}
