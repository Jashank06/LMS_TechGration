<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TECHGRATION PRODUCTION & DATA INTEGRITY DIRECTIVES

## 1. STRICT ZERO-TOLERANCE POLICY FOR DUMMY / FAKE / SYNTHETIC DATA
- **NEVER insert, seed, or hardcode fake, dummy, or synthetic mock data** into the database (MongoDB Atlas) or frontend/mobile UI.
- **NEVER create or run test/seed scripts that mutate production data** with sample courses, fake live classes, fake assignments, artificial submissions, or mock progress.
- **NEVER use mock fallback arrays or fake cards in UI components** (Web or Mobile / Flutter). If an API or database query returns an empty list `[]` or null, **ALWAYS render an authentic empty state** (e.g., "No Live Classes Scheduled", "No Assignments Posted Yet", "No Study Materials Uploaded").
- **Real User Data Only**: Only real courses, enrollments, lectures, assignments, and submissions created by authorized instructors/admins or registered students may exist.

## 2. PRODUCTION DATABASE SAFETY RULES
- **No Test Seeding in Production**: Automated tests, smoke tests, and UI verifications must NEVER execute database `create`, `update`, `upsert`, or `insertMany` commands against the live production database (`DATABASE_URL`).
- **Clean Empty States Everywhere**: Every portal hub (Course Hub, Live Classes Hub, Assignments Hub, Quizzes, Certificates, Leaderboard) must gracefully handle empty collections with professional, production-ready empty state illustrations and messaging—never mock fallback rows.
