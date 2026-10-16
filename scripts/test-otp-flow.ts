import { db } from "../src/server/db"
import { verifySmtpConnection } from "../src/server/email/mailer"
import bcrypt from "bcryptjs"

const BASE_URL = "http://localhost:3000"

async function runOtpTests() {
  console.log("=================================================================")
  console.log("🚀 TESTING LIVE EMAIL OTP AUTHENTICATION & PASSWORD RESET FLOW")
  console.log("Database: MongoDB Atlas | SMTP: Gmail (welcome@jashank.me)")
  console.log("=================================================================\n")

  const testEmail = `qa.otp.${Date.now()}@techgration.com`
  const testPassword = "OriginalPass@2026!"
  const newPassword = "UpdatedSecret@2026!"
  let createdUserId = ""

  try {
    // -------------------------------------------------------------
    // TEST 1: Gmail SMTP Connection
    // -------------------------------------------------------------
    console.log("▶ 1. Verifying Gmail SMTP Connection...")
    const smtpOk = await verifySmtpConnection()
    if (!smtpOk) {
      throw new Error("SMTP connection failed. Check credentials.")
    }
    console.log("  ✅ [PASS] Gmail SMTP Connection verified (welcome@jashank.me)")

    // -------------------------------------------------------------
    // TEST 2: Registration - Send OTP
    // -------------------------------------------------------------
    console.log(`\n▶ 2. Requesting Registration OTP for: ${testEmail}...`)
    const sendOtpRes = await fetch(`${BASE_URL}/api/auth/register/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Automated Learner",
        email: testEmail,
        password: testPassword,
      }),
    })

    const sendOtpData = await sendOtpRes.json()
    if (!sendOtpRes.ok || !sendOtpData.success) {
      throw new Error(`Failed to send registration OTP: ${JSON.stringify(sendOtpData)}`)
    }
    console.log("  ✅ [PASS] POST /api/auth/register/send-otp succeeded:", sendOtpData.message)

    // Retrieve generated OTP from MongoDB Atlas
    const otpRecord = await db.otpVerification.findFirst({
      where: {
        email: testEmail,
        purpose: "REGISTRATION",
        isUsed: false,
      },
      orderBy: { createdAt: "desc" },
    })

    if (!otpRecord) {
      throw new Error("OTP record not found in MongoDB Atlas!")
    }
    console.log(`  ✅ [PASS] MongoDB Atlas OtpVerification record found (OTP: ${otpRecord.otpCode})`)

    // -------------------------------------------------------------
    // TEST 3: Registration - Verify Wrong OTP (Negative Test)
    // -------------------------------------------------------------
    console.log("\n▶ 3. Testing Incorrect OTP Rejection...")
    const badVerifyRes = await fetch(`${BASE_URL}/api/auth/register/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otpCode: "000000",
      }),
    })
    const badVerifyData = await badVerifyRes.json()
    if (badVerifyRes.status !== 400) {
      throw new Error(`Expected 400 for bad OTP, got ${badVerifyRes.status}`)
    }
    console.log("  ✅ [PASS] Incorrect OTP successfully blocked with 400 error:", badVerifyData.error)

    // -------------------------------------------------------------
    // TEST 4: Registration - Verify Correct OTP (Positive Test)
    // -------------------------------------------------------------
    console.log("\n▶ 4. Verifying Account with Correct OTP...")
    const goodVerifyRes = await fetch(`${BASE_URL}/api/auth/register/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otpCode: otpRecord.otpCode,
      }),
    })
    const goodVerifyData = await goodVerifyRes.json()
    if (!goodVerifyRes.ok || !goodVerifyData.success) {
      throw new Error(`Failed to verify correct OTP: ${JSON.stringify(goodVerifyData)}`)
    }

    createdUserId = goodVerifyData.user?.id
    console.log("  ✅ [PASS] User account created in MongoDB Atlas! ID:", createdUserId)

    // Verify session cookie was issued
    const setCookie = goodVerifyRes.headers.get("set-cookie") || ""
    const hasSessionCookie = setCookie.includes("tg_session=")
    if (!hasSessionCookie) {
      throw new Error("Expected tg_session cookie in response!")
    }
    console.log("  ✅ [PASS] Authenticated tg_session cookie issued!")

    // Check user in database
    const dbUser = await db.user.findUnique({
      where: { email: testEmail },
      include: { profile: true },
    })
    if (!dbUser) {
      throw new Error("Created user not found in db.user!")
    }
    console.log(`  ✅ [PASS] Database User record verified: ${dbUser.name} (${dbUser.role})`)

    // -------------------------------------------------------------
    // TEST 5: Password Reset - Send Reset OTP
    // -------------------------------------------------------------
    console.log("\n▶ 5. Requesting Password Reset OTP...")
    const resetSendRes = await fetch(`${BASE_URL}/api/auth/reset-password/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    })
    const resetSendData = await resetSendRes.json()
    if (!resetSendRes.ok || !resetSendData.success) {
      throw new Error(`Failed to send reset OTP: ${JSON.stringify(resetSendData)}`)
    }
    console.log("  ✅ [PASS] POST /api/auth/reset-password/send-otp succeeded:", resetSendData.message)

    // Retrieve reset OTP from MongoDB
    const resetOtpRecord = await db.otpVerification.findFirst({
      where: {
        email: testEmail,
        purpose: "PASSWORD_RESET",
        isUsed: false,
      },
      orderBy: { createdAt: "desc" },
    })
    if (!resetOtpRecord) {
      throw new Error("Password reset OTP record not found in MongoDB!")
    }
    console.log(`  ✅ [PASS] Password Reset OTP record found (OTP: ${resetOtpRecord.otpCode})`)

    // -------------------------------------------------------------
    // TEST 6: Password Reset - Complete with New Password
    // -------------------------------------------------------------
    console.log("\n▶ 6. Completing Password Reset with New Password...")
    const resetCompleteRes = await fetch(`${BASE_URL}/api/auth/reset-password/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otpCode: resetOtpRecord.otpCode,
        newPassword: newPassword,
      }),
    })
    const resetCompleteData = await resetCompleteRes.json()
    if (!resetCompleteRes.ok || !resetCompleteData.success) {
      throw new Error(`Failed to complete password reset: ${JSON.stringify(resetCompleteData)}`)
    }
    console.log("  ✅ [PASS] Password reset successfully in MongoDB Atlas!")

    // Verify password hash changed and matches new password
    const updatedUser = await db.user.findUnique({
      where: { email: testEmail },
    })
    const isNewPassValid = await bcrypt.compare(newPassword, updatedUser!.passwordHash)
    const isOldPassValid = await bcrypt.compare(testPassword, updatedUser!.passwordHash)
    if (!isNewPassValid || isOldPassValid) {
      throw new Error("Password hash verification failed!")
    }
    console.log("  ✅ [PASS] Bcrypt password verification confirmed: Old password rejected, New password accepted!")

    // -------------------------------------------------------------
    // TEST 7: Frontend Route Availability
    // -------------------------------------------------------------
    console.log("\n▶ 7. Testing Frontend Auth Routes Rendering...")
    const routes = ["/register", "/forgot-password", "/login", "/admin/login"]
    for (const r of routes) {
      const res = await fetch(`${BASE_URL}${r}`)
      if (res.status !== 200) {
        throw new Error(`Route ${r} returned status ${res.status}`)
      }
      console.log(`  ✅ [PASS] ${r} rendered with HTTP 200 OK`)
    }

    console.log("\n=================================================================")
    console.log("🎉 ALL EMAIL OTP REGISTRATION & PASSWORD RESET TESTS PASSED 100%!")
    console.log("=================================================================")
  } catch (err: any) {
    console.error("\n❌ Test Failed:", err.message)
    process.exit(1)
  } finally {
    // Cleanup temporary test data from MongoDB Atlas
    console.log("\n▶ Cleaning up temporary test data from MongoDB Atlas...")
    try {
      await db.otpVerification.deleteMany({ where: { email: testEmail } })
      if (createdUserId) {
        await db.enrollment.deleteMany({ where: { userId: createdUserId } })
        await db.userProfile.deleteMany({ where: { userId: createdUserId } })
        await db.user.deleteMany({ where: { id: createdUserId } })
      }
      console.log("  🧹 Test data cleaned up successfully.")
    } catch (e) {
      // Ignore
    }
  }
}

runOtpTests()
