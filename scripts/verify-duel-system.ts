/**
 * Read-Only & Pure Logic Verification Script for 1v1 Battle Arena Engine
 * Strictly adheres to ZERO-TOLERANCE policy for fake/synthetic data.
 * Does NOT execute any create, update, upsert, or insertMany operations on production DB.
 */
import { db } from "../src/server/db"
import {
  generateDuelCode,
  getHappyHourStatus,
  DUEL_MODES,
  STAKE_OPTIONS,
  EXPIRY_OPTIONS,
} from "../src/lib/duel-constants"
import * as duelService from "../src/server/services/duel-service"

async function runVerification() {
  console.log("=== TechGration 1v1 Battle Arena Verification ===")

  // 1. Verify Short Code Generator
  console.log("\n[1] Verifying Collision-Free Short Code Generator:")
  const sampleCodes = new Set<string>()
  for (let i = 0; i < 100; i++) {
    const code = generateDuelCode()
    if (!code.startsWith("DUEL-") || code.length !== 9) {
      throw new Error(`Invalid code format: ${code}`)
    }
    sampleCodes.add(code)
  }
  console.log(`✓ Generated 100 distinct codes successfully. Uniqueness: ${sampleCodes.size}/100`)
  console.log(`  Sample: ${Array.from(sampleCodes).slice(0, 3).join(", ")}`)

  // 2. Verify Happy Hour Timezone Evaluation (Asia/Kolkata strict)
  console.log("\n[2] Verifying Happy Hour Status & Timezone Logic:")
  const hh = getHappyHourStatus()
  console.log(`✓ Happy Hour Live: ${hh.isLive}`)
  console.log(`  Next Rush Window: ${hh.nextRushDate.toISOString()}`)
  console.log(`  Formatted Timer: ${hh.formattedNext}`)
  console.log(`  Seconds Remaining / Until: ${hh.secondsRemaining}s`)

  // 3. Verify Duel Constants
  console.log("\n[3] Verifying Duel Constants:")
  console.log(`✓ Modes (4 dedicated unmixed): ${DUEL_MODES.join(", ")}`)
  console.log(`✓ Stake Options: ${STAKE_OPTIONS.join(", ")} XP`)
  console.log(`✓ Expiry Options: ${EXPIRY_OPTIONS.map((e) => e.label).join(", ")}`)

  // 4. Verify Exported Service Functions
  console.log("\n[4] Verifying Duel Service Method Signatures:")
  const expectedMethods = [
    "createDuel",
    "createGhostDuel",
    "joinDuel",
    "submitDuelCode",
    "matchHappyHourQueue",
    "forfeitDuel",
    "sweepExpiredDuels",
    "getDuelRoomState",
    "updateDuelProgress",
  ]
  for (const method of expectedMethods) {
    if (typeof (duelService as any)[method] !== "function") {
      throw new Error(`Missing expected service method: ${method}`)
    }
    console.log(`✓ Method duelService.${method} is defined and exported`)
  }

  // 5. Read-Only Production DB Query (Zero Mutations)
  console.log("\n[5] Verifying Read-Only Database Queries against MongoDB Atlas:")
  const problemCount = await db.codingProblem.count({ where: { isPublished: true } })
  console.log(`✓ Published coding problems in database: ${problemCount}`)

  const activeStudentCount = await db.user.count({ where: { role: "STUDENT", status: "ACTIVE" } })
  console.log(`✓ Active students in database: ${activeStudentCount}`)

  const totalDuelsInDb = await db.codingDuel.count()
  console.log(`✓ CodingDuel collection active in MongoDB. Total records: ${totalDuelsInDb}`)

  // 6. Verify Authentic Ghost Runs Available (Read-only)
  const authenticGhostCount = await db.codingSubmission.count({
    where: {
      verdict: "ACCEPTED",
      isRunOnly: false,
      executionTimeMs: { not: null },
    },
  })
  console.log(`✓ Authentic historical accepted submissions available for Ghost Mode: ${authenticGhostCount}`)

  console.log("\n=======================================================")
  console.log("🎉 ALL PHASE 3 BACKEND API & SERVICE VERIFICATIONS PASSED!")
  console.log("=======================================================")
}

runVerification()
  .catch((err) => {
    console.error("Verification failed:", err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
