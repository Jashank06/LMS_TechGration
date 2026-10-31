import nodemailer from "nodemailer"
// @ts-ignore
import dotenv from "dotenv"

dotenv.config()

const SMTP_USER = process.env.SMTP_USER || "admin@techgration.live"
const SMTP_PASS = (process.env.SMTP_PASS || "rjrj kltp iuxp fbyp").replace(/\s+/g, "")
const DEFAULT_PASSWORD = "TechGration@2026"

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

export interface StudentInfo {
  name: string
  email: string
  password?: string
}

export const STUDENTS_LIST: StudentInfo[] = [
  { name: "Nakul Sharma", email: "nakulsharma8952@gmail.com" },
  { name: "Priyanshi Gupta", email: "priyanshigupta63760@gmail.com" },
  { name: "Rishika Raman Jha", email: "rishikaramanjha@gmail.com" },
  { name: "Sneha Kamboj", email: "snehakamboj003@gmail.com" },
  { name: "Gayatri Mohanty", email: "mohantyg724@gmail.com" },
  { name: "Tanmay Sharma", email: "tanmaysharma.ai09@gmail.com" },
  { name: "Niharika Rajput", email: "rniharika125@gmail.com" },
  { name: "Divyansh Namdev", email: "2600839@medicaps.ac.in" },
  { name: "Anas Warsi", email: "anaswarsi7476@gmail.com" },
  { name: "Nishant Singh", email: "nishantsinghrajput2612@gmail.com" },
  { name: "Priyanka Singh", email: "lilcanny877@gmail.com" },
  { name: "Yashi Jain", email: "yashijain0510@gmail.com" },
  { name: "Aayush Rawal", email: "rawal.aayush07@gmail.com" },
  { name: "Pragya Gupta", email: "guptapragya1602@gmail.com" },
  { name: "Hriturajsingh A", email: "hriturajsingh9a30@gmail.com" },
  { name: "Raisatyam", email: "raisatyam547@gmail.com" },
  { name: "Safalsingh", email: "safalsingh5002@gmail.com" },
  { name: "S Mujahid", email: "s04mujahid@gmail.com" },
]

