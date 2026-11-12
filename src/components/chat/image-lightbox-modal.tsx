"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageLightboxModalProps {
  imageUrl: string | null
  imageAlt?: string
  onClose: () => void
}

export function ImageLightboxModal({
  imageUrl,
  imageAlt = "Image preview",
  onClose,
}: ImageLightboxModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!imageUrl) return null

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md select-none"
      >
        {/* Floating Top Controls */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 flex items-center gap-2 z-10"
        >
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download full image"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scaled Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
