"use client"

import * as React from "react"
import { motion } from "motion/react"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Ensure digits array matches length
  const digits = React.useMemo(() => {
    const arr = value.split("").slice(0, length)
    while (arr.length < length) {
      arr.push("")
    }
    return arr
  }, [value, length])

  // Focus first input on mount
  React.useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [disabled])

  function handleInputChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = e.target.value
    // Get the last typed character
    const lastChar = rawValue.slice(-1)

    if (!/^\d*$/.test(lastChar)) {
      return // Ignore non-numeric
    }

    const newDigits = [...digits]
    newDigits[index] = lastChar
    const combined = newDigits.join("")
    onChange(combined)

    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (combined.length === length && !combined.includes("")) {
      onComplete?.(combined)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back and clear previous
        const newDigits = [...digits]
        newDigits[index - 1] = ""
        onChange(newDigits.join(""))
        inputRefs.current[index - 1]?.focus()
      } else {
        const newDigits = [...digits]
        newDigits[index] = ""
        onChange(newDigits.join(""))
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length)

    if (!pasted) return

    onChange(pasted)
    const targetFocusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[targetFocusIndex]?.focus()

    if (pasted.length === length) {
      onComplete?.(pasted)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, idx) => {
        const isFilled = !!digit
        return (
          <motion.div
            key={idx}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
            className="relative"
          >
            <input
              ref={(el) => {
                inputRefs.current[idx] = el
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleInputChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${idx + 1}`}
              className={`w-11 h-14 sm:w-13 sm:h-16 text-center font-mono text-2xl sm:text-3xl font-extrabold rounded-xl transition-all duration-200 outline-none select-none ${
                hasError
                  ? "border-2 border-red-500/80 bg-red-500/10 text-red-400 focus:ring-2 focus:ring-red-500"
                  : isFilled
                  ? "border-2 border-brand-teal/80 bg-brand-teal/10 text-brand-teal shadow-[0_0_15px_rgba(0,214,214,0.2)] focus:ring-2 focus:ring-brand-teal"
                  : "border border-border/80 bg-card/60 text-foreground focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/40 hover:border-brand-teal/40"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            {/* Glowing bottom indicator */}
            <div
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full transition-all duration-200 ${
                isFilled ? "bg-brand-teal opacity-100" : "bg-muted-foreground/30 opacity-0"
              }`}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
