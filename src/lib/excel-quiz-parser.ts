import * as XLSX from "xlsx"

export interface ParsedQuestionDraft {
  prompt: string
  points: number
  explanation: string
  options: Array<{
    label: string
    isCorrect: boolean
  }>
}

/**
 * Generates and downloads a clean, production-ready Excel template (.xlsx)
 * pre-populated with standard headers and sample multiple-choice questions.
 */
export function generateQuizTemplate(): void {
  const headers = [
    "Question",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Option",
    "Points",
    "Explanation",
  ]

  const sampleRows = [
    [
      "Why are residual skip connections critical in deep transformer backbones?",
      "They eliminate the need for GPU VRAM during training",
      "They allow uninterrupted gradient flow to earlier layers, combating vanishing gradients",
      "They compress vocabulary embeddings by 50%",
      "They disable dropout during inference automatically",
      "B",
      10,
      "Skip connections provide identity gradient flow paths during backpropagation, avoiding vanishing gradients.",
    ],
    [
      "What is the computational complexity of standard self-attention with respect to sequence length N?",
      "O(N) - Linear",
      "O(N log N) - Log-linear",
      "O(N^2) - Quadratic",
      "O(1) - Constant",
      "C",
      10,
      "Self-attention computes pair-wise dot products across all N tokens with all N tokens, leading to O(N^2) complexity.",
    ],
    [
      "What role does Layer Normalization play before Multi-Head Attention (Pre-LN)?",
      "It stabilizes training dynamics and improves convergence in deep networks",
      "It replaces activation functions entirely",
      "It hashes token IDs into fixed 32-bit floats",
      "It is only used during batch evaluation",
      "A",
      10,
      "Pre-LN stabilizes gradients across layers, enabling easier training without complex warmup schedules.",
    ],
  ]

  const data = [headers, ...sampleRows]
  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // Configure column widths for readability in Excel & Numbers
  worksheet["!cols"] = [
    { wch: 55 }, // Question
    { wch: 32 }, // Option A
    { wch: 32 }, // Option B
    { wch: 32 }, // Option C
    { wch: 32 }, // Option D
    { wch: 16 }, // Correct Option
    { wch: 10 }, // Points
    { wch: 50 }, // Explanation
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz_Questions")

  XLSX.writeFile(workbook, "techgration_quiz_mcq_template.xlsx")
}

/**
 * Parses an uploaded .xlsx, .xls, or .csv spreadsheet file into structured
 * question drafts ready for quiz creation or editing.
 */
export async function parseQuizSpreadsheet(file: File): Promise<{
  questions: ParsedQuestionDraft[]
  errors: string[]
}> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result
        if (!buffer) {
          return resolve({ questions: [], errors: ["File is empty or could not be read."] })
        }

        const workbook = XLSX.read(buffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        if (!sheetName) {
          return resolve({ questions: [], errors: ["No sheets found in workbook."] })
        }

        const worksheet = workbook.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
        })

        if (!rawRows || rawRows.length === 0) {
          return resolve({
            questions: [],
            errors: ["Spreadsheet contains no data rows."],
          })
        }

        const questions: ParsedQuestionDraft[] = []
        const errors: string[] = []

        rawRows.forEach((row, idx) => {
          const rowNum = idx + 2 // 1-based row index accounting for header

          // Helper to retrieve value ignoring column casing and whitespace
          const findVal = (candidateKeys: string[]): string => {
            for (const key of Object.keys(row)) {
              const normalized = key.trim().toLowerCase()
              for (const candidate of candidateKeys) {
                if (normalized === candidate.toLowerCase()) {
                  return String(row[key] ?? "").trim()
                }
              }
            }
            return ""
          }

          const prompt = findVal(["Question", "Prompt", "Question Text", "Query", "Title"])
          const optA = findVal(["Option A", "Option 1", "A", "Choice A", "OptionA"])
          const optB = findVal(["Option B", "Option 2", "B", "Choice B", "OptionB"])
          const optC = findVal(["Option C", "Option 3", "C", "Choice C", "OptionC"])
          const optD = findVal(["Option D", "Option 4", "D", "Choice D", "OptionD"])
          const correctRaw = findVal(["Correct Option", "Correct", "Answer", "Correct Answer", "Ans"])
          const pointsRaw = findVal(["Points", "Marks", "Score", "Point", "Mark"])
          const explanation = findVal(["Explanation", "Notes", "Solution", "Feedback"])

          if (!prompt) {
            errors.push(`Row ${rowNum}: Skipped because Question prompt is empty.`)
            return
          }

          const optionCandidates = [
            { key: "A", text: optA },
            { key: "B", text: optB },
            { key: "C", text: optC },
            { key: "D", text: optD },
          ].filter((o) => o.text.length > 0)

          if (optionCandidates.length < 2) {
            errors.push(
              `Row ${rowNum}: Needs at least 2 non-empty options. Found ${optionCandidates.length}.`
            )
            return
          }

          // Determine correct option index
          const normalizedCorrect = correctRaw.trim().toUpperCase()
          let correctIndex = -1

          if (["A", "B", "C", "D"].includes(normalizedCorrect)) {
            const letterIdx = ["A", "B", "C", "D"].indexOf(normalizedCorrect)
            if (letterIdx < optionCandidates.length) {
              correctIndex = letterIdx
            }
          } else if (["1", "2", "3", "4"].includes(normalizedCorrect)) {
            const numIdx = parseInt(normalizedCorrect, 10) - 1
            if (numIdx >= 0 && numIdx < optionCandidates.length) {
              correctIndex = numIdx
            }
          } else if (normalizedCorrect) {
            const textMatchIdx = optionCandidates.findIndex(
              (o) => o.text.trim().toLowerCase() === correctRaw.trim().toLowerCase()
            )
            if (textMatchIdx !== -1) {
              correctIndex = textMatchIdx
            }
          }

          // Fallback to option 0 if unspecified or unrecognized
          if (correctIndex === -1) {
            correctIndex = 0
            if (correctRaw) {
              errors.push(
                `Row ${rowNum}: Correct option indicator "${correctRaw}" unrecognized; defaulted to first option.`
              )
            }
          }

          const parsedPoints = parseInt(pointsRaw, 10)
          const points = isNaN(parsedPoints) || parsedPoints <= 0 ? 10 : parsedPoints

          questions.push({
            prompt,
            points,
            explanation,
            options: optionCandidates.map((opt, i) => ({
              label: opt.text,
              isCorrect: i === correctIndex,
            })),
          })
        })

        resolve({ questions, errors })
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to parse spreadsheet"
        resolve({
          questions: [],
          errors: [`File reading error: ${errorMsg}`],
        })
      }
    }

    reader.onerror = () => {
      resolve({
        questions: [],
        errors: ["Failed to read uploaded file."],
      })
    }

    reader.readAsArrayBuffer(file)
  })
}
