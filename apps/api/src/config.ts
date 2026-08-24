import { z } from "zod"

/**
 * Fail fast and loudly on misconfiguration: a half-configured API that boots
 * and 500s later is worse than one that refuses to start.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  /** Supabase project URL, e.g. https://abc.supabase.co — used for JWKS. */
  SUPABASE_URL: z.string().url(),
  // Optional outside production so the API boots for auth/card work before
  // Stripe is set up. Billing routes report 503 until these are present.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_ATHLETE_PRICE_ID: z.string().min(1).optional(),
  STRIPE_ORGANISATION_PRICE_ID: z.string().optional(),
  /** Where Stripe returns the member after checkout. */
  MEMBERS_APP_URL: z.string().url(),
  /** Comma-separated list of allowed browser origins. */
  ALLOWED_ORIGINS: z.string().default(""),
})

export type Config = z.infer<typeof schema> & {
  allowedOrigins: string[]
  /** True when every Stripe value needed to sell membership is present. */
  billingEnabled: boolean
}

const STRIPE_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_ATHLETE_PRICE_ID",
] as const

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const parsed = schema.safeParse(env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  const missingStripe = STRIPE_KEYS.filter((key) => !parsed.data[key])
  if (parsed.data.NODE_ENV === "production" && missingStripe.length > 0) {
    throw new Error(
      `Stripe configuration is required in production. Missing: ${missingStripe.join(", ")}`
    )
  }
  if (missingStripe.length > 0) {
    console.warn(
      `[config] Billing disabled — missing ${missingStripe.join(", ")}`
    )
  }

  return {
    ...parsed.data,
    allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    billingEnabled: missingStripe.length === 0,
  }
}
