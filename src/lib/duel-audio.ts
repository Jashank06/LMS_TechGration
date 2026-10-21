/**
 * Web Audio API Zero-Latency Sound Synthesizer for 1v1 Battle Arena
 * Pure browser mathematical oscillators — zero external mp3/wav dependencies.
 */

class DuelAudioEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false

  constructor() {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("tg_duel_muted") === "true"
    }
  }

  private initContext() {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (typeof window !== "undefined") {
      localStorage.setItem("tg_duel_muted", this.isMuted ? "true" : "false")
    }
    return this.isMuted
  }

  /**
   * 3, 2, 1 Countdown Tick: Crisp low sine blip (440Hz, 120ms)
   */
  public playCountdownTick() {
    if (this.isMuted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(440, ctx.currentTime) // A4

      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch {}
  }

  /**
   * "GO!" Chime: High resonant triangle bell (880Hz, 350ms)
   */
  public playCountdownGo() {
    if (this.isMuted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5

      gain.gain.setValueAtTime(0.28, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch {}
  }

  /**
   * Testcase Passed: Soft melodic ping (1046.50Hz, 200ms)
   */
  public playTestcasePassed() {
    if (this.isMuted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime) // C6

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }

  /**
   * Victory Fanfare: Major Triad arpeggio (C5 -> E5 -> G5 -> C6)
   */
  public playVictoryFanfare() {
    if (this.isMuted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        const startTime = ctx.currentTime + idx * 0.12

        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0.2, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.45)
      })
    } catch {}
  }

  /**
   * Defeat Tone: Gentle descending minor chord (E4 -> C4)
   */
  public playDefeatSound() {
    if (this.isMuted) return
    const ctx = this.initContext()
    if (!ctx) return

    try {
      const notes = [329.63, 261.63] // E4, C4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        const startTime = ctx.currentTime + idx * 0.18

        osc.frequency.setValueAtTime(freq, startTime)
        gain.gain.setValueAtTime(0.18, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.5)
      })
    } catch {}
  }
}

export const duelAudio = new DuelAudioEngine()
