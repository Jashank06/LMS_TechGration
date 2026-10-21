/**
 * Seed Script: 100 Coding Arena Problems — Progressive Learning Path
 * 
 * From absolute beginner (Hello World) to advanced (Dynamic Programming)
 * 
 * Run: npx tsx scripts/seed-coding-problems.ts
 * 
 * Idempotent: skips problems that already exist by slug.
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface TestCase {
  input: string
  expectedOutput: string
  isSample: boolean
  explanation?: string
}

interface Problem {
  slug: string
  title: string
  statement: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  topics: string[]
  hints: string[]
  editorial: string
  timeLimitMs: number
  memoryLimitKb: number
  starterCode: Record<string, string>
  xpReward: number
  position: number
  testCases: TestCase[]
}

// ═══════════════════════════════════════════════════════════════════
// STAGE 1: Getting Started — Hello World & I/O (Problems 1–8)  EASY
// ═══════════════════════════════════════════════════════════════════

const stage1: Problem[] = [
  {
    slug: "hello-world",
    title: "Hello, World!",
    statement: `Your very first program! Simply print the text **Hello, World!** (exactly as shown, with comma, space and exclamation mark).\n\nThis problem has no input.`,
    difficulty: "EASY",
    topics: ["basics"],
    hints: ["Use the print/console.log/cout/System.out.println function."],
    editorial: "Just use the standard output function of your language to print the exact string.\n\nPython: `print('Hello, World!')`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 1,
    starterCode: {
      python: `# Print Hello, World!\nprint("Hello, World!")`,
      java: `public class Main {\n    public static void main(String[] args) {\n        // Print Hello, World!\n        System.out.println("Hello, World!");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Print Hello, World!\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
      javascript: `// Print Hello, World!\nconsole.log("Hello, World!");`,
    },
    testCases: [
      { input: "", expectedOutput: "Hello, World!", isSample: true, explanation: "Print the exact text." },
    ],
  },
  {
    slug: "greet-user",
    title: "Greet the User",
    statement: `Read a person's name from input and print a greeting.\n\n**Input:** A single line containing a name (string).\n**Output:** Print \`Hello, <name>!\` where \`<name>\` is the input.\n\n**Example:**\nInput: \`Alice\`\nOutput: \`Hello, Alice!\``,
    difficulty: "EASY",
    topics: ["basics"],
    hints: ["Read the input, then concatenate it into the greeting string."],
    editorial: "Read the name, then use string formatting or concatenation.\n\nPython: `name = input()` then `print(f'Hello, {name}!')`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 2,
    starterCode: {
      python: `name = input()\n# Print Hello, <name>!\nprint(f"Hello, {name}!")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.nextLine();\n        // Print Hello, <name>!\n        System.out.println("Hello, " + name + "!");\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    getline(cin, name);\n    // Print Hello, <name>!\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}`,
      javascript: `const name = require('fs').readFileSync('/dev/stdin', 'utf8').trim();\n// Print Hello, <name>!\nconsole.log("Hello, " + name + "!");`,
    },
    testCases: [
      { input: "Alice", expectedOutput: "Hello, Alice!", isSample: true, explanation: "Greet Alice" },
      { input: "TechGration", expectedOutput: "Hello, TechGration!", isSample: true },
      { input: "Bob", expectedOutput: "Hello, Bob!", isSample: false },
      { input: "World", expectedOutput: "Hello, World!", isSample: false },
    ],
  },
  {
    slug: "add-two-numbers",
    title: "Add Two Numbers",
    statement: `Read two integers from input (one per line) and print their sum.\n\n**Input:** Two lines, each containing one integer.\n**Output:** A single integer — the sum.`,
    difficulty: "EASY",
    topics: ["basics", "math"],
    hints: ["Read two numbers, add them, print the result."],
    editorial: "Read two integers and print their sum.\n\nPython: `a = int(input())`, `b = int(input())`, `print(a + b)`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 3,
    starterCode: {
      python: `a = int(input())\nb = int(input())\n# Print the sum\nprint(a + b)`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        // Print the sum\n        System.out.println(a + b);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // Print the sum\n    cout << a + b << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst a = parseInt(lines[0]);\nconst b = parseInt(lines[1]);\n// Print the sum\nconsole.log(a + b);`,
    },
    testCases: [
      { input: "3\n5", expectedOutput: "8", isSample: true, explanation: "3 + 5 = 8" },
      { input: "10\n20", expectedOutput: "30", isSample: true, explanation: "10 + 20 = 30" },
      { input: "0\n0", expectedOutput: "0", isSample: false },
      { input: "-5\n3", expectedOutput: "-2", isSample: false },
      { input: "999\n1", expectedOutput: "1000", isSample: false },
    ],
  },
  {
    slug: "area-of-rectangle",
    title: "Area of Rectangle",
    statement: `Given the length and width of a rectangle, calculate and print its area.\n\n**Input:** Two integers on separate lines — length and width.\n**Output:** A single integer — the area (length × width).`,
    difficulty: "EASY",
    topics: ["basics", "math"],
    hints: ["Area = length × width"],
    editorial: "Multiply the two inputs and print the result.\n\nFormula: area = length * width",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 4,
    starterCode: {
      python: `length = int(input())\nwidth = int(input())\n# Print the area\nprint(length * width)`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int length = sc.nextInt();\n        int width = sc.nextInt();\n        System.out.println(length * width);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int length, width;\n    cin >> length >> width;\n    cout << length * width << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst length = parseInt(lines[0]);\nconst width = parseInt(lines[1]);\nconsole.log(length * width);`,
    },
    testCases: [
      { input: "5\n3", expectedOutput: "15", isSample: true, explanation: "5 × 3 = 15" },
      { input: "10\n10", expectedOutput: "100", isSample: true },
      { input: "1\n1", expectedOutput: "1", isSample: false },
      { input: "100\n200", expectedOutput: "20000", isSample: false },
    ],
  },
  {
    slug: "celsius-to-fahrenheit",
    title: "Celsius to Fahrenheit",
    statement: `Convert a temperature from Celsius to Fahrenheit.\n\n**Formula:** F = (C × 9/5) + 32\n\n**Input:** A single number C (can be decimal).\n**Output:** The temperature in Fahrenheit, printed as a decimal with 2 decimal places.`,
    difficulty: "EASY",
    topics: ["basics", "math"],
    hints: ["Use the formula F = (C * 9/5) + 32", "Format output to 2 decimal places."],
    editorial: "Apply the conversion formula and format the output.\n\nPython: `print(f'{(c * 9/5) + 32:.2f}')`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 5,
    starterCode: {
      python: `c = float(input())\nf = (c * 9/5) + 32\nprint(f"{f:.2f}")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        double c = sc.nextDouble();\n        double f = (c * 9.0/5.0) + 32;\n        System.out.printf(\"%.2f%n\", f);\n    }\n}`,
      cpp: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double c;\n    cin >> c;\n    double f = (c * 9.0/5.0) + 32;\n    cout << fixed << setprecision(2) << f << endl;\n    return 0;\n}`,
      javascript: `const c = parseFloat(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nconst f = (c * 9/5) + 32;\nconsole.log(f.toFixed(2));`,
    },
    testCases: [
      { input: "0", expectedOutput: "32.00", isSample: true, explanation: "0°C = 32°F (freezing point)" },
      { input: "100", expectedOutput: "212.00", isSample: true, explanation: "100°C = 212°F (boiling point)" },
      { input: "37", expectedOutput: "98.60", isSample: false },
      { input: "-40", expectedOutput: "-40.00", isSample: false },
    ],
  },
  {
    slug: "swap-two-numbers",
    title: "Swap Two Numbers",
    statement: `Given two integers A and B, print them in swapped order.\n\n**Input:** Two integers on separate lines.\n**Output:** Two lines — first print B, then print A.`,
    difficulty: "EASY",
    topics: ["basics"],
    hints: ["You can just print them in reverse order."],
    editorial: "Simply print the second number first, then the first number.\n\nPython: `print(b)` then `print(a)`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 6,
    starterCode: {
      python: `a = int(input())\nb = int(input())\n# Print b then a\nprint(b)\nprint(a)`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(b);\n        System.out.println(a);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << b << endl << a << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst a = parseInt(lines[0]);\nconst b = parseInt(lines[1]);\nconsole.log(b);\nconsole.log(a);`,
    },
    testCases: [
      { input: "5\n10", expectedOutput: "10\n5", isSample: true, explanation: "Swap 5 and 10" },
      { input: "1\n2", expectedOutput: "2\n1", isSample: true },
      { input: "0\n0", expectedOutput: "0\n0", isSample: false },
      { input: "-3\n7", expectedOutput: "7\n-3", isSample: false },
    ],
  },
  {
    slug: "simple-interest",
    title: "Simple Interest Calculator",
    statement: `Calculate simple interest given principal, rate, and time.\n\n**Formula:** SI = (P × R × T) / 100\n\n**Input:** Three numbers on separate lines — Principal (P), Rate (R), and Time in years (T).\n**Output:** The simple interest, formatted to 2 decimal places.`,
    difficulty: "EASY",
    topics: ["basics", "math"],
    hints: ["SI = (P * R * T) / 100"],
    editorial: "Apply the formula directly.\n\nPython: `si = (p * r * t) / 100`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 7,
    starterCode: {
      python: `p = float(input())\nr = float(input())\nt = float(input())\nsi = (p * r * t) / 100\nprint(f"{si:.2f}")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        double p = sc.nextDouble();\n        double r = sc.nextDouble();\n        double t = sc.nextDouble();\n        double si = (p * r * t) / 100;\n        System.out.printf(\"%.2f%n\", si);\n    }\n}`,
      cpp: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double p, r, t;\n    cin >> p >> r >> t;\n    double si = (p * r * t) / 100;\n    cout << fixed << setprecision(2) << si << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst p = parseFloat(lines[0]);\nconst r = parseFloat(lines[1]);\nconst t = parseFloat(lines[2]);\nconst si = (p * r * t) / 100;\nconsole.log(si.toFixed(2));`,
    },
    testCases: [
      { input: "1000\n5\n2", expectedOutput: "100.00", isSample: true, explanation: "(1000 × 5 × 2)/100 = 100" },
      { input: "5000\n10\n3", expectedOutput: "1500.00", isSample: true },
      { input: "10000\n8.5\n5", expectedOutput: "4250.00", isSample: false },
      { input: "0\n5\n2", expectedOutput: "0.00", isSample: false },
    ],
  },
  {
    slug: "average-of-three",
    title: "Average of Three Numbers",
    statement: `Calculate the average of three numbers.\n\n**Input:** Three integers on separate lines.\n**Output:** The average, formatted to 2 decimal places.`,
    difficulty: "EASY",
    topics: ["basics", "math"],
    hints: ["Average = (a + b + c) / 3"],
    editorial: "Sum the three numbers and divide by 3.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 8,
    starterCode: {
      python: `a = int(input())\nb = int(input())\nc = int(input())\navg = (a + b + c) / 3\nprint(f"{avg:.2f}")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n        double avg = (a + b + c) / 3.0;\n        System.out.printf(\"%.2f%n\", avg);\n    }\n}`,
      cpp: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    double avg = (a + b + c) / 3.0;\n    cout << fixed << setprecision(2) << avg << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst a = parseInt(lines[0]), b = parseInt(lines[1]), c = parseInt(lines[2]);\nconst avg = (a + b + c) / 3;\nconsole.log(avg.toFixed(2));`,
    },
    testCases: [
      { input: "10\n20\n30", expectedOutput: "20.00", isSample: true, explanation: "(10+20+30)/3 = 20" },
      { input: "1\n2\n3", expectedOutput: "2.00", isSample: true },
      { input: "0\n0\n0", expectedOutput: "0.00", isSample: false },
      { input: "7\n8\n9", expectedOutput: "8.00", isSample: false },
      { input: "100\n200\n300", expectedOutput: "200.00", isSample: false },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
// STAGE 2: Decision Making — Conditionals (Problems 9–18)  EASY
// ═══════════════════════════════════════════════════════════════════

const stage2: Problem[] = [
  {
    slug: "even-or-odd",
    title: "Even or Odd",
    statement: `Given an integer, determine if it is **Even** or **Odd**.\n\n**Input:** A single integer N.\n**Output:** Print \`Even\` if N is even, otherwise print \`Odd\`.`,
    difficulty: "EASY",
    topics: ["conditionals"],
    hints: ["A number is even if it's divisible by 2 (N % 2 == 0)."],
    editorial: "Check if N % 2 == 0. If yes, it's Even, otherwise Odd.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 9,
    starterCode: {
      python: `n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        System.out.println(n % 2 == 0 ? "Even" : "Odd");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    cout << (n % 2 == 0 ? "Even" : "Odd") << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nconsole.log(n % 2 === 0 ? "Even" : "Odd");`,
    },
    testCases: [
      { input: "4", expectedOutput: "Even", isSample: true, explanation: "4 is divisible by 2" },
      { input: "7", expectedOutput: "Odd", isSample: true, explanation: "7 is not divisible by 2" },
      { input: "0", expectedOutput: "Even", isSample: false },
      { input: "-3", expectedOutput: "Odd", isSample: false },
      { input: "100", expectedOutput: "Even", isSample: false },
    ],
  },
  {
    slug: "positive-negative-zero",
    title: "Positive, Negative or Zero",
    statement: `Given a number, classify it as **Positive**, **Negative**, or **Zero**.\n\n**Input:** A single integer.\n**Output:** Print \`Positive\`, \`Negative\`, or \`Zero\`.`,
    difficulty: "EASY",
    topics: ["conditionals"],
    hints: ["Use if-elif-else to check > 0, < 0, or == 0."],
    editorial: "Simple conditional: check if N > 0, N < 0, or N == 0.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 10,
    starterCode: {
      python: `n = int(input())\nif n > 0:\n    print("Positive")\nelif n < 0:\n    print("Negative")\nelse:\n    print("Zero")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        if (n > 0) System.out.println("Positive");\n        else if (n < 0) System.out.println("Negative");\n        else System.out.println("Zero");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n > 0) cout << "Positive" << endl;\n    else if (n < 0) cout << "Negative" << endl;\n    else cout << "Zero" << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nif (n > 0) console.log("Positive");\nelse if (n < 0) console.log("Negative");\nelse console.log("Zero");`,
    },
    testCases: [
      { input: "5", expectedOutput: "Positive", isSample: true },
      { input: "-3", expectedOutput: "Negative", isSample: true },
      { input: "0", expectedOutput: "Zero", isSample: true },
      { input: "1000", expectedOutput: "Positive", isSample: false },
      { input: "-999", expectedOutput: "Negative", isSample: false },
    ],
  },
  {
    slug: "largest-of-three",
    title: "Largest of Three Numbers",
    statement: `Given three integers, find and print the largest one.\n\n**Input:** Three integers, one per line.\n**Output:** The largest integer.`,
    difficulty: "EASY",
    topics: ["conditionals"],
    hints: ["Compare all three using if-elif-else, or use max()."],
    editorial: "Use conditional comparisons or built-in max function.\n\nPython: `print(max(a, b, c))`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 11,
    starterCode: {
      python: `a = int(input())\nb = int(input())\nc = int(input())\nprint(max(a, b, c))`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n        System.out.println(Math.max(a, Math.max(b, c)));\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << max({a, b, c}) << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst [a, b, c] = lines.map(Number);\nconsole.log(Math.max(a, b, c));`,
    },
    testCases: [
      { input: "1\n2\n3", expectedOutput: "3", isSample: true },
      { input: "10\n5\n8", expectedOutput: "10", isSample: true },
      { input: "-1\n-2\n-3", expectedOutput: "-1", isSample: false },
      { input: "5\n5\n5", expectedOutput: "5", isSample: false },
      { input: "100\n200\n150", expectedOutput: "200", isSample: false },
    ],
  },
  {
    slug: "leap-year",
    title: "Leap Year Check",
    statement: `Determine if a given year is a leap year.\n\nA year is a leap year if:\n- It is divisible by 4 **AND**\n- It is NOT divisible by 100, **UNLESS** it is also divisible by 400.\n\n**Input:** A single integer — the year.\n**Output:** Print \`Leap\` or \`Not Leap\`.`,
    difficulty: "EASY",
    topics: ["conditionals"],
    hints: ["Check divisibility by 400 first, then 100, then 4."],
    editorial: "A year is leap if: (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 12,
    starterCode: {
      python: `year = int(input())\nif (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):\n    print("Leap")\nelse:\n    print("Not Leap")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int y = new Scanner(System.in).nextInt();\n        boolean leap = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);\n        System.out.println(leap ? "Leap" : "Not Leap");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int y;\n    cin >> y;\n    bool leap = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0);\n    cout << (leap ? "Leap" : "Not Leap") << endl;\n    return 0;\n}`,
      javascript: `const y = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nconst leap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);\nconsole.log(leap ? "Leap" : "Not Leap");`,
    },
    testCases: [
      { input: "2024", expectedOutput: "Leap", isSample: true, explanation: "2024 ÷ 4 = 506, not divisible by 100" },
      { input: "1900", expectedOutput: "Not Leap", isSample: true, explanation: "Divisible by 100 but not 400" },
      { input: "2000", expectedOutput: "Leap", isSample: false },
      { input: "2023", expectedOutput: "Not Leap", isSample: false },
      { input: "400", expectedOutput: "Leap", isSample: false },
    ],
  },
  {
    slug: "grade-calculator",
    title: "Grade Calculator",
    statement: `Given a student's marks (0–100), print the corresponding grade:\n\n- 90–100 → **A**\n- 80–89 → **B**\n- 70–79 → **C**\n- 60–69 → **D**\n- Below 60 → **F**\n\n**Input:** A single integer — marks.\n**Output:** The grade letter.`,
    difficulty: "EASY",
    topics: ["conditionals"],
    hints: ["Use if-elif-else chain checking from highest range down."],
    editorial: "Check ranges from top to bottom using if-elif-else.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 13,
    starterCode: {
      python: `marks = int(input())\nif marks >= 90:\n    print("A")\nelif marks >= 80:\n    print("B")\nelif marks >= 70:\n    print("C")\nelif marks >= 60:\n    print("D")\nelse:\n    print("F")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int m = new Scanner(System.in).nextInt();\n        if (m >= 90) System.out.println("A");\n        else if (m >= 80) System.out.println("B");\n        else if (m >= 70) System.out.println("C");\n        else if (m >= 60) System.out.println("D");\n        else System.out.println("F");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int m;\n    cin >> m;\n    if (m >= 90) cout << "A" << endl;\n    else if (m >= 80) cout << "B" << endl;\n    else if (m >= 70) cout << "C" << endl;\n    else if (m >= 60) cout << "D" << endl;\n    else cout << "F" << endl;\n    return 0;\n}`,
      javascript: `const m = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nif (m >= 90) console.log("A");\nelse if (m >= 80) console.log("B");\nelse if (m >= 70) console.log("C");\nelse if (m >= 60) console.log("D");\nelse console.log("F");`,
    },
    testCases: [
      { input: "95", expectedOutput: "A", isSample: true },
      { input: "72", expectedOutput: "C", isSample: true },
      { input: "85", expectedOutput: "B", isSample: false },
      { input: "60", expectedOutput: "D", isSample: false },
      { input: "45", expectedOutput: "F", isSample: false },
      { input: "100", expectedOutput: "A", isSample: false },
    ],
  },
  {
    slug: "vowel-or-consonant",
    title: "Vowel or Consonant",
    statement: `Given a single lowercase English letter, check if it is a **Vowel** or **Consonant**.\n\nVowels: a, e, i, o, u\n\n**Input:** A single lowercase character.\n**Output:** Print \`Vowel\` or \`Consonant\`.`,
    difficulty: "EASY",
    topics: ["conditionals", "strings"],
    hints: ["Check if the character is in the set {a, e, i, o, u}."],
    editorial: "Check membership in the vowel set.\n\nPython: `if ch in 'aeiou': print('Vowel')`",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 14,
    starterCode: {
      python: `ch = input().strip()\nif ch in 'aeiou':\n    print("Vowel")\nelse:\n    print("Consonant")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        char ch = new Scanner(System.in).next().charAt(0);\n        System.out.println(\"aeiou\".indexOf(ch) != -1 ? \"Vowel\" : \"Consonant\");\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    char ch;\n    cin >> ch;\n    string vowels = "aeiou";\n    cout << (vowels.find(ch) != string::npos ? "Vowel" : "Consonant") << endl;\n    return 0;\n}`,
      javascript: `const ch = require('fs').readFileSync('/dev/stdin', 'utf8').trim();\nconsole.log('aeiou'.includes(ch) ? "Vowel" : "Consonant");`,
    },
    testCases: [
      { input: "a", expectedOutput: "Vowel", isSample: true },
      { input: "b", expectedOutput: "Consonant", isSample: true },
      { input: "e", expectedOutput: "Vowel", isSample: false },
      { input: "z", expectedOutput: "Consonant", isSample: false },
      { input: "u", expectedOutput: "Vowel", isSample: false },
    ],
  },
  {
    slug: "eligible-to-vote",
    title: "Eligible to Vote?",
    statement: `Given a person's age, determine if they are eligible to vote (age ≥ 18).\n\n**Input:** A single integer — age.\n**Output:** Print \`Eligible\` or \`Not Eligible\`.`,
    difficulty: "EASY",
    topics: ["conditionals"],
    hints: ["Simple comparison: age >= 18"],
    editorial: "Check if age >= 18.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 15,
    starterCode: {
      python: `age = int(input())\nprint("Eligible" if age >= 18 else "Not Eligible")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int age = new Scanner(System.in).nextInt();\n        System.out.println(age >= 18 ? "Eligible" : "Not Eligible");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    cin >> age;\n    cout << (age >= 18 ? "Eligible" : "Not Eligible") << endl;\n    return 0;\n}`,
      javascript: `const age = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nconsole.log(age >= 18 ? "Eligible" : "Not Eligible");`,
    },
    testCases: [
      { input: "21", expectedOutput: "Eligible", isSample: true },
      { input: "15", expectedOutput: "Not Eligible", isSample: true },
      { input: "18", expectedOutput: "Eligible", isSample: false },
      { input: "17", expectedOutput: "Not Eligible", isSample: false },
      { input: "1", expectedOutput: "Not Eligible", isSample: false },
    ],
  },
  {
    slug: "absolute-value",
    title: "Absolute Value",
    statement: `Given an integer N, print its absolute value **without** using built-in abs functions.\n\n**Input:** A single integer.\n**Output:** The absolute value.`,
    difficulty: "EASY",
    topics: ["conditionals", "math"],
    hints: ["If the number is negative, multiply by -1."],
    editorial: "If N < 0, print -N, else print N.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 16,
    starterCode: {
      python: `n = int(input())\nif n < 0:\n    print(-n)\nelse:\n    print(n)`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        System.out.println(n < 0 ? -n : n);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    cout << (n < 0 ? -n : n) << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nconsole.log(n < 0 ? -n : n);`,
    },
    testCases: [
      { input: "-5", expectedOutput: "5", isSample: true },
      { input: "3", expectedOutput: "3", isSample: true },
      { input: "0", expectedOutput: "0", isSample: false },
      { input: "-1000", expectedOutput: "1000", isSample: false },
    ],
  },
  {
    slug: "triangle-validity",
    title: "Valid Triangle",
    statement: `Given three sides of a triangle, determine if they can form a valid triangle.\n\nA triangle is valid if the sum of any two sides is **strictly greater** than the third side.\n\n**Input:** Three positive integers on separate lines.\n**Output:** Print \`Valid\` or \`Invalid\`.`,
    difficulty: "EASY",
    topics: ["conditionals", "math"],
    hints: ["Check: a+b > c AND a+c > b AND b+c > a"],
    editorial: "Triangle inequality: all three pair-sums must exceed the third side.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 17,
    starterCode: {
      python: `a = int(input())\nb = int(input())\nc = int(input())\nif a + b > c and a + c > b and b + c > a:\n    print("Valid")\nelse:\n    print("Invalid")`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n        System.out.println(a+b>c && a+c>b && b+c>a ? "Valid" : "Invalid");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << (a+b>c && a+c>b && b+c>a ? "Valid" : "Invalid") << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\nconst [a,b,c] = lines.map(Number);\nconsole.log(a+b>c && a+c>b && b+c>a ? "Valid" : "Invalid");`,
    },
    testCases: [
      { input: "3\n4\n5", expectedOutput: "Valid", isSample: true },
      { input: "1\n2\n10", expectedOutput: "Invalid", isSample: true },
      { input: "5\n5\n5", expectedOutput: "Valid", isSample: false },
      { input: "1\n1\n2", expectedOutput: "Invalid", isSample: false },
      { input: "7\n10\n5", expectedOutput: "Valid", isSample: false },
    ],
  },
  {
    slug: "fizzbuzz",
    title: "FizzBuzz",
    statement: `The classic FizzBuzz! Given a number N, print numbers from 1 to N with these rules:\n\n- If divisible by **both 3 and 5**, print \`FizzBuzz\`\n- If divisible by **3** only, print \`Fizz\`\n- If divisible by **5** only, print \`Buzz\`\n- Otherwise, print the number itself\n\nPrint each result on a new line.\n\n**Input:** A single integer N.\n**Output:** N lines of FizzBuzz output.`,
    difficulty: "EASY",
    topics: ["conditionals", "loops"],
    hints: ["Check divisibility by 15 first (both 3 and 5), then 3, then 5.", "Use a loop from 1 to N."],
    editorial: "Loop from 1 to N. For each number, check divisibility in order: 15 → 3 → 5 → number.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 18,
    starterCode: {
      python: `n = int(input())\nfor i in range(1, n + 1):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)`,
      java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) System.out.println("FizzBuzz");\n            else if (i % 3 == 0) System.out.println("Fizz");\n            else if (i % 5 == 0) System.out.println("Buzz");\n            else System.out.println(i);\n        }\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) cout << "FizzBuzz" << endl;\n        else if (i % 3 == 0) cout << "Fizz" << endl;\n        else if (i % 5 == 0) cout << "Buzz" << endl;\n        else cout << i << endl;\n    }\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());\nfor (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) console.log("FizzBuzz");\n    else if (i % 3 === 0) console.log("Fizz");\n    else if (i % 5 === 0) console.log("Buzz");\n    else console.log(i);\n}`,
    },
    testCases: [
      { input: "5", expectedOutput: "1\n2\nFizz\n4\nBuzz", isSample: true },
      { input: "15", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", isSample: true },
      { input: "1", expectedOutput: "1", isSample: false },
      { input: "3", expectedOutput: "1\n2\nFizz", isSample: false },
    ],
  },
]


// ═══════════════════════════════════════════════════════════════════
// STAGE 3: Loops & Patterns (Problems 19–30)  EASY → MEDIUM
// ═══════════════════════════════════════════════════════════════════

const stage3: Problem[] = [
  {
    slug: "sum-of-n",
    title: "Sum of First N Numbers",
    statement: `Given N, find the sum of all integers from 1 to N.\n\n**Input:** A single integer N (1 ≤ N ≤ 10^6).\n**Output:** The sum.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Use a loop, or the formula N*(N+1)/2."],
    editorial: "Formula: sum = N * (N + 1) / 2. Or use a simple for loop.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 19,
    starterCode: {
      python: `n = int(input())\nprint(n * (n + 1) // 2)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        long n = new Scanner(System.in).nextLong();\n        System.out.println(n * (n + 1) / 2);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    long long n;\n    cin >> n;\n    cout << n * (n + 1) / 2 << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(n * (n + 1) / 2);`,
    },
    testCases: [
      { input: "5", expectedOutput: "15", isSample: true, explanation: "1+2+3+4+5 = 15" },
      { input: "10", expectedOutput: "55", isSample: true },
      { input: "1", expectedOutput: "1", isSample: false },
      { input: "100", expectedOutput: "5050", isSample: false },
      { input: "1000", expectedOutput: "500500", isSample: false },
    ],
  },
  {
    slug: "factorial",
    title: "Factorial",
    statement: `Calculate the factorial of a non-negative integer N.\n\nFactorial of N (written as N!) = 1 × 2 × 3 × ... × N. By definition, 0! = 1.\n\n**Input:** A single integer N (0 ≤ N ≤ 20).\n**Output:** N!`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Start with result = 1, multiply by each number from 1 to N."],
    editorial: "Initialize result = 1, then multiply by i for i in 1..N.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 20,
    starterCode: {
      python: `n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        long result = 1;\n        for (int i = 1; i <= n; i++) result *= i;\n        System.out.println(result);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    long long result = 1;\n    for (int i = 1; i <= n; i++) result *= i;\n    cout << result << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet result = 1n;\nfor (let i = 1n; i <= BigInt(n); i++) result *= i;\nconsole.log(result.toString());`,
    },
    testCases: [
      { input: "5", expectedOutput: "120", isSample: true, explanation: "5! = 1×2×3×4×5 = 120" },
      { input: "0", expectedOutput: "1", isSample: true, explanation: "0! = 1 by definition" },
      { input: "1", expectedOutput: "1", isSample: false },
      { input: "10", expectedOutput: "3628800", isSample: false },
      { input: "12", expectedOutput: "479001600", isSample: false },
    ],
  },
  {
    slug: "multiplication-table",
    title: "Multiplication Table",
    statement: `Print the multiplication table of a given number N from 1 to 10.\n\nEach line should be in the format: \`N x i = result\`\n\n**Input:** A single integer N.\n**Output:** 10 lines showing the table.`,
    difficulty: "EASY",
    topics: ["loops"],
    hints: ["Use a loop from 1 to 10 and print formatted output."],
    editorial: "Loop i from 1 to 10 and print `N x i = N*i`.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 21,
    starterCode: {
      python: `n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        for (int i = 1; i <= 10; i++)\n            System.out.println(n + " x " + i + " = " + (n * i));\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= 10; i++)\n        cout << n << " x " << i << " = " << n*i << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nfor (let i = 1; i <= 10; i++) console.log(n + " x " + i + " = " + (n * i));`,
    },
    testCases: [
      { input: "5", expectedOutput: "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50", isSample: true },
      { input: "2", expectedOutput: "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20", isSample: false },
      { input: "1", expectedOutput: "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10", isSample: false },
    ],
  },
  {
    slug: "count-digits",
    title: "Count Digits",
    statement: `Count the number of digits in a given positive integer.\n\n**Input:** A single positive integer N.\n**Output:** The digit count.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Repeatedly divide by 10 until the number becomes 0, counting iterations.", "Or convert to string and find its length."],
    editorial: "Either use len(str(n)) or a loop that divides by 10.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 22,
    starterCode: {
      python: `n = int(input())\nprint(len(str(abs(n))))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        long n = Math.abs(new Scanner(System.in).nextLong());\n        System.out.println(String.valueOf(n).length());\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    long long n;\n    cin >> n;\n    cout << to_string(abs(n)).length() << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(Math.abs(n).toString().length);`,
    },
    testCases: [
      { input: "12345", expectedOutput: "5", isSample: true },
      { input: "7", expectedOutput: "1", isSample: true },
      { input: "100", expectedOutput: "3", isSample: false },
      { input: "9999999", expectedOutput: "7", isSample: false },
    ],
  },
  {
    slug: "reverse-number",
    title: "Reverse a Number",
    statement: `Given a non-negative integer, reverse its digits and print the result.\n\nLeading zeros in the reversed number should be dropped.\n\n**Input:** A single non-negative integer.\n**Output:** The reversed integer.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Extract last digit with % 10, build reversed number, divide by 10."],
    editorial: "Use a loop: extract the last digit (n % 10), add to reversed, then n //= 10.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 23,
    starterCode: {
      python: `n = int(input())\nreversed_n = 0\nwhile n > 0:\n    reversed_n = reversed_n * 10 + n % 10\n    n //= 10\nprint(reversed_n)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        int rev = 0;\n        while (n > 0) { rev = rev * 10 + n % 10; n /= 10; }\n        System.out.println(rev);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int rev = 0;\n    while (n > 0) { rev = rev * 10 + n % 10; n /= 10; }\n    cout << rev << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet num = n, rev = 0;\nwhile (num > 0) { rev = rev * 10 + num % 10; num = Math.floor(num / 10); }\nconsole.log(rev);`,
    },
    testCases: [
      { input: "1234", expectedOutput: "4321", isSample: true },
      { input: "100", expectedOutput: "1", isSample: true, explanation: "001 → 1 (leading zeros dropped)" },
      { input: "5", expectedOutput: "5", isSample: false },
      { input: "9876", expectedOutput: "6789", isSample: false },
    ],
  },
  {
    slug: "palindrome-number",
    title: "Palindrome Number",
    statement: `Check if a given non-negative integer is a palindrome. A number is a palindrome if it reads the same forward and backward.\n\n**Input:** A single non-negative integer.\n**Output:** Print \`Yes\` if palindrome, \`No\` otherwise.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Reverse the number and compare with original."],
    editorial: "Reverse the digits, then check if reversed equals original.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 24,
    starterCode: {
      python: `n = input().strip()\nprint("Yes" if n == n[::-1] else "No")`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        System.out.println(s.equals(new StringBuilder(s).reverse().toString()) ? "Yes" : "No");\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    string rev = s;\n    reverse(rev.begin(), rev.end());\n    cout << (s == rev ? "Yes" : "No") << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log(s === s.split('').reverse().join('') ? "Yes" : "No");`,
    },
    testCases: [
      { input: "121", expectedOutput: "Yes", isSample: true },
      { input: "123", expectedOutput: "No", isSample: true },
      { input: "1", expectedOutput: "Yes", isSample: false },
      { input: "12321", expectedOutput: "Yes", isSample: false },
      { input: "10", expectedOutput: "No", isSample: false },
    ],
  },
  {
    slug: "sum-of-digits",
    title: "Sum of Digits",
    statement: `Find the sum of all digits of a given positive integer.\n\n**Input:** A single positive integer.\n**Output:** The sum of its digits.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Extract each digit with % 10, add to sum, divide by 10."],
    editorial: "Loop: add n % 10 to sum, then n //= 10, until n becomes 0.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 25,
    starterCode: {
      python: `n = int(input())\ntotal = 0\nwhile n > 0:\n    total += n % 10\n    n //= 10\nprint(total)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        int sum = 0;\n        while (n > 0) { sum += n % 10; n /= 10; }\n        System.out.println(sum);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    int sum = 0;\n    while (n > 0) { sum += n % 10; n /= 10; }\n    cout << sum << endl;\n    return 0;\n}`,
      javascript: `let n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet sum = 0;\nwhile (n > 0) { sum += n % 10; n = Math.floor(n / 10); }\nconsole.log(sum);`,
    },
    testCases: [
      { input: "123", expectedOutput: "6", isSample: true, explanation: "1+2+3 = 6" },
      { input: "9999", expectedOutput: "36", isSample: true },
      { input: "5", expectedOutput: "5", isSample: false },
      { input: "100", expectedOutput: "1", isSample: false },
    ],
  },
  {
    slug: "power-of-number",
    title: "Power of a Number",
    statement: `Calculate A raised to the power B (A^B) without using built-in power functions.\n\n**Input:** Two integers A and B (B ≥ 0) on separate lines.\n**Output:** A^B`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Multiply A by itself B times using a loop."],
    editorial: "Initialize result = 1. Loop B times, multiplying result by A each time.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 26,
    starterCode: {
      python: `a = int(input())\nb = int(input())\nresult = 1\nfor _ in range(b):\n    result *= a\nprint(result)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong(), b = sc.nextLong();\n        long result = 1;\n        for (int i = 0; i < b; i++) result *= a;\n        System.out.println(result);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    long long result = 1;\n    for (int i = 0; i < b; i++) result *= a;\n    cout << result << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a = parseInt(lines[0]), b = parseInt(lines[1]);\nlet result = 1;\nfor (let i = 0; i < b; i++) result *= a;\nconsole.log(result);`,
    },
    testCases: [
      { input: "2\n10", expectedOutput: "1024", isSample: true, explanation: "2^10 = 1024" },
      { input: "3\n0", expectedOutput: "1", isSample: true, explanation: "Any number^0 = 1" },
      { input: "5\n3", expectedOutput: "125", isSample: false },
      { input: "1\n100", expectedOutput: "1", isSample: false },
    ],
  },
  {
    slug: "prime-check",
    title: "Prime Number Check",
    statement: `Determine if a given number is a prime number.\n\nA prime number is greater than 1 and has no divisors other than 1 and itself.\n\n**Input:** A single integer N.\n**Output:** Print \`Prime\` or \`Not Prime\`.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Check divisibility from 2 to √N.", "Numbers ≤ 1 are not prime."],
    editorial: "If N ≤ 1, not prime. Check if any number from 2 to √N divides N evenly. If none do, it's prime.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 27,
    starterCode: {
      python: `n = int(input())\nif n <= 1:\n    print("Not Prime")\nelse:\n    is_prime = True\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            is_prime = False\n            break\n        i += 1\n    print("Prime" if is_prime else "Not Prime")`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        if (n <= 1) { System.out.println("Not Prime"); return; }\n        boolean prime = true;\n        for (int i = 2; i * i <= n; i++) if (n % i == 0) { prime = false; break; }\n        System.out.println(prime ? "Prime" : "Not Prime");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    if (n <= 1) { cout << "Not Prime" << endl; return 0; }\n    bool prime = true;\n    for (int i = 2; i * i <= n; i++) if (n % i == 0) { prime = false; break; }\n    cout << (prime ? "Prime" : "Not Prime") << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nif (n <= 1) { console.log("Not Prime"); } else {\n    let prime = true;\n    for (let i = 2; i * i <= n; i++) if (n % i === 0) { prime = false; break; }\n    console.log(prime ? "Prime" : "Not Prime");\n}`,
    },
    testCases: [
      { input: "7", expectedOutput: "Prime", isSample: true },
      { input: "10", expectedOutput: "Not Prime", isSample: true, explanation: "10 = 2 × 5" },
      { input: "1", expectedOutput: "Not Prime", isSample: false },
      { input: "2", expectedOutput: "Prime", isSample: false },
      { input: "97", expectedOutput: "Prime", isSample: false },
      { input: "100", expectedOutput: "Not Prime", isSample: false },
    ],
  },
  {
    slug: "fibonacci-series",
    title: "Fibonacci Series",
    statement: `Print the first N numbers of the Fibonacci series.\n\nThe Fibonacci series starts: 0, 1, 1, 2, 3, 5, 8, 13, ...\nEach number is the sum of the two preceding ones.\n\n**Input:** A single integer N (1 ≤ N ≤ 30).\n**Output:** N Fibonacci numbers separated by spaces.`,
    difficulty: "EASY",
    topics: ["loops", "math"],
    hints: ["Start with a=0, b=1. In each step, compute c=a+b, then shift."],
    editorial: "Maintain two variables. Print the current, then compute next = a + b.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 28,
    starterCode: {
      python: `n = int(input())\na, b = 0, 1\nresult = []\nfor _ in range(n):\n    result.append(str(a))\n    a, b = b, a + b\nprint(" ".join(result))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        long a = 0, b = 1;\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < n; i++) {\n            if (i > 0) sb.append(" ");\n            sb.append(a);\n            long c = a + b; a = b; b = c;\n        }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    long long a = 0, b = 1;\n    for (int i = 0; i < n; i++) {\n        if (i > 0) cout << " ";\n        cout << a;\n        long long c = a + b; a = b; b = c;\n    }\n    cout << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet a = 0, b = 1, res = [];\nfor (let i = 0; i < n; i++) { res.push(a); const c = a + b; a = b; b = c; }\nconsole.log(res.join(' '));`,
    },
    testCases: [
      { input: "5", expectedOutput: "0 1 1 2 3", isSample: true },
      { input: "8", expectedOutput: "0 1 1 2 3 5 8 13", isSample: true },
      { input: "1", expectedOutput: "0", isSample: false },
      { input: "10", expectedOutput: "0 1 1 2 3 5 8 13 21 34", isSample: false },
    ],
  },
  {
    slug: "star-pattern-right-triangle",
    title: "Star Pattern — Right Triangle",
    statement: `Print a right-angled triangle pattern of stars.\n\nFor N=4:\n\`\`\`\n*\n**\n***\n****\n\`\`\`\n\n**Input:** A single integer N.\n**Output:** N lines, where line i has i stars.`,
    difficulty: "EASY",
    topics: ["loops", "patterns"],
    hints: ["Use nested loops: outer for rows, inner for columns."],
    editorial: "For each row i (1 to N), print i stars.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 29,
    starterCode: {
      python: `n = int(input())\nfor i in range(1, n + 1):\n    print("*" * i)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        for (int i = 1; i <= n; i++) System.out.println("*".repeat(i));\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) cout << string(i, '*') << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nfor (let i = 1; i <= n; i++) console.log('*'.repeat(i));`,
    },
    testCases: [
      { input: "4", expectedOutput: "*\n**\n***\n****", isSample: true },
      { input: "1", expectedOutput: "*", isSample: true },
      { input: "3", expectedOutput: "*\n**\n***", isSample: false },
      { input: "5", expectedOutput: "*\n**\n***\n****\n*****", isSample: false },
    ],
  },
  {
    slug: "number-pyramid",
    title: "Number Pyramid",
    statement: `Print a number pyramid pattern.\n\nFor N=4:\n\`\`\`\n1\n1 2\n1 2 3\n1 2 3 4\n\`\`\`\n\n**Input:** A single integer N.\n**Output:** N lines forming the pyramid.`,
    difficulty: "EASY",
    topics: ["loops", "patterns"],
    hints: ["For each row i, print numbers from 1 to i separated by spaces."],
    editorial: "Nested loop: outer 1..N for rows, inner 1..i for numbers in each row.",
    timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 30,
    starterCode: {
      python: `n = int(input())\nfor i in range(1, n + 1):\n    print(" ".join(str(j) for j in range(1, i + 1)))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        for (int i = 1; i <= n; i++) {\n            StringBuilder sb = new StringBuilder();\n            for (int j = 1; j <= i; j++) { if (j > 1) sb.append(" "); sb.append(j); }\n            System.out.println(sb);\n        }\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) { if (j > 1) cout << " "; cout << j; }\n        cout << endl;\n    }\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nfor (let i = 1; i <= n; i++) {\n    let row = [];\n    for (let j = 1; j <= i; j++) row.push(j);\n    console.log(row.join(' '));\n}`,
    },
    testCases: [
      { input: "4", expectedOutput: "1\n1 2\n1 2 3\n1 2 3 4", isSample: true },
      { input: "1", expectedOutput: "1", isSample: true },
      { input: "3", expectedOutput: "1\n1 2\n1 2 3", isSample: false },
      { input: "5", expectedOutput: "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5", isSample: false },
    ],
  },
]


// ═══════════════════════════════════════════════════════════════════
// STAGE 4: Functions (Problems 31–38)  EASY → MEDIUM
// ═══════════════════════════════════════════════════════════════════

const stage4: Problem[] = [
  {
    slug: "max-of-two-function",
    title: "Maximum of Two (Function)",
    statement: `Write a function that takes two integers and returns the larger one.\n\n**Input:** Two integers on separate lines.\n**Output:** The larger integer.`,
    difficulty: "EASY", topics: ["functions"], hints: ["Compare using if-else or ternary."],
    editorial: "Return a if a > b else b.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 31,
    starterCode: {
      python: `def max_of_two(a, b):\n    return a if a > b else b\n\na = int(input())\nb = int(input())\nprint(max_of_two(a, b))`,
      java: `import java.util.Scanner;\npublic class Main {\n    static int maxOfTwo(int a, int b) { return a > b ? a : b; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(maxOfTwo(sc.nextInt(), sc.nextInt()));\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint maxOfTwo(int a, int b) { return a > b ? a : b; }\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << maxOfTwo(a, b) << endl;\n    return 0;\n}`,
      javascript: `function maxOfTwo(a, b) { return a > b ? a : b; }\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log(maxOfTwo(parseInt(lines[0]), parseInt(lines[1])));`,
    },
    testCases: [
      { input: "5\n3", expectedOutput: "5", isSample: true },
      { input: "2\n8", expectedOutput: "8", isSample: true },
      { input: "-1\n-5", expectedOutput: "-1", isSample: false },
      { input: "7\n7", expectedOutput: "7", isSample: false },
    ],
  },
  {
    slug: "is-prime-function",
    title: "Is Prime? (Function)",
    statement: `Write a function \`is_prime(n)\` that returns \`True\` if n is prime, \`False\` otherwise. Use it to check a given number.\n\n**Input:** A single integer.\n**Output:** \`True\` or \`False\`.`,
    difficulty: "EASY", topics: ["functions", "math"], hints: ["Check divisibility from 2 to √n."],
    editorial: "Loop from 2 to √n. If any divides evenly, return False. Handle n <= 1.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 32,
    starterCode: {
      python: `def is_prime(n):\n    if n <= 1:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True\n\nprint(is_prime(int(input())))`,
      java: `import java.util.Scanner;\npublic class Main {\n    static boolean isPrime(int n) {\n        if (n <= 1) return false;\n        for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;\n        return true;\n    }\n    public static void main(String[] args) {\n        System.out.println(isPrime(new Scanner(System.in).nextInt()) ? "True" : "False");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;\n    return true;\n}\nint main() {\n    int n; cin >> n;\n    cout << (isPrime(n) ? "True" : "False") << endl;\n    return 0;\n}`,
      javascript: `function isPrime(n) {\n    if (n <= 1) return false;\n    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;\n    return true;\n}\nconst n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(isPrime(n) ? "True" : "False");`,
    },
    testCases: [
      { input: "7", expectedOutput: "True", isSample: true },
      { input: "4", expectedOutput: "False", isSample: true },
      { input: "1", expectedOutput: "False", isSample: false },
      { input: "2", expectedOutput: "True", isSample: false },
      { input: "29", expectedOutput: "True", isSample: false },
    ],
  },
  {
    slug: "gcd-of-two",
    title: "GCD of Two Numbers",
    statement: `Find the Greatest Common Divisor (GCD) of two positive integers using the Euclidean algorithm.\n\n**Input:** Two positive integers on separate lines.\n**Output:** Their GCD.`,
    difficulty: "EASY", topics: ["functions", "math"], hints: ["Euclidean: gcd(a,b) = gcd(b, a%b). Base case: gcd(a,0) = a."],
    editorial: "Euclidean algorithm: repeatedly replace (a,b) with (b, a%b) until b=0.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 33,
    starterCode: {
      python: `def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n\na = int(input())\nb = int(input())\nprint(gcd(a, b))`,
      java: `import java.util.Scanner;\npublic class Main {\n    static int gcd(int a, int b) { while (b != 0) { int t = b; b = a % b; a = t; } return a; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.println(gcd(sc.nextInt(), sc.nextInt()));\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint gcd(int a, int b) { while (b) { int t = b; b = a % b; a = t; } return a; }\nint main() { int a, b; cin >> a >> b; cout << gcd(a, b) << endl; return 0; }`,
      javascript: `function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log(gcd(parseInt(lines[0]), parseInt(lines[1])));`,
    },
    testCases: [
      { input: "12\n8", expectedOutput: "4", isSample: true },
      { input: "7\n5", expectedOutput: "1", isSample: true },
      { input: "100\n25", expectedOutput: "25", isSample: false },
      { input: "17\n17", expectedOutput: "17", isSample: false },
    ],
  },
  {
    slug: "lcm-of-two",
    title: "LCM of Two Numbers",
    statement: `Find the Least Common Multiple (LCM) of two positive integers.\n\n**Formula:** LCM(a, b) = (a × b) / GCD(a, b)\n\n**Input:** Two positive integers on separate lines.\n**Output:** Their LCM.`,
    difficulty: "EASY", topics: ["functions", "math"], hints: ["First find GCD, then LCM = a*b/GCD."],
    editorial: "Use: lcm = (a * b) // gcd(a, b).", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 34,
    starterCode: {
      python: `def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a\n\na = int(input())\nb = int(input())\nprint(a * b // gcd(a, b))`,
      java: `import java.util.Scanner;\npublic class Main {\n    static long gcd(long a, long b) { while (b != 0) { long t = b; b = a % b; a = t; } return a; }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong(), b = sc.nextLong();\n        System.out.println(a * b / gcd(a, b));\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nlong long gcd(long long a, long long b) { while (b) { long long t = b; b = a % b; a = t; } return a; }\nint main() { long long a, b; cin >> a >> b; cout << a * b / gcd(a, b) << endl; return 0; }`,
      javascript: `function gcd(a, b) { while (b) { [a, b] = [b, a % b]; } return a; }\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a = parseInt(lines[0]), b = parseInt(lines[1]);\nconsole.log(a * b / gcd(a, b));`,
    },
    testCases: [
      { input: "4\n6", expectedOutput: "12", isSample: true },
      { input: "3\n5", expectedOutput: "15", isSample: true },
      { input: "12\n18", expectedOutput: "36", isSample: false },
      { input: "7\n7", expectedOutput: "7", isSample: false },
    ],
  },
  {
    slug: "armstrong-number",
    title: "Armstrong Number",
    statement: `Check if a number is an Armstrong number. A number with n digits is Armstrong if the sum of each digit raised to the power n equals the number itself.\n\nExample: 153 → 1³ + 5³ + 3³ = 1 + 125 + 27 = 153 ✓\n\n**Input:** A positive integer.\n**Output:** \`Yes\` or \`No\`.`,
    difficulty: "MEDIUM", topics: ["functions", "math"], hints: ["First find the digit count, then sum each digit raised to that power."],
    editorial: "Count digits (n). Sum (digit^n) for each digit. Compare with original.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 35,
    starterCode: {
      python: `num = int(input())\ndigits = str(num)\nn = len(digits)\ntotal = sum(int(d) ** n for d in digits)\nprint("Yes" if total == num else "No")`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int num = new Scanner(System.in).nextInt();\n        String s = String.valueOf(num);\n        int n = s.length();\n        int sum = 0;\n        for (char c : s.toCharArray()) sum += (int) Math.pow(c - '0', n);\n        System.out.println(sum == num ? "Yes" : "No");\n    }\n}`,
      cpp: `#include <iostream>\n#include <cmath>\n#include <string>\nusing namespace std;\nint main() {\n    int num; cin >> num;\n    string s = to_string(num);\n    int n = s.size(), sum = 0;\n    for (char c : s) sum += pow(c - '0', n);\n    cout << (sum == num ? "Yes" : "No") << endl;\n    return 0;\n}`,
      javascript: `const num = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconst digits = num.toString();\nconst n = digits.length;\nconst sum = [...digits].reduce((s, d) => s + Math.pow(parseInt(d), n), 0);\nconsole.log(sum === num ? "Yes" : "No");`,
    },
    testCases: [
      { input: "153", expectedOutput: "Yes", isSample: true, explanation: "1³+5³+3³ = 153" },
      { input: "123", expectedOutput: "No", isSample: true },
      { input: "370", expectedOutput: "Yes", isSample: false },
      { input: "9474", expectedOutput: "Yes", isSample: false },
      { input: "100", expectedOutput: "No", isSample: false },
    ],
  },
  {
    slug: "perfect-number",
    title: "Perfect Number",
    statement: `A perfect number is a positive integer that equals the sum of its proper divisors (excluding itself).\n\nExample: 6 = 1 + 2 + 3\n\n**Input:** A positive integer.\n**Output:** \`Yes\` or \`No\`.`,
    difficulty: "MEDIUM", topics: ["functions", "math"], hints: ["Find all divisors from 1 to n/2 and sum them."],
    editorial: "Sum all divisors from 1 to n-1 (or optimize to √n). Compare sum with n.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 36,
    starterCode: {
      python: `n = int(input())\ntotal = sum(i for i in range(1, n) if n % i == 0)\nprint("Yes" if total == n else "No")`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        int sum = 0;\n        for (int i = 1; i < n; i++) if (n % i == 0) sum += i;\n        System.out.println(sum == n ? "Yes" : "No");\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    int sum = 0;\n    for (int i = 1; i < n; i++) if (n % i == 0) sum += i;\n    cout << (sum == n ? "Yes" : "No") << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet sum = 0;\nfor (let i = 1; i < n; i++) if (n % i === 0) sum += i;\nconsole.log(sum === n ? "Yes" : "No");`,
    },
    testCases: [
      { input: "6", expectedOutput: "Yes", isSample: true, explanation: "1+2+3=6" },
      { input: "28", expectedOutput: "Yes", isSample: true },
      { input: "12", expectedOutput: "No", isSample: false },
      { input: "496", expectedOutput: "Yes", isSample: false },
      { input: "1", expectedOutput: "No", isSample: false },
    ],
  },
  {
    slug: "decimal-to-binary",
    title: "Decimal to Binary",
    statement: `Convert a non-negative decimal integer to its binary representation.\n\n**Input:** A non-negative integer.\n**Output:** Its binary representation (as a string without leading zeros, except for 0 itself).`,
    difficulty: "MEDIUM", topics: ["functions", "math"], hints: ["Repeatedly divide by 2 and collect remainders.", "Or use built-in bin() and strip prefix."],
    editorial: "Divide by 2 repeatedly, collect remainders, reverse them.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 37,
    starterCode: {
      python: `n = int(input())\nif n == 0:\n    print("0")\nelse:\n    bits = []\n    while n > 0:\n        bits.append(str(n % 2))\n        n //= 2\n    print("".join(reversed(bits)))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        System.out.println(n == 0 ? "0" : Integer.toBinaryString(n));\n    }\n}`,
      cpp: `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    if (n == 0) { cout << "0" << endl; return 0; }\n    string bits;\n    while (n > 0) { bits += (char)('0' + n % 2); n /= 2; }\n    reverse(bits.begin(), bits.end());\n    cout << bits << endl;\n    return 0;\n}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(n.toString(2));`,
    },
    testCases: [
      { input: "10", expectedOutput: "1010", isSample: true },
      { input: "0", expectedOutput: "0", isSample: true },
      { input: "1", expectedOutput: "1", isSample: false },
      { input: "255", expectedOutput: "11111111", isSample: false },
      { input: "7", expectedOutput: "111", isSample: false },
    ],
  },
  {
    slug: "count-primes-in-range",
    title: "Count Primes in Range",
    statement: `Count how many prime numbers exist between 1 and N (inclusive).\n\n**Input:** A single integer N (1 ≤ N ≤ 10000).\n**Output:** The count of primes from 1 to N.`,
    difficulty: "MEDIUM", topics: ["functions", "math", "loops"], hints: ["Use the is_prime function in a loop.", "Optimize with Sieve of Eratosthenes."],
    editorial: "Loop 2..N, check each with is_prime, count the primes.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 38,
    starterCode: {
      python: `def is_prime(n):\n    if n <= 1: return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0: return False\n        i += 1\n    return True\n\nn = int(input())\ncount = sum(1 for i in range(2, n + 1) if is_prime(i))\nprint(count)`,
      java: `import java.util.Scanner;\npublic class Main {\n    static boolean isPrime(int n) {\n        if (n <= 1) return false;\n        for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;\n        return true;\n    }\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt(), count = 0;\n        for (int i = 2; i <= n; i++) if (isPrime(i)) count++;\n        System.out.println(count);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nbool isPrime(int n) {\n    if (n <= 1) return false;\n    for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;\n    return true;\n}\nint main() {\n    int n; cin >> n;\n    int count = 0;\n    for (int i = 2; i <= n; i++) if (isPrime(i)) count++;\n    cout << count << endl;\n    return 0;\n}`,
      javascript: `function isPrime(n) { if (n<=1) return false; for(let i=2;i*i<=n;i++) if(n%i===0) return false; return true; }\nconst n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nlet count = 0;\nfor (let i = 2; i <= n; i++) if (isPrime(i)) count++;\nconsole.log(count);`,
    },
    testCases: [
      { input: "10", expectedOutput: "4", isSample: true, explanation: "Primes: 2,3,5,7" },
      { input: "20", expectedOutput: "8", isSample: true },
      { input: "1", expectedOutput: "0", isSample: false },
      { input: "100", expectedOutput: "25", isSample: false },
      { input: "2", expectedOutput: "1", isSample: false },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
// STAGE 5: Strings (Problems 39–50)  EASY → MEDIUM
// ═══════════════════════════════════════════════════════════════════

const stage5: Problem[] = [
  {
    slug: "reverse-string",
    title: "Reverse a String",
    statement: `Given a string, print it in reverse.\n\n**Input:** A single string.\n**Output:** The reversed string.`,
    difficulty: "EASY", topics: ["strings"], hints: ["Use slicing [::-1] in Python, or loop backward."],
    editorial: "Python: s[::-1]. Java: StringBuilder.reverse(). C++: reverse().", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 39,
    starterCode: {
      python: `s = input()\nprint(s[::-1])`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine();\n        System.out.println(new StringBuilder(s).reverse());\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() { string s; getline(cin, s); reverse(s.begin(), s.end()); cout << s << endl; return 0; }`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log(s.split('').reverse().join(''));`,
    },
    testCases: [
      { input: "hello", expectedOutput: "olleh", isSample: true },
      { input: "TechGration", expectedOutput: "noitarGhceT", isSample: true },
      { input: "a", expectedOutput: "a", isSample: false },
      { input: "racecar", expectedOutput: "racecar", isSample: false },
    ],
  },
  {
    slug: "count-vowels-consonants",
    title: "Count Vowels and Consonants",
    statement: `Given a string of lowercase letters, count the number of vowels and consonants.\n\n**Input:** A string of lowercase letters (no spaces).\n**Output:** Two space-separated integers — vowel count and consonant count.`,
    difficulty: "EASY", topics: ["strings", "loops"], hints: ["Check each character against 'aeiou'."],
    editorial: "Loop through each char. If in 'aeiou', increment vowels, else consonants.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 40,
    starterCode: {
      python: `s = input().strip()\nvowels = sum(1 for c in s if c in 'aeiou')\nprint(vowels, len(s) - vowels)`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        int v = 0;\n        for (char c : s.toCharArray()) if ("aeiou".indexOf(c) != -1) v++;\n        System.out.println(v + " " + (s.length() - v));\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    int v = 0;\n    for (char c : s) if (string("aeiou").find(c) != string::npos) v++;\n    cout << v << " " << s.size() - v << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconst v = [...s].filter(c => 'aeiou'.includes(c)).length;\nconsole.log(v + ' ' + (s.length - v));`,
    },
    testCases: [
      { input: "hello", expectedOutput: "2 3", isSample: true, explanation: "e,o are vowels; h,l,l are consonants" },
      { input: "aeiou", expectedOutput: "5 0", isSample: true },
      { input: "bcdfg", expectedOutput: "0 5", isSample: false },
      { input: "programming", expectedOutput: "3 8", isSample: false },
    ],
  },
  {
    slug: "palindrome-string",
    title: "Palindrome String Check",
    statement: `Check if a given string is a palindrome (reads the same forwards and backwards). Ignore case.\n\n**Input:** A single string.\n**Output:** \`Yes\` or \`No\`.`,
    difficulty: "EASY", topics: ["strings"], hints: ["Convert to lowercase, then compare with reverse."],
    editorial: "Lowercase the string, then compare s == s[::-1].", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 41,
    starterCode: {
      python: `s = input().strip().lower()\nprint("Yes" if s == s[::-1] else "No")`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine().toLowerCase();\n        System.out.println(s.equals(new StringBuilder(s).reverse().toString()) ? "Yes" : "No");\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s; getline(cin, s);\n    for (auto& c : s) c = tolower(c);\n    string rev = s; reverse(rev.begin(), rev.end());\n    cout << (s == rev ? "Yes" : "No") << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim().toLowerCase();\nconsole.log(s === s.split('').reverse().join('') ? "Yes" : "No");`,
    },
    testCases: [
      { input: "racecar", expectedOutput: "Yes", isSample: true },
      { input: "hello", expectedOutput: "No", isSample: true },
      { input: "Madam", expectedOutput: "Yes", isSample: false },
      { input: "a", expectedOutput: "Yes", isSample: false },
    ],
  },
  {
    slug: "count-words",
    title: "Count Words in a Sentence",
    statement: `Count the number of words in a given sentence. Words are separated by spaces.\n\n**Input:** A single line of text.\n**Output:** The number of words.`,
    difficulty: "EASY", topics: ["strings"], hints: ["Split by spaces and count non-empty parts."],
    editorial: "Split the string by spaces and count the parts.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 42,
    starterCode: {
      python: `s = input().strip()\nprint(len(s.split()))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine().trim();\n        System.out.println(s.isEmpty() ? 0 : s.split("\\\\s+").length);\n    }\n}`,
      cpp: `#include <iostream>\n#include <sstream>\nusing namespace std;\nint main() {\n    string line; getline(cin, line);\n    istringstream iss(line);\n    string word; int count = 0;\n    while (iss >> word) count++;\n    cout << count << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log(s ? s.split(/\\s+/).length : 0);`,
    },
    testCases: [
      { input: "Hello World", expectedOutput: "2", isSample: true },
      { input: "I love coding at TechGration", expectedOutput: "5", isSample: true },
      { input: "OneWord", expectedOutput: "1", isSample: false },
      { input: "a b c d e", expectedOutput: "5", isSample: false },
    ],
  },
  {
    slug: "toggle-case",
    title: "Toggle Case",
    statement: `Convert all uppercase letters to lowercase and vice versa in a given string.\n\n**Input:** A single string.\n**Output:** The string with toggled case.`,
    difficulty: "EASY", topics: ["strings"], hints: ["Use swapcase() in Python, or check each character's case and flip it."],
    editorial: "Loop through each char. If upper, make lower and vice versa.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 43,
    starterCode: {
      python: `s = input()\nprint(s.swapcase())`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine();\n        StringBuilder sb = new StringBuilder();\n        for (char c : s.toCharArray()) sb.append(Character.isUpperCase(c) ? Character.toLowerCase(c) : Character.toUpperCase(c));\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    string s; getline(cin, s);\n    for (auto& c : s) c = isupper(c) ? tolower(c) : toupper(c);\n    cout << s << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log([...s].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''));`,
    },
    testCases: [
      { input: "Hello World", expectedOutput: "hELLO wORLD", isSample: true },
      { input: "ABC", expectedOutput: "abc", isSample: true },
      { input: "abc", expectedOutput: "ABC", isSample: false },
      { input: "PyThOn", expectedOutput: "pYtHoN", isSample: false },
    ],
  },
  {
    slug: "character-frequency",
    title: "Character Frequency",
    statement: `Count the frequency of each character in a string (case-sensitive). Print each unique character and its count, sorted alphabetically, one per line in the format \`char count\`.\n\n**Input:** A single string (no spaces).\n**Output:** Lines of \`character count\`, sorted by character.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing"], hints: ["Use a dictionary/map to count frequencies.", "Sort the keys before printing."],
    editorial: "Build a frequency map, then sort keys and print.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 44,
    starterCode: {
      python: `s = input().strip()\nfreq = {}\nfor c in s:\n    freq[c] = freq.get(c, 0) + 1\nfor c in sorted(freq):\n    print(c, freq[c])`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        TreeMap<Character, Integer> freq = new TreeMap<>();\n        for (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);\n        for (var e : freq.entrySet()) System.out.println(e.getKey() + " " + e.getValue());\n    }\n}`,
      cpp: `#include <iostream>\n#include <map>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    map<char,int> freq;\n    for (char c : s) freq[c]++;\n    for (auto& [c, n] : freq) cout << c << " " << n << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconst freq = {};\nfor (const c of s) freq[c] = (freq[c] || 0) + 1;\nfor (const c of Object.keys(freq).sort()) console.log(c + ' ' + freq[c]);`,
    },
    testCases: [
      { input: "hello", expectedOutput: "e 1\nh 1\nl 2\no 1", isSample: true },
      { input: "aab", expectedOutput: "a 2\nb 1", isSample: true },
      { input: "programming", expectedOutput: "a 1\ng 2\ni 1\nm 2\nn 1\no 1\np 1\nr 2", isSample: false },
    ],
  },
  {
    slug: "caesar-cipher",
    title: "Caesar Cipher",
    statement: `Encrypt a string using Caesar cipher with a given shift value. Only shift lowercase English letters; leave other characters unchanged. Wrap around after 'z'.\n\n**Input:** Line 1: the string. Line 2: the shift value (integer).\n**Output:** The encrypted string.`,
    difficulty: "MEDIUM", topics: ["strings", "math"], hints: ["For each letter: (char - 'a' + shift) % 26 + 'a'"],
    editorial: "For each lowercase letter, shift by k positions with wrap-around using modulo 26.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 45,
    starterCode: {
      python: `s = input()\nk = int(input())\nresult = []\nfor c in s:\n    if c.islower():\n        result.append(chr((ord(c) - ord('a') + k) % 26 + ord('a')))\n    else:\n        result.append(c)\nprint(''.join(result))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        int k = sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (char c : s.toCharArray()) {\n            if (c >= 'a' && c <= 'z') sb.append((char)((c - 'a' + k) % 26 + 'a'));\n            else sb.append(c);\n        }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    string s; getline(cin, s);\n    int k; cin >> k;\n    for (auto& c : s) if (c >= 'a' && c <= 'z') c = (c - 'a' + k) % 26 + 'a';\n    cout << s << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst s = lines[0], k = parseInt(lines[1]);\nconsole.log([...s].map(c => c >= 'a' && c <= 'z' ? String.fromCharCode((c.charCodeAt(0) - 97 + k) % 26 + 97) : c).join(''));`,
    },
    testCases: [
      { input: "abc\n3", expectedOutput: "def", isSample: true },
      { input: "xyz\n2", expectedOutput: "zab", isSample: true, explanation: "x→z, y→a, z→b (wraps)" },
      { input: "hello\n1", expectedOutput: "ifmmp", isSample: false },
      { input: "abc\n26", expectedOutput: "abc", isSample: false },
    ],
  },
  {
    slug: "valid-anagram",
    title: "Valid Anagram",
    statement: `Given two strings, determine if they are anagrams of each other (contain the same characters with the same frequencies).\n\n**Input:** Two strings on separate lines (lowercase only).\n**Output:** \`Yes\` or \`No\`.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing"], hints: ["Sort both strings and compare.", "Or use character frequency counts."],
    editorial: "Sort both strings and check equality. Or compare frequency maps.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 46,
    starterCode: {
      python: `s1 = input().strip()\ns2 = input().strip()\nprint("Yes" if sorted(s1) == sorted(s2) else "No")`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        char[] a = sc.nextLine().toCharArray(), b = sc.nextLine().toCharArray();\n        Arrays.sort(a); Arrays.sort(b);\n        System.out.println(Arrays.equals(a, b) ? "Yes" : "No");\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string a, b; cin >> a >> b;\n    sort(a.begin(), a.end()); sort(b.begin(), b.end());\n    cout << (a == b ? "Yes" : "No") << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a = [...lines[0]].sort().join(''), b = [...lines[1]].sort().join('');\nconsole.log(a === b ? "Yes" : "No");`,
    },
    testCases: [
      { input: "listen\nsilent", expectedOutput: "Yes", isSample: true },
      { input: "hello\nworld", expectedOutput: "No", isSample: true },
      { input: "anagram\nnagaram", expectedOutput: "Yes", isSample: false },
      { input: "rat\ncar", expectedOutput: "No", isSample: false },
    ],
  },
  {
    slug: "longest-common-prefix-strings",
    title: "Longest Common Prefix",
    statement: `Find the longest common prefix among an array of strings.\n\n**Input:** Line 1: integer N. Next N lines: strings.\n**Output:** The longest common prefix, or an empty line if none.`,
    difficulty: "MEDIUM", topics: ["strings"], hints: ["Compare characters position by position across all strings.", "Start with the first string as prefix and shrink it."],
    editorial: "Take the first string as prefix. For each subsequent string, shorten the prefix until it matches.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 47,
    starterCode: {
      python: `n = int(input())\nstrs = [input().strip() for _ in range(n)]\nif not strs:\n    print("")\nelse:\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: break\n    print(prefix)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine());\n        String[] strs = new String[n];\n        for (int i = 0; i < n; i++) strs[i] = sc.nextLine();\n        String prefix = strs[0];\n        for (int i = 1; i < n; i++)\n            while (!strs[i].startsWith(prefix)) prefix = prefix.substring(0, prefix.length() - 1);\n        System.out.println(prefix);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n; cin.ignore();\n    string prefix; getline(cin, prefix);\n    for (int i = 1; i < n; i++) {\n        string s; getline(cin, s);\n        while (s.find(prefix) != 0) prefix = prefix.substr(0, prefix.size() - 1);\n    }\n    cout << prefix << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\nlet prefix = lines[1];\nfor (let i = 2; i <= n; i++) while (!lines[i].startsWith(prefix)) prefix = prefix.slice(0, -1);\nconsole.log(prefix);`,
    },
    testCases: [
      { input: "3\nflower\nflow\nflight", expectedOutput: "fl", isSample: true },
      { input: "3\ndog\nracecar\ncar", expectedOutput: "", isSample: true },
      { input: "2\nabc\nabc", expectedOutput: "abc", isSample: false },
      { input: "3\ninter\ninterface\ninternet", expectedOutput: "inter", isSample: false },
    ],
  },
  {
    slug: "string-compression",
    title: "String Compression (Run-Length Encoding)",
    statement: `Compress a string using run-length encoding. Replace consecutive repeated characters with the character followed by the count. If the count is 1, just write the character.\n\nExample: \`aaabbc\` → \`a3b2c\`\n\n**Input:** A single string.\n**Output:** The compressed string.`,
    difficulty: "MEDIUM", topics: ["strings"], hints: ["Track current char and count. When char changes, append to result."],
    editorial: "Iterate through the string, count consecutive chars, append char+count to result.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 48,
    starterCode: {
      python: `s = input().strip()\nif not s:\n    print("")\nelse:\n    result = []\n    count = 1\n    for i in range(1, len(s)):\n        if s[i] == s[i-1]:\n            count += 1\n        else:\n            result.append(s[i-1] + (str(count) if count > 1 else ""))\n            count = 1\n    result.append(s[-1] + (str(count) if count > 1 else ""))\n    print("".join(result))`,
      java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        StringBuilder sb = new StringBuilder();\n        int count = 1;\n        for (int i = 1; i < s.length(); i++) {\n            if (s.charAt(i) == s.charAt(i-1)) count++;\n            else { sb.append(s.charAt(i-1)); if (count > 1) sb.append(count); count = 1; }\n        }\n        sb.append(s.charAt(s.length()-1)); if (count > 1) sb.append(count);\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    string result;\n    int count = 1;\n    for (int i = 1; i < (int)s.size(); i++) {\n        if (s[i] == s[i-1]) count++;\n        else { result += s[i-1]; if (count > 1) result += to_string(count); count = 1; }\n    }\n    result += s.back(); if (count > 1) result += to_string(count);\n    cout << result << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nlet result = '', count = 1;\nfor (let i = 1; i < s.length; i++) {\n    if (s[i] === s[i-1]) count++;\n    else { result += s[i-1] + (count > 1 ? count : ''); count = 1; }\n}\nresult += s[s.length-1] + (count > 1 ? count : '');\nconsole.log(result);`,
    },
    testCases: [
      { input: "aaabbc", expectedOutput: "a3b2c", isSample: true },
      { input: "abc", expectedOutput: "abc", isSample: true, explanation: "No compression needed" },
      { input: "aaaaaa", expectedOutput: "a6", isSample: false },
      { input: "aabbbcccc", expectedOutput: "a2b3c4", isSample: false },
    ],
  },
  {
    slug: "first-unique-character",
    title: "First Unique Character",
    statement: `Find the first non-repeating character in a string and print its **index** (0-based). If no unique character exists, print \`-1\`.\n\n**Input:** A single string (lowercase).\n**Output:** Index of first unique character, or -1.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing"], hints: ["Count frequencies first, then find the first char with count 1."],
    editorial: "Build frequency map. Then iterate again to find first char with frequency 1.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 49,
    starterCode: {
      python: `s = input().strip()\nfreq = {}\nfor c in s:\n    freq[c] = freq.get(c, 0) + 1\nfor i, c in enumerate(s):\n    if freq[c] == 1:\n        print(i)\n        break\nelse:\n    print(-1)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        int[] freq = new int[26];\n        for (char c : s.toCharArray()) freq[c - 'a']++;\n        for (int i = 0; i < s.length(); i++) if (freq[s.charAt(i) - 'a'] == 1) { System.out.println(i); return; }\n        System.out.println(-1);\n    }\n}`,
      cpp: `#include <iostream>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    unordered_map<char,int> freq;\n    for (char c : s) freq[c]++;\n    for (int i = 0; i < (int)s.size(); i++) if (freq[s[i]] == 1) { cout << i << endl; return 0; }\n    cout << -1 << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconst freq = {};\nfor (const c of s) freq[c] = (freq[c] || 0) + 1;\nlet result = -1;\nfor (let i = 0; i < s.length; i++) if (freq[s[i]] === 1) { result = i; break; }\nconsole.log(result);`,
    },
    testCases: [
      { input: "leetcode", expectedOutput: "0", isSample: true, explanation: "'l' appears once, index 0" },
      { input: "aabb", expectedOutput: "-1", isSample: true },
      { input: "loveleetcode", expectedOutput: "2", isSample: false },
      { input: "a", expectedOutput: "0", isSample: false },
    ],
  },
  {
    slug: "remove-duplicates-string",
    title: "Remove Duplicate Characters",
    statement: `Remove duplicate characters from a string, keeping only the **first occurrence** of each character. Maintain the original order.\n\n**Input:** A single string.\n**Output:** String with duplicates removed.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing"], hints: ["Use a set to track seen characters."],
    editorial: "Iterate through the string. If char not in seen set, add to result and set.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 50,
    starterCode: {
      python: `s = input().strip()\nseen = set()\nresult = []\nfor c in s:\n    if c not in seen:\n        seen.add(c)\n        result.append(c)\nprint("".join(result))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine();\n        Set<Character> seen = new LinkedHashSet<>();\n        for (char c : s.toCharArray()) seen.add(c);\n        StringBuilder sb = new StringBuilder();\n        for (char c : seen) sb.append(c);\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <unordered_set>\nusing namespace std;\nint main() {\n    string s; getline(cin, s);\n    unordered_set<char> seen;\n    string result;\n    for (char c : s) if (seen.insert(c).second) result += c;\n    cout << result << endl;\n    return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconsole.log([...new Set(s)].join(''));`,
    },
    testCases: [
      { input: "programming", expectedOutput: "progamin", isSample: true },
      { input: "hello", expectedOutput: "helo", isSample: true },
      { input: "aabbcc", expectedOutput: "abc", isSample: false },
      { input: "abcdef", expectedOutput: "abcdef", isSample: false },
    ],
  },
]


// ═══════════════════════════════════════════════════════════════════
// STAGE 6: Arrays & Lists (Problems 51–63)  EASY → MEDIUM
// ═══════════════════════════════════════════════════════════════════

const stage6: Problem[] = [
  {
    slug: "find-maximum-in-array",
    title: "Find Maximum in Array",
    statement: `Find the largest element in an array of integers.\n\n**Input:** Line 1: integer N. Line 2: N space-separated integers.\n**Output:** The maximum element.`,
    difficulty: "EASY", topics: ["arrays"], hints: ["Track the max as you iterate through the array."],
    editorial: "Initialize max with first element. Iterate and update when a larger element is found.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 51,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nprint(max(arr))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int max = Integer.MIN_VALUE;\n        for (int i = 0; i < n; i++) max = Math.max(max, sc.nextInt());\n        System.out.println(max);\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    int mx = INT_MIN;\n    for (int i = 0; i < n; i++) { int x; cin >> x; mx = max(mx, x); }\n    cout << mx << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconsole.log(Math.max(...arr));`,
    },
    testCases: [
      { input: "5\n3 7 2 9 1", expectedOutput: "9", isSample: true },
      { input: "3\n-1 -5 -2", expectedOutput: "-1", isSample: true },
      { input: "1\n42", expectedOutput: "42", isSample: false },
      { input: "4\n10 10 10 10", expectedOutput: "10", isSample: false },
    ],
  },
  {
    slug: "find-minimum-in-array",
    title: "Find Minimum in Array",
    statement: `Find the smallest element in an array of integers.\n\n**Input:** Line 1: integer N. Line 2: N space-separated integers.\n**Output:** The minimum element.`,
    difficulty: "EASY", topics: ["arrays"], hints: ["Similar to finding max, but track the minimum."],
    editorial: "Initialize min with first element. Update when smaller found.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 52,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nprint(min(arr))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int min = Integer.MAX_VALUE;\n        for (int i = 0; i < n; i++) min = Math.min(min, sc.nextInt());\n        System.out.println(min);\n    }\n}`,
      cpp: `#include <iostream>\n#include <climits>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    int mn = INT_MAX;\n    for (int i = 0; i < n; i++) { int x; cin >> x; mn = min(mn, x); }\n    cout << mn << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log(Math.min(...lines[1].split(' ').map(Number)));`,
    },
    testCases: [
      { input: "5\n3 7 2 9 1", expectedOutput: "1", isSample: true },
      { input: "3\n-1 -5 -2", expectedOutput: "-5", isSample: true },
      { input: "1\n0", expectedOutput: "0", isSample: false },
    ],
  },
  {
    slug: "linear-search",
    title: "Linear Search",
    statement: `Search for a target element in an array. Print its **index** (0-based) if found, otherwise print \`-1\`. If it appears multiple times, print the first occurrence.\n\n**Input:** Line 1: N. Line 2: N integers. Line 3: target.\n**Output:** Index or -1.`,
    difficulty: "EASY", topics: ["arrays", "searching"], hints: ["Iterate through the array and compare each element with target."],
    editorial: "Simple loop: if arr[i] == target, return i.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 53,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\ntarget = int(input())\nresult = -1\nfor i in range(n):\n    if arr[i] == target:\n        result = i\n        break\nprint(result)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int result = -1;\n        for (int i = 0; i < n; i++) if (arr[i] == target) { result = i; break; }\n        System.out.println(result);\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    int arr[n]; for (int i=0;i<n;i++) cin >> arr[i];\n    int t; cin >> t;\n    int result = -1;\n    for (int i=0;i<n;i++) if (arr[i]==t) { result = i; break; }\n    cout << result << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconst target = parseInt(lines[2]);\nconsole.log(arr.indexOf(target));`,
    },
    testCases: [
      { input: "5\n10 20 30 40 50\n30", expectedOutput: "2", isSample: true },
      { input: "4\n1 2 3 4\n5", expectedOutput: "-1", isSample: true },
      { input: "3\n7 7 7\n7", expectedOutput: "0", isSample: false },
      { input: "1\n42\n42", expectedOutput: "0", isSample: false },
    ],
  },
  {
    slug: "second-largest",
    title: "Second Largest Element",
    statement: `Find the second largest distinct element in an array. If no second largest exists, print \`-1\`.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Second largest or -1.`,
    difficulty: "EASY", topics: ["arrays"], hints: ["Track both largest and second largest while iterating.", "Remove duplicates first, sort, take second from end."],
    editorial: "Maintain two vars: first and second. Update as you iterate.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 54,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nunique = sorted(set(arr), reverse=True)\nprint(unique[1] if len(unique) >= 2 else -1)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        TreeSet<Integer> set = new TreeSet<>();\n        for (int i = 0; i < n; i++) set.add(sc.nextInt());\n        if (set.size() < 2) System.out.println(-1);\n        else { set.pollLast(); System.out.println(set.last()); }\n    }\n}`,
      cpp: `#include <iostream>\n#include <set>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    set<int> s;\n    for (int i=0;i<n;i++) { int x; cin >> x; s.insert(x); }\n    if (s.size() < 2) cout << -1 << endl;\n    else { auto it = s.end(); --it; --it; cout << *it << endl; }\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst unique = [...new Set(lines[1].split(' ').map(Number))].sort((a,b)=>b-a);\nconsole.log(unique.length >= 2 ? unique[1] : -1);`,
    },
    testCases: [
      { input: "5\n3 7 2 9 1", expectedOutput: "7", isSample: true },
      { input: "3\n5 5 5", expectedOutput: "-1", isSample: true },
      { input: "2\n1 2", expectedOutput: "1", isSample: false },
      { input: "4\n10 5 10 8", expectedOutput: "8", isSample: false },
    ],
  },
  {
    slug: "reverse-array",
    title: "Reverse an Array",
    statement: `Reverse an array and print the result.\n\n**Input:** Line 1: N. Line 2: N space-separated integers.\n**Output:** The reversed array, space-separated.`,
    difficulty: "EASY", topics: ["arrays"], hints: ["Use two pointers from start and end, swapping elements."],
    editorial: "Use slicing [::-1] or two-pointer swap.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 55,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nprint(" ".join(map(str, arr[::-1])))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (int i = n-1; i >= 0; i--) { if (i < n-1) sb.append(" "); sb.append(arr[i]); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n);\n    for (int i=0;i<n;i++) cin >> arr[i];\n    reverse(arr.begin(), arr.end());\n    for (int i=0;i<n;i++) { if (i) cout << " "; cout << arr[i]; }\n    cout << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconsole.log(lines[1].split(' ').reverse().join(' '));`,
    },
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5 4 3 2 1", isSample: true },
      { input: "3\n10 20 30", expectedOutput: "30 20 10", isSample: true },
      { input: "1\n7", expectedOutput: "7", isSample: false },
    ],
  },
  {
    slug: "count-occurrences",
    title: "Count Occurrences",
    statement: `Count how many times a given element appears in an array.\n\n**Input:** Line 1: N. Line 2: N integers. Line 3: target.\n**Output:** The count.`,
    difficulty: "EASY", topics: ["arrays"], hints: ["Use a counter variable in a loop."],
    editorial: "Loop through the array and count matches.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 56,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nt = int(input())\nprint(arr.count(t))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(); int count = 0;\n        int[] arr = new int[n]; for (int i=0;i<n;i++) arr[i]=sc.nextInt();\n        int t = sc.nextInt();\n        for (int x : arr) if (x == t) count++;\n        System.out.println(count);\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    int arr[n]; for (int i=0;i<n;i++) cin >> arr[i];\n    int t; cin >> t;\n    cout << count(arr, arr+n, t) << endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number), t = parseInt(lines[2]);\nconsole.log(arr.filter(x=>x===t).length);`,
    },
    testCases: [
      { input: "6\n1 2 3 2 4 2\n2", expectedOutput: "3", isSample: true },
      { input: "4\n1 1 1 1\n1", expectedOutput: "4", isSample: true },
      { input: "3\n5 6 7\n8", expectedOutput: "0", isSample: false },
    ],
  },
  {
    slug: "remove-duplicates-sorted-array",
    title: "Remove Duplicates from Sorted Array",
    statement: `Given a sorted array, remove duplicates and print only unique elements.\n\n**Input:** Line 1: N. Line 2: N sorted integers.\n**Output:** Unique elements, space-separated.`,
    difficulty: "EASY", topics: ["arrays", "two-pointers"], hints: ["Since the array is sorted, duplicates are adjacent.", "Use two-pointer technique."],
    editorial: "Since array is sorted, skip element if it equals the previous one.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 57,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nresult = []\nfor i in range(n):\n    if i == 0 or arr[i] != arr[i-1]:\n        result.append(arr[i])\nprint(" ".join(map(str, result)))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n]; for (int i=0;i<n;i++) arr[i]=sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (int i=0;i<n;i++) if (i==0||arr[i]!=arr[i-1]) { if (sb.length()>0) sb.append(" "); sb.append(arr[i]); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<int> arr(n); for(int i=0;i<n;i++) cin>>arr[i];\n    bool first=true;\n    for(int i=0;i<n;i++) if(i==0||arr[i]!=arr[i-1]) { if(!first) cout<<" "; first=false; cout<<arr[i]; }\n    cout<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconsole.log([...new Set(arr)].join(' '));`,
    },
    testCases: [
      { input: "7\n1 1 2 2 3 4 4", expectedOutput: "1 2 3 4", isSample: true },
      { input: "5\n1 2 3 4 5", expectedOutput: "1 2 3 4 5", isSample: true },
      { input: "3\n5 5 5", expectedOutput: "5", isSample: false },
    ],
  },
  {
    slug: "move-zeroes",
    title: "Move Zeroes to End",
    statement: `Move all zeroes in an array to the end while maintaining the relative order of non-zero elements.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** The rearranged array, space-separated.`,
    difficulty: "MEDIUM", topics: ["arrays", "two-pointers"], hints: ["Use a write pointer for non-zero elements.", "First place all non-zero elements, then fill remaining with zeros."],
    editorial: "Two-pointer: maintain a position for the next non-zero. Iterate and swap non-zeros to the front.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 58,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nresult = [x for x in arr if x != 0]\nresult.extend([0] * (n - len(result)))\nprint(" ".join(map(str, result)))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n]; for(int i=0;i<n;i++) arr[i]=sc.nextInt();\n        int pos = 0;\n        for(int i=0;i<n;i++) if(arr[i]!=0) arr[pos++]=arr[i];\n        while(pos<n) arr[pos++]=0;\n        StringBuilder sb = new StringBuilder();\n        for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(arr[i]); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    vector<int> arr(n); for(int i=0;i<n;i++) cin>>arr[i];\n    int pos=0;\n    for(int i=0;i<n;i++) if(arr[i]!=0) arr[pos++]=arr[i];\n    while(pos<n) arr[pos++]=0;\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<arr[i]; }\n    cout<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconst nonZero = arr.filter(x=>x!==0);\nconsole.log([...nonZero, ...Array(arr.length-nonZero.length).fill(0)].join(' '));`,
    },
    testCases: [
      { input: "5\n0 1 0 3 12", expectedOutput: "1 3 12 0 0", isSample: true },
      { input: "4\n1 2 3 4", expectedOutput: "1 2 3 4", isSample: true },
      { input: "3\n0 0 0", expectedOutput: "0 0 0", isSample: false },
      { input: "6\n5 0 0 3 0 1", expectedOutput: "5 3 1 0 0 0", isSample: false },
    ],
  },
  {
    slug: "rotate-array-k",
    title: "Rotate Array by K Positions",
    statement: `Rotate an array to the right by K positions.\n\nExample: [1,2,3,4,5] rotated by 2 → [4,5,1,2,3]\n\n**Input:** Line 1: N and K (space-separated). Line 2: N integers.\n**Output:** The rotated array, space-separated.`,
    difficulty: "MEDIUM", topics: ["arrays"], hints: ["K can be larger than N, so use K % N.", "Take last K elements and prepend them."],
    editorial: "Effective rotation = K % N. Take arr[N-K:] + arr[:N-K].", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 59,
    starterCode: {
      python: `n, k = map(int, input().split())\narr = list(map(int, input().split()))\nk = k % n\nresult = arr[-k:] + arr[:-k] if k > 0 else arr\nprint(" ".join(map(str, result)))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), k = sc.nextInt() % n;\n        int[] arr = new int[n]; for(int i=0;i<n;i++) arr[i]=sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(arr[(i-k+n)%n]); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n,k; cin>>n>>k; k%=n;\n    vector<int> arr(n); for(int i=0;i<n;i++) cin>>arr[i];\n    rotate(arr.begin(), arr.begin()+n-k, arr.end());\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<arr[i]; }\n    cout<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [n,k_] = lines[0].split(' ').map(Number);\nconst arr = lines[1].split(' ').map(Number);\nconst k = k_ % n;\nconsole.log([...arr.slice(-k), ...arr.slice(0,-k)].join(' '));`,
    },
    testCases: [
      { input: "5 2\n1 2 3 4 5", expectedOutput: "4 5 1 2 3", isSample: true },
      { input: "4 1\n10 20 30 40", expectedOutput: "40 10 20 30", isSample: true },
      { input: "3 3\n1 2 3", expectedOutput: "1 2 3", isSample: false },
      { input: "5 7\n1 2 3 4 5", expectedOutput: "4 5 1 2 3", isSample: false },
    ],
  },
  {
    slug: "two-sum",
    title: "Two Sum",
    statement: `Given an array and a target sum, find two numbers that add up to the target. Print their **indices** (0-based) in ascending order.\n\nAssume exactly one solution exists.\n\n**Input:** Line 1: N. Line 2: N integers. Line 3: target.\n**Output:** Two space-separated indices.`,
    difficulty: "MEDIUM", topics: ["arrays", "hashing"], hints: ["Use a hash map to store values and their indices.", "For each number, check if (target - number) exists in the map."],
    editorial: "HashMap approach: for each element, check if (target - element) exists. O(n) time.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 60,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\ntarget = int(input())\nseen = {}\nfor i, num in enumerate(arr):\n    complement = target - num\n    if complement in seen:\n        print(seen[complement], i)\n        break\n    seen[num] = i`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n]; for(int i=0;i<n;i++) arr[i]=sc.nextInt();\n        int target = sc.nextInt();\n        Map<Integer,Integer> map = new HashMap<>();\n        for(int i=0;i<n;i++) {\n            int comp = target - arr[i];\n            if(map.containsKey(comp)) { System.out.println(map.get(comp)+" "+i); return; }\n            map.put(arr[i], i);\n        }\n    }\n}`,
      cpp: `#include <iostream>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    int arr[n]; for(int i=0;i<n;i++) cin>>arr[i];\n    int target; cin>>target;\n    unordered_map<int,int> m;\n    for(int i=0;i<n;i++) {\n        if(m.count(target-arr[i])) { cout<<m[target-arr[i]]<<" "<<i<<endl; return 0; }\n        m[arr[i]]=i;\n    }\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number), target = parseInt(lines[2]);\nconst map = new Map();\nfor(let i=0;i<arr.length;i++) {\n    if(map.has(target-arr[i])) { console.log(map.get(target-arr[i])+' '+i); break; }\n    map.set(arr[i], i);\n}`,
    },
    testCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isSample: true, explanation: "2+7=9" },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isSample: true },
      { input: "2\n3 3\n6", expectedOutput: "0 1", isSample: false },
      { input: "5\n1 5 3 7 2\n10", expectedOutput: "1 3", isSample: false },
    ],
  },
  {
    slug: "merge-sorted-arrays",
    title: "Merge Two Sorted Arrays",
    statement: `Merge two sorted arrays into one sorted array.\n\n**Input:** Line 1: N M. Line 2: N sorted integers. Line 3: M sorted integers.\n**Output:** The merged sorted array, space-separated.`,
    difficulty: "MEDIUM", topics: ["arrays", "two-pointers"], hints: ["Use two pointers, one for each array.", "Compare elements and pick the smaller one."],
    editorial: "Two-pointer merge: compare front elements of both arrays, pick smaller.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 61,
    starterCode: {
      python: `n, m = map(int, input().split())\na = list(map(int, input().split()))\nb = list(map(int, input().split()))\ni = j = 0\nresult = []\nwhile i < n and j < m:\n    if a[i] <= b[j]:\n        result.append(a[i]); i += 1\n    else:\n        result.append(b[j]); j += 1\nresult.extend(a[i:])\nresult.extend(b[j:])\nprint(" ".join(map(str, result)))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n=sc.nextInt(),m=sc.nextInt();\n        int[] a=new int[n],b=new int[m];\n        for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        for(int i=0;i<m;i++) b[i]=sc.nextInt();\n        int i=0,j=0;\n        StringBuilder sb=new StringBuilder();\n        while(i<n&&j<m) { if(a[i]<=b[j]) { if(sb.length()>0)sb.append(" "); sb.append(a[i++]); } else { if(sb.length()>0)sb.append(" "); sb.append(b[j++]); } }\n        while(i<n) { sb.append(" ").append(a[i++]); }\n        while(j<m) { sb.append(" ").append(b[j++]); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n,m; cin>>n>>m;\n    vector<int> a(n),b(m);\n    for(int i=0;i<n;i++) cin>>a[i];\n    for(int i=0;i<m;i++) cin>>b[i];\n    int i=0,j=0; bool first=true;\n    while(i<n&&j<m) { if(!first)cout<<" "; first=false; if(a[i]<=b[j])cout<<a[i++]; else cout<<b[j++]; }\n    while(i<n) { cout<<" "<<a[i++]; }\n    while(j<m) { cout<<" "<<b[j++]; }\n    cout<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a = lines[1].split(' ').map(Number), b = lines[2].split(' ').map(Number);\nconst result = []; let i=0,j=0;\nwhile(i<a.length&&j<b.length) { if(a[i]<=b[j]) result.push(a[i++]); else result.push(b[j++]); }\nwhile(i<a.length) result.push(a[i++]);\nwhile(j<b.length) result.push(b[j++]);\nconsole.log(result.join(' '));`,
    },
    testCases: [
      { input: "3 3\n1 3 5\n2 4 6", expectedOutput: "1 2 3 4 5 6", isSample: true },
      { input: "2 3\n1 2\n3 4 5", expectedOutput: "1 2 3 4 5", isSample: true },
      { input: "1 1\n5\n3", expectedOutput: "3 5", isSample: false },
    ],
  },
  {
    slug: "maximum-subarray-sum",
    title: "Maximum Subarray Sum (Kadane's)",
    statement: `Find the contiguous subarray with the largest sum.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** The maximum subarray sum.`,
    difficulty: "MEDIUM", topics: ["arrays", "dynamic-programming"], hints: ["Kadane's Algorithm: track current sum and max sum.", "Reset current sum to 0 if it goes negative."],
    editorial: "Kadane's: currentMax = max(num, currentMax + num), globalMax = max(globalMax, currentMax).", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 62,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\ncurrent_max = global_max = arr[0]\nfor i in range(1, n):\n    current_max = max(arr[i], current_max + arr[i])\n    global_max = max(global_max, current_max)\nprint(global_max)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int curr = sc.nextInt(), best = curr;\n        for(int i=1;i<n;i++) { int x=sc.nextInt(); curr=Math.max(x,curr+x); best=Math.max(best,curr); }\n        System.out.println(best);\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    int x; cin>>x;\n    int curr=x, best=x;\n    for(int i=1;i<n;i++) { cin>>x; curr=max(x,curr+x); best=max(best,curr); }\n    cout<<best<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nlet curr=arr[0], best=arr[0];\nfor(let i=1;i<arr.length;i++) { curr=Math.max(arr[i],curr+arr[i]); best=Math.max(best,curr); }\nconsole.log(best);`,
    },
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isSample: true, explanation: "[4,-1,2,1] = 6" },
      { input: "5\n1 2 3 4 5", expectedOutput: "15", isSample: true },
      { input: "3\n-1 -2 -3", expectedOutput: "-1", isSample: false },
      { input: "1\n5", expectedOutput: "5", isSample: false },
    ],
  },
  {
    slug: "plus-one-array",
    title: "Plus One",
    statement: `Given a non-negative integer represented as an array of digits, add one to the number.\n\nThe most significant digit is at the head of the array.\n\n**Input:** Line 1: N. Line 2: N digits.\n**Output:** The resulting digits, space-separated.`,
    difficulty: "MEDIUM", topics: ["arrays", "math"], hints: ["Start from the last digit, handle carry.", "Watch for 999...9 → 1000...0."],
    editorial: "Iterate from last digit. Add carry. If digit becomes 10, set to 0, carry=1. If carry remains after loop, prepend 1.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 63,
    starterCode: {
      python: `n = int(input())\ndigits = list(map(int, input().split()))\ncarry = 1\nfor i in range(n-1, -1, -1):\n    digits[i] += carry\n    if digits[i] >= 10:\n        digits[i] = 0\n        carry = 1\n    else:\n        carry = 0\n        break\nif carry:\n    digits.insert(0, 1)\nprint(" ".join(map(str, digits)))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] d = new int[n]; for(int i=0;i<n;i++) d[i]=sc.nextInt();\n        int carry = 1;\n        for(int i=n-1;i>=0&&carry>0;i--) { d[i]+=carry; carry=d[i]/10; d[i]%=10; }\n        StringBuilder sb = new StringBuilder();\n        if(carry>0) sb.append("1 ");\n        for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(d[i]); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    vector<int> d(n); for(int i=0;i<n;i++) cin>>d[i];\n    int carry=1;\n    for(int i=n-1;i>=0&&carry;i--) { d[i]+=carry; carry=d[i]/10; d[i]%=10; }\n    if(carry) cout<<"1 ";\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<d[i]; }\n    cout<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst d = lines[1].split(' ').map(Number);\nlet carry=1;\nfor(let i=d.length-1;i>=0&&carry;i--) { d[i]+=carry; carry=Math.floor(d[i]/10); d[i]%=10; }\nif(carry) d.unshift(1);\nconsole.log(d.join(' '));`,
    },
    testCases: [
      { input: "3\n1 2 3", expectedOutput: "1 2 4", isSample: true },
      { input: "3\n9 9 9", expectedOutput: "1 0 0 0", isSample: true, explanation: "999+1=1000" },
      { input: "1\n0", expectedOutput: "1", isSample: false },
      { input: "2\n2 9", expectedOutput: "3 0", isSample: false },
    ],
  },
]


// ═══════════════════════════════════════════════════════════════════
// STAGE 7: Hashing & Dictionaries (Problems 64–71)  MEDIUM
// ═══════════════════════════════════════════════════════════════════

const stage7: Problem[] = [
  {
    slug: "frequency-counter",
    title: "Frequency Counter",
    statement: `Count the frequency of each element in an array. Print each unique element and its count, sorted by element value.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Lines of \`element count\`, sorted by element.`,
    difficulty: "MEDIUM", topics: ["arrays", "hashing"], hints: ["Use a dictionary/map."],
    editorial: "Build a frequency map, sort keys, print.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 64,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nfreq = {}\nfor x in arr:\n    freq[x] = freq.get(x, 0) + 1\nfor k in sorted(freq):\n    print(k, freq[k])`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        TreeMap<Integer,Integer> freq = new TreeMap<>();\n        for(int i=0;i<n;i++) freq.merge(sc.nextInt(),1,Integer::sum);\n        for(var e:freq.entrySet()) System.out.println(e.getKey()+" "+e.getValue());\n    }\n}`,
      cpp: `#include <iostream>\n#include <map>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    map<int,int> freq;\n    for(int i=0;i<n;i++) { int x; cin>>x; freq[x]++; }\n    for(auto& [k,v]:freq) cout<<k<<" "<<v<<endl;\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconst freq = {};\nfor(const x of arr) freq[x]=(freq[x]||0)+1;\nfor(const k of Object.keys(freq).map(Number).sort((a,b)=>a-b)) console.log(k+' '+freq[k]);`,
    },
    testCases: [
      { input: "7\n1 2 2 3 3 3 1", expectedOutput: "1 2\n2 2\n3 3", isSample: true },
      { input: "4\n5 5 5 5", expectedOutput: "5 4", isSample: true },
      { input: "5\n3 1 4 1 5", expectedOutput: "1 2\n3 1\n4 1\n5 1", isSample: false },
    ],
  },
  {
    slug: "first-non-repeating-array",
    title: "First Non-Repeating Element",
    statement: `Find the first element that appears exactly once in the array. Print it, or \`-1\` if none.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** The element or -1.`,
    difficulty: "MEDIUM", topics: ["arrays", "hashing"], hints: ["Count frequencies, then find first with count 1."],
    editorial: "Build frequency map. Iterate original array again, return first element with freq=1.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 65,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\nfreq = {}\nfor x in arr: freq[x] = freq.get(x, 0) + 1\nresult = -1\nfor x in arr:\n    if freq[x] == 1: result = x; break\nprint(result)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n]; for(int i=0;i<n;i++) arr[i]=sc.nextInt();\n        Map<Integer,Integer> freq = new LinkedHashMap<>();\n        for(int x:arr) freq.merge(x,1,Integer::sum);\n        int result = -1;\n        for(int x:arr) if(freq.get(x)==1) { result=x; break; }\n        System.out.println(result);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    vector<int> arr(n); for(int i=0;i<n;i++) cin>>arr[i];\n    unordered_map<int,int> freq;\n    for(int x:arr) freq[x]++;\n    int result=-1;\n    for(int x:arr) if(freq[x]==1) { result=x; break; }\n    cout<<result<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconst freq = {};\nfor(const x of arr) freq[x]=(freq[x]||0)+1;\nconst result = arr.find(x=>freq[x]===1);\nconsole.log(result !== undefined ? result : -1);`,
    },
    testCases: [
      { input: "7\n1 2 3 2 1 4 3", expectedOutput: "4", isSample: true },
      { input: "4\n1 1 2 2", expectedOutput: "-1", isSample: true },
      { input: "5\n5 4 3 2 1", expectedOutput: "5", isSample: false },
    ],
  },
  {
    slug: "group-anagrams",
    title: "Group Anagrams",
    statement: `Group strings that are anagrams of each other. Print each group on a line (sorted within group), groups sorted by their first element.\n\n**Input:** Line 1: N. Next N lines: strings.\n**Output:** Groups on separate lines, words space-separated.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing"], hints: ["Sort each string to get a key. Group by this key."],
    editorial: "For each string, sort its characters to create a canonical key. Group strings by this key.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 66,
    starterCode: {
      python: `from collections import defaultdict\nn = int(input())\ngroups = defaultdict(list)\nfor _ in range(n):\n    s = input().strip()\n    key = "".join(sorted(s))\n    groups[key].append(s)\nfor key in sorted(groups, key=lambda k: groups[k][0]):\n    print(" ".join(sorted(groups[key])))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine());\n        Map<String,List<String>> groups = new TreeMap<>();\n        for(int i=0;i<n;i++) {\n            String s = sc.nextLine();\n            char[] ch = s.toCharArray(); Arrays.sort(ch);\n            String key = new String(ch);\n            groups.computeIfAbsent(key, k->new ArrayList<>()).add(s);\n        }\n        for(var g:groups.values()) { Collections.sort(g); System.out.println(String.join(" ",g)); }\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <map>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin>>n; cin.ignore();\n    map<string,vector<string>> groups;\n    for(int i=0;i<n;i++) { string s; getline(cin,s); string key=s; sort(key.begin(),key.end()); groups[key].push_back(s); }\n    for(auto& [k,v]:groups) { sort(v.begin(),v.end()); for(int i=0;i<(int)v.size();i++) { if(i) cout<<" "; cout<<v[i]; } cout<<endl; }\n    return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n = parseInt(lines[0]);\nconst groups = {};\nfor(let i=1;i<=n;i++) { const s=lines[i]; const k=[...s].sort().join(''); (groups[k]=groups[k]||[]).push(s); }\nfor(const k of Object.keys(groups).sort()) console.log(groups[k].sort().join(' '));`,
    },
    testCases: [
      { input: "6\neat\ntea\ntan\nate\nnat\nbat", expectedOutput: "ate eat tea\nbat\nnat tan", isSample: true },
      { input: "3\nabc\nbca\ncab", expectedOutput: "abc bca cab", isSample: false },
    ],
  },
  {
    slug: "subarray-sum-equals-k",
    title: "Subarray Sum Equals K",
    statement: `Count the number of contiguous subarrays whose sum equals K.\n\n**Input:** Line 1: N K. Line 2: N integers.\n**Output:** The count of subarrays.`,
    difficulty: "MEDIUM", topics: ["arrays", "hashing"], hints: ["Use prefix sum with a hash map.", "If prefixSum[j] - prefixSum[i] = K, then subarray [i+1..j] sums to K."],
    editorial: "Prefix sum + hashmap: store count of each prefix sum. For each new prefix sum, check if (prefixSum - K) exists.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 67,
    starterCode: {
      python: `n, k = map(int, input().split())\narr = list(map(int, input().split()))\nprefix_counts = {0: 1}\nprefix_sum = 0\ncount = 0\nfor x in arr:\n    prefix_sum += x\n    count += prefix_counts.get(prefix_sum - k, 0)\n    prefix_counts[prefix_sum] = prefix_counts.get(prefix_sum, 0) + 1\nprint(count)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n=sc.nextInt(),k=sc.nextInt();\n        Map<Integer,Integer> map = new HashMap<>(); map.put(0,1);\n        int sum=0,count=0;\n        for(int i=0;i<n;i++) { sum+=sc.nextInt(); count+=map.getOrDefault(sum-k,0); map.merge(sum,1,Integer::sum); }\n        System.out.println(count);\n    }\n}`,
      cpp: `#include <iostream>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n,k; cin>>n>>k;\n    unordered_map<int,int> m; m[0]=1;\n    int sum=0,count=0;\n    for(int i=0;i<n;i++) { int x; cin>>x; sum+=x; count+=m[sum-k]; m[sum]++; }\n    cout<<count<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [n,k] = lines[0].split(' ').map(Number);\nconst arr = lines[1].split(' ').map(Number);\nconst map = new Map([[0,1]]); let sum=0,count=0;\nfor(const x of arr) { sum+=x; count+=(map.get(sum-k)||0); map.set(sum,(map.get(sum)||0)+1); }\nconsole.log(count);`,
    },
    testCases: [
      { input: "5 3\n1 1 1 2 3", expectedOutput: "3", isSample: true },
      { input: "3 7\n3 4 7", expectedOutput: "2", isSample: true },
      { input: "1 0\n0", expectedOutput: "1", isSample: false },
      { input: "5 5\n1 2 3 4 5", expectedOutput: "2", isSample: false },
    ],
  },
  {
    slug: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    statement: `Given an unsorted array of integers, find the length of the longest consecutive elements sequence.\n\nExample: [100, 4, 200, 1, 3, 2] → longest consecutive is [1,2,3,4] → length 4\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Length of longest consecutive sequence.`,
    difficulty: "MEDIUM", topics: ["arrays", "hashing"], hints: ["Put all elements in a set.", "For each element, if (element-1) is NOT in set, it's a sequence start. Count forward."],
    editorial: "HashSet approach: only start counting from sequence beginnings (num-1 not in set).", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 68,
    starterCode: {
      python: `n = int(input())\narr = list(map(int, input().split()))\ns = set(arr)\nbest = 0\nfor x in s:\n    if x - 1 not in s:\n        length = 1\n        while x + length in s:\n            length += 1\n        best = max(best, length)\nprint(best)`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        Set<Integer> set = new HashSet<>();\n        for(int i=0;i<n;i++) set.add(sc.nextInt());\n        int best=0;\n        for(int x:set) if(!set.contains(x-1)) { int len=1; while(set.contains(x+len)) len++; best=Math.max(best,len); }\n        System.out.println(best);\n    }\n}`,
      cpp: `#include <iostream>\n#include <unordered_set>\nusing namespace std;\nint main() {\n    int n; cin>>n;\n    unordered_set<int> s;\n    for(int i=0;i<n;i++) { int x; cin>>x; s.insert(x); }\n    int best=0;\n    for(int x:s) if(!s.count(x-1)) { int len=1; while(s.count(x+len)) len++; best=max(best,len); }\n    cout<<best<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst arr = lines[1].split(' ').map(Number);\nconst s = new Set(arr); let best=0;\nfor(const x of s) if(!s.has(x-1)) { let len=1; while(s.has(x+len)) len++; best=Math.max(best,len); }\nconsole.log(best);`,
    },
    testCases: [
      { input: "6\n100 4 200 1 3 2", expectedOutput: "4", isSample: true, explanation: "[1,2,3,4]" },
      { input: "5\n5 4 3 2 1", expectedOutput: "5", isSample: true },
      { input: "4\n10 20 30 40", expectedOutput: "1", isSample: false },
      { input: "6\n1 2 3 5 6 7", expectedOutput: "3", isSample: false },
    ],
  },
  {
    slug: "isomorphic-strings",
    title: "Isomorphic Strings",
    statement: `Two strings are isomorphic if there is a one-to-one mapping between characters of the first string to the second.\n\nExample: "egg" and "add" are isomorphic (e→a, g→d).\n\n**Input:** Two strings on separate lines.\n**Output:** \`Yes\` or \`No\`.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing"], hints: ["Build two maps: s→t and t→s. Check consistency."],
    editorial: "Maintain forward and backward mapping. If any conflict, not isomorphic.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 69,
    starterCode: {
      python: `s = input().strip()\nt = input().strip()\nif len(s) != len(t): print("No")\nelse:\n    s2t, t2s = {}, {}\n    iso = True\n    for a, b in zip(s, t):\n        if a in s2t and s2t[a] != b: iso = False; break\n        if b in t2s and t2s[b] != a: iso = False; break\n        s2t[a] = b; t2s[b] = a\n    print("Yes" if iso else "No")`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine(), t = sc.nextLine();\n        if(s.length()!=t.length()) { System.out.println("No"); return; }\n        Map<Character,Character> s2t=new HashMap<>(), t2s=new HashMap<>();\n        boolean iso=true;\n        for(int i=0;i<s.length()&&iso;i++) {\n            char a=s.charAt(i), b=t.charAt(i);\n            if(s2t.containsKey(a)&&s2t.get(a)!=b) iso=false;\n            if(t2s.containsKey(b)&&t2s.get(b)!=a) iso=false;\n            s2t.put(a,b); t2s.put(b,a);\n        }\n        System.out.println(iso?"Yes":"No");\n    }\n}`,
      cpp: `#include <iostream>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string s,t; cin>>s>>t;\n    if(s.size()!=t.size()) { cout<<"No"<<endl; return 0; }\n    unordered_map<char,char> s2t,t2s;\n    bool iso=true;\n    for(int i=0;i<(int)s.size()&&iso;i++) {\n        if(s2t.count(s[i])&&s2t[s[i]]!=t[i]) iso=false;\n        if(t2s.count(t[i])&&t2s[t[i]]!=s[i]) iso=false;\n        s2t[s[i]]=t[i]; t2s[t[i]]=s[i];\n    }\n    cout<<(iso?"Yes":"No")<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [s,t] = lines;\nif(s.length!==t.length) { console.log("No"); } else {\n    const s2t={}, t2s={}; let iso=true;\n    for(let i=0;i<s.length&&iso;i++) {\n        if(s2t[s[i]]&&s2t[s[i]]!==t[i]) iso=false;\n        if(t2s[t[i]]&&t2s[t[i]]!==s[i]) iso=false;\n        s2t[s[i]]=t[i]; t2s[t[i]]=s[i];\n    }\n    console.log(iso?"Yes":"No");\n}`,
    },
    testCases: [
      { input: "egg\nadd", expectedOutput: "Yes", isSample: true },
      { input: "foo\nbar", expectedOutput: "No", isSample: true },
      { input: "paper\ntitle", expectedOutput: "Yes", isSample: false },
      { input: "ab\naa", expectedOutput: "No", isSample: false },
    ],
  },
  {
    slug: "top-k-frequent",
    title: "Top K Frequent Elements",
    statement: `Find the K most frequent elements in an array. Print them sorted by frequency (highest first), then by value if tied.\n\n**Input:** Line 1: N K. Line 2: N integers.\n**Output:** K most frequent elements, space-separated.`,
    difficulty: "MEDIUM", topics: ["arrays", "hashing", "sorting"], hints: ["Count frequencies, then sort by frequency descending."],
    editorial: "Build frequency map, sort by frequency descending, take top K.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 70,
    starterCode: {
      python: `n, k = map(int, input().split())\narr = list(map(int, input().split()))\nfrom collections import Counter\nfreq = Counter(arr)\ntop = sorted(freq.keys(), key=lambda x: (-freq[x], x))\nprint(" ".join(map(str, top[:k])))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n=sc.nextInt(),k=sc.nextInt();\n        Map<Integer,Integer> freq = new HashMap<>();\n        for(int i=0;i<n;i++) freq.merge(sc.nextInt(),1,Integer::sum);\n        List<Integer> keys = new ArrayList<>(freq.keySet());\n        keys.sort((a,b)->freq.get(a).equals(freq.get(b))?a-b:freq.get(b)-freq.get(a));\n        StringBuilder sb = new StringBuilder();\n        for(int i=0;i<k;i++) { if(i>0) sb.append(" "); sb.append(keys.get(i)); }\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n,k; cin>>n>>k;\n    unordered_map<int,int> freq;\n    for(int i=0;i<n;i++) { int x; cin>>x; freq[x]++; }\n    vector<pair<int,int>> v;\n    for(auto& [key,cnt]:freq) v.push_back({key,cnt});\n    sort(v.begin(),v.end(),[](auto& a,auto& b){ return a.second!=b.second?a.second>b.second:a.first<b.first; });\n    for(int i=0;i<k;i++) { if(i) cout<<" "; cout<<v[i].first; }\n    cout<<endl; return 0;\n}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [n,k] = lines[0].split(' ').map(Number);\nconst arr = lines[1].split(' ').map(Number);\nconst freq = {};\nfor(const x of arr) freq[x]=(freq[x]||0)+1;\nconst sorted_ = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]||a-b);\nconsole.log(sorted_.slice(0,k).join(' '));`,
    },
    testCases: [
      { input: "6 2\n1 1 1 2 2 3", expectedOutput: "1 2", isSample: true },
      { input: "4 1\n4 4 4 4", expectedOutput: "4", isSample: true },
      { input: "7 3\n1 2 2 3 3 3 4", expectedOutput: "3 2 1", isSample: false },
    ],
  },
  {
    slug: "sort-characters-by-frequency",
    title: "Sort Characters by Frequency",
    statement: `Sort a string's characters by their frequency in descending order. Characters with the same frequency should maintain their first-appearance order.\n\n**Input:** A single string.\n**Output:** The frequency-sorted string.`,
    difficulty: "MEDIUM", topics: ["strings", "hashing", "sorting"], hints: ["Count frequencies, sort characters by frequency descending."],
    editorial: "Count freq of each char. Sort by freq descending. Rebuild string.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 71,
    starterCode: {
      python: `from collections import Counter\ns = input().strip()\nfreq = Counter(s)\nresult = sorted(s, key=lambda c: -freq[c])\nprint("".join(result))`,
      java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        int[] freq = new int[128];\n        for(char c:s.toCharArray()) freq[c]++;\n        Character[] chars = new Character[s.length()];\n        for(int i=0;i<s.length();i++) chars[i]=s.charAt(i);\n        Arrays.sort(chars, (a,b)->freq[b]-freq[a]);\n        StringBuilder sb = new StringBuilder();\n        for(char c:chars) sb.append(c);\n        System.out.println(sb);\n    }\n}`,
      cpp: `#include <iostream>\n#include <algorithm>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string s; cin>>s;\n    unordered_map<char,int> freq;\n    for(char c:s) freq[c]++;\n    sort(s.begin(),s.end(),[&](char a,char b){ return freq[a]>freq[b]; });\n    cout<<s<<endl; return 0;\n}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\nconst freq = {};\nfor(const c of s) freq[c]=(freq[c]||0)+1;\nconsole.log([...s].sort((a,b)=>freq[b]-freq[a]).join(''));`,
    },
    testCases: [
      { input: "tree", expectedOutput: "eert", isSample: true, explanation: "'e' appears 2 times" },
      { input: "cccaaa", expectedOutput: "cccaaa", isSample: true },
      { input: "aabb", expectedOutput: "aabb", isSample: false },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════
// STAGE 8: Sorting (72–79), STAGE 9: Searching (80–85), STAGE 10: Recursion (86–92),
// STAGE 11: Stacks & Queues (93–97), STAGE 12: DP (98–100)
// ═══════════════════════════════════════════════════════════════════

const stage8to12: Problem[] = [
  // === SORTING ===
  { slug: "bubble-sort", title: "Bubble Sort", statement: `Implement Bubble Sort. Sort an array in ascending order.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Sorted array, space-separated.`, difficulty: "MEDIUM", topics: ["sorting"], hints: ["Repeatedly swap adjacent elements if they are in wrong order."], editorial: "Nested loops: compare adjacent pairs, swap if needed. Repeat until no swaps.", timeLimitMs: 3000, memoryLimitKb: 256000, xpReward: 25, position: 72,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nfor i in range(n):\n    for j in range(n-1-i):\n        if arr[j] > arr[j+1]:\n            arr[j], arr[j+1] = arr[j+1], arr[j]\nprint(" ".join(map(str, arr)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        for(int i=0;i<n;i++) for(int j=0;j<n-1-i;j++) if(a[j]>a[j+1]) { int t=a[j]; a[j]=a[j+1]; a[j+1]=t; }\n        StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(a[i]); }\n        System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n; cin>>n; vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];\n    for(int i=0;i<n;i++) for(int j=0;j<n-1-i;j++) if(a[j]>a[j+1]) swap(a[j],a[j+1]);\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<a[i]; } cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number);\nfor(let i=0;i<a.length;i++) for(let j=0;j<a.length-1-i;j++) if(a[j]>a[j+1]) [a[j],a[j+1]]=[a[j+1],a[j]];\nconsole.log(a.join(' '));` },
    testCases: [ { input: "5\n5 3 1 4 2", expectedOutput: "1 2 3 4 5", isSample: true }, { input: "3\n3 2 1", expectedOutput: "1 2 3", isSample: true }, { input: "4\n1 2 3 4", expectedOutput: "1 2 3 4", isSample: false } ] },
  { slug: "selection-sort", title: "Selection Sort", statement: `Implement Selection Sort.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Sorted array.`, difficulty: "MEDIUM", topics: ["sorting"], hints: ["Find the minimum in unsorted part, swap with first unsorted."], editorial: "For each position, find the min in remaining array and swap.", timeLimitMs: 3000, memoryLimitKb: 256000, xpReward: 25, position: 73,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nfor i in range(n):\n    min_idx = i\n    for j in range(i+1, n):\n        if arr[j] < arr[min_idx]: min_idx = j\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]\nprint(" ".join(map(str, arr)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        for(int i=0;i<n;i++) { int mi=i; for(int j=i+1;j<n;j++) if(a[j]<a[mi]) mi=j; int t=a[i]; a[i]=a[mi]; a[mi]=t; }\n        StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(a[i]); } System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n; cin>>n; vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];\n    for(int i=0;i<n;i++) { int mi=i; for(int j=i+1;j<n;j++) if(a[j]<a[mi]) mi=j; swap(a[i],a[mi]); }\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<a[i]; } cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number);\nfor(let i=0;i<a.length;i++) { let mi=i; for(let j=i+1;j<a.length;j++) if(a[j]<a[mi]) mi=j; [a[i],a[mi]]=[a[mi],a[i]]; }\nconsole.log(a.join(' '));` },
    testCases: [ { input: "5\n64 25 12 22 11", expectedOutput: "11 12 22 25 64", isSample: true }, { input: "3\n1 2 3", expectedOutput: "1 2 3", isSample: false } ] },
  { slug: "binary-search", title: "Binary Search", statement: `Implement binary search on a sorted array. Find the index of the target, or -1.\n\n**Input:** Line 1: N. Line 2: N sorted integers. Line 3: target.\n**Output:** Index (0-based) or -1.`, difficulty: "MEDIUM", topics: ["searching"], hints: ["Compare target with middle element. If equal return. If less, search left half. If more, search right."], editorial: "Classic binary search: lo=0, hi=n-1. While lo<=hi, check mid.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 80,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nt = int(input())\nlo, hi = 0, n - 1\nresult = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == t: result = mid; break\n    elif arr[mid] < t: lo = mid + 1\n    else: hi = mid - 1\nprint(result)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        int t=sc.nextInt(), lo=0, hi=n-1, result=-1;\n        while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { result=mid; break; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; }\n        System.out.println(result);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i];\n    int t; cin>>t; int lo=0,hi=n-1,result=-1;\n    while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { result=mid; break; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; }\n    cout<<result<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), t=parseInt(lines[2]);\nlet lo=0,hi=a.length-1,result=-1;\nwhile(lo<=hi) { const mid=Math.floor((lo+hi)/2); if(a[mid]===t) { result=mid; break; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; }\nconsole.log(result);` },
    testCases: [ { input: "5\n1 3 5 7 9\n5", expectedOutput: "2", isSample: true }, { input: "5\n1 3 5 7 9\n4", expectedOutput: "-1", isSample: true }, { input: "1\n42\n42", expectedOutput: "0", isSample: false } ] },
  { slug: "search-insert-position", title: "Search Insert Position", statement: `Given a sorted array and a target value, return the index where target would be inserted.\n\n**Input:** Line 1: N. Line 2: N sorted integers. Line 3: target.\n**Output:** The insertion index.`, difficulty: "MEDIUM", topics: ["searching"], hints: ["Modified binary search: return lo when element not found."], editorial: "Binary search variant: when loop ends, lo is the insertion point.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 81,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nt = int(input())\nlo, hi = 0, n\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if arr[mid] < t: lo = mid + 1\n    else: hi = mid\nprint(lo)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        int t=sc.nextInt(), lo=0, hi=n;\n        while(lo<hi) { int mid=(lo+hi)/2; if(a[mid]<t) lo=mid+1; else hi=mid; }\n        System.out.println(lo);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i];\n    int t; cin>>t; int lo=0,hi=n;\n    while(lo<hi) { int mid=(lo+hi)/2; if(a[mid]<t) lo=mid+1; else hi=mid; }\n    cout<<lo<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), t=parseInt(lines[2]);\nlet lo=0,hi=a.length;\nwhile(lo<hi) { const mid=Math.floor((lo+hi)/2); if(a[mid]<t) lo=mid+1; else hi=mid; }\nconsole.log(lo);` },
    testCases: [ { input: "4\n1 3 5 6\n5", expectedOutput: "2", isSample: true }, { input: "4\n1 3 5 6\n2", expectedOutput: "1", isSample: true }, { input: "4\n1 3 5 6\n7", expectedOutput: "4", isSample: false }, { input: "4\n1 3 5 6\n0", expectedOutput: "0", isSample: false } ] },
  { slug: "find-peak-element", title: "Find Peak Element", statement: `A peak element is one that is strictly greater than its neighbors. Find the index of any peak element.\n\nEdge elements only need to be greater than their single neighbor. Guaranteed at least one peak exists.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Index of a peak element.`, difficulty: "MEDIUM", topics: ["searching"], hints: ["Use binary search. If mid > mid+1, peak is on left (including mid). Else on right."], editorial: "Binary search: if arr[mid] > arr[mid+1], search left half, else right.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 82,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nlo, hi = 0, n - 1\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if arr[mid] > arr[mid + 1]: hi = mid\n    else: lo = mid + 1\nprint(lo)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        int lo=0,hi=n-1;\n        while(lo<hi) { int mid=(lo+hi)/2; if(a[mid]>a[mid+1]) hi=mid; else lo=mid+1; }\n        System.out.println(lo);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i];\n    int lo=0,hi=n-1;\n    while(lo<hi) { int mid=(lo+hi)/2; if(a[mid]>a[mid+1]) hi=mid; else lo=mid+1; }\n    cout<<lo<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number);\nlet lo=0,hi=a.length-1;\nwhile(lo<hi) { const mid=Math.floor((lo+hi)/2); if(a[mid]>a[mid+1]) hi=mid; else lo=mid+1; }\nconsole.log(lo);` },
    testCases: [ { input: "4\n1 2 3 1", expectedOutput: "2", isSample: true }, { input: "5\n1 2 1 3 5", expectedOutput: "4", isSample: true }, { input: "1\n1", expectedOutput: "0", isSample: false } ] },
  // === RECURSION ===
  { slug: "recursive-factorial", title: "Recursive Factorial", statement: `Calculate factorial of N using recursion.\n\n**Input:** Integer N (0 ≤ N ≤ 20).\n**Output:** N!`, difficulty: "MEDIUM", topics: ["recursion"], hints: ["Base case: 0! = 1. Recursive: n! = n * (n-1)!"], editorial: "Recursive function: if n==0 return 1, else return n*fact(n-1).", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 86,
    starterCode: { python: `def factorial(n):\n    if n <= 1: return 1\n    return n * factorial(n - 1)\nprint(factorial(int(input())))`, java: `import java.util.Scanner;\npublic class Main {\n    static long fact(int n) { return n <= 1 ? 1 : n * fact(n-1); }\n    public static void main(String[] args) { System.out.println(fact(new Scanner(System.in).nextInt())); }\n}`, cpp: `#include <iostream>\nusing namespace std;\nlong long fact(int n) { return n<=1?1:(long long)n*fact(n-1); }\nint main() { int n; cin>>n; cout<<fact(n)<<endl; return 0; }`, javascript: `function fact(n) { return n <= 1 ? 1n : BigInt(n) * fact(n-1); }\nconst n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(fact(n).toString());` },
    testCases: [ { input: "5", expectedOutput: "120", isSample: true }, { input: "0", expectedOutput: "1", isSample: true }, { input: "10", expectedOutput: "3628800", isSample: false } ] },
  { slug: "recursive-fibonacci", title: "Nth Fibonacci (Recursive)", statement: `Find the Nth Fibonacci number using recursion (0-indexed). F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).\n\n**Input:** Integer N (0 ≤ N ≤ 30).\n**Output:** F(N).`, difficulty: "MEDIUM", topics: ["recursion"], hints: ["Base cases: F(0)=0, F(1)=1. Recursive: F(n) = F(n-1) + F(n-2)."], editorial: "Direct recursive implementation. For optimization, use memoization.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 87,
    starterCode: { python: `def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\nprint(fib(int(input())))`, java: `import java.util.Scanner;\npublic class Main {\n    static int fib(int n) { return n<=1?n:fib(n-1)+fib(n-2); }\n    public static void main(String[] args) { System.out.println(fib(new Scanner(System.in).nextInt())); }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint fib(int n) { return n<=1?n:fib(n-1)+fib(n-2); }\nint main() { int n; cin>>n; cout<<fib(n)<<endl; return 0; }`, javascript: `function fib(n) { return n<=1?n:fib(n-1)+fib(n-2); }\nconsole.log(fib(parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim())));` },
    testCases: [ { input: "6", expectedOutput: "8", isSample: true, explanation: "0,1,1,2,3,5,8" }, { input: "0", expectedOutput: "0", isSample: true }, { input: "10", expectedOutput: "55", isSample: false } ] },
  { slug: "power-of-two", title: "Power of Two Check", statement: `Check if N is a power of two.\n\n**Input:** Positive integer N.\n**Output:** \`Yes\` or \`No\`.`, difficulty: "MEDIUM", topics: ["recursion", "math"], hints: ["A power of 2 has exactly one bit set: n & (n-1) == 0.", "Or recursively: if n==1, yes. If n%2!=0, no. Else check n/2."], editorial: "Bit trick: n > 0 and (n & (n-1)) == 0. Or recursive halving.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 88,
    starterCode: { python: `n = int(input())\nprint("Yes" if n > 0 and (n & (n - 1)) == 0 else "No")`, java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        System.out.println(n > 0 && (n & (n-1)) == 0 ? "Yes" : "No");\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; cout<<(n>0&&(n&(n-1))==0?"Yes":"No")<<endl; return 0; }`, javascript: `const n=parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nconsole.log(n>0&&(n&(n-1))===0?"Yes":"No");` },
    testCases: [ { input: "16", expectedOutput: "Yes", isSample: true }, { input: "6", expectedOutput: "No", isSample: true }, { input: "1", expectedOutput: "Yes", isSample: false }, { input: "1024", expectedOutput: "Yes", isSample: false } ] },
  { slug: "generate-subsets", title: "Generate All Subsets", statement: `Generate all subsets of a set of N distinct integers. Print each subset on a line (elements sorted, space-separated). Print subsets in lexicographic order. Empty subset as an empty line first.\n\n**Input:** Line 1: N. Line 2: N distinct integers (sorted).\n**Output:** All 2^N subsets, one per line.`, difficulty: "MEDIUM", topics: ["recursion"], hints: ["Use bit masking: iterate 0 to 2^N-1, each bit decides inclusion.", "Or use recursive backtracking."], editorial: "Bitmask approach: for each number 0..2^N-1, include element i if bit i is set.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 89,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nfor mask in range(1 << n):\n    subset = [arr[i] for i in range(n) if mask & (1 << i)]\n    print(" ".join(map(str, subset)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        for(int mask=0;mask<(1<<n);mask++) {\n            StringBuilder sb=new StringBuilder();\n            for(int i=0;i<n;i++) if((mask&(1<<i))!=0) { if(sb.length()>0) sb.append(" "); sb.append(a[i]); }\n            System.out.println(sb);\n        }\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n; cin>>n; vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];\n    for(int mask=0;mask<(1<<n);mask++) {\n        bool first=true;\n        for(int i=0;i<n;i++) if(mask&(1<<i)) { if(!first) cout<<" "; first=false; cout<<a[i]; }\n        cout<<endl;\n    } return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst n=parseInt(lines[0]), a=lines[1].split(' ').map(Number);\nfor(let mask=0;mask<(1<<n);mask++) {\n    const sub=[];\n    for(let i=0;i<n;i++) if(mask&(1<<i)) sub.push(a[i]);\n    console.log(sub.join(' '));\n}` },
    testCases: [ { input: "3\n1 2 3", expectedOutput: "\n1\n2\n1 2\n3\n1 3\n2 3\n1 2 3", isSample: true }, { input: "1\n5", expectedOutput: "\n5", isSample: false } ] },
  // === STACKS ===
  { slug: "valid-parentheses", title: "Valid Parentheses", statement: `Given a string containing only \`()\`, \`{}\`, \`[]\`, determine if the input string is valid. A string is valid if brackets are closed in the correct order.\n\n**Input:** A string.\n**Output:** \`Yes\` or \`No\`.`, difficulty: "MEDIUM", topics: ["stacks", "strings"], hints: ["Use a stack. Push opening brackets, pop on matching closing.", "If stack is empty at the end, it's valid."], editorial: "Push opening brackets onto stack. For closing brackets, check if top matches. If stack empty at end → valid.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 93,
    starterCode: { python: `s = input().strip()\nstack = []\nmatch = {')': '(', '}': '{', ']': '['}\nvalid = True\nfor c in s:\n    if c in '({[':\n        stack.append(c)\n    elif c in ')}]':\n        if not stack or stack[-1] != match[c]:\n            valid = False; break\n        stack.pop()\nif stack: valid = False\nprint("Yes" if valid else "No")`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine().trim();\n        Stack<Character> stack = new Stack<>();\n        Map<Character,Character> match = Map.of(')','(','}','{',']','[');\n        boolean valid = true;\n        for(char c:s.toCharArray()) {\n            if("({[".indexOf(c)!=-1) stack.push(c);\n            else if(match.containsKey(c)) { if(stack.isEmpty()||stack.pop()!=match.get(c)) { valid=false; break; } }\n        }\n        if(!stack.isEmpty()) valid=false;\n        System.out.println(valid?"Yes":"No");\n    }\n}`, cpp: `#include <iostream>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string s; cin>>s;\n    stack<char> st;\n    unordered_map<char,char> match = {{')','{'},{')','{'},{')','{'}};\n    match = {{')','('},{'}','{'},{']','['}};\n    bool valid=true;\n    for(char c:s) {\n        if(c=='('||c=='{'||c=='[') st.push(c);\n        else if(match.count(c)) { if(st.empty()||st.top()!=match[c]) { valid=false; break; } st.pop(); }\n    }\n    if(!st.empty()) valid=false;\n    cout<<(valid?"Yes":"No")<<endl; return 0;\n}`, javascript: `const s=require('fs').readFileSync('/dev/stdin','utf8').trim();\nconst stack=[],match={')':'(','}':'{',']':'['};\nlet valid=true;\nfor(const c of s) {\n    if('({['.includes(c)) stack.push(c);\n    else if(match[c]) { if(!stack.length||stack.pop()!==match[c]) { valid=false; break; } }\n}\nif(stack.length) valid=false;\nconsole.log(valid?"Yes":"No");` },
    testCases: [ { input: "()", expectedOutput: "Yes", isSample: true }, { input: "()[]{}", expectedOutput: "Yes", isSample: true }, { input: "(]", expectedOutput: "No", isSample: false }, { input: "([)]", expectedOutput: "No", isSample: false }, { input: "{[]}", expectedOutput: "Yes", isSample: false } ] },
  { slug: "next-greater-element", title: "Next Greater Element", statement: `For each element in the array, find the next element to its right that is strictly greater. If none exists, output -1.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** N space-separated integers (next greater for each).`, difficulty: "MEDIUM", topics: ["stacks", "arrays"], hints: ["Use a monotonic stack.", "Traverse right to left. While stack top ≤ current, pop. Stack top is next greater."], editorial: "Monotonic decreasing stack. Traverse from right. For each element, pop all smaller/equal from stack. Top is answer.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 94,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nresult = [-1] * n\nstack = []\nfor i in range(n - 1, -1, -1):\n    while stack and stack[-1] <= arr[i]:\n        stack.pop()\n    if stack:\n        result[i] = stack[-1]\n    stack.append(arr[i])\nprint(" ".join(map(str, result)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        int[] res=new int[n]; Arrays.fill(res,-1);\n        Stack<Integer> stack=new Stack<>();\n        for(int i=n-1;i>=0;i--) { while(!stack.isEmpty()&&stack.peek()<=a[i]) stack.pop(); if(!stack.isEmpty()) res[i]=stack.peek(); stack.push(a[i]); }\n        StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(res[i]); } System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\n#include <stack>\nusing namespace std;\nint main() { int n; cin>>n; vector<int> a(n),res(n,-1);\n    for(int i=0;i<n;i++) cin>>a[i];\n    stack<int> st;\n    for(int i=n-1;i>=0;i--) { while(!st.empty()&&st.top()<=a[i]) st.pop(); if(!st.empty()) res[i]=st.top(); st.push(a[i]); }\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<res[i]; } cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), res=Array(a.length).fill(-1), stack=[];\nfor(let i=a.length-1;i>=0;i--) { while(stack.length&&stack[stack.length-1]<=a[i]) stack.pop(); if(stack.length) res[i]=stack[stack.length-1]; stack.push(a[i]); }\nconsole.log(res.join(' '));` },
    testCases: [ { input: "4\n4 5 2 10", expectedOutput: "5 10 10 -1", isSample: true }, { input: "5\n1 3 2 4 1", expectedOutput: "3 4 4 -1 -1", isSample: true }, { input: "3\n3 2 1", expectedOutput: "-1 -1 -1", isSample: false } ] },
  // === DYNAMIC PROGRAMMING ===
  { slug: "climbing-stairs", title: "Climbing Stairs", statement: `You are climbing a staircase with N steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?\n\n**Input:** Integer N (1 ≤ N ≤ 45).\n**Output:** Number of ways.`, difficulty: "MEDIUM", topics: ["dynamic-programming"], hints: ["This is the Fibonacci sequence! ways(n) = ways(n-1) + ways(n-2).", "Base cases: ways(1) = 1, ways(2) = 2."], editorial: "DP: dp[1]=1, dp[2]=2, dp[i] = dp[i-1] + dp[i-2]. Same as Fibonacci.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 98,
    starterCode: { python: `n = int(input())\nif n <= 2: print(n)\nelse:\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    print(b)`, java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        if(n<=2) { System.out.println(n); return; }\n        int a=1,b=2;\n        for(int i=3;i<=n;i++) { int c=a+b; a=b; b=c; }\n        System.out.println(b);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; if(n<=2) { cout<<n<<endl; return 0; }\n    long long a=1,b=2; for(int i=3;i<=n;i++) { long long c=a+b; a=b; b=c; }\n    cout<<b<<endl; return 0; }`, javascript: `const n=parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nif(n<=2) { console.log(n); } else { let a=1,b=2; for(let i=3;i<=n;i++) { const c=a+b; a=b; b=c; } console.log(b); }` },
    testCases: [ { input: "3", expectedOutput: "3", isSample: true, explanation: "1+1+1, 1+2, 2+1" }, { input: "5", expectedOutput: "8", isSample: true }, { input: "1", expectedOutput: "1", isSample: false }, { input: "10", expectedOutput: "89", isSample: false } ] },
  { slug: "coin-change", title: "Coin Change", statement: `Given coins of different denominations and a total amount, find the minimum number of coins needed to make that amount. If impossible, return -1.\n\n**Input:** Line 1: N (number of coin types) and amount. Line 2: N coin values.\n**Output:** Minimum coins needed, or -1.`, difficulty: "HARD", topics: ["dynamic-programming"], hints: ["DP: dp[i] = minimum coins to make amount i.", "dp[0] = 0. For each amount, try each coin."], editorial: "Bottom-up DP: dp[0]=0. For i=1..amount, dp[i] = min(dp[i-coin]+1) for each coin where coin<=i.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 50, position: 99,
    starterCode: { python: `n, amount = map(int, input().split())\ncoins = list(map(int, input().split()))\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor i in range(1, amount + 1):\n    for c in coins:\n        if c <= i and dp[i - c] + 1 < dp[i]:\n            dp[i] = dp[i - c] + 1\nprint(dp[amount] if dp[amount] != float('inf') else -1)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt(),amount=sc.nextInt();\n        int[] coins=new int[n]; for(int i=0;i<n;i++) coins[i]=sc.nextInt();\n        int[] dp=new int[amount+1]; Arrays.fill(dp,amount+1); dp[0]=0;\n        for(int i=1;i<=amount;i++) for(int c:coins) if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);\n        System.out.println(dp[amount]>amount?-1:dp[amount]);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() { int n,amount; cin>>n>>amount;\n    vector<int> coins(n); for(int i=0;i<n;i++) cin>>coins[i];\n    vector<int> dp(amount+1,amount+1); dp[0]=0;\n    for(int i=1;i<=amount;i++) for(int c:coins) if(c<=i) dp[i]=min(dp[i],dp[i-c]+1);\n    cout<<(dp[amount]>amount?-1:dp[amount])<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [n,amount]=lines[0].split(' ').map(Number);\nconst coins=lines[1].split(' ').map(Number);\nconst dp=Array(amount+1).fill(amount+1); dp[0]=0;\nfor(let i=1;i<=amount;i++) for(const c of coins) if(c<=i) dp[i]=Math.min(dp[i],dp[i-c]+1);\nconsole.log(dp[amount]>amount?-1:dp[amount]);` },
    testCases: [ { input: "3 11\n1 5 6", expectedOutput: "2", isSample: true, explanation: "6+5=11" }, { input: "1 3\n2", expectedOutput: "-1", isSample: true }, { input: "3 0\n1 2 5", expectedOutput: "0", isSample: false }, { input: "3 27\n1 5 10", expectedOutput: "4", isSample: false } ] },
  { slug: "house-robber", title: "House Robber", statement: `You are a robber planning to rob houses along a street. Each house has a certain amount of money. You cannot rob two adjacent houses. Find the maximum money you can rob.\n\n**Input:** Line 1: N. Line 2: N integers (money in each house).\n**Output:** Maximum money.`, difficulty: "HARD", topics: ["dynamic-programming"], hints: ["For each house, you decide: rob it (skip previous) or skip it (keep previous max).", "dp[i] = max(dp[i-1], dp[i-2] + nums[i])"], editorial: "DP: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Can be done with two variables.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 50, position: 100,
    starterCode: { python: `n = int(input())\nnums = list(map(int, input().split()))\nif n == 1: print(nums[0])\nelse:\n    prev2, prev1 = 0, 0\n    for x in nums:\n        curr = max(prev1, prev2 + x)\n        prev2, prev1 = prev1, curr\n    print(prev1)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] nums=new int[n]; for(int i=0;i<n;i++) nums[i]=sc.nextInt();\n        int prev2=0,prev1=0;\n        for(int x:nums) { int curr=Math.max(prev1,prev2+x); prev2=prev1; prev1=curr; }\n        System.out.println(prev1);\n    }\n}`, cpp: `#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() { int n; cin>>n; int nums[n]; for(int i=0;i<n;i++) cin>>nums[i];\n    int prev2=0,prev1=0;\n    for(int i=0;i<n;i++) { int curr=max(prev1,prev2+nums[i]); prev2=prev1; prev1=curr; }\n    cout<<prev1<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst nums=lines[1].split(' ').map(Number);\nlet prev2=0,prev1=0;\nfor(const x of nums) { const curr=Math.max(prev1,prev2+x); prev2=prev1; prev1=curr; }\nconsole.log(prev1);` },
    testCases: [ { input: "4\n1 2 3 1", expectedOutput: "4", isSample: true, explanation: "Rob house 1(1) + house 3(3) = 4" }, { input: "5\n2 7 9 3 1", expectedOutput: "12", isSample: true, explanation: "2+9+1=12" }, { input: "1\n5", expectedOutput: "5", isSample: false }, { input: "3\n10 1 10", expectedOutput: "20", isSample: false } ] },
]

// ═══════════════════════════════════════════════════════════════════
// MISSING PROBLEMS — Filling gaps 74-79, 83-85, 90-92, 95-97
// ═══════════════════════════════════════════════════════════════════
const missingProblems: Problem[] = [
  // === MORE SORTING (74-79) ===
  { slug: "insertion-sort", title: "Insertion Sort", statement: `Implement Insertion Sort.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Sorted array, space-separated.`, difficulty: "MEDIUM", topics: ["sorting"], hints: ["Pick each element and insert it into the correct position in the sorted part."], editorial: "For each element starting from index 1, shift larger elements right and insert.", timeLimitMs: 3000, memoryLimitKb: 256000, xpReward: 25, position: 74,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nfor i in range(1, n):\n    key = arr[i]\n    j = i - 1\n    while j >= 0 and arr[j] > key:\n        arr[j+1] = arr[j]\n        j -= 1\n    arr[j+1] = key\nprint(" ".join(map(str, arr)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        for(int i=1;i<n;i++) { int key=a[i],j=i-1; while(j>=0&&a[j]>key) { a[j+1]=a[j]; j--; } a[j+1]=key; }\n        StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(a[i]); } System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n; cin>>n; vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];\n    for(int i=1;i<n;i++) { int key=a[i],j=i-1; while(j>=0&&a[j]>key) { a[j+1]=a[j]; j--; } a[j+1]=key; }\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<a[i]; } cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number);\nfor(let i=1;i<a.length;i++) { const key=a[i]; let j=i-1; while(j>=0&&a[j]>key) { a[j+1]=a[j]; j--; } a[j+1]=key; }\nconsole.log(a.join(' '));` },
    testCases: [ { input: "5\n5 3 1 4 2", expectedOutput: "1 2 3 4 5", isSample: true }, { input: "3\n1 2 3", expectedOutput: "1 2 3", isSample: true }, { input: "4\n4 3 2 1", expectedOutput: "1 2 3 4", isSample: false } ] },
  { slug: "merge-sorted-arrays", title: "Merge Two Sorted Arrays", statement: `Merge two sorted arrays into one sorted array.\n\n**Input:** Line 1: N M. Line 2: N sorted integers. Line 3: M sorted integers.\n**Output:** Merged sorted array, space-separated.`, difficulty: "MEDIUM", topics: ["sorting", "two-pointers"], hints: ["Use two pointers, one for each array.", "Compare elements and pick the smaller one."], editorial: "Two pointers: compare heads of both arrays, pick smaller, advance that pointer.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 75,
    starterCode: { python: `n, m = map(int, input().split())\na = list(map(int, input().split()))\nb = list(map(int, input().split()))\ni = j = 0\nresult = []\nwhile i < n and j < m:\n    if a[i] <= b[j]: result.append(a[i]); i += 1\n    else: result.append(b[j]); j += 1\nresult.extend(a[i:])\nresult.extend(b[j:])\nprint(" ".join(map(str, result)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt(),m=sc.nextInt();\n        int[] a=new int[n],b=new int[m]; for(int i=0;i<n;i++) a[i]=sc.nextInt(); for(int i=0;i<m;i++) b[i]=sc.nextInt();\n        int i=0,j=0; StringBuilder sb=new StringBuilder();\n        while(i<n&&j<m) { if(a[i]<=b[j]) { if(sb.length()>0) sb.append(" "); sb.append(a[i++]); } else { if(sb.length()>0) sb.append(" "); sb.append(b[j++]); } }\n        while(i<n) { if(sb.length()>0) sb.append(" "); sb.append(a[i++]); }\n        while(j<m) { if(sb.length()>0) sb.append(" "); sb.append(b[j++]); }\n        System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { int n,m; cin>>n>>m; vector<int> a(n),b(m); for(int i=0;i<n;i++) cin>>a[i]; for(int i=0;i<m;i++) cin>>b[i];\n    int i=0,j=0; bool first=true;\n    while(i<n&&j<m) { if(!first) cout<<" "; first=false; if(a[i]<=b[j]) cout<<a[i++]; else cout<<b[j++]; }\n    while(i<n) { if(!first) cout<<" "; first=false; cout<<a[i++]; }\n    while(j<m) { if(!first) cout<<" "; first=false; cout<<b[j++]; }\n    cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), b=lines[2].split(' ').map(Number);\nlet i=0,j=0; const res=[];\nwhile(i<a.length&&j<b.length) { if(a[i]<=b[j]) res.push(a[i++]); else res.push(b[j++]); }\nwhile(i<a.length) res.push(a[i++]); while(j<b.length) res.push(b[j++]);\nconsole.log(res.join(' '));` },
    testCases: [ { input: "3 3\n1 3 5\n2 4 6", expectedOutput: "1 2 3 4 5 6", isSample: true }, { input: "2 3\n1 8\n2 3 5", expectedOutput: "1 2 3 5 8", isSample: true }, { input: "1 1\n1\n1", expectedOutput: "1 1", isSample: false } ] },
  { slug: "sort-array-of-0-1-2", title: "Sort Array of 0s, 1s, and 2s", statement: `Sort an array containing only 0, 1, and 2 without using a standard sort.\n\n**Input:** Line 1: N. Line 2: N integers (each 0, 1, or 2).\n**Output:** Sorted array, space-separated.`, difficulty: "MEDIUM", topics: ["sorting", "arrays"], hints: ["Count occurrences of 0, 1, 2 and reconstruct.", "Or use Dutch National Flag algorithm with 3 pointers."], editorial: "Dutch National Flag: lo=0, mid=0, hi=n-1. Swap 0s to front, 2s to back.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 76,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nc = [0, 0, 0]\nfor x in arr: c[x] += 1\nresult = [0]*c[0] + [1]*c[1] + [2]*c[2]\nprint(" ".join(map(str, result)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        int[] c=new int[3]; for(int x:a) c[x]++;\n        StringBuilder sb=new StringBuilder(); int idx=0;\n        for(int v=0;v<3;v++) for(int i=0;i<c[v];i++) { if(idx++>0) sb.append(" "); sb.append(v); }\n        System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i];\n    int c[3]={}; for(int i=0;i<n;i++) c[a[i]]++;\n    bool first=true; for(int v=0;v<3;v++) for(int i=0;i<c[v];i++) { if(!first) cout<<" "; first=false; cout<<v; }\n    cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), c=[0,0,0];\nfor(const x of a) c[x]++;\nconsole.log([...Array(c[0]).fill(0),...Array(c[1]).fill(1),...Array(c[2]).fill(2)].join(' '));` },
    testCases: [ { input: "6\n2 0 1 2 0 1", expectedOutput: "0 0 1 1 2 2", isSample: true }, { input: "3\n0 0 0", expectedOutput: "0 0 0", isSample: true }, { input: "5\n2 2 1 0 0", expectedOutput: "0 0 1 2 2", isSample: false } ] },
  { slug: "kth-smallest-element", title: "Kth Smallest Element", statement: `Find the Kth smallest element in an unsorted array.\n\n**Input:** Line 1: N K. Line 2: N integers.\n**Output:** The Kth smallest element.`, difficulty: "MEDIUM", topics: ["sorting", "arrays"], hints: ["Sort and pick element at index K-1.", "For optimal, use quickselect (but sort is fine for learning)."], editorial: "Simple approach: sort the array and return arr[K-1].", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 77,
    starterCode: { python: `n, k = map(int, input().split())\narr = list(map(int, input().split()))\narr.sort()\nprint(arr[k-1])`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt(),k=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        Arrays.sort(a); System.out.println(a[k-1]);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() { int n,k; cin>>n>>k; vector<int> a(n); for(int i=0;i<n;i++) cin>>a[i];\n    sort(a.begin(),a.end()); cout<<a[k-1]<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [n,k]=lines[0].split(' ').map(Number);\nconst a=lines[1].split(' ').map(Number);\na.sort((x,y)=>x-y); console.log(a[k-1]);` },
    testCases: [ { input: "6 3\n7 10 4 3 20 15", expectedOutput: "7", isSample: true }, { input: "3 1\n5 2 8", expectedOutput: "2", isSample: true }, { input: "5 5\n1 2 3 4 5", expectedOutput: "5", isSample: false } ] },
  { slug: "count-inversions", title: "Count Inversions", statement: `Count the number of inversions in an array. An inversion is a pair (i,j) where i < j and arr[i] > arr[j].\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Number of inversions.`, difficulty: "HARD", topics: ["sorting", "arrays"], hints: ["Brute force: O(n²) double loop counting pairs.", "Optimal: merge sort based approach."], editorial: "Brute force: for each pair (i,j) where i<j, count if arr[i]>arr[j]. O(n²) but works for small N.", timeLimitMs: 3000, memoryLimitKb: 256000, xpReward: 50, position: 78,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\ncount = 0\nfor i in range(n):\n    for j in range(i+1, n):\n        if arr[i] > arr[j]: count += 1\nprint(count)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        long count=0; for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) if(a[i]>a[j]) count++;\n        System.out.println(count);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i];\n    long long count=0; for(int i=0;i<n;i++) for(int j=i+1;j<n;j++) if(a[i]>a[j]) count++;\n    cout<<count<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number); let count=0;\nfor(let i=0;i<a.length;i++) for(let j=i+1;j<a.length;j++) if(a[i]>a[j]) count++;\nconsole.log(count);` },
    testCases: [ { input: "5\n2 4 1 3 5", expectedOutput: "3", isSample: true, explanation: "(2,1),(4,1),(4,3)" }, { input: "3\n1 2 3", expectedOutput: "0", isSample: true }, { input: "4\n4 3 2 1", expectedOutput: "6", isSample: false } ] },
  { slug: "sort-by-frequency", title: "Sort by Frequency", statement: `Sort array elements by decreasing frequency. If two elements have same frequency, the one that appears first in the original array comes first.\n\n**Input:** Line 1: N. Line 2: N integers.\n**Output:** Sorted array.`, difficulty: "MEDIUM", topics: ["sorting", "hashing"], hints: ["Count frequency of each element.", "Sort by frequency descending, then by first occurrence ascending."], editorial: "Use a hash map for frequency and first occurrence index. Custom sort by (-freq, first_index).", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 79,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nfrom collections import Counter\nfreq = Counter(arr)\nfirst = {}\nfor i, x in enumerate(arr):\n    if x not in first: first[x] = i\narr.sort(key=lambda x: (-freq[x], first[x]))\nprint(" ".join(map(str, arr)))`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; Map<Integer,Integer> freq=new LinkedHashMap<>(), first=new HashMap<>();\n        for(int i=0;i<n;i++) { a[i]=sc.nextInt(); freq.merge(a[i],1,Integer::sum); if(!first.containsKey(a[i])) first.put(a[i],i); }\n        Integer[] b=new Integer[n]; for(int i=0;i<n;i++) b[i]=a[i];\n        Arrays.sort(b,(x,y)->{ int d=freq.get(y)-freq.get(x); return d!=0?d:first.get(x)-first.get(y); });\n        StringBuilder sb=new StringBuilder(); for(int i=0;i<n;i++) { if(i>0) sb.append(" "); sb.append(b[i]); } System.out.println(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\nint main() { int n; cin>>n; vector<int> a(n);\n    unordered_map<int,int> freq,first;\n    for(int i=0;i<n;i++) { cin>>a[i]; freq[a[i]]++; if(!first.count(a[i])) first[a[i]]=i; }\n    vector<int> b=a;\n    stable_sort(b.begin(),b.end(),[&](int x,int y) { int d=freq[y]-freq[x]; return d!=0?d<0?false:true:first[x]<first[y]; });\n    for(int i=0;i<n;i++) { if(i) cout<<" "; cout<<b[i]; } cout<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), freq={}, first={};\na.forEach((x,i)=>{ freq[x]=(freq[x]||0)+1; if(!(x in first)) first[x]=i; });\nconst b=[...a]; b.sort((x,y)=>{ const d=freq[y]-freq[x]; return d!==0?d:first[x]-first[y]; });\nconsole.log(b.join(' '));` },
    testCases: [ { input: "6\n1 1 2 2 2 3", expectedOutput: "2 2 2 1 1 3", isSample: true }, { input: "4\n4 4 3 3", expectedOutput: "4 4 3 3", isSample: true }, { input: "5\n5 5 4 4 6", expectedOutput: "5 5 4 4 6", isSample: false } ] },
  // === MORE SEARCHING (83-85) ===
  { slug: "first-and-last-occurrence", title: "First and Last Occurrence", statement: `Find the first and last position of a target in a sorted array. If not found, print -1 -1.\n\n**Input:** Line 1: N. Line 2: N sorted integers. Line 3: target.\n**Output:** Two integers: first and last index (0-based).`, difficulty: "MEDIUM", topics: ["searching"], hints: ["Use binary search twice: once for leftmost, once for rightmost."], editorial: "Two binary searches: find lower bound and upper bound of target.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 83,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nt = int(input())\ndef find_first(a, t):\n    lo, hi, ans = 0, len(a)-1, -1\n    while lo <= hi:\n        mid = (lo+hi)//2\n        if a[mid] == t: ans = mid; hi = mid - 1\n        elif a[mid] < t: lo = mid + 1\n        else: hi = mid - 1\n    return ans\ndef find_last(a, t):\n    lo, hi, ans = 0, len(a)-1, -1\n    while lo <= hi:\n        mid = (lo+hi)//2\n        if a[mid] == t: ans = mid; lo = mid + 1\n        elif a[mid] < t: lo = mid + 1\n        else: hi = mid - 1\n    return ans\nprint(find_first(arr,t), find_last(arr,t))`, java: `import java.util.*;\npublic class Main {\n    static int findFirst(int[] a, int t) { int lo=0,hi=a.length-1,ans=-1; while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { ans=mid; hi=mid-1; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; } return ans; }\n    static int findLast(int[] a, int t) { int lo=0,hi=a.length-1,ans=-1; while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { ans=mid; lo=mid+1; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; } return ans; }\n    public static void main(String[] args) { Scanner sc=new Scanner(System.in); int n=sc.nextInt(); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt(); int t=sc.nextInt(); System.out.println(findFirst(a,t)+" "+findLast(a,t)); }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i]; int t; cin>>t;\n    int lo=0,hi=n-1,first=-1; while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { first=mid; hi=mid-1; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; }\n    lo=0; hi=n-1; int last=-1; while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { last=mid; lo=mid+1; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; }\n    cout<<first<<" "<<last<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), t=parseInt(lines[2]);\nfunction findFirst(a,t) { let lo=0,hi=a.length-1,ans=-1; while(lo<=hi) { const mid=Math.floor((lo+hi)/2); if(a[mid]===t) { ans=mid; hi=mid-1; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; } return ans; }\nfunction findLast(a,t) { let lo=0,hi=a.length-1,ans=-1; while(lo<=hi) { const mid=Math.floor((lo+hi)/2); if(a[mid]===t) { ans=mid; lo=mid+1; } else if(a[mid]<t) lo=mid+1; else hi=mid-1; } return ans; }\nconsole.log(findFirst(a,t)+' '+findLast(a,t));` },
    testCases: [ { input: "6\n1 2 2 2 3 4\n2", expectedOutput: "1 3", isSample: true }, { input: "5\n1 3 5 7 9\n6", expectedOutput: "-1 -1", isSample: true }, { input: "3\n1 1 1\n1", expectedOutput: "0 2", isSample: false } ] },
  { slug: "square-root-integer", title: "Integer Square Root", statement: `Find the integer square root of N (floor of sqrt(N)) without using built-in sqrt.\n\n**Input:** Non-negative integer N.\n**Output:** floor(sqrt(N)).`, difficulty: "MEDIUM", topics: ["searching", "math"], hints: ["Binary search: find largest x such that x*x <= N."], editorial: "Binary search on answer: lo=0, hi=N. Check if mid*mid <= N.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 84,
    starterCode: { python: `n = int(input())\nif n < 2: print(n)\nelse:\n    lo, hi = 1, n // 2\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if mid * mid == n: print(mid); break\n        elif mid * mid < n: lo = mid + 1\n        else: hi = mid - 1\n    else:\n        print(hi)`, java: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        long n = new Scanner(System.in).nextLong();\n        if(n<2) { System.out.println(n); return; }\n        long lo=1,hi=n/2;\n        while(lo<=hi) { long mid=(lo+hi)/2; if(mid<=n/mid&&(mid+1)>n/(mid+1)) { System.out.println(mid); return; } if(mid<n/mid) lo=mid+1; else hi=mid-1; }\n        System.out.println(hi);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { long long n; cin>>n; if(n<2) { cout<<n<<endl; return 0; }\n    long long lo=1,hi=n/2,ans=1;\n    while(lo<=hi) { long long mid=(lo+hi)/2; if(mid<=n/mid) { ans=mid; lo=mid+1; } else hi=mid-1; }\n    cout<<ans<<endl; return 0; }`, javascript: `const n=BigInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\nif(n<2n) { console.log(n.toString()); } else { let lo=1n,hi=n/2n,ans=1n; while(lo<=hi) { const mid=(lo+hi)/2n; if(mid*mid<=n) { ans=mid; lo=mid+1n; } else hi=mid-1n; } console.log(ans.toString()); }` },
    testCases: [ { input: "16", expectedOutput: "4", isSample: true }, { input: "8", expectedOutput: "2", isSample: true }, { input: "0", expectedOutput: "0", isSample: false }, { input: "1", expectedOutput: "1", isSample: false }, { input: "100", expectedOutput: "10", isSample: false } ] },
  { slug: "search-rotated-sorted-array", title: "Search in Rotated Sorted Array", statement: `A sorted array is rotated at an unknown pivot. Given a target, return its index or -1.\n\n**Input:** Line 1: N. Line 2: N integers (rotated sorted). Line 3: target.\n**Output:** Index (0-based) or -1.`, difficulty: "HARD", topics: ["searching"], hints: ["Modified binary search.", "One half is always sorted. Check if target lies in that half."], editorial: "Binary search: determine which half is sorted. If target in sorted half, search there; else other half.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 50, position: 85,
    starterCode: { python: `n = int(input())\narr = list(map(int, input().split()))\nt = int(input())\nlo, hi = 0, n - 1\nans = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == t: ans = mid; break\n    if arr[lo] <= arr[mid]:\n        if arr[lo] <= t < arr[mid]: hi = mid - 1\n        else: lo = mid + 1\n    else:\n        if arr[mid] < t <= arr[hi]: lo = mid + 1\n        else: hi = mid - 1\nprint(ans)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int n=sc.nextInt();\n        int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=sc.nextInt();\n        int t=sc.nextInt(), lo=0, hi=n-1, ans=-1;\n        while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { ans=mid; break; }\n            if(a[lo]<=a[mid]) { if(a[lo]<=t&&t<a[mid]) hi=mid-1; else lo=mid+1; }\n            else { if(a[mid]<t&&t<=a[hi]) lo=mid+1; else hi=mid-1; } }\n        System.out.println(ans);\n    }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint main() { int n; cin>>n; int a[n]; for(int i=0;i<n;i++) cin>>a[i]; int t; cin>>t;\n    int lo=0,hi=n-1,ans=-1;\n    while(lo<=hi) { int mid=(lo+hi)/2; if(a[mid]==t) { ans=mid; break; }\n        if(a[lo]<=a[mid]) { if(a[lo]<=t&&t<a[mid]) hi=mid-1; else lo=mid+1; }\n        else { if(a[mid]<t&&t<=a[hi]) lo=mid+1; else hi=mid-1; } }\n    cout<<ans<<endl; return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst a=lines[1].split(' ').map(Number), t=parseInt(lines[2]);\nlet lo=0,hi=a.length-1,ans=-1;\nwhile(lo<=hi) { const mid=Math.floor((lo+hi)/2); if(a[mid]===t) { ans=mid; break; }\n    if(a[lo]<=a[mid]) { if(a[lo]<=t&&t<a[mid]) hi=mid-1; else lo=mid+1; }\n    else { if(a[mid]<t&&t<=a[hi]) lo=mid+1; else hi=mid-1; } }\nconsole.log(ans);` },
    testCases: [ { input: "7\n4 5 6 7 0 1 2\n0", expectedOutput: "4", isSample: true }, { input: "7\n4 5 6 7 0 1 2\n3", expectedOutput: "-1", isSample: true }, { input: "1\n1\n1", expectedOutput: "0", isSample: false } ] },
  // === MORE RECURSION (90-92) ===
  { slug: "sum-of-digits-recursive", title: "Sum of Digits (Recursive)", statement: `Calculate the sum of digits of N using recursion.\n\n**Input:** Non-negative integer N.\n**Output:** Sum of digits.`, difficulty: "EASY", topics: ["recursion", "math"], hints: ["Base case: if N < 10, return N.", "Recursive: N%10 + sumDigits(N/10)."], editorial: "Recursion: sum_digits(n) = n%10 + sum_digits(n//10). Base: n<10 → return n.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 90,
    starterCode: { python: `def sum_digits(n):\n    if n < 10: return n\n    return n % 10 + sum_digits(n // 10)\nprint(sum_digits(int(input())))`, java: `import java.util.Scanner;\npublic class Main {\n    static int sumDigits(int n) { return n<10?n:n%10+sumDigits(n/10); }\n    public static void main(String[] args) { System.out.println(sumDigits(new Scanner(System.in).nextInt())); }\n}`, cpp: `#include <iostream>\nusing namespace std;\nint sumDigits(int n) { return n<10?n:n%10+sumDigits(n/10); }\nint main() { int n; cin>>n; cout<<sumDigits(n)<<endl; return 0; }`, javascript: `function sumDigits(n) { return n<10?n:n%10+sumDigits(Math.floor(n/10)); }\nconsole.log(sumDigits(parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim())));` },
    testCases: [ { input: "123", expectedOutput: "6", isSample: true }, { input: "9999", expectedOutput: "36", isSample: true }, { input: "0", expectedOutput: "0", isSample: false }, { input: "5", expectedOutput: "5", isSample: false } ] },
  { slug: "reverse-string-recursive", title: "Reverse String (Recursive)", statement: `Reverse a string using recursion.\n\n**Input:** A string.\n**Output:** The reversed string.`, difficulty: "EASY", topics: ["recursion", "strings"], hints: ["Base case: empty or single char string.", "Recursive: reverse(s) = reverse(s[1:]) + s[0]."], editorial: "Take last char + reverse of remaining. Or swap first and last and recurse on middle.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 10, position: 91,
    starterCode: { python: `def reverse(s):\n    if len(s) <= 1: return s\n    return reverse(s[1:]) + s[0]\nprint(reverse(input().strip()))`, java: `import java.util.Scanner;\npublic class Main {\n    static String reverse(String s) { return s.length()<=1?s:reverse(s.substring(1))+s.charAt(0); }\n    public static void main(String[] args) { System.out.println(reverse(new Scanner(System.in).nextLine().trim())); }\n}`, cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nstring rev(string s) { return s.size()<=1?s:rev(s.substr(1))+s[0]; }\nint main() { string s; getline(cin,s); cout<<rev(s)<<endl; return 0; }`, javascript: `function reverse(s) { return s.length<=1?s:reverse(s.slice(1))+s[0]; }\nconsole.log(reverse(require('fs').readFileSync('/dev/stdin','utf8').trim()));` },
    testCases: [ { input: "hello", expectedOutput: "olleh", isSample: true }, { input: "a", expectedOutput: "a", isSample: true }, { input: "abcdef", expectedOutput: "fedcba", isSample: false } ] },
  { slug: "tower-of-hanoi-count", title: "Tower of Hanoi — Count Moves", statement: `Calculate the minimum number of moves needed to solve Tower of Hanoi with N disks.\n\n**Input:** Integer N (1 ≤ N ≤ 30).\n**Output:** Minimum number of moves.`, difficulty: "MEDIUM", topics: ["recursion", "math"], hints: ["T(n) = 2 * T(n-1) + 1.", "Or simply 2^n - 1."], editorial: "Recursive formula: T(n) = 2*T(n-1)+1. Closed form: 2^n - 1.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 92,
    starterCode: { python: `def hanoi(n):\n    if n == 1: return 1\n    return 2 * hanoi(n - 1) + 1\nprint(hanoi(int(input())))`, java: `import java.util.Scanner;\npublic class Main {\n    static long hanoi(int n) { return n==1?1:2*hanoi(n-1)+1; }\n    public static void main(String[] args) { System.out.println(hanoi(new Scanner(System.in).nextInt())); }\n}`, cpp: `#include <iostream>\nusing namespace std;\nlong long hanoi(int n) { return n==1?1:2*hanoi(n-1)+1; }\nint main() { int n; cin>>n; cout<<hanoi(n)<<endl; return 0; }`, javascript: `function hanoi(n) { return n===1?1n:2n*hanoi(n-1)+1n; }\nconsole.log(hanoi(parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim())).toString());` },
    testCases: [ { input: "3", expectedOutput: "7", isSample: true }, { input: "1", expectedOutput: "1", isSample: true }, { input: "10", expectedOutput: "1023", isSample: false }, { input: "20", expectedOutput: "1048575", isSample: false } ] },
  // === MORE STACKS & QUEUES (95-97) ===
  { slug: "min-stack", title: "Min Stack", statement: `Implement a stack that supports push, pop, and getMin in O(1).\n\nOperations:\n- \`push X\` — push X\n- \`pop\` — pop top\n- \`min\` — print current minimum\n\n**Input:** Line 1: Q (number of operations). Next Q lines: operations.\n**Output:** For each \`min\` operation, print the minimum.`, difficulty: "MEDIUM", topics: ["stacks"], hints: ["Maintain a second stack tracking minimums.", "When pushing, push onto min-stack if X ≤ current min."], editorial: "Use auxiliary stack: push current min alongside. When main stack pops, min-stack also pops if tops match.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 95,
    starterCode: { python: `q = int(input())\nstack = []\nmin_stack = []\nfor _ in range(q):\n    op = input().split()\n    if op[0] == "push":\n        x = int(op[1])\n        stack.append(x)\n        if not min_stack or x <= min_stack[-1]: min_stack.append(x)\n    elif op[0] == "pop":\n        if stack:\n            if stack[-1] == min_stack[-1]: min_stack.pop()\n            stack.pop()\n    elif op[0] == "min":\n        print(min_stack[-1] if min_stack else -1)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int q=sc.nextInt(); sc.nextLine();\n        Stack<Integer> stack=new Stack<>(), minSt=new Stack<>();\n        StringBuilder sb=new StringBuilder();\n        for(int i=0;i<q;i++) { String[] op=sc.nextLine().split(" ");\n            if(op[0].equals("push")) { int x=Integer.parseInt(op[1]); stack.push(x); if(minSt.isEmpty()||x<=minSt.peek()) minSt.push(x); }\n            else if(op[0].equals("pop")) { if(!stack.isEmpty()) { if(stack.peek().equals(minSt.peek())) minSt.pop(); stack.pop(); } }\n            else if(op[0].equals("min")) { sb.append(minSt.isEmpty()?-1:minSt.peek()).append("\\n"); } }\n        System.out.print(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <stack>\nusing namespace std;\nint main() { int q; cin>>q; cin.ignore();\n    stack<int> st, mn;\n    while(q--) { string op; getline(cin, op);\n        if(op.substr(0,4)=="push") { int x=stoi(op.substr(5)); st.push(x); if(mn.empty()||x<=mn.top()) mn.push(x); }\n        else if(op=="pop") { if(!st.empty()) { if(st.top()==mn.top()) mn.pop(); st.pop(); } }\n        else if(op=="min") { cout<<(mn.empty()?-1:mn.top())<<endl; } }\n    return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst q=parseInt(lines[0]), stack=[], minStack=[], out=[];\nfor(let i=1;i<=q;i++) { const parts=lines[i].split(' ');\n    if(parts[0]==='push') { const x=parseInt(parts[1]); stack.push(x); if(!minStack.length||x<=minStack[minStack.length-1]) minStack.push(x); }\n    else if(parts[0]==='pop') { if(stack.length) { if(stack[stack.length-1]===minStack[minStack.length-1]) minStack.pop(); stack.pop(); } }\n    else if(parts[0]==='min') { out.push(minStack.length?minStack[minStack.length-1]:-1); } }\nconsole.log(out.join('\\n'));` },
    testCases: [ { input: "7\npush 5\npush 3\npush 7\nmin\npop\nmin\npop", expectedOutput: "3\n3", isSample: true }, { input: "5\npush 2\npush 2\npop\nmin\npop", expectedOutput: "2", isSample: true }, { input: "4\npush 1\npush -1\nmin\npop", expectedOutput: "-1", isSample: false } ] },
  { slug: "queue-using-stacks", title: "Queue Using Two Stacks", statement: `Implement a queue using two stacks. Support:\n- \`enqueue X\` — add X\n- \`dequeue\` — remove and print front element\n- \`front\` — print front element\n\n**Input:** Line 1: Q. Next Q lines: operations.\n**Output:** For each dequeue/front, print the result. Print -1 if empty.`, difficulty: "MEDIUM", topics: ["stacks", "queues"], hints: ["Use stack1 for enqueue, stack2 for dequeue.", "When stack2 is empty, transfer all from stack1 to stack2."], editorial: "Two stacks: push to s1. For dequeue/front: if s2 empty, pour s1 into s2. Then pop/peek s2.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 96,
    starterCode: { python: `q = int(input())\ns1, s2 = [], []\nfor _ in range(q):\n    op = input().split()\n    if op[0] == "enqueue":\n        s1.append(int(op[1]))\n    elif op[0] == "dequeue":\n        if not s2:\n            while s1: s2.append(s1.pop())\n        print(s2.pop() if s2 else -1)\n    elif op[0] == "front":\n        if not s2:\n            while s1: s2.append(s1.pop())\n        print(s2[-1] if s2 else -1)`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc=new Scanner(System.in); int q=sc.nextInt(); sc.nextLine();\n        Stack<Integer> s1=new Stack<>(), s2=new Stack<>();\n        StringBuilder sb=new StringBuilder();\n        for(int i=0;i<q;i++) { String[] op=sc.nextLine().split(" ");\n            if(op[0].equals("enqueue")) s1.push(Integer.parseInt(op[1]));\n            else { if(s2.isEmpty()) while(!s1.isEmpty()) s2.push(s1.pop());\n                if(op[0].equals("dequeue")) sb.append(s2.isEmpty()?-1:s2.pop()).append("\\n");\n                else sb.append(s2.isEmpty()?-1:s2.peek()).append("\\n"); } }\n        System.out.print(sb);\n    }\n}`, cpp: `#include <iostream>\n#include <stack>\nusing namespace std;\nint main() { int q; cin>>q; cin.ignore();\n    stack<int> s1,s2;\n    while(q--) { string op; getline(cin,op);\n        if(op.substr(0,7)=="enqueue") s1.push(stoi(op.substr(8)));\n        else { if(s2.empty()) while(!s1.empty()) { s2.push(s1.top()); s1.pop(); }\n            if(op=="dequeue") { if(s2.empty()) cout<<-1<<endl; else { cout<<s2.top()<<endl; s2.pop(); } }\n            else { cout<<(s2.empty()?-1:s2.top())<<endl; } } }\n    return 0; }`, javascript: `const lines=require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst q=parseInt(lines[0]), s1=[], s2=[], out=[];\nfor(let i=1;i<=q;i++) { const parts=lines[i].split(' ');\n    if(parts[0]==='enqueue') s1.push(parseInt(parts[1]));\n    else { if(!s2.length) while(s1.length) s2.push(s1.pop());\n        if(parts[0]==='dequeue') out.push(s2.length?s2.pop():-1);\n        else out.push(s2.length?s2[s2.length-1]:-1); } }\nconsole.log(out.join('\\n'));` },
    testCases: [ { input: "6\nenqueue 1\nenqueue 2\nenqueue 3\ndequeue\ndequeue\nfront", expectedOutput: "1\n2\n3", isSample: true }, { input: "3\ndequeue\nenqueue 5\nfront", expectedOutput: "-1\n5", isSample: true }, { input: "4\nenqueue 10\nenqueue 20\ndequeue\ndequeue", expectedOutput: "10\n20", isSample: false } ] },
  { slug: "evaluate-postfix", title: "Evaluate Postfix Expression", statement: `Evaluate a postfix (Reverse Polish Notation) expression.\n\nOperands are integers, operators are +, -, *, /. Division is integer division (truncate toward zero). Tokens are space-separated.\n\n**Input:** Space-separated postfix expression.\n**Output:** The result.`, difficulty: "MEDIUM", topics: ["stacks", "math"], hints: ["Use a stack. Push numbers. On operator, pop two, compute, push result.", "Note: first popped is right operand, second popped is left."], editorial: "Stack-based evaluation: push numbers, on operator pop b then a, push a op b.", timeLimitMs: 2000, memoryLimitKb: 256000, xpReward: 25, position: 97,
    starterCode: { python: `tokens = input().split()\nstack = []\nfor t in tokens:\n    if t in "+-*/":\n        b, a = stack.pop(), stack.pop()\n        if t == "+": stack.append(a + b)\n        elif t == "-": stack.append(a - b)\n        elif t == "*": stack.append(a * b)\n        elif t == "/": stack.append(int(a / b))\n    else:\n        stack.append(int(t))\nprint(stack[0])`, java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String[] tokens = new Scanner(System.in).nextLine().trim().split(" ");\n        Stack<Long> stack = new Stack<>();\n        for(String t:tokens) { if("+-*/".contains(t)&&t.length()==1) { long b=stack.pop(),a=stack.pop();\n            if(t.equals("+")) stack.push(a+b); else if(t.equals("-")) stack.push(a-b);\n            else if(t.equals("*")) stack.push(a*b); else stack.push(a/b);\n        } else stack.push(Long.parseLong(t)); }\n        System.out.println(stack.peek());\n    }\n}`, cpp: `#include <iostream>\n#include <stack>\n#include <sstream>\nusing namespace std;\nint main() { string line; getline(cin,line); istringstream iss(line);\n    stack<long long> st; string t;\n    while(iss>>t) { if(t=="+"||t=="-"||t=="*"||t=="/") { long long b=st.top(); st.pop(); long long a=st.top(); st.pop();\n        if(t=="+") st.push(a+b); else if(t=="-") st.push(a-b); else if(t=="*") st.push(a*b); else st.push(a/b);\n    } else st.push(stoll(t)); }\n    cout<<st.top()<<endl; return 0; }`, javascript: `const tokens=require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ');\nconst stack=[];\nfor(const t of tokens) { if(['+','-','*','/'].includes(t)) { const b=stack.pop(),a=stack.pop();\n    if(t==='+') stack.push(a+b); else if(t==='-') stack.push(a-b); else if(t==='*') stack.push(a*b); else stack.push(Math.trunc(a/b));\n} else stack.push(parseInt(t)); }\nconsole.log(stack[0]);` },
    testCases: [ { input: "2 3 +", expectedOutput: "5", isSample: true }, { input: "5 1 2 + 4 * + 3 -", expectedOutput: "14", isSample: true }, { input: "10 2 /", expectedOutput: "5", isSample: false }, { input: "4 13 5 / +", expectedOutput: "6", isSample: false } ] },
]

