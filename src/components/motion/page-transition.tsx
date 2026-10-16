"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { fadeInVariants, slideUpVariants } from "./presets"

export function PageTransition({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? fadeInVariants : slideUpVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
