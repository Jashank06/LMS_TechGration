"use client"

import * as React from "react"

interface CountUpProps {
  value: number
  duration?: number
  delay?: number
  decimals?: number
  /** When false, shows the final value immediately. */
  animate?: boolean
  className?: string
}

export function CountUp({
  value,
  duration = 1200,
  delay = 0,
  decimals = 0,
  animate = true,
  className,
}: CountUpProps) {
  const [display, setDisplay] = React.useState(animate ? 0 : value)

  React.useEffect(() => {
    if (!animate) {
      setDisplay(value)
      return
    }
    let raf = 0
    let timer: ReturnType<typeof setTimeout>
    const start = () => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(value * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    timer = setTimeout(start, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [value, duration, delay, animate])

  const shown = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString()
  return <span className={className}>{shown}</span>
}
