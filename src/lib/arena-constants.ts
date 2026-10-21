// Judge0 CE Language IDs (RapidAPI)
export const LANGUAGE_MAP: Record<string, number> = {
  python: 71,      // Python 3.8.1
  java: 62,        // Java (OpenJDK 13.0.1)
  cpp: 54,         // C++ (GCC 9.2.0)
  javascript: 63,  // JavaScript (Node.js 12.14.0)
}

export const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python 3",
  java: "Java",
  cpp: "C++ 17",
  javascript: "JavaScript",
}

export const SUPPORTED_LANGUAGES = ["python", "java", "cpp", "javascript"] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// XP rewards per difficulty
export const XP_REWARDS: Record<string, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
}

export const DAILY_CHALLENGE_BONUS_XP = 5

// All topic tags — progressive learning path from basics to advanced
export const ARENA_TOPICS = [
  "basics",
  "math",
  "conditionals",
  "loops",
  "patterns",
  "functions",
  "strings",
  "arrays",
  "hashing",
  "sorting",
  "searching",
  "recursion",
  "stacks",
  "queues",
  "two-pointers",
  "dynamic-programming",
] as const

export const TOPIC_LABELS: Record<string, string> = {
  "basics": "Basics & I/O",
  "math": "Math & Arithmetic",
  "conditionals": "Conditionals",
  "loops": "Loops",
  "patterns": "Patterns",
  "functions": "Functions",
  "strings": "Strings",
  "arrays": "Arrays & Lists",
  "hashing": "Dictionaries & Hashing",
  "sorting": "Sorting",
  "searching": "Searching",
  "recursion": "Recursion",
  "stacks": "Stacks",
  "queues": "Queues",
  "two-pointers": "Two Pointers",
  "dynamic-programming": "Dynamic Programming",
}

export interface ArenaStageInfo {
  id: number
  title: string
  subtitle: string
  description: string
  range: [number, number]
  color: string
  gradient: string
  borderColor: string
}

