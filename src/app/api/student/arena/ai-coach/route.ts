import { NextResponse } from "next/server"
import { getCurrentUser } from "@/server/auth"
import { db } from "@/server/db"

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      problemSlug,
      code,
      language,
      verdict,
      compileOutput,
      errorOutput,
      testInput,
      expectedOutput,
      actualOutput,
    } = body

    if (!problemSlug) {
      return NextResponse.json({ error: "Missing problemSlug" }, { status: 400 })
    }

    const problem = await db.codingProblem.findUnique({
      where: { slug: problemSlug },
      select: {
        id: true,
        title: true,
        difficulty: true,
        statement: true,
        topics: true,
        hints: true,
      },
    })

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ""

    // 1. If Gemini API Key is configured, use live LLM with Socratic prompt
    if (apiKey.trim()) {
      try {
        const prompt = `You are a warm, encouraging Computer Science professor acting as an AI Code Coach on TechGration LMS.
A student is working on the challenge "${problem.title}" (${problem.difficulty}) in ${language}.

Problem Statement Summary:
${problem.statement.slice(0, 600)}

Topics: ${problem.topics.join(", ")}

Student's Submitted Code:
\`\`\`${language}
${code?.slice(0, 1500) || "// No code submitted"}
\`\`\`

Outcome / Status: ${verdict || "UNKNOWN"}
${compileOutput ? `Compiler Output:\n${compileOutput.slice(0, 500)}` : ""}
${errorOutput ? `Runtime Stderr:\n${errorOutput.slice(0, 500)}` : ""}
${testInput ? `Failing Input:\n${testInput.slice(0, 200)}` : ""}
${expectedOutput ? `Expected Output: ${expectedOutput.slice(0, 200)}` : ""}
${actualOutput ? `Student Output: ${actualOutput.slice(0, 200)}` : ""}

CRITICAL PEDAGOGICAL RULES:
1. NEVER provide the complete code solution or write their function for them.
2. NEVER spoil the algorithmic answer directly.
3. Ask 1-2 probing Socratic questions that guide them toward identifying their bug or edge-case omission.
4. Keep your answer encouraging and concise (maximum 3 bullet points).
5. Build their confidence as an engineer.`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 400,
              },
            }),
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const aiText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (aiText) {
            return NextResponse.json({
              success: true,
              coachReply: aiText,
              provider: "gemini",
            })
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini AI Coach call failed, falling back to heuristic tutor:", geminiErr)
      }
    }

    // 2. Fallback Heuristic Socratic Tutor (Deterministic, zero external keys needed)
    const hints = problem.hints || []
    let pedagogicalObservations: string[] = []

    if (verdict === "COMPILATION_ERROR") {
      pedagogicalObservations.push(
        "Look closely at the compiler output. Often a misplaced bracket, misspelled variable name, or missing type definition is the culprit."
      )
      if (language === "cpp" || language === "java") {
        pedagogicalObservations.push(
          "Ensure all standard libraries are properly imported and all variables are declared before use."
        )
      }
    } else if (verdict === "TIME_LIMIT_EXCEEDED") {
      pedagogicalObservations.push(
        "Your code is taking longer than the 3.0-second sandbox limit. Are you using nested loops (O(N²)) where a Hash Map or Two Pointers (O(N)) could work?"
      )
      pedagogicalObservations.push(
        "Check your loop termination conditions—could a `while` loop be running indefinitely without incrementing its pointer?"
      )
    } else if (verdict === "RUNTIME_ERROR") {
      if (errorOutput?.includes("IndexError") || errorOutput?.includes("out of bounds") || errorOutput?.includes("SIGSEGV")) {
        pedagogicalObservations.push(
          "An index boundary exception occurred! Check what happens when your index reaches `0` or `length - 1`."
        )
      } else if (errorOutput?.includes("RecursionError") || errorOutput?.includes("StackOverflow")) {
        pedagogicalObservations.push(
          "A stack overflow / infinite recursion occurred. Double-check your recursive base case condition!"
        )
      } else {
        pedagogicalObservations.push(
          "A runtime exception occurred while processing the input. Check for null/undefined access or division by zero."
        )
      }
    } else {
      // Wrong Answer
      pedagogicalObservations.push(
        "Compare your output with the expected format. Notice if there are trailing spaces, extra newlines, or 0-indexed vs 1-indexed mismatches."
      )
      if (hints.length > 0) {
        pedagogicalObservations.push(`💡 Key Concept Hint: "${hints[0]}"`)
      }
      pedagogicalObservations.push(
        "Think about edge cases: What happens with an empty collection, negative numbers, or arrays with duplicate elements?"
      )
    }

    const fallbackReply = `Here are a few Socratic pointers to guide your debugging:

${pedagogicalObservations.map((obs) => `• ${obs}`).join("\n\n")}

Take a step back, trace through one example manually with pen and paper, and try running again!`

    return NextResponse.json({
      success: true,
      coachReply: fallbackReply,
      provider: "heuristic",
    })
  } catch (error) {
    console.error("AI Coach error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
