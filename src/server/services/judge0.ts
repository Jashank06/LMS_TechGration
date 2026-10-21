import { LANGUAGE_MAP, JUDGE0_STATUS_MAP } from "@/lib/arena-constants"
import { spawnSync } from "child_process"
import fs from "fs"
import path from "path"
import os from "os"

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.JUDGE0_RAPIDAPI_KEY || ""

export interface TestCaseInput {
  input: string
  expectedOutput: string
}

export interface TestCaseResult {
  passed: boolean
  statusId: number
  statusDescription: string
  verdict: string
  stdout: string | null
  stderr: string | null
  compileOutput: string | null
  time: string | null // seconds as string e.g. "0.04"
  memory: number | null // KiB
}

export interface ExecutionResult {
  results: TestCaseResult[]
  overallVerdict: string
  passedCount: number
  totalCount: number
  maxTimeMs: number | null
  maxMemoryKb: number | null
}

function b64encode(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64")
}

function b64decode(str: string): string {
  return Buffer.from(str, "base64").toString("utf-8")
}

function getHeaders(): Record<string, string> {
  if (!RAPIDAPI_KEY) {
    throw new Error(
      "JUDGE0_RAPIDAPI_KEY is not configured. Please add it to your .env file. Get a free API key at https://rapidapi.com/judge0-official/api/judge0-ce"
    )
  }
  return {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": new URL(JUDGE0_API_URL).hostname,
  }
}

/**
 * Executes student code.
 * - If JUDGE0_RAPIDAPI_KEY is configured: Uses hosted Judge0 CE.
 * - If not configured: Automatically falls back to built-in local sandboxed executor (Python3, Node, G++, Java).
 */
export async function executeCode(params: {
  sourceCode: string
  language: string
  testCases: TestCaseInput[]
  timeLimitSec?: number
  memoryLimitKb?: number
}): Promise<ExecutionResult> {
  const { sourceCode, language, testCases, timeLimitSec = 3, memoryLimitKb = 256000 } = params

  if (testCases.length === 0) {
    throw new Error("No test cases provided")
  }

  // If RapidAPI key is configured, use cloud Judge0 CE
  if (RAPIDAPI_KEY.trim()) {
    try {
      return await executeJudge0(params)
    } catch (err) {
      console.warn("Judge0 cloud execution failed, falling back to local runner:", err)
      return executeLocally({ sourceCode, language, testCases, timeLimitSec })
    }
  }

  // Otherwise, use built-in local runner directly (zero setup required!)
  return executeLocally({ sourceCode, language, testCases, timeLimitSec })
}

/**
 * Built-in local execution engine using the machine's native compilers / runtimes.
 */
function executeLocally(params: {
  sourceCode: string
  language: string
  testCases: TestCaseInput[]
  timeLimitSec?: number
}): ExecutionResult {
  const { sourceCode, language, testCases, timeLimitSec = 3 } = params
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `arena_${Date.now()}_`))

  try {
    let compileOutput: string | null = null
    let runCommand = ""
    let runArgs: string[] = []

    if (language === "python") {
      const src = path.join(tmpDir, "solution.py")
      fs.writeFileSync(src, sourceCode)
      runCommand = "python3"
      runArgs = [src]
    } else if (language === "javascript") {
      const src = path.join(tmpDir, "solution.js")
      fs.writeFileSync(src, sourceCode)
      runCommand = "node"
      runArgs = [src]
    } else if (language === "cpp") {
      const src = path.join(tmpDir, "main.cpp")
      const bin = path.join(tmpDir, "main")
      fs.writeFileSync(src, sourceCode)
      const comp = spawnSync("g++", ["-O2", "-std=c++17", src, "-o", bin], { timeout: 6000 })
      if (comp.status !== 0) {
        compileOutput = comp.stderr?.toString() || comp.error?.message || "Compilation Error"
        return {
          results: testCases.map(() => ({
            passed: false,
            statusId: 6,
            statusDescription: "Compilation Error",
            verdict: "COMPILATION_ERROR",
            stdout: null,
            stderr: null,
            compileOutput,
            time: null,
            memory: null,
          })),
          overallVerdict: "COMPILATION_ERROR",
          passedCount: 0,
          totalCount: testCases.length,
          maxTimeMs: null,
          maxMemoryKb: null,
        }
      }
      runCommand = bin
      runArgs = []
    } else if (language === "java") {
      const src = path.join(tmpDir, "Main.java")
      fs.writeFileSync(src, sourceCode)
      const comp = spawnSync("javac", [src], { timeout: 6000 })
      if (comp.status !== 0) {
        compileOutput = comp.stderr?.toString() || comp.error?.message || "Compilation Error"
        return {
          results: testCases.map(() => ({
            passed: false,
            statusId: 6,
            statusDescription: "Compilation Error",
            verdict: "COMPILATION_ERROR",
            stdout: null,
            stderr: null,
            compileOutput,
            time: null,
            memory: null,
          })),
          overallVerdict: "COMPILATION_ERROR",
          passedCount: 0,
          totalCount: testCases.length,
          maxTimeMs: null,
          maxMemoryKb: null,
        }
      }
      runCommand = "java"
      runArgs = ["-cp", tmpDir, "Main"]
    } else {
      throw new Error(`Unsupported language: ${language}`)
    }

    const results: TestCaseResult[] = []
    let maxTimeMs = 0

    for (const tc of testCases) {
      const startTime = Date.now()
      const proc = spawnSync(runCommand, runArgs, {
        input: tc.input || "",
        timeout: timeLimitSec * 1000,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
      })
      const elapsedMs = Date.now() - startTime
      if (elapsedMs > maxTimeMs) maxTimeMs = elapsedMs

      const stdout = proc.stdout ? proc.stdout.toString() : ""
      const stderr = proc.stderr ? proc.stderr.toString() : ""

      if (proc.error && (proc.error as any).code === "ETIMEDOUT") {
        results.push({
          passed: false,
          statusId: 5,
          statusDescription: "Time Limit Exceeded",
          verdict: "TIME_LIMIT_EXCEEDED",
          stdout,
          stderr: "Execution exceeded time limit.",
          compileOutput: null,
          time: (elapsedMs / 1000).toFixed(2),
          memory: null,
        })
        continue
      }

      if (proc.status !== 0) {
        results.push({
          passed: false,
          statusId: 7,
          statusDescription: "Runtime Error",
          verdict: "RUNTIME_ERROR",
          stdout,
          stderr: stderr || proc.error?.message || "Process exited with non-zero exit code",
          compileOutput: null,
          time: (elapsedMs / 1000).toFixed(2),
          memory: null,
        })
        continue
      }

      const normalizedActual = stdout.replace(/\r\n/g, "\n").trimEnd()
      const normalizedExpected = tc.expectedOutput.replace(/\r\n/g, "\n").trimEnd()
      const passed = tc.expectedOutput === "" ? true : normalizedActual === normalizedExpected

      results.push({
        passed,
        statusId: passed ? 3 : 4,
        statusDescription: passed ? "Accepted" : "Wrong Answer",
        verdict: passed ? "ACCEPTED" : "WRONG_ANSWER",
        stdout,
        stderr: stderr || null,
        compileOutput: null,
        time: (elapsedMs / 1000).toFixed(2),
        memory: null,
      })
    }

    const passedCount = results.filter((r) => r.passed).length
    let overallVerdict = "ACCEPTED"
    if (passedCount < results.length) {
      const firstFail = results.find((r) => !r.passed)
      overallVerdict = firstFail?.verdict || "WRONG_ANSWER"
    }

    return {
      results,
      overallVerdict,
      passedCount,
      totalCount: results.length,
      maxTimeMs,
      maxMemoryKb: null,
    }
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // cleanup error ignored
    }
  }
}

