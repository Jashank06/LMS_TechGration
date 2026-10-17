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

// In development, invalidate the cached global instance if new fields were added
const cachedClient = globalForPrisma.prisma
const isStale =
  Boolean(cachedClient) &&
  !(cachedClient as unknown as { _runtimeDataModel?: { models?: { Course?: { fields?: Array<{ name: string }> } } } })
    ?._runtimeDataModel?.models?.Course?.fields?.some((f) => f.name === "timetableUrl")

if (isStale && cachedClient) {
  try {
    cachedClient.$disconnect()
  } catch {
    // Ignore disconnect error during hot reload
  }
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: sanitizedDatabaseUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
