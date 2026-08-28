import type { Config } from "../../src/config.js"

export const testConfig = (overrides: Partial<Config> = {}): Config => ({
  NODE_ENV: "test",
  APP_ENV: "local",
  PORT: 4000,
  DATABASE_URL: "pglite://memory",
  SUPABASE_URL: "https://test.supabase.co",
  STRIPE_SECRET_KEY: "sk_test_x",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
  STRIPE_ATHLETE_PRICE_ID: "price_athlete",
  STRIPE_ORGANISATION_PRICE_ID: "price_org",
  MEMBERS_APP_URL: "http://localhost:5174",
  ALLOWED_ORIGINS: "http://localhost:5174",
  allowedOrigins: ["http://localhost:5174"],
  billingEnabled: true,
  PARTNER_OFFERS: "[]",
  partnerOffers: [],
  ...overrides,
})