export function generateEmailContent(student: StudentInfo) {
  const pwd = student.password || DEFAULT_PASSWORD

  const text = `Dear ${student.name},

Greetings from TechGration Technologies Private Limited!

We're delighted to welcome you to the Artificial Intelligence & Modern Deep Learning Systems program at TechGration! 🚀

Your enrollment is active, and your Learning Management System (LMS) account is now ready to use. You can log in to our campus portal and get ready for an exciting learning journey into Artificial Intelligence and Deep Learning.

🎓 Your Course Details
Course Name: Artificial Intelligence & Modern Deep Learning Systems
Batch Start Date: 23rd October 2026
Enrollment Status: Active

🔐 Your LMS Login Credentials
LMS Portal: https://campus.techgration.live/
Login Email: ${student.email}
Temporary Password: ${pwd}

📝 How to Access Your LMS
1. Visit https://campus.techgration.live/
2. Enter your registered email address and password provided above.
3. Log in to your student dashboard.
4. Explore your LMS and stay connected for course updates, learning resources, and upcoming classes.

For your account's security, please change your temporary password after logging in, if the portal allows it. Kindly keep your credentials confidential and do not share them with anyone.

🌟 Your Learning Journey Starts Here!
At TechGration, our goal is to help you build practical skills, strengthen your technical foundation, and prepare for the evolving world of AI-driven technologies.

Your first step is to log in to the LMS and familiarize yourself with the platform before your batch begins on 23rd October 2026.

We look forward to learning, building, and growing together with you!

If you face any login issues or need assistance accessing your account, simply reply to this email, and our team will be happy to help.

Welcome aboard, and all the best for your AI learning journey!

Warm regards,
Team TechGration
TechGration Technologies Private Limited
🌐 Website: https://techgration.live/
🎓 Student LMS: https://campus.techgration.live/
✉️ Email: admin@techgration.live`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TechGration LMS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1D1D1F; line-height: 1.6;">
  <table width="100%" bgcolor="#F5F5F7" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Apple-Style White Container Card -->
        <table width="100%" bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E5E5EA; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05); overflow: hidden; text-align: left;">
          
          <!-- Apple Clean Top Header -->
          <tr>
            <td align="center" style="padding: 38px 36px 26px; border-bottom: 1px solid #F0F0F2; background-color: #FFFFFF;">
              <div style="font-size: 26px; font-weight: 800; color: #1D1D1F; letter-spacing: -0.6px; margin: 0;">
                Tech<span style="color: #0071E3;">Gration</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #86868B; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                ENTERPRISE LEARNING MANAGEMENT SYSTEM
              </div>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="padding: 36px 36px 40px;">
              <h2 style="font-size: 22px; font-weight: 700; color: #1D1D1F; margin: 0 0 16px; letter-spacing: -0.4px;">
                Dear ${student.name},
              </h2>

              <p style="font-size: 15px; color: #3A3A3C; margin: 0 0 14px; line-height: 1.65;">
                Greetings from <strong>TechGration Technologies Private Limited</strong>!
              </p>

              <p style="font-size: 15px; color: #3A3A3C; margin: 0 0 26px; line-height: 1.65;">
                We're delighted to welcome you to the <strong>Artificial Intelligence & Modern Deep Learning Systems</strong> program at TechGration! 🚀
              </p>

              <p style="font-size: 14.5px; color: #515154; margin: 0 0 28px; line-height: 1.65;">
                Your enrollment is active, and your Learning Management System (LMS) account is now ready to use. You can log in to our campus portal and get ready for an exciting learning journey into Artificial Intelligence and Deep Learning.
              </p>

              <!-- Course Details Card (Apple Sub-card) -->
              <table width="100%" bgcolor="#FBFBFD" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #E5E5EA; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px 12px; border-bottom: 1px solid #EFEFEF;">
                    <span style="font-size: 13.5px; font-weight: 700; color: #1D1D1F;">🎓 Your Course Details</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 13px; color: #86868B; padding: 6px 0; width: 42%;">Course Name:</td>
                        <td style="font-size: 13.5px; font-weight: 600; color: #1D1D1F; padding: 6px 0; text-align: right;">Artificial Intelligence &amp; Modern Deep Learning Systems</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #86868B; padding: 6px 0;">Batch Start Date:</td>
                        <td style="font-size: 13.5px; font-weight: 700; color: #0071E3; padding: 6px 0; text-align: right;">23rd October 2026</td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #86868B; padding: 6px 0;">Enrollment Status:</td>
                        <td style="font-size: 13px; font-weight: 700; padding: 6px 0; text-align: right;">
                          <span style="background-color: #E8F5E9; color: #1B5E20; padding: 3px 12px; border-radius: 980px; font-size: 12px; font-weight: 700; display: inline-block;">Active</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Login Credentials Card (Apple Blue Highlight) -->
              <table width="100%" bgcolor="#F0F7FF" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #BAE0FD; border-radius: 14px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px 12px; border-bottom: 1px solid #D5E8FD;">
                    <span style="font-size: 13.5px; font-weight: 700; color: #0071E3;">🔐 Your LMS Login Credentials</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 13px; color: #64748B; padding: 6px 0; width: 38%;">LMS Portal:</td>
                        <td style="font-size: 13.5px; font-weight: 600; padding: 6px 0; text-align: right;">
                          <a href="https://campus.techgration.live/" style="color: #0071E3; text-decoration: none; font-weight: 600;">https://campus.techgration.live/</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748B; padding: 6px 0;">Login Email:</td>
                        <td style="font-size: 13.5px; font-weight: 700; color: #1D1D1F; padding: 6px 0; text-align: right;">
                          ${student.email}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 13px; color: #64748B; padding: 6px 0;">Temporary Password:</td>
                        <td style="padding: 6px 0; text-align: right;">
                          <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; font-weight: 800; color: #0071E3; background: #FFFFFF; border: 1px solid #BAE0FD; padding: 4px 12px; border-radius: 8px; display: inline-block; letter-spacing: 0.5px;">${pwd}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Apple Pill CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="https://campus.techgration.live/" style="display: inline-block; background-color: #0071E3; color: #FFFFFF !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 980px; box-shadow: 0 4px 14px rgba(0, 113, 227, 0.35); text-align: center;">
                      🚀 Log In to Student LMS
                    </a>
                  </td>
                </tr>
              </table>

              <!-- How to Access Your LMS -->
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #1D1D1F; margin: 0 0 12px;">
                  📝 How to Access Your LMS
                </h3>
                <ol style="margin: 0; padding-left: 22px; color: #3A3A3C; font-size: 14px; line-height: 1.7;">
                  <li style="margin-bottom: 6px;">Visit <a href="https://campus.techgration.live/" style="color: #0071E3; text-decoration: none; font-weight: 600;">https://campus.techgration.live/</a></li>
                  <li style="margin-bottom: 6px;">Enter your registered email address and password provided above.</li>
                  <li style="margin-bottom: 6px;">Log in to your student dashboard.</li>
                  <li>Explore your LMS and stay connected for course updates, learning resources, and upcoming classes.</li>
                </ol>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 16px; margin-bottom: 28px; font-size: 13px; color: #92400E; line-height: 1.55;">
                🔒 <strong>Security Notice:</strong> For your account's security, please change your temporary password after logging in, if the portal allows it. Kindly keep your credentials confidential and do not share them with anyone.
              </div>

              <!-- Your Learning Journey Starts Here -->
              <div style="margin-bottom: 28px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #1D1D1F; margin: 0 0 10px;">
                  🌟 Your Learning Journey Starts Here!
                </h3>
                <p style="font-size: 14px; color: #3A3A3C; margin: 0 0 10px; line-height: 1.65;">
                  At TechGration, our goal is to help you build practical skills, strengthen your technical foundation, and prepare for the evolving world of AI-driven technologies.
                </p>
                <p style="font-size: 14px; color: #3A3A3C; margin: 0 0 10px; line-height: 1.65;">
                  Your first step is to log in to the LMS and familiarize yourself with the platform before your batch begins on <strong>23rd October 2026</strong>.
                </p>
                <p style="font-size: 14px; color: #3A3A3C; margin: 0; line-height: 1.65;">
                  We look forward to learning, building, and growing together with you! If you face any login issues or need assistance accessing your account, simply reply to this email, and our team will be happy to help.
                </p>
              </div>

              <p style="font-size: 14.5px; font-weight: 700; color: #1D1D1F; margin: 0 0 20px;">
                Welcome aboard, and all the best for your AI learning journey! 🚀
              </p>

              <p style="font-size: 13.5px; color: #86868B; margin: 0; line-height: 1.6;">
                Warm regards,<br/>
                <strong style="color: #1D1D1F;">Team TechGration</strong><br/>
                TechGration Technologies Private Limited
              </p>
            </td>
          </tr>

          <!-- Apple Minimalist Footer -->
          <tr>
            <td align="center" style="background-color: #FBFBFD; padding: 24px 36px; border-top: 1px solid #F0F0F2; font-size: 12px; color: #86868B;">
              <p style="margin: 0 0 6px;">
                🌐 Website: <a href="https://techgration.live/" style="color: #0071E3; text-decoration: none;">https://techgration.live/</a> &nbsp;|&nbsp; 
                🎓 Student LMS: <a href="https://campus.techgration.live/" style="color: #0071E3; text-decoration: none;">https://campus.techgration.live/</a>
              </p>
              <p style="margin: 0 0 10px;">
                ✉️ Email: <a href="mailto:admin@techgration.live" style="color: #0071E3; text-decoration: none;">admin@techgration.live</a>
              </p>
              <p style="margin: 0; color: #A1A1A6; font-size: 11px;">
                &copy; 2026 TechGration Technologies Private Limited. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { text, html }
}