// ═══════════════════════════════════════════════════════════════════
// COMBINE ALL STAGES + RUN SEED
// ═══════════════════════════════════════════════════════════════════
const allProblems = [
  ...stage1, ...stage2, ...stage3, ...stage4,
  ...stage5, ...stage6, ...stage7, ...stage8to12,
  ...missingProblems,
]

function cleanPython(code: string, slug: string): string {
  if (!code) return ""
  if (slug === "hello-world") return `# Write your code here to print "Hello, World!"\n`
  
  if (code.includes("def ")) {
    const lines = code.split("\n")
    const out: string[] = []
    let insideDef = false
    let defIndent = 0
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith("def ")) {
        out.push(line)
        out.push("    # Write your code here\n    pass\n")
        insideDef = true
        defIndent = line.search(/\S/)
      } else if (insideDef) {
        if (line.trim() !== "" && line.search(/\S/) <= defIndent && !line.trim().startsWith("#")) {
          insideDef = false
          out.push(line)
        }
      } else {
        out.push(line)
      }
    }
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n"
  }

  const lines = code.split("\n")
  const inputLines: string[] = []
  for (const line of lines) {
    if (line.includes("input()") || line.includes("sys.stdin") || line.trim().startsWith("import ") || line.trim().startsWith("from ")) {
      inputLines.push(line)
    }
  }
  if (inputLines.length > 0) {
    return inputLines.join("\n").trimEnd() + "\n\n# Write your code here\n"
  }
  return "# Write your code here\n"
}

