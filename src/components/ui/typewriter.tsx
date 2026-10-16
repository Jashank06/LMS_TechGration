"use client"

import * as React from "react"
import { motion } from "motion/react"

interface TypewriterProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
  cursorClassName?: string
}

export function Typewriter({
  words,
  typingSpeed = 80,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className = "",
  cursorClassName = "text-brand-teal",
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0)
  const [currentText, setCurrentText] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    const fullWord = words[currentWordIndex] || ""

    let timer: NodeJS.Timeout

    if (!isDeleting) {
      // Typing phase
      if (currentText.length < fullWord.length) {
        timer = setTimeout(() => {
          setCurrentText(fullWord.slice(0, currentText.length + 1))
        }, typingSpeed)
      } else {
        // Word complete, pause before deleting
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    } else {
      // Deleting phase
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(fullWord.slice(0, currentText.length - 1))
        }, deletingSpeed)
      } else {
        // Deletion complete, move to next word
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
      }
    }

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.85, ease: "easeInOut" }}
        className={`inline-block ml-0.5 font-bold ${cursorClassName}`}
      >
        |
      </motion.span>
    </span>
  )
}
