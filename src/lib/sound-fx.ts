/**
 * Synthesizes glassy modern chat chimes using native Web Audio API.
 * Requires 0 external audio files, 0 network latency, and never throws 404.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("tg_chat_sound_muted") !== "true"
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tg_chat_sound_muted", enabled ? "false" : "true")
}

/**
 * Play a crisp, gentle ascending glass-pop when sending a message.
 */
export function playMessageSentSound(): void {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.13)
  } catch {
    // Non-blocking
  }
}

/**
 * Play a double-bell gentle marimba chime when receiving an incoming message.
 */
export function playMessageReceivedSound(): void {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Tone 1
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.09, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.23)

    // Tone 2 (harmony)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(880, now + 0.08) // A5
    gain2.gain.setValueAtTime(0.09, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.32)
  } catch {
    // Non-blocking
  }
}
