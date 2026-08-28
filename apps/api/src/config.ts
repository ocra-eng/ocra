import { z } from "zod"

/**
 * Fail fast and loudly on misconfiguration: a half-configured API that boots
 * and 500s later is worse than one that refuses to start.
 */
const schema = z.object({
  // NODE_ENV is about runtime optimisation and is "production" on every
  // deployed host, dev included. APP_ENV is what this environment *is*,
  // and it decides whether missing Stripe config is fatal.
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(["local", "dev", "production"]).default("local"),
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
  /** JSON array of partner discounts; see .env.example. Empty means none. */
  PARTNER_OFFERS: z.string().default("[]"),
})

/** One partner discount. `code` is absent when the shopUrl carries it. */
const partnerOffer = z.object({
  key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case key"),
  name: z.string().min(1),
  percent: z.number().int().min(1).max(100),
  shopUrl: z.string().url().startsWith("https://"),
  code: z.string().min(1).optional(),
})

export type PartnerOffer = z.infer<typeof partnerOffer>

const invalid = (issues: string) =>
  new Error(`Invalid environment configuration:\n${issues}`)

/** The offers are the member benefit, so a malformed list refuses to boot
 *  rather than quietly serving nothing. */
const parseOffers = (raw: string): PartnerOffer[] => {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    throw invalid("  PARTNER_OFFERS: not valid JSON")
  }
  const offers = z.array(partnerOffer).safeParse(json)
  if (!offers.success) {
    throw invalid(
      offers.error.issues
        .map((issue) => `  PARTNER_OFFERS.${issue.path.join(".")}: ${issue.message}`)
        .join("\n")
    )
  }
  return offers.data
}

export type Config = z.infer<typeof schema> & {
  allowedOrigins: string[]
  partnerOffers: PartnerOffer[]
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
    throw invalid(
      parsed.error.issues
        .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")
    )
  }
  const missingStripe = STRIPE_KEYS.filter((key) => !parsed.data[key])
  if (parsed.data.APP_ENV === "production" && missingStripe.length > 0) {
    throw new Error(
      `Stripe configuration is required when APP_ENV=production. Missing: ${missingStripe.join(", ")}`
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
    partnerOffers: parseOffers(parsed.data.PARTNER_OFFERS),
  }
}
