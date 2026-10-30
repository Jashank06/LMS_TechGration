import { LANGUAGE_MAP, JUDGE0_STATUS_MAP } from "@/lib/arena-constants"
import { spawn } from "child_process"
import fs from "fs"
import path from "path"
import os from "os"

const DEFAULT_PUBLIC_JUDGE0 = "https://ce.judge0.com"

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

/**
 * Resolves Judge0 API endpoint and headers.
 * - If JUDGE0_RAPIDAPI_KEY is configured and host is RapidAPI: passes RapidAPI headers.
 * - If not configured or empty: seamlessly defaults to the official free public Judge0 CE (https://ce.judge0.com).
 * - If self-hosted (e.g. http://localhost:2358): uses self-hosted URL.
 */
export function getJudge0Config(): { apiUrl: string; headers: Record<string, string> } {
  let apiUrl = (process.env.JUDGE0_API_URL || "").trim()
  const rapidApiKey = (process.env.JUDGE0_RAPIDAPI_KEY || "").trim()

  // If apiUrl is empty, or if it points to RapidAPI without a key:
  // automatically fallback to the official public Judge0 CE server
  if (!apiUrl || (apiUrl.includes("rapidapi.com") && !rapidApiKey)) {
    apiUrl = DEFAULT_PUBLIC_JUDGE0
  }

  // Remove trailing slashes
  apiUrl = apiUrl.replace(/\/+$/, "")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (apiUrl.includes("rapidapi.com") && rapidApiKey) {
    try {
      headers["X-RapidAPI-Key"] = rapidApiKey
      headers["X-RapidAPI-Host"] = new URL(apiUrl).hostname
    } catch {
      // ignore
    }
  }

  return { apiUrl, headers }
}

/**
 * Executes student code.
 * - Tier 1: Cloud Judge0 CE (works in all environments: serverless, docker, local).
 * - Tier 2: Built-in local sandboxed executor fallback if machine has local compilers.
 */
export async function executeCode(params: {
  sourceCode: string
  language: string
  testCases: TestCaseInput[]
  timeLimitSec?: number
  memoryLimitKb?: number
}): Promise<ExecutionResult> {
  const { sourceCode, language, testCases, timeLimitSec = 3, memoryLimitKb = 256000 } = params

  if (!testCases || testCases.length === 0) {
    throw new Error("No test cases provided")
  }

  // Tier 1: Try Cloud Judge0 CE first
  try {
    return await executeJudge0(params)
  } catch (err: any) {
    console.warn("Judge0 cloud execution failed, attempting local runner fallback:", err?.message || err)

    // Tier 2: Fall back to local runner if available
    try {
      return await executeLocally({ sourceCode, language, testCases, timeLimitSec })
    } catch (localErr: any) {
      console.error("Local runner fallback also failed:", localErr?.message || localErr)
      throw err || localErr
    }
  }
}

interface AsyncProcessResult {
  stdout: string
  stderr: string
  code: number | null
  timedOut: boolean
  elapsedMs: number
}

/**
 * Asynchronously spawns a non-blocking child process with timeout protection.
 * Prevents freezing the Node.js event loop during intensive code runs.
 */
function runProcessAsync(
  command: string,
  args: string[],
  options: {
    cwd: string
    input?: string
    timeoutMs: number
    env?: NodeJS.ProcessEnv
  }
): Promise<AsyncProcessResult> {
  return new Promise((resolve) => {
    const startTime = Date.now()
    let timedOut = false
    let stdout = ""
    let stderr = ""

    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["pipe", "pipe", "pipe"],
    })

    const timer = setTimeout(() => {
      timedOut = true
      try {
        child.kill("SIGKILL")
      } catch {
        // ignore
      }
    }, options.timeoutMs)

    if (options.input !== undefined && options.input !== null) {
      try {
        child.stdin.write(options.input)
      } catch {
        // ignore
      }
    }
    try {
      child.stdin.end()
    } catch {
      // ignore
    }

    child.stdout.on("data", (data) => {
      if (stdout.length < 5 * 1024 * 1024) {
        stdout += data.toString("utf-8")
      }
    })

    child.stderr.on("data", (data) => {
      if (stderr.length < 2 * 1024 * 1024) {
        stderr += data.toString("utf-8")
      }
    })

    child.on("error", (err: any) => {
      clearTimeout(timer)
      if (err?.code === "ENOENT" || err?.message?.includes("ENOENT")) {
        stderr += `\nServer Error: Command '${command}' is not installed in the server environment.`
      } else {
        stderr += `\n${err.message}`
      }
      resolve({
        stdout,
        stderr,
        code: 1,
        timedOut: false,
        elapsedMs: Date.now() - startTime,
      })
    })

    child.on("close", (code) => {
      clearTimeout(timer)
      resolve({
        stdout,
        stderr,
        code,
        timedOut,
        elapsedMs: Date.now() - startTime,
      })
    })
  })
}

