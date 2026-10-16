import assert from "node:assert/strict"
import { rankStudents, type RawStudent } from "../src/lib/leaderboard-rank"

// Assertion-only harness for the pure ranking function. Never touches DB/UI.
const mk = (id: string): RawStudent => ({
  userId: id, displayName: id, avatarUrl: null, isAnonymous: false, email: null,
})
const day = 24 * 60 * 60 * 1000
const now = new Date("2026-01-30T00:00:00Z")
const ago = (d: number) => new Date(now.getTime() - d * day)

const students = [mk("a"), mk("b"), mk("c"), mk("d")]

// 1) ordering by total marks, best quiz attempt only, unscored goes to waiting
{
  const { ranked, waiting } = rankStudents(
    students,
    [
      { userId: "a", assignmentId: "x1", marks: 80, max: 100, at: ago(1) },
      { userId: "b", assignmentId: "x1", marks: 90, max: 100, at: ago(1) },
    ],
    [
      { userId: "a", assessmentId: "q1", earned: 10, total: 20, at: ago(2) },
      { userId: "a", assessmentId: "q1", earned: 20, total: 20, at: ago(1) }, // best
      { userId: "c", assessmentId: "q1", earned: 5, total: 20, at: ago(1) },
    ],
    { now }
  )
  assert.deepEqual(ranked.map((r) => r.userId), ["a", "b", "c"])
  assert.equal(ranked[0].totalMarks, 100)
  assert.equal(ranked[0].quizMarks, 20)
  assert.deepEqual(waiting.map((w) => w.userId), ["d"])
}

// 2) tie on marks+accuracy shares rank; tie-break order by earliest score
{
  const { ranked } = rankStudents(
    [mk("a"), mk("b"), mk("c")],
    [
      { userId: "a", assignmentId: "x", marks: 50, max: 100, at: ago(1) },
      { userId: "b", assignmentId: "x", marks: 50, max: 100, at: ago(3) },
      { userId: "c", assignmentId: "x", marks: 10, max: 100, at: ago(1) },
    ],
    [],
    { now }
  )
  assert.deepEqual(ranked.map((r) => r.userId), ["b", "a", "c"])
  assert.deepEqual(ranked.map((r) => r.rank), [1, 1, 3])
}

// 3) accuracy breaks marks tie
{
  const { ranked } = rankStudents(
    [mk("a"), mk("b")],
    [
      { userId: "a", assignmentId: "x", marks: 50, max: 100, at: ago(1) },
      { userId: "b", assignmentId: "x", marks: 50, max: 60, at: ago(1) },
    ],
    [],
    { now }
  )
  assert.equal(ranked[0].userId, "b")
  assert.deepEqual(ranked.map((r) => r.rank), [1, 2])
}

// 4) rank movement over 7 days
{
  const { ranked } = rankStudents(
    [mk("a"), mk("b")],
    [
      { userId: "a", assignmentId: "x1", marks: 90, max: 100, at: ago(20) }, // a led last week
      { userId: "b", assignmentId: "x1", marks: 40, max: 100, at: ago(20) },
      { userId: "b", assignmentId: "x2", marks: 90, max: 100, at: ago(1) },  // b overtook
    ],
    [],
    { now }
  )
  const a = ranked.find((r) => r.userId === "a")!
  const b = ranked.find((r) => r.userId === "b")!
  assert.equal(b.rank, 1)
  assert.equal(b.rankDelta, 1)
  assert.equal(a.rankDelta, -1)
  assert.ok(b.badges.includes("TOP_SCORER"))
  assert.ok(b.badges.includes("RISING_STAR"))
}

// 5) no history => null deltas; nothing scored => empty ranked
{
  const r1 = rankStudents([mk("a")], [{ userId: "a", assignmentId: "x", marks: 5, max: 10, at: ago(1) }], [], { now })
  assert.equal(r1.ranked[0].rankDelta, null)
  assert.equal(r1.ranked[0].badges.includes("QUIZ_ACE"), false)
  const r2 = rankStudents([mk("a"), mk("b")], [], [], { now })
  assert.equal(r2.ranked.length, 0)
  assert.equal(r2.waiting.length, 2)
}

console.log("✅ leaderboard ranking assertions passed")