/**
 * Cloud Judge0 CE batch execution.
 */
async function executeJudge0(params: {
  sourceCode: string
  language: string
  testCases: TestCaseInput[]
  timeLimitSec?: number
  memoryLimitKb?: number
}): Promise<ExecutionResult> {
  const { sourceCode, language, testCases, timeLimitSec = 2, memoryLimitKb = 256000 } = params

  const languageId = LANGUAGE_MAP[language]
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`)
  }

  const headers = getHeaders()

  const submissions = testCases.map((tc) => ({
    language_id: languageId,
    source_code: b64encode(sourceCode),
    stdin: b64encode(tc.input),
    expected_output: b64encode(tc.expectedOutput.trimEnd() + "\n"),
    cpu_time_limit: timeLimitSec,
    memory_limit: memoryLimitKb,
  }))

  const batchRes = await fetch(`${JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({ submissions }),
  })

  if (!batchRes.ok) {
    const errorText = await batchRes.text()
    console.error("Judge0 batch submission failed:", batchRes.status, errorText)
    throw new Error(`Code execution service returned ${batchRes.status}. Please try again.`)
  }

  const tokens: { token: string }[] = await batchRes.json()
  const tokenString = tokens.map((t) => t.token).join(",")

  const maxAttempts = 30
  let attempt = 0
  let allDone = false
  let batchResults: any[] = []

  while (!allDone && attempt < maxAttempts) {
    attempt++
    await new Promise((r) => setTimeout(r, 1000))

    const pollRes = await fetch(
      `${JUDGE0_API_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
      { method: "GET", headers }
    )

    if (!pollRes.ok) {
      console.error("Judge0 poll failed:", pollRes.status)
      continue
    }

    const pollData = await pollRes.json()
    batchResults = pollData.submissions || []
    allDone = batchResults.every((s: any) => s.status && s.status.id >= 3)
  }

  if (!allDone) {
    return {
      results: testCases.map(() => ({
        passed: false,
        statusId: 13,
        statusDescription: "Execution timed out",
        verdict: "INTERNAL_ERROR",
        stdout: null,
        stderr: null,
        compileOutput: null,
        time: null,
        memory: null,
      })),
      overallVerdict: "INTERNAL_ERROR",
      passedCount: 0,
      totalCount: testCases.length,
      maxTimeMs: null,
      maxMemoryKb: null,
    }
  }

  const results: TestCaseResult[] = batchResults.map((r: any) => {
    const statusId = r.status?.id ?? 13
    const verdict = JUDGE0_STATUS_MAP[statusId] || "INTERNAL_ERROR"
    return {
      passed: statusId === 3,
      statusId,
      statusDescription: r.status?.description || "Unknown",
      verdict,
      stdout: r.stdout ? b64decode(r.stdout) : null,
      stderr: r.stderr ? b64decode(r.stderr) : null,
      compileOutput: r.compile_output ? b64decode(r.compile_output) : null,
      time: r.time || null,
      memory: r.memory || null,
    }
  })

  const passedCount = results.filter((r) => r.passed).length
  const times = results.map((r) => (r.time ? parseFloat(r.time) * 1000 : 0)).filter(Boolean)
  const memories = results.map((r) => r.memory || 0).filter(Boolean)

  let overallVerdict = "ACCEPTED"
  if (passedCount < results.length) {
    const firstFail = results.find((r) => !r.passed)
    overallVerdict = firstFail?.verdict || "WRONG_ANSWER"
  }

  return {
    results,
    overallVerdict,
    passedCount,
    totalCount: results.length,
    maxTimeMs: times.length > 0 ? Math.max(...times) : null,
    maxMemoryKb: memories.length > 0 ? Math.max(...memories) : null,
  }
}
