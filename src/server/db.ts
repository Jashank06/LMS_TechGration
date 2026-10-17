import { PrismaClient } from "@prisma/client"

// Automatically strip surrounding quotes or whitespace if injected literally by Docker --env-file
const rawUrl = process.env.DATABASE_URL
const sanitizedDatabaseUrl = rawUrl ? rawUrl.replace(/^["']|["']$/g, "").trim() : undefined

if (sanitizedDatabaseUrl) {
  process.env.DATABASE_URL = sanitizedDatabaseUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: sanitizedDatabaseUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
