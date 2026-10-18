"use client"

import * as React from "react"

interface AnimatedCounterProps {
  value: string | number
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1000,
  className = "",
}: AnimatedCounterProps) {
  const valueStr = String(value).trim()

  // Extract prefix, numeric part, and suffix
  // e.g. "0.0 hrs" -> numeric: 0.0, suffix: " hrs"
  // e.g. "85%" -> numeric: 85, suffix: "%"
  // e.g. "2" -> numeric: 2, suffix: ""
  const match = valueStr.match(/^([^0-9.]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
  const prefix = match ? match[1] : ""
  const targetNum = match ? parseFloat(match[2]) : NaN
  const isDecimal = match && match[2].includes(".")
  const decimalPlaces = isDecimal ? match[2].split(".")[1]?.length || 1 : 0
  const suffix = match ? match[3] : ""

  const [displayNum, setDisplayNum] = React.useState<number>(targetNum)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (isNaN(targetNum)) return

    let startTime: number | null = null
    let animationFrameId: number

    const startValue = 0

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic formula: 1 - pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (targetNum - startValue) * easeOut

      setDisplayNum(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setDisplayNum(targetNum)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [targetNum, duration])

  if (isNaN(targetNum)) {
    return <span className={className}>{valueStr}</span>
  }

  const formattedNumber = !mounted
    ? isDecimal
      ? targetNum.toFixed(decimalPlaces)
      : Math.round(targetNum).toString()
    : isDecimal
    ? displayNum.toFixed(decimalPlaces)
    : Math.round(displayNum).toString()

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  )
}