export const ARENA_STAGES: ArenaStageInfo[] = [
  {
    id: 1,
    title: "Getting Started — Hello World & I/O",
    subtitle: "Python Fundamentals & Output",
    description: "Master print statements, taking user inputs, arithmetic operators, and basic variables.",
    range: [1, 8],
    color: "text-emerald-500",
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderColor: "border-emerald-500/30",
  },
  {
    id: 2,
    title: "Decision Making — Conditionals",
    subtitle: "If-Else & Logical Flow",
    description: "Understand if-elif-else branching, comparative checks, leap years, and grade calculation.",
    range: [9, 18],
    color: "text-cyan-500",
    gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
    borderColor: "border-cyan-500/30",
  },
  {
    id: 3,
    title: "Repetition — Loops & Patterns",
    subtitle: "For, While & Iterations",
    description: "Write while & for loops, compute factorials, count digits, reverse numbers, and check primes.",
    range: [19, 30],
    color: "text-teal-500",
    gradient: "from-teal-500/10 via-emerald-500/5 to-transparent",
    borderColor: "border-teal-500/30",
  },
  {
    id: 4,
    title: "Building Blocks — Functions & Math",
    subtitle: "Modular Code & Reusability",
    description: "Define clean functions, return values, compute GCD, LCM, Armstrong and binary conversions.",
    range: [31, 38],
    color: "text-indigo-500",
    gradient: "from-indigo-500/10 via-purple-500/5 to-transparent",
    borderColor: "border-indigo-500/30",
  },
  {
    id: 5,
    title: "Text Mastery — Strings",
    subtitle: "String Manipulation & Parsing",
    description: "Index strings, reverse words, count vowels, toggle case, check anagrams, and compress run-lengths.",
    range: [39, 50],
    color: "text-pink-500",
    gradient: "from-pink-500/10 via-rose-500/5 to-transparent",
    borderColor: "border-pink-500/30",
  },
  {
    id: 6,
    title: "Collections — Arrays & Lists",
    subtitle: "Linear Data Structures & Two Pointers",
    description: "Traverse arrays, find min/max, reverse in-place, rotate elements, and implement Kadane's algorithm.",
    range: [51, 65],
    color: "text-amber-500",
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    borderColor: "border-amber-500/30",
  },
  {
    id: 7,
    title: "Key-Value Magic — Dictionaries & Hashing",
    subtitle: "Fast Lookups & Frequency Maps",
    description: "Use hash maps for O(1) lookups, group anagrams, count frequencies, and solve Two Sum.",
    range: [66, 71],
    color: "text-violet-500",
    gradient: "from-violet-500/10 via-indigo-500/5 to-transparent",
    borderColor: "border-violet-500/30",
  },
  {
    id: 8,
    title: "Ordering Data — Sorting",
    subtitle: "Fundamental Sorting Algorithms",
    description: "Implement Bubble, Selection, Insertion sorts, Dutch National Flag, and custom frequency sorts.",
    range: [72, 79],
    color: "text-orange-500",
    gradient: "from-orange-500/10 via-amber-500/5 to-transparent",
    borderColor: "border-orange-500/30",
  },
  {
    id: 9,
    title: "Finding Things — Searching",
    subtitle: "Binary Search Mastery",
    description: "Implement classic binary search, find bounds, search rotated arrays, and find peak elements.",
    range: [80, 85],
    color: "text-blue-500",
    gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    borderColor: "border-blue-500/30",
  },
  {
    id: 10,
    title: "Think Recursively — Recursion",
    subtitle: "Self-Referential Functions",
    description: "Understand base cases, recursive call stacks, Tower of Hanoi, and generating subsets.",
    range: [86, 92],
    color: "text-purple-500",
    gradient: "from-purple-500/10 via-pink-500/5 to-transparent",
    borderColor: "border-purple-500/30",
  },
  {
    id: 11,
    title: "Stack It Up — Stacks & Queues",
    subtitle: "LIFO & FIFO Data Structures",
    description: "Validate balanced parentheses, monotonic stacks, Next Greater Element, and Min Stack.",
    range: [93, 97],
    color: "text-emerald-500",
    gradient: "from-emerald-500/10 via-green-500/5 to-transparent",
    borderColor: "border-emerald-500/30",
  },
  {
    id: 12,
    title: "Optimize — Dynamic Programming",
    subtitle: "Optimal Substructure & Memoization",
    description: "Break complex problems into subproblems: Climbing Stairs, Coin Change, and House Robber.",
    range: [98, 100],
    color: "text-rose-500",
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    borderColor: "border-rose-500/30",
  },
]

// Stage labels for the learning path
export const STAGE_LABELS: Record<number, string> = {
  1: "🚀 Getting Started — Hello World & I/O",
  2: "🔀 Decision Making — Conditionals",
  3: "🔄 Repetition — Loops & Patterns",
  4: "🧩 Building Blocks — Functions",
  5: "📝 Text Mastery — Strings",
  6: "📦 Collections — Arrays & Lists",
  7: "🗂️ Key-Value Magic — Dictionaries & Hashing",
  8: "📊 Ordering Data — Sorting",
  9: "🔍 Finding Things — Searching",
  10: "🪞 Think Recursively — Recursion",
  11: "📚 Stack It Up — Stacks & Queues",
  12: "🧠 Optimize — Dynamic Programming",
}

// Judge0 status ID to CodingVerdict mapping
export const JUDGE0_STATUS_MAP: Record<number, string> = {
  1: "PENDING",    // In Queue
  2: "PENDING",    // Processing
  3: "ACCEPTED",
  4: "WRONG_ANSWER",
  5: "TIME_LIMIT_EXCEEDED",
  6: "COMPILATION_ERROR",
  7: "RUNTIME_ERROR",    // SIGSEGV
  8: "RUNTIME_ERROR",    // SIGXFSZ
  9: "RUNTIME_ERROR",    // SIGFPE
  10: "RUNTIME_ERROR",   // SIGABRT
  11: "RUNTIME_ERROR",   // NZEC
  12: "RUNTIME_ERROR",   // Other
  13: "INTERNAL_ERROR",
  14: "RUNTIME_ERROR",   // Exec Format Error
}

export const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: "python",
  java: "java",
  cpp: "cpp",
  javascript: "javascript",
}
