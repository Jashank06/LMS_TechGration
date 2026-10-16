# Multi-stage production Dockerfile for TechGration LMS (Frontend + Backend)
# Optimized for multi-platform builds: linux/amd64, linux/arm64

FROM --platform=$BUILDPLATFORM node:20-alpine AS base

# Install required native libraries for Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install pnpm matching project version
RUN npm install -g pnpm@10.28.2

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# Stage 2: Build Next.js application (Frontend UI + Backend API Routes)
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client for multi-platform support
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fallback values for static analysis during build phase
ENV DATABASE_URL="mongodb://build_dummy:27017/build"
ENV BETTER_AUTH_SECRET="build-phase-dummy-secret-minimum-32-characters"

RUN pnpm run build

# Stage 3: Minimal production runtime
FROM node:20-alpine AS runner
WORKDIR /app

# OpenSSL needed by Prisma Client runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public static files and standalone output
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
