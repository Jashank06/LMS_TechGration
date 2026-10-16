import confetti from "canvas-confetti"

export function triggerBrandCelebration() {
  if (typeof window === "undefined") return

  // Check prefers-reduced-motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return
  }

  const brandColors = ["#00D6D6", "#18E6E6", "#00AEB8", "#D7DCE2", "#FFFFFF"]

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: brandColors,
    disableForReducedMotion: true,
  })

  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: brandColors,
      disableForReducedMotion: true,
    })
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: brandColors,
      disableForReducedMotion: true,
    })
  }, 200)
}
