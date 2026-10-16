import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  // Storage
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().default("techgration-lms"),
  S3_FORCE_PATH_STYLE: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),

  // Feature Flags
  FEATURE_BILLING_ENABLED: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(false),
  FEATURE_COURSE_APPROVAL_REQUIRED: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),
  FEATURE_SELF_REGISTRATION_ENABLED: z.preprocess((val) => val === "true" || val === true, z.boolean()).default(true),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.preprocess((val) => Number(val), z.number()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("TechGration LMS <noreply@techgration.com>"),
})

export const env = envSchema.parse(process.env)