export async function sendSampleEmailToUser(targetEmail = "jaykumar0305@gmail.com") {
  const sampleStudent: StudentInfo = {
    name: "Nakul Sharma",
    email: "nakulsharma8952@gmail.com",
    password: DEFAULT_PASSWORD,
  }

  const { text, html } = generateEmailContent(sampleStudent)

  console.log(`Sending sample preview email to ${targetEmail}...`)

  const info = await transporter.sendMail({
    from: `"TechGration Technologies" <${SMTP_USER}>`,
    to: targetEmail,
    subject: `Welcome to Artificial Intelligence & Modern Deep Learning Systems — TechGration LMS`,
    text,
    html,
  })

  console.log("Sample email successfully sent! Message ID:", info.messageId)
  return info
}

export async function sendToAllStudents(delayMs = 10000) {
  console.log(`Starting bulk dispatch to ${STUDENTS_LIST.length} students with ${delayMs / 1000}s gap between emails...`)

  let successCount = 0
  let failureCount = 0

  for (let i = 0; i < STUDENTS_LIST.length; i++) {
    const student = STUDENTS_LIST[i]
    console.log(`\n[${i + 1}/${STUDENTS_LIST.length}] Sending to ${student.name} <${student.email}>...`)

    try {
      const { text, html } = generateEmailContent(student)
      const info = await transporter.sendMail({
        from: `"TechGration Technologies" <${SMTP_USER}>`,
        to: student.email,
        subject: `Welcome to Artificial Intelligence & Modern Deep Learning Systems — TechGration LMS`,
        text,
        html,
      })

      console.log(`  ✓ Successfully sent to ${student.name}! (MsgID: ${info.messageId})`)
      successCount++
    } catch (err) {
      console.error(`  ✗ Failed to send to ${student.name} (${student.email}):`, err)
      failureCount++
    }

    if (i < STUDENTS_LIST.length - 1) {
      console.log(`  ⏳ Waiting ${delayMs / 1000} seconds before sending next email...`)
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  console.log(`\n===========================================`)
  console.log(`Batch Dispatch Complete: ${successCount} sent, ${failureCount} failed.`)
  console.log(`===========================================\n`)
}

// When run directly from CLI
if (process.argv[2] === "--test") {
  sendSampleEmailToUser(process.argv[3] || "jaykumar0305@gmail.com")
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to send sample email:", err)
      process.exit(1)
    })
} else if (process.argv[2] === "--send-all") {
  sendToAllStudents(10000)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Batch dispatch error:", err)
      process.exit(1)
    })
}

