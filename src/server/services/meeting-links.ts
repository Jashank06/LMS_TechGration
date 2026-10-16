export type MeetingPlatformKey = "ZOOM" | "GOOGLE_MEET" | "TEAMS" | "CUSTOM"

export interface MeetingLinkResult {
  ok: boolean
  url?: string
  error?: string
}

/** Guess the platform from a pasted link (used to auto-select in the UI). */
export function detectPlatform(rawUrl: string): MeetingPlatformKey {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase()
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
 */
export function validateMeetingUrl(platform: MeetingPlatformKey, input: string): MeetingLinkResult {
  const raw = input.trim()
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
  const path = parsed.pathname

  if (platform === "ZOOM") {
    const okHost = host.endsWith("zoom.us") || host.endsWith("zoom.com") || host.endsWith("zoomgov.com")
    if (!okHost || !/^\/(j|my|wc|s)\//.test(path)) {
      return { ok: false, error: "Zoom link should look like https://zoom.us/j/1234567890" }
    }
  } else if (platform === "GOOGLE_MEET") {
    if (host !== "meet.google.com" || !/^\/(lookup\/)?[a-z0-9-]{3,}$/i.test(path)) {
      return { ok: false, error: "Google Meet link should look like https://meet.google.com/abc-defg-hij" }
    }
  } else if (platform === "TEAMS") {
    if (!(host.endsWith("teams.microsoft.com") || host.endsWith("teams.live.com"))) {
      return { ok: false, error: "Teams link should start with https://teams.microsoft.com/..." }
    }
  }

  return { ok: true, url: parsed.toString() }
}
