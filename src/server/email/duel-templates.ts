import { transporter } from "./mailer"

const SMTP_USER = process.env.OTP_GMAIL_USER || "welcome@jashank.me"
const APP_URL = (process.env.PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://campus.techgration.live").replace(/\/$/, "")

/**
 * Sends a notification email when a batchmate creates an Open Challenge.
 */
export async function sendOpenChallengeEmail({
  recipientEmail,
  recipientName,
  challengerName,
  topic,
  difficulty,
  stakeXp,
  duelCode,
}: {
  recipientEmail: string
  recipientName: string
  challengerName: string
  topic: string
  difficulty: string
  stakeXp: number
  duelCode: string
}): Promise<boolean> {
  const duelUrl = `${APP_URL}/student/arena/duels/room/${duelCode}`

  const diffColor =
    difficulty === "HARD"
      ? "#F43F5E"
      : difficulty === "MEDIUM"
      ? "#F59E0B"
      : "#10B981"

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>⚔️ 1v1 Coding Challenge Alert</title>
  <style>
    body { margin: 0; padding: 0; background-color: #080B0E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #080B0E; padding: 32px 0; }
    .container { max-width: 540px; margin: 0 auto; background-color: #11161B; border: 1px solid rgba(0, 214, 214, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); }
    .header { background: linear-gradient(135deg, #0A0E12 0%, #161F26 100%); padding: 28px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center; }
    .brand-title { font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; margin: 0; }
    .brand-sub { font-size: 11px; color: #00D6D6; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top: 4px; }
    .content { padding: 32px; }
    .greeting { font-size: 17px; font-weight: 700; color: #F8FAFC; margin-bottom: 12px; }
    .message { font-size: 13px; line-height: 1.6; color: #94A3B8; margin-bottom: 24px; }
    .card { background: rgba(0, 214, 214, 0.05); border: 1px solid rgba(0, 214, 214, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .btn { display: block; width: fit-content; margin: 0 auto; background: linear-gradient(135deg, #00D6D6 0%, #00A3A3 100%); color: #000000 !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; text-align: center; letter-spacing: 0.3px; }
    .footer { background: #0D1115; padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748B; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">⚔️ TechGration Arena Duel</h1>
        <div class="brand-sub">Real-Time DSA Battle League</div>
      </div>
      <div class="content">
        <div class="greeting">Hey ${recipientName},</div>
        <p class="message">
          <strong>${challengerName}</strong> has just thrown down an <strong>Open 1v1 Challenge</strong> on the TechGration Arena Lobby! First batchmate to accept enters the live race.
        </p>

        <div class="card">
          <div style="margin-bottom: 8px;">
            <span class="badge" style="background: rgba(255,255,255,0.1); color: #FFF; margin-right: 6px;">${topic}</span>
            <span class="badge" style="background: ${diffColor}22; color: ${diffColor}; border: 1px solid ${diffColor}44;">${difficulty}</span>
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #FFF; margin-top: 6px;">
            Challenger: <span style="color: #00D6D6;">${challengerName}</span>
          </div>
          ${
            stakeXp > 0
              ? `<div style="font-size: 12px; color: #F59E0B; margin-top: 4px; font-weight: 600;">⚡ Bounty: +${stakeXp * 2} XP Pot (Winner Takes All)</div>`
              : ""
          }
        </div>

        <a href="${duelUrl}" class="btn">Accept Duel & Code Now →</a>
      </div>
      <div class="footer">
        TechGration Learning Portal • Real-Time Competitive DSA
      </div>
    </div>
  </div>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"TechGration Arena" <${SMTP_USER}>`,
      to: recipientEmail,
      subject: `⚔️ Challenge from ${challengerName} in ${topic} (${difficulty})!`,
      html,
    })
    return true
  } catch (error) {
    console.error("Failed to send open challenge email to", recipientEmail, error)
    return false
  }
}

/**
 * Sends a viral re-engagement email when a student's past run is defeated in Ghost Mode.
 */
export async function sendGhostDefeatedEmail({
  recipientEmail,
  recipientName,
  defeaterName,
  problemTitle,
  defeaterTime,
  originalTime,
  duelCode,
}: {
  recipientEmail: string
  recipientName: string
  defeaterName: string
  problemTitle: string
  defeaterTime: string
  originalTime: string
  duelCode: string
}): Promise<boolean> {
  const rematchUrl = `${APP_URL}/student/arena/duels/room/${duelCode}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>🚨 Speed Record Broken!</title>
  <style>
    body { margin: 0; padding: 0; background-color: #080B0E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #080B0E; padding: 32px 0; }
    .container { max-width: 540px; margin: 0 auto; background-color: #11161B; border: 1px solid rgba(244, 63, 94, 0.4); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); }
    .header { background: linear-gradient(135deg, #1C0F14 0%, #161F26 100%); padding: 28px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); text-align: center; }
    .brand-title { font-size: 20px; font-weight: 800; color: #F43F5E; letter-spacing: -0.5px; margin: 0; }
    .brand-sub { font-size: 11px; color: #E2E8F0; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top: 4px; }
    .content { padding: 32px; }
    .greeting { font-size: 17px; font-weight: 700; color: #F8FAFC; margin-bottom: 12px; }
    .message { font-size: 13px; line-height: 1.6; color: #94A3B8; margin-bottom: 24px; }
    .card { background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left; }
    .btn { display: block; width: fit-content; margin: 0 auto; background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%); color: #FFFFFF !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; text-align: center; letter-spacing: 0.3px; }
    .footer { background: #0D1115; padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748B; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">🚨 Speed Record Broken!</h1>
        <div class="brand-sub">Ghost Battle Alert</div>
      </div>
      <div class="content">
        <div class="greeting">Hey ${recipientName},</div>
        <p class="message">
          Your previous speed record on <strong>"${problemTitle}"</strong> was just defeated in a Ghost Duel by <strong>${defeaterName}</strong>!
        </p>

        <div class="card">
          <div style="font-size: 13px; color: #CBD5E1; margin-bottom: 8px;">
            <strong>Your Record:</strong> ${originalTime}
          </div>
          <div style="font-size: 14px; color: #F43F5E; font-weight: 800;">
            <strong>${defeaterName}'s Time:</strong> ${defeaterTime} (Winner)
          </div>
        </div>

        <p class="message">
          Can you optimize your solution and reclaim your #1 crown? Click below to launch a re-challenge!
        </p>

        <a href="${rematchUrl}" class="btn">Re-Challenge ${defeaterName} Now →</a>
      </div>
      <div class="footer">
        TechGration Learning Portal • Ghost Racing Engine
      </div>
    </div>
  </div>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"TechGration Arena" <${SMTP_USER}>`,
      to: recipientEmail,
      subject: `🚨 ${defeaterName} just defeated your record on "${problemTitle}"!`,
      html,
    })
    return true
  } catch (error) {
    console.error("Failed to send ghost defeated email to", recipientEmail, error)
    return false
  }
}