function cleanCpp(code: string, slug: string): string {
  if (!code) return ""
  if (slug === "hello-world") {
    return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here to print "Hello, World!"\n    \n    return 0;\n}\n`
  }
  
  const mainIdx = code.indexOf("int main()")
  if (mainIdx === -1) return code
  
  const preMain = code.substring(0, mainIdx + "int main()".length)
  const mainBody = code.substring(mainIdx + "int main()".length)
  
  const bodyLines = mainBody.split("\n")
  const cinLines: string[] = []
  for (const line of bodyLines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("cin >>") || trimmed.startsWith("int ") || trimmed.startsWith("string ") || trimmed.startsWith("double ") || trimmed.startsWith("float ") || trimmed.startsWith("char ") || trimmed.startsWith("long ") || trimmed.startsWith("vector<") || trimmed.startsWith("getline(")) {
      if (!trimmed.includes("cout") && !trimmed.includes("return")) {
        cinLines.push(line)
      }
    }
  }
  
  return `${preMain} {\n${cinLines.join("\n")}\n\n    // Write your code here\n    \n    return 0;\n}\n`
}

function cleanJava(code: string, slug: string): string {
  if (!code) return ""
  if (slug === "hello-world") {
    return `public class Main {\n    public static void main(String[] args) {\n        // Write your code here to print "Hello, World!"\n        \n    }\n}\n`
  }
  
  const mainIdx = code.indexOf("public static void main")
  if (mainIdx === -1) return code
  
  const preMain = code.substring(0, mainIdx)
  const mainPart = code.substring(mainIdx)
  const bodyLines = mainPart.split("\n")
  const inputLines: string[] = []
  
  for (const line of bodyLines) {
    const trimmed = line.trim()
    if (trimmed.includes("Scanner ") || trimmed.startsWith("int ") || trimmed.startsWith("String ") || trimmed.startsWith("double ") || trimmed.startsWith("float ") || trimmed.startsWith("long ") || trimmed.includes("sc.next")) {
      if (!trimmed.includes("System.out.print")) {
        inputLines.push(line)
      }
    }
  }
  
  return `${preMain}public static void main(String[] args) {\n${inputLines.join("\n")}\n\n        // Write your code here\n        \n    }\n}\n`
}

function cleanJs(code: string, slug: string): string {
  if (!code) return ""
  if (slug === "hello-world") {
    return `// Write your code here to print "Hello, World!"\n`
  }
  
  const lines = code.split("\n")
  const inputLines: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.includes("fs.readFileSync") || trimmed.includes("split(") || trimmed.startsWith("const ") || trimmed.startsWith("let ") || trimmed.startsWith("var ")) {
      if (!trimmed.includes("console.log") && !trimmed.includes("return")) {
        inputLines.push(line)
      }
    }
  }
  
  return `${inputLines.join("\n")}\n\n// Write your code here\n`
}