/**
 * Built-in local execution engine using the machine's native compilers / runtimes.
 * Fully asynchronous, non-blocking, and sandboxed with isolated environment variables.
 */
async function executeLocally(params: {
  sourceCode: string
  language: string
  testCases: TestCaseInput[]
  timeLimitSec?: number
}): Promise<ExecutionResult> {
  const { sourceCode, language, testCases, timeLimitSec = 3 } = params
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `arena_${Date.now()}_`))

  // SECURE ISOLATED ENVIRONMENT: Stripped of production credentials / secrets
  const safeEnv: NodeJS.ProcessEnv = {
    PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin",
    TMPDIR: tmpDir,
    HOME: tmpDir,
    LANG: "en_US.UTF-8",
    LC_ALL: "en_US.UTF-8",
    NODE_ENV: "production",
  }

  try {
    let compileOutput: string | null = null
    let runCommand = ""
    let runArgs: string[] = []

    if (language === "python") {
      const src = path.join(tmpDir, "solution.py")
      fs.writeFileSync(src, sourceCode)
      runCommand = "python3"
      runArgs = ["-u", src]
    } else if (language === "javascript") {
      const src = path.join(tmpDir, "solution.js")
      fs.writeFileSync(src, sourceCode)
      runCommand = "node"
      runArgs = ["--max-old-space-size=128", src]
    } else if (language === "cpp") {
      const src = path.join(tmpDir, "main.cpp")
      const bin = path.join(tmpDir, "main")
      fs.writeFileSync(src, sourceCode)
      const comp = await runProcessAsync("g++", ["-O2", "-std=c++17", src, "-o", bin], {
        cwd: tmpDir,
        timeoutMs: 6000,
        env: safeEnv,
      })
      if (comp.code !== 0) {
        compileOutput = comp.stderr || "Compilation Error"
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
      const comp = await runProcessAsync("javac", [src], {
        cwd: tmpDir,
        timeoutMs: 6000,
        env: safeEnv,
      })
      if (comp.code !== 0) {
        compileOutput = comp.stderr || "Compilation Error"
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
      runArgs = ["-Xmx256m", "-cp", tmpDir, "Main"]
    } else {
      throw new Error(`Unsupported language: ${language}`)
    }

    const results: TestCaseResult[] = []
    let maxTimeMs = 0

    for (const tc of testCases) {
      const proc = await runProcessAsync(runCommand, runArgs, {
        cwd: tmpDir,
        input: tc.input || "",
        timeoutMs: timeLimitSec * 1000,
        env: safeEnv,
      })

      if (proc.elapsedMs > maxTimeMs) maxTimeMs = proc.elapsedMs

      const stdout = proc.stdout
      const stderr = proc.stderr

      if (proc.timedOut) {
        results.push({
          passed: false,
          statusId: 5,
          statusDescription: "Time Limit Exceeded",
          verdict: "TIME_LIMIT_EXCEEDED",
          stdout,
          stderr: "Execution exceeded time limit.",
          compileOutput: null,
          time: (proc.elapsedMs / 1000).toFixed(2),
          memory: null,
        })
        continue
      }

      if (proc.code !== 0) {
        results.push({
          passed: false,
          statusId: 7,
          statusDescription: "Runtime Error",
          verdict: "RUNTIME_ERROR",
          stdout,
          stderr: stderr || "Process exited with non-zero exit code",
          compileOutput: null,
          time: (proc.elapsedMs / 1000).toFixed(2),
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
        time: (proc.elapsedMs / 1000).toFixed(2),
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
 * Cloud Judge0 CE execution.
 * - Single testcase: fast synchronous execution with wait=true (sub-second response).
 * - Multi testcases: batch execution with fast 600ms polling.
 */
async function executeJudge0(params: {
  sourceCode: string
  language: string
  testCases: TestCaseInput[]
  timeLimitSec?: number
  memoryLimitKb?: number
}): Promise<ExecutionResult> {
  const { sourceCode, language, testCases, timeLimitSec = 3, memoryLimitKb = 256000 } = params

  const languageId = LANGUAGE_MAP[language]
  if (!languageId) {
    throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`)
  }

  const { apiUrl, headers } = getJudge0Config()

  // Optimization: If only 1 testcase (e.g. sample test or custom input), execute synchronously with wait=true
  if (testCases.length === 1) {
    const tc = testCases[0]
    const submissionBody: any = {
      language_id: languageId,
      source_code: b64encode(sourceCode),
      stdin: b64encode(tc.input || ""),
      cpu_time_limit: timeLimitSec,
      memory_limit: memoryLimitKb,
    }
    if (tc.expectedOutput && tc.expectedOutput.trim() !== "") {
      submissionBody.expected_output = b64encode(tc.expectedOutput.trimEnd() + "\n")
    }

    const singleRes = await fetch(`${apiUrl}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify(submissionBody),
    })

    if (!singleRes.ok) {
      const errorText = await singleRes.text()
      console.error("Judge0 single submission failed:", singleRes.status, errorText)
      throw new Error(`Code execution service returned HTTP ${singleRes.status}.`)
    }

    const r = await singleRes.json()
    const statusId = r.status?.id ?? 13
    const verdict = JUDGE0_STATUS_MAP[statusId] || "INTERNAL_ERROR"
    const decodedStdout = r.stdout ? b64decode(r.stdout) : null
    const decodedStderr = r.stderr ? b64decode(r.stderr) : null
    const decodedCompile = r.compile_output ? b64decode(r.compile_output) : null

    let passed = statusId === 3
    if (tc.expectedOutput && tc.expectedOutput.trim() !== "") {
      const normalizedActual = (decodedStdout || "").replace(/\r\n/g, "\n").trimEnd()
      const normalizedExpected = tc.expectedOutput.replace(/\r\n/g, "\n").trimEnd()
      if (normalizedActual === normalizedExpected) {
        passed = true
      }
    } else {
      // Custom input: considered passed if no runtime or compile error
      passed = statusId === 3 || (statusId !== 5 && statusId !== 6 && statusId < 7)
    }

    const testResult: TestCaseResult = {
      passed,
      statusId: passed ? 3 : statusId,
      statusDescription: passed ? "Accepted" : (r.status?.description || "Failed"),
      verdict: passed ? "ACCEPTED" : verdict,
      stdout: decodedStdout,
      stderr: decodedStderr,
      compileOutput: decodedCompile,
      time: r.time || null,
      memory: r.memory || null,
    }

    return {
      results: [testResult],
      overallVerdict: testResult.verdict,
      passedCount: passed ? 1 : 0,
      totalCount: 1,
      maxTimeMs: r.time ? Math.round(parseFloat(r.time) * 1000) : null,
      maxMemoryKb: r.memory || null,
    }
  }

  // Multiple testcases: Use batch submission
  const submissions = testCases.map((tc) => {
    const sub: any = {
      language_id: languageId,
      source_code: b64encode(sourceCode),
      stdin: b64encode(tc.input || ""),
      cpu_time_limit: timeLimitSec,
      memory_limit: memoryLimitKb,
    }
    if (tc.expectedOutput && tc.expectedOutput.trim() !== "") {
      sub.expected_output = b64encode(tc.expectedOutput.trimEnd() + "\n")
    }
    return sub
  })

  const batchRes = await fetch(`${apiUrl}/submissions/batch?base64_encoded=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({ submissions }),
  })

  if (!batchRes.ok) {
    const errorText = await batchRes.text()
    console.error("Judge0 batch submission failed:", batchRes.status, errorText)
    throw new Error(`Code execution service returned HTTP ${batchRes.status}.`)
  }

  const tokens: { token: string }[] = await batchRes.json()
  const tokenString = tokens.map((t) => t.token).join(",")

  const maxAttempts = 25
  let attempt = 0
  let allDone = false
  let batchResults: any[] = []

  while (!allDone && attempt < maxAttempts) {
    attempt++
    await new Promise((r) => setTimeout(r, 600))

    const pollRes = await fetch(
      `${apiUrl}/submissions/batch?tokens=${tokenString}&base64_encoded=true&fields=stdout,stderr,compile_output,status,time,memory`,
      { method: "GET", headers }
    )

    if (!pollRes.ok) {
      console.error("Judge0 poll failed:", pollRes.status)
      continue
    }

    const pollData = await pollRes.json()
    batchResults = pollData.submissions || []
    allDone = batchResults.length > 0 && batchResults.every((s: any) => s.status && s.status.id >= 3)
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

  const results: TestCaseResult[] = batchResults.map((r: any, idx: number) => {
    const statusId = r.status?.id ?? 13
    const verdict = JUDGE0_STATUS_MAP[statusId] || "INTERNAL_ERROR"
    const decodedStdout = r.stdout ? b64decode(r.stdout) : null
    const decodedStderr = r.stderr ? b64decode(r.stderr) : null
    const decodedCompile = r.compile_output ? b64decode(r.compile_output) : null
    const tc = testCases[idx]

    let passed = statusId === 3
    if (tc && tc.expectedOutput && tc.expectedOutput.trim() !== "") {
      const normalizedActual = (decodedStdout || "").replace(/\r\n/g, "\n").trimEnd()
      const normalizedExpected = tc.expectedOutput.replace(/\r\n/g, "\n").trimEnd()
      if (normalizedActual === normalizedExpected) {
        passed = true
      }
    }

    return {
      passed,
      statusId: passed ? 3 : statusId,
      statusDescription: passed ? "Accepted" : (r.status?.description || "Failed"),
      verdict: passed ? "ACCEPTED" : verdict,
      stdout: decodedStdout,
      stderr: decodedStderr,
      compileOutput: decodedCompile,
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
    maxTimeMs: times.length > 0 ? Math.round(Math.max(...times)) : null,
    maxMemoryKb: memories.length > 0 ? Math.round(Math.max(...memories)) : null,
  }
}
