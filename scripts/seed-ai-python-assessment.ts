import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"
import * as path from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Starting Python & Data Science Assessment Seeding...")

  // 1. Target Course: Artificial Intelligence & Modern Deep Learning Systems
  const aiCourse = await prisma.course.findFirst({
    where: {
      title: { contains: "Artificial Intelligence", mode: "insensitive" },
    },
  })

  if (!aiCourse) {
    throw new Error("Could not find Artificial Intelligence course in database.")
  }

  console.log(`✓ Found target course: "${aiCourse.title}" (${aiCourse.id})`)

  // 2. Read the Assessment Excel File
  const filePath = path.join(process.cwd(), "public", "Quizs", "TechGration_Python_DataScience_Assessment_50_Marks.xlsx")
  const workbook = XLSX.readFile(filePath)

  console.log("✓ Loaded workbook sheets:", workbook.SheetNames)

  // 3. Upsert Assessment
  const assessmentTitle = "TechGration | Python & Data Science Assessment"
  const allowedEmails = ["arunkumar0003578@gmail.com"]

  // Clean up any existing draft of this assessment to ensure a clean, idempotent seed
  const existingAssessment = await prisma.assessment.findFirst({
    where: {
      courseId: aiCourse.id,
      title: assessmentTitle,
    },
  })

  let assessmentId: string

  if (existingAssessment) {
    console.log(`Updating existing assessment (${existingAssessment.id})...`)
    const updated = await prisma.assessment.update({
      where: { id: existingAssessment.id },
      data: {
        description:
          "Comprehensive 50-mark technical assessment for AI & Modern Deep Learning Systems. Section 1 contains 40 foundational MCQs (1 mark each) covering core Python, NumPy, Pandas, Matplotlib, and Seaborn. Section 2 contains 2 hands-on coding challenges (5 marks each).",
        timeLimitSec: 3600, // 60 minutes
        passingPct: 70, // 35 / 50 marks
        isPublished: false, // Private beta gating
        allowedEmails,
      },
    })
    assessmentId = updated.id

    // Remove old questions to re-create clean state
    await prisma.question.deleteMany({
      where: { assessmentId },
    })
    console.log("✓ Cleaned up previous questions for clean re-insertion.")
  } else {
    console.log("Creating new assessment...")
    const created = await prisma.assessment.create({
      data: {
        courseId: aiCourse.id,
        title: assessmentTitle,
        description:
          "Comprehensive 50-mark technical assessment for AI & Modern Deep Learning Systems. Section 1 contains 40 foundational MCQs (1 mark each) covering core Python, NumPy, Pandas, Matplotlib, and Seaborn. Section 2 contains 2 hands-on coding challenges (5 marks each).",
        timeLimitSec: 3600, // 60 minutes
        passingPct: 70, // 35 / 50 marks
        isPublished: false, // Private beta gating
        allowedEmails,
      },
    })
    assessmentId = created.id
    console.log(`✓ Created assessment with ID: ${assessmentId}`)
  }

  // 4. Parse MCQ Question Bank Sheet
  const mcqSheet = workbook.Sheets["MCQ Question Bank"]
  const rawRows: any[][] = XLSX.utils.sheet_to_json(mcqSheet, { header: 1 })

  // Find header row (Q. No., Topic, Question, Option A, Option B, Option C, Option D, Correct Option, Correct Answer, Teacher Explanation)
  let headerIndex = -1
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i]
    if (row && row[0] === "Q. No.") {
      headerIndex = i
      break
    }
  }

  if (headerIndex === -1) {
    throw new Error("Could not find header row with 'Q. No.' in MCQ Question Bank sheet")
  }

  const questionRows = rawRows.slice(headerIndex + 1).filter((r) => r && r[0] !== undefined && r[0] !== null && String(r[0]).trim() !== "")
  console.log(`✓ Found ${questionRows.length} MCQ questions to insert`)

  for (const row of questionRows) {
    const qNo = Number(row[0])
    const topic = String(row[1] || "").trim()
    const prompt = String(row[2] || "").trim()
    const optA = String(row[3] || "").trim()
    const optB = String(row[4] || "").trim()
    const optC = String(row[5] || "").trim()
    const optD = String(row[6] || "").trim()
    const correctLetter = String(row[7] || "").trim().toUpperCase()
    const explanation = String(row[9] || "").trim()

    const optionsData = [
      { label: optA, isCorrect: correctLetter === "A", position: 0 },
      { label: optB, isCorrect: correctLetter === "B", position: 1 },
      { label: optC, isCorrect: correctLetter === "C", position: 2 },
      { label: optD, isCorrect: correctLetter === "D", position: 3 },
    ]

    await prisma.question.create({
      data: {
        assessmentId,
        prompt,
        type: "MCQ_SINGLE",
        position: qNo,
        explanation,
        topic,
        points: 1, // 1 mark each
        options: {
          create: optionsData,
        },
      },
    })
  }

  console.log(`✓ Successfully seeded all ${questionRows.length} MCQs into Assessment.`)

  // 5. Seed the 2 Coding Problems
  // Problem 1: Student Marks Analyzer
  const problem1Slug = "student-marks-analyzer"
  const problem1Data = {
    slug: problem1Slug,
    title: "Student Marks Analyzer",
    statement: `### Problem Overview
Write a Python function \`analyze_marks(marks)\` that takes a list of numerical student marks and outputs statistical insights.

### Requirements
1. **Print All Marks**: Output the full list in the exact format: \`Student Marks: [85, 72, 90, 65, 78]\`
2. **Calculate Average Marks**: Output the mean rounded to one decimal place: \`Average Marks: 78.0\`
3. **Find Highest and Lowest**:
   - \`Highest Marks: 90\`
   - \`Lowest Marks: 65\`
4. **Determine Performance**:
   - If \`average >= 75\` → \`Performance: Excellent\`
   - Else if \`average >= 60\` → \`Performance: Good\`
   - Otherwise → \`Performance: Needs Improvement\`

### Sample Input
\`\`\`python
marks = [85, 72, 90, 65, 78]
\`\`\`

### Expected Output
\`\`\`text
Student Marks: [85, 72, 90, 65, 78]
Average Marks: 78.0
Highest Marks: 90
Lowest Marks: 65
Performance: Excellent
\`\`\`

### Marking Scheme (5 Marks Total)
- Function definition & list handling: 1 Mark
- Correct average calculation: 1 Mark
- Highest & lowest determination: 1 Mark
- Conditional performance grading: 1 Mark
- Exact output formatting: 1 Mark`,
    difficulty: "EASY" as const,
    topics: ["Python", "Functions", "Lists", "Conditionals", "Data Science"],
    hints: [
      "Use sum(marks) / len(marks) to calculate average.",
      "Use max(marks) and min(marks) to find highest and lowest.",
      "Use if / elif / else blocks to check average >= 75 and average >= 60.",
    ],
    editorial: `### Model Solution
\`\`\`python
def analyze_marks(marks):
    print(f"Student Marks: {marks}")
    avg = sum(marks) / len(marks)
    print(f"Average Marks: {avg:.1f}")
    print(f"Highest Marks: {max(marks)}")
    print(f"Lowest Marks: {min(marks)}")
    if avg >= 75:
        print("Performance: Excellent")
    elif avg >= 60:
        print("Performance: Good")
    else:
        print("Performance: Needs Improvement")

marks = [85, 72, 90, 65, 78]
analyze_marks(marks)
\`\`\``,
    timeLimitMs: 3000,
    memoryLimitKb: 256000,
    starterCode: {
      python: `def analyze_marks(marks):\n    # 1. Print all marks\n    # 2. Calculate average marks\n    # 3. Find highest and lowest marks\n    # 4. Determine performance (>=75 Excellent, >=60 Good, else Needs Improvement)\n    pass\n\nmarks = [85, 72, 90, 65, 78]\nanalyze_marks(marks)`,
    },
    solutionCode: {
      python: `def analyze_marks(marks):\n    print(f"Student Marks: {marks}")\n    avg = sum(marks) / len(marks)\n    print(f"Average Marks: {avg:.1f}")\n    print(f"Highest Marks: {max(marks)}")\n    print(f"Lowest Marks: {min(marks)}")\n    if avg >= 75:\n        print("Performance: Excellent")\n    elif avg >= 60:\n        print("Performance: Good")\n    else:\n        print("Performance: Needs Improvement")\n\nmarks = [85, 72, 90, 65, 78]\nanalyze_marks(marks)`,
    },
    isPublished: false,
    allowedEmails,
    xpReward: 25,
    stage: 1,
    position: 201,
  }

  // Problem 2: Student Data Analysis Using Pandas
  const problem2Slug = "student-data-analysis-pandas"
  const problem2Data = {
    slug: problem2Slug,
    title: "Student Data Analysis Using Pandas",
    statement: `### Problem Overview
Perform fundamental data exploration and filtering on the provided cohort dataset \`students.csv\` using Pandas.

### Cohort Dataset Preview (20 Records)
Download the CSV file: [\`students.csv\`](/data/students.csv)

| Student_ID | Student_Name | Branch | Semester | Marks | Attendance |
|:---|:---|:---|:---:|:---:|:---:|
| ST001 | Aarav | CSE | 1 | 88 | 91 |
| ST002 | Diya | ECE | 1 | 76 | 85 |
| ST003 | Kabir | CSE | 2 | 92 | 89 |
| ST004 | Anaya | IT | 2 | 81 | 78 |
| ST005 | Vivaan | CSE | 1 | 67 | 74 |
| ST006 | Ishita | AI&ML | 3 | 95 | 96 |
| ST007 | Reyansh | ECE | 2 | 73 | 80 |
| ST008 | Saanvi | CSE | 3 | 84 | 87 |
| ST009 | Advik | IT | 1 | 59 | 68 |
| ST010 | Myra | AI&ML | 2 | 90 | 92 |
| ST011 | Arjun | CSE | 2 | 78 | 82 |
| ST012 | Aadhya | ECE | 3 | 86 | 90 |
| ST013 | Krish | IT | 2 | 71 | 75 |
| ST014 | Kiara | CSE | 1 | 94 | 93 |
| ST015 | Rudra | AI&ML | 3 | 82 | 88 |
| ST016 | Sara | ECE | 1 | 64 | 70 |
| ST017 | Atharv | CSE | 3 | 89 | 86 |
| ST018 | Navya | IT | 3 | 77 | 81 |
| ST019 | Dhruv | AI&ML | 1 | 69 | 73 |
| ST020 | Meera | CSE | 2 | 97 | 95 |

### Requirements
1. **Load Data**: Read \`students.csv\` using Pandas (\`pd.read_csv('students.csv')\`).
2. **Display First 5 Rows**: Print \`df.head()\`.
3. **Filter CSE Students**: Filter and print rows where \`Branch == 'CSE'\`.
4. **Compute Average Marks**: Calculate and print the average marks of CSE students: \`print("Average CSE Marks:", cse_df['Marks'].mean())\`
5. **Sort Records**: Sort all students by \`Marks\` in descending order (\`ascending=False\`) and print the sorted DataFrame.

### Marking Scheme (5 Marks Total)
- Correct CSV ingestion using pd.read_csv: 1 Mark
- Accurate first 5 rows inspection: 1 Mark
- Clean branch filtering condition: 1 Mark
- Aggregate CSE average calculation: 1 Mark
- Descending sort by marks: 1 Mark`,
    difficulty: "MEDIUM" as const,
    topics: ["Python", "Data Science", "Pandas", "Data Analysis"],
    hints: [
      "Use pd.read_csv('students.csv') to read the dataset.",
      "df.head() returns the first 5 records.",
      "df[df['Branch'] == 'CSE'] filters students in the CSE department.",
      "df.sort_values(by='Marks', ascending=False) sorts records in descending order.",
    ],
    editorial: `### Model Solution
\`\`\`python
import pandas as pd

# 1. Read CSV
df = pd.read_csv('students.csv')

# 2. Display first 5 rows
print(df.head())

# 3. Filter CSE students
cse_df = df[df['Branch'] == 'CSE']
print(cse_df)

# 4. Calculate average marks for CSE
print("Average CSE Marks:", cse_df['Marks'].mean())

# 5. Sort all students by Marks descending
sorted_df = df.sort_values(by='Marks', ascending=False)
print(sorted_df)
\`\`\``,
    timeLimitMs: 5000,
    memoryLimitKb: 512000,
    starterCode: {
      python: `import pandas as pd\n\n# 1. Read students.csv\ndf = pd.read_csv('students.csv')\n\n# 2. Display first 5 rows\n\n# 3. Filter students whose Branch is CSE\n\n# 4. Calculate average Marks of CSE students\n\n# 5. Sort all students by Marks in descending order\n`,
    },
    solutionCode: {
      python: `import pandas as pd\n\ndf = pd.read_csv('students.csv')\nprint(df.head())\ncse_df = df[df['Branch'] == 'CSE']\nprint(cse_df)\nprint("Average CSE Marks:", cse_df['Marks'].mean())\nsorted_df = df.sort_values(by='Marks', ascending=False)\nprint(sorted_df)`,
    },
    isPublished: false,
    allowedEmails,
    xpReward: 35,
    stage: 1,
    position: 202,
  }

  // Upsert Problem 1
  const p1 = await prisma.codingProblem.upsert({
    where: { slug: problem1Slug },
    update: problem1Data,
    create: problem1Data,
  })

  // Upsert Test Cases for Problem 1
  await prisma.codingTestCase.deleteMany({ where: { problemId: p1.id } })
  await prisma.codingTestCase.createMany({
    data: [
      {
        problemId: p1.id,
        input: "[85, 72, 90, 65, 78]",
        expectedOutput: "Student Marks: [85, 72, 90, 65, 78]\nAverage Marks: 78.0\nHighest Marks: 90\nLowest Marks: 65\nPerformance: Excellent",
        isSample: true,
        position: 1,
        explanation: "Average is 78.0 >= 75 so Performance is Excellent.",
      },
      {
        problemId: p1.id,
        input: "[60, 65, 62, 70, 68]",
        expectedOutput: "Student Marks: [60, 65, 62, 70, 68]\nAverage Marks: 65.0\nHighest Marks: 70\nLowest Marks: 60\nPerformance: Good",
        isSample: false,
        position: 2,
        explanation: "Average is 65.0 (60 <= avg < 75) so Performance is Good.",
      },
      {
        problemId: p1.id,
        input: "[45, 52, 50, 48, 55]",
        expectedOutput: "Student Marks: [45, 52, 50, 48, 55]\nAverage Marks: 50.0\nHighest Marks: 55\nLowest Marks: 45\nPerformance: Needs Improvement",
        isSample: false,
        position: 3,
        explanation: "Average is 50.0 < 60 so Performance is Needs Improvement.",
      },
    ],
  })
  console.log(`✓ Seeded Coding Problem 1: "${p1.title}" with test cases`)

  // Upsert Problem 2
  const p2 = await prisma.codingProblem.upsert({
    where: { slug: problem2Slug },
    update: problem2Data,
    create: problem2Data,
  })

  await prisma.codingTestCase.deleteMany({ where: { problemId: p2.id } })
  await prisma.codingTestCase.createMany({
    data: [
      {
        problemId: p2.id,
        input: "",
        expectedOutput: "Average CSE Marks: 86.125",
        isSample: true,
        position: 1,
        explanation: "Calculates correct CSE average (88+92+67+84+78+94+89+97)/8 = 86.125",
      },
    ],
  })
  console.log(`✓ Seeded Coding Problem 2: "${p2.title}" with test cases`)

  console.log("\n🎉 ALL ASSESSMENT & CODING PROBLEMS SEEDED SUCCESSFULLY!")
  console.log(`- Assessment ID: ${assessmentId}`)
  console.log(`- Total Marks: 50 (40 MCQs + 10 Marks Coding)`)
  console.log(`- Privacy Status: isPublished = false`)
  console.log(`- Restricted Access Whitelist: [arunkumar0003578@gmail.com] (Aarav only)`)
}

main()
  .catch((e) => {
    console.error("Error seeding assessment:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