async function main() {
  console.log(`\n🚀 TechGration Coding Arena — Seeding ${allProblems.length} problems...\n`)
  let created = 0
  let skipped = 0

  for (const p of allProblems) {
    const existing = await prisma.codingProblem.findUnique({ where: { slug: p.slug } })
    if (existing) {
      console.log(`  ⏭  Skip (exists): ${p.slug}`)
      skipped++
      continue
    }

    const { testCases, ...problemData } = p
    const solutionCode = problemData.starterCode
    const cleanedStarter = {
      python: cleanPython((problemData.starterCode as any)?.python || "", p.slug),
      cpp: cleanCpp((problemData.starterCode as any)?.cpp || "", p.slug),
      java: cleanJava((problemData.starterCode as any)?.java || "", p.slug),
      javascript: cleanJs((problemData.starterCode as any)?.javascript || "", p.slug),
    }

    await prisma.codingProblem.create({
      data: {
        ...problemData,
        isPublished: true,
        solutionCode: solutionCode as any,
        starterCode: cleanedStarter as any,
        testCases: {
          create: testCases.map((tc, i) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isSample: tc.isSample,
            explanation: tc.explanation || null,
            position: i,
          })),
        },
      },
    })
    console.log(`  ✅ Created: ${p.title} [${p.difficulty}] (pos ${p.position})`)
    created++
  }

  console.log(`\n✨ Done! Created: ${created}, Skipped: ${skipped}, Total: ${allProblems.length}\n`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

