export type MeetingPlatformKey = "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "CUSTOM"

export interface MeetingLinkResult {
  ok: boolean
  url?: string
  error?: string
}

/** Guess the platform from a pasted link (used to auto-select in the UI). */
export function detectPlatform(rawUrl: string): MeetingPlatformKey {
  try {
    const trimmed = rawUrl.trim()
    const urlWithProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const host = new URL(urlWithProto).hostname.toLowerCase()
    if (host.endsWith("zoom.us") || host.endsWith("zoom.com") || host.endsWith("zoomgov.com")) return "ZOOM"
    if (host === "meet.google.com") return "GOOGLE_MEET"
    if (host.endsWith("teams.microsoft.com") || host.endsWith("teams.live.com")) return "TEAMS"
  } catch {
    // ignore
  }
  return "CUSTOM"
}

/**
 * Validates a meeting link for the selected platform. Always requires https
 * (the link is emailed to learners, so we refuse javascript:/http: junk).
 * Gracefully auto-prefixes https:// and strips trailing slashes.
 */
export function validateMeetingUrl(platform: MeetingPlatformKey, input: string): MeetingLinkResult {
  let raw = input.trim()
  if (!raw) {
    return { ok: false, error: "Meeting link is required" }
  }

  // Auto-prefix https:// if omitted by user
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`
  }

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return { ok: false, error: "Enter a full meeting link starting with https://" }
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Meeting link must use https://" }
  }

  const host = parsed.hostname.toLowerCase()
  const cleanPath = (parsed.pathname || "/").replace(/\/+$/, "")

  if (platform === "ZOOM") {
    const okHost = host.endsWith("zoom.us") || host.endsWith("zoom.com") || host.endsWith("zoomgov.com")
    // Supports standard meetings (/j/), personal meeting IDs (/my/), web client (/wc/), start URLs (/s/), and webinars (/w/, /webinar/)
    const okPath = /^\/(j|my|wc|s|w|webinar)(\/|$)/i.test(cleanPath)
    if (!okHost || !okPath) {
      return { ok: false, error: "Zoom link should look like https://zoom.us/j/1234567890" }
    }
  } else if (platform === "GOOGLE_MEET") {
    // Supports standard meetings (meet.google.com/abc-defg-hij) and lookup links (meet.google.com/lookup/...)
    if (host !== "meet.google.com" || !/^\/(lookup\/)?[a-z0-9-]{3,}$/i.test(cleanPath)) {
      return { ok: false, error: "Google Meet link should look like https://meet.google.com/abc-defg-hij" }
    }
  } else if (platform === "TEAMS") {
    if (!(host.endsWith("teams.microsoft.com") || host.endsWith("teams.live.com"))) {
      return { ok: false, error: "Teams link should start with https://teams.microsoft.com/..." }
    }
  }

  return { ok: true, url: parsed.toString() }
}
