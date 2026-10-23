import nodemailer from "nodemailer"

const SMTP_USER = process.env.OTP_GMAIL_USER || process.env.SMTP_USER || "welcome@jashank.me"
// Remove any accidental extra spaces from the password if passed raw or with spaces
const SMTP_PASS = (process.env.OTP_GMAIL_PASSWORD || process.env.SMTP_PASS || "qvrf ycyv kljs nnxd").replace(/\s+/g, "")

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
})

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error("Gmail SMTP verification error:", error)
    return false
  }
}

/**
 * Send 6-Digit Email Verification OTP for Account Creation
 */
export async function sendRegistrationOtpEmail({
  email,
  otpCode,
  name,
}: {
  email: string
  otpCode: string
  name: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your TechGration LMS Account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080B0E;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #080B0E;
      padding: 40px 0;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #11161B;
      border: 1px solid rgba(0, 214, 214, 0.25);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #0A0E12 0%, #161F26 100%);
      padding: 32px 36px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #00D6D6;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
      margin-top: 4px;
    }
    .content {
      padding: 36px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #F8FAFC;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin-bottom: 28px;
    }
    .otp-card {
      background: rgba(0, 214, 214, 0.06);
      border: 1px solid rgba(0, 214, 214, 0.4);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .otp-code {
      font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 12px;
      color: #00D6D6;
      margin: 8px 0;
      text-shadow: 0 0 20px rgba(0, 214, 214, 0.4);
    }
    .otp-expiry {
      font-size: 12px;
      color: #64748B;
      margin-top: 6px;
    }
    .security-note {
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid #00D6D6;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .footer {
      background: #0D1115;
      padding: 24px 36px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">TechGration LMS</h1>
        <div class="brand-sub">Enterprise Learning Cloud</div>
      </div>
      <div class="content">
        <div class="greeting">Welcome, ${name}!</div>
        <p class="message">
          Thank you for starting your registration on TechGration LMS. To verify your email address and activate your learner portal account, please enter the one-time verification code below:
        </p>
        
        <div class="otp-card">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94A3B8; font-weight: 600;">Account Verification Code</div>
          <div class="otp-code">${otpCode}</div>
          <div class="otp-expiry">Valid for 10 minutes • Single-use only</div>
        </div>

        <div class="security-note">
          <strong>Security Protection:</strong> If you did not initiate this account creation request, you can safely ignore this email. No account will be created without this verification code.
        </div>
      </div>
      <div class="footer">
        TechGration Technologies © 2026 • 256-Bit TLS Secured Platform<br>
        Need assistance? Contact <a href="mailto:support@techgration.com" style="color: #00D6D6; text-decoration: none;">support@techgration.com</a>
      </div>
    </div>
  </div>
</body>
</html>
`

  try {
    const info = await transporter.sendMail({
      from: `"TechGration LMS" <${SMTP_USER}>`,
      to: email,
      subject: `[${otpCode}] Verify Your TechGration LMS Account`,
      text: `Welcome to TechGration LMS, ${name}!\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("Failed to send registration OTP email:", error)
    return { success: false, error: error.message || "Failed to deliver OTP email" }
  }
}

/**
 * Send 6-Digit Password Reset OTP
 */
export async function sendPasswordResetOtpEmail({
  email,
  otpCode,
}: {
  email: string
  otpCode: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your TechGration LMS Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080B0E;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #080B0E;
      padding: 40px 0;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background-color: #11161B;
      border: 1px solid rgba(251, 146, 60, 0.3);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #0A0E12 0%, #1A1713 100%);
      padding: 32px 36px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 11px;
      color: #FB923C;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
      margin-top: 4px;
    }
    .content {
      padding: 36px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #F8FAFC;
      margin-bottom: 12px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin-bottom: 28px;
    }
    .otp-card {
      background: rgba(251, 146, 60, 0.08);
      border: 1px solid rgba(251, 146, 60, 0.4);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .otp-code {
      font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 12px;
      color: #FB923C;
      margin: 8px 0;
      text-shadow: 0 0 20px rgba(251, 146, 60, 0.4);
    }
    .otp-expiry {
      font-size: 12px;
      color: #64748B;
      margin-top: 6px;
    }
    .security-note {
      background: rgba(239, 68, 68, 0.08);
      border-left: 3px solid #EF4444;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 12px;
      color: #FCA5A5;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .footer {
      background: #0D1115;
      padding: 24px 36px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="brand-title">TechGration LMS</h1>
        <div class="brand-sub">Security Access Control</div>
      </div>
      <div class="content">
        <div class="greeting">Password Reset Request</div>
        <p class="message">
          We received a request to reset your password for TechGration LMS. To confirm your identity and proceed with resetting your password, use the verification code below:
        </p>
        
        <div class="otp-card">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #FB923C; font-weight: 600;">Password Reset Code</div>
          <div class="otp-code">${otpCode}</div>
          <div class="otp-expiry">Expires in 10 minutes • Valid for one attempt</div>
        </div>

        <div class="security-note">
          <strong>Important Security Warning:</strong> Never share this code with anyone. TechGration staff will never ask for your verification code. If you did not request this password reset, please change your email password immediately and contact support.
        </div>
      </div>
      <div class="footer">
        TechGration Technologies © 2026 • 256-Bit TLS Secured Platform<br>
        Need assistance? Contact <a href="mailto:support@techgration.com" style="color: #FB923C; text-decoration: none;">support@techgration.com</a>
      </div>
    </div>
  </div>
</body>
</html>
`

  try {
    const info = await transporter.sendMail({
      from: `"TechGration LMS Security" <${SMTP_USER}>`,
      to: email,
      subject: `[${otpCode}] TechGration LMS Password Reset Code`,
      text: `TechGration LMS Password Reset Request\n\nYour 6-digit password reset code is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please disregard.`,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("Failed to send password reset OTP email:", error)
    return { success: false, error: error.message || "Failed to deliver reset email" }
  }
}

/* ------------------------------------------------------------------ *
 * Generic mail helpers (used by invites, mapping & live-class mails)
 * ------------------------------------------------------------------ */

export interface MailAttachment {
  filename: string
  content: string
  contentType: string
}

export interface SendMailInput {
  to: string
  subject: string
  html: string
  text: string
  template: string
  liveClassId?: string
  fromName?: string
  attachments?: MailAttachment[]
}

/**
 * Sends one email, retries twice on failure and always writes an EmailLog row.
 * Set EMAIL_DRY_RUN=true to skip real delivery (used by automated tests).
 */
export async function sendMail(input: SendMailInput): Promise<{ success: boolean; error?: string }> {
  // Imported lazily so that scripts importing only the OTP helpers don't need Prisma.
  const { db } = await import("@/server/db")
  const dryRun = process.env.EMAIL_DRY_RUN === "true"
  let lastError: string | undefined

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (!dryRun) {
        await transporter.sendMail({
          from: `"${input.fromName || "TechGration LMS"}" <${SMTP_USER}>`,
          to: input.to,
          subject: input.subject,
          text: input.text,
          html: input.html,
          attachments: input.attachments,
        })
      }
      await db.emailLog
        .create({
          data: {
            toEmail: input.to,
            subject: input.subject,
            template: input.template,
            liveClassId: input.liveClassId,
            status: dryRun ? "DRY_RUN" : "SENT",
          },
        })
        .catch(() => {})
      return { success: true }
    } catch (error: any) {
      lastError = error?.message || "Unknown mail error"
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }
  }

  await db.emailLog
    .create({
      data: {
        toEmail: input.to,
        subject: input.subject,
        template: input.template,
        liveClassId: input.liveClassId,
        status: "FAILED",
        error: lastError,
      },
    })
    .catch(() => {})
  return { success: false, error: lastError }
}

/**
 * Throttled batch sender: runs `concurrency` mails in parallel (Gmail friendly).
 */
export async function sendMailBatch(
  inputs: SendMailInput[],
  concurrency = 5
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  let cursor = 0

  async function worker() {
    while (cursor < inputs.length) {
      const current = inputs[cursor++]
      const res = await sendMail(current)
      if (res.success) sent++
      else failed++
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, worker))
  return { sent, failed }
}
