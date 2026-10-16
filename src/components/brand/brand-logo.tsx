import * as React from "react"
import Image from "next/image"
import Link from "next/link"

export type BrandLogoVariant = "hero" | "lockup" | "mark" | "wordmark" | "sidebar"

export interface BrandLogoProps {
  variant?: BrandLogoVariant
  portalName?: "Student" | "Teacher" | "Admin" | "LMS"
  className?: string
  href?: string | null
  priority?: boolean
}

export function BrandLogo({
  variant = "lockup",
  portalName,
  className = "",
  href = "/",
  priority = false,
}: BrandLogoProps) {
  const content = (() => {
    switch (variant) {
      case "hero":
        return (
          <div className={`relative flex flex-col items-center select-none ${className}`}>
            <div className="relative w-full max-w-[540px] aspect-[1774/887] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0A0E11]">
              <Image
                src="/brand/techgration-logo.webp"
                alt="TechGration LMS — Learning. Technology. Growth."
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, 540px"
                className="object-contain"
              />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-2xl" />
            </div>
            <p className="mt-3 text-xs tracking-widest uppercase font-medium text-muted-foreground/80">
              Learning. Technology. Growth.
            </p>
          </div>
        )

      case "mark":
        return (
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0E1418] border border-white/10 shadow-sm overflow-hidden group-hover:border-brand-teal/50 transition-colors select-none ${className}`}
            title="TechGration LMS"
          >
            <div className="relative w-7 h-7">
              <Image
                src="/brand/tg-mark.png"
                alt="TechGration"
                fill
                priority={priority}
                sizes="40px"
                className="object-contain"
              />
            </div>
          </div>
        )

      case "wordmark":
        return (
          <div className={`relative h-6 w-36 select-none ${className}`}>
            <Image
              src="/brand/tg-wordmark.png"
              alt="TechGration"
              fill
              priority={priority}
              sizes="144px"
              className="object-contain"
            />
          </div>
        )

      case "sidebar":
        return (
          <div className={`flex items-center gap-3 select-none ${className}`}>
            {/* Apple-style squircle brand emblem */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#141A1E] to-[#0A0D10] border border-border/80 shadow-xs shrink-0">
              <div className="relative w-5 h-5">
                <Image
                  src="/brand/tg-mark.png"
                  alt="TechGration Mark"
                  fill
                  priority={priority}
                  sizes="36px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-foreground leading-snug">
                Tech<span className="text-brand-ink dark:text-brand-teal font-bold">Gration</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Student Portal
              </span>
            </div>
          </div>
        )

      case "lockup":
      default:
        return (
          <div className={`flex items-center gap-2.5 select-none ${className}`}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0D1215] border border-white/10 shadow-sm shrink-0">
              <div className="relative w-7 h-7">
                <Image
                  src="/brand/tg-mark.png"
                  alt="TechGration Mark"
                  fill
                  priority={priority}
                  sizes="40px"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold tracking-tight text-base text-foreground leading-tight">
                Tech<span className="text-brand-ink dark:text-brand-teal">Gration</span>
                <span className="ml-1 text-xs font-normal text-muted-foreground">LMS</span>
              </span>
              <span className="text-[10px] tracking-wide text-muted-foreground">
                Learning. Technology. Growth.
              </span>
            </div>
          </div>
        )
    }
  })()

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    )
  }

  return content
}
