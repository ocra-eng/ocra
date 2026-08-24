import { sql } from "drizzle-orm"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"
import Stripe from "stripe"
import { z } from "zod"
import type { Config } from "./config.js"
import type { Database } from "./db/index.js"
import { members } from "./db/schema.js"
import {
  createSupabaseVerifier,
  requireAdmin,
  requireAuth,
  requireMember,
} from "./features/auth/middleware.js"
import { handleStripeEvent } from "./features/billing/webhook.js"
import {
  findMembershipForMember,
  findVerification,
} from "./features/membership/service.js"
import { eq } from "drizzle-orm"

interface AppDeps {
  config: Config
  db: Database
  stripe?: Stripe
  /** Injectable for tests; defaults to real Supabase JWKS verification. */
  verifyToken?: (token: string) => Promise<{ supabaseUserId: string; email: string }>
}

const profileUpdate = z.object({
  profileName: z.string().trim().min(1).max(80).optional(),
})

export const createApp = ({ config, db, stripe, verifyToken }: AppDeps) => {
  const app = new Hono()
  // Null when Stripe isn't configured (local dev before billing is set up).
  const client =
    stripe ??
    (config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null)

  /** Billing routes are unavailable, not broken, when Stripe is absent. */
  const stripeOrFail = () => {
    if (!client) {
      throw new HTTPException(503, { message: "Billing is not configured" })
    }
    return client
  }
  const verify = verifyToken ?? createSupabaseVerifier(config.SUPABASE_URL)
  const authed = [requireAuth(verify), requireMember(db)] as const

  if (config.NODE_ENV !== "test") app.use("*", logger())

  app.use(
    "*",
    cors({
      origin: (origin) =>
        config.allowedOrigins.includes(origin) ? origin : null,
      credentials: true,
    })
  )

  /**
   * Health includes a real database probe: an API that answers "ok" while
   * its database is asleep is how v1 produced 500s at sign-in.
   */
  app.get("/health", async (c) => {
    let database = "ok"
    try {
      await db.execute(sql`select 1`)
    } catch {
      database = "unavailable"
    }
    return c.json(
      {
        status: database === "ok" ? "ok" : "degraded",
        api: "ok",
        database,
        billing: config.billingEnabled ? "ok" : "disabled",
      },
      database === "ok" ? 200 : 503
    )
  })

  // -------------------------------------------------------------- member

  app.get("/me", ...authed, async (c) => {
    const member = c.get("member")
    const membership = await findMembershipForMember(db, member.id)
    return c.json({
      member: {
        id: member.id,
        email: member.email,
        displayName: member.displayName,
        profileName: member.profileName ?? undefined,
        photoUrl: member.photoUrl ?? undefined,
        role: member.role,
        createdAt: member.createdAt.toISOString(),
      },
      membership: membership
        ? {
            memberNumber: membership.memberNumber,
            type: membership.type,
            status: membership.status,
            currentPeriodEnd: membership.currentPeriodEnd?.toISOString(),
          }
        : null,
    })
  })

  app.patch("/me", ...authed, async (c) => {
    const body = profileUpdate.safeParse(await c.req.json().catch(() => ({})))
    if (!body.success) {
      throw new HTTPException(400, { message: "Invalid profile update" })
    }
    const [updated] = await db
      .update(members)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(members.id, c.get("member").id))
      .returning()
    return c.json({ profileName: updated.profileName ?? undefined })
  })

  // -------------------------------------------------------------- public

  app.get("/verify/:memberNumber", async (c) => {
    const result = await findVerification(db, c.req.param("memberNumber"))
    if (!result) return c.json({ error: "not-found" }, 404)
    return c.json(result)
  })

  // ------------------------------------------------------------- billing

  app.post("/billing/checkout-session", ...authed, async (c) => {
    const member = c.get("member")
    const session = await stripeOrFail().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: config.STRIPE_ATHLETE_PRICE_ID!, quantity: 1 }],
      customer: member.stripeCustomerId ?? undefined,
      customer_email: member.stripeCustomerId ? undefined : member.email,
      success_url: `${config.MEMBERS_APP_URL}/?checkout=success`,
      cancel_url: `${config.MEMBERS_APP_URL}/membership?checkout=cancelled`,
      client_reference_id: member.id,
    })
    return c.json({ url: session.url })
  })

  app.post("/billing/portal-session", ...authed, async (c) => {
    const member = c.get("member")
    if (!member.stripeCustomerId) {
      throw new HTTPException(409, { message: "No billing account yet" })
    }
    const session = await stripeOrFail().billingPortal.sessions.create({
      customer: member.stripeCustomerId,
      return_url: `${config.MEMBERS_APP_URL}/membership`,
    })
    return c.json({ url: session.url })
  })

  /**
   * Stripe signs the raw body, so this route must read text, not JSON —
   * and it is deliberately not behind CORS or auth.
   */
  app.post("/webhooks/stripe", async (c) => {
    const signature = c.req.header("stripe-signature")
    if (!signature) return c.json({ error: "missing-signature" }, 400)

    const stripeClient = stripeOrFail()
    let event: Stripe.Event
    try {
      event = stripeClient.webhooks.constructEvent(
        await c.req.text(),
        signature,
        config.STRIPE_WEBHOOK_SECRET!
      )
    } catch {
      return c.json({ error: "invalid-signature" }, 400)
    }

    const result = await handleStripeEvent(
      {
        db,
        stripe: stripeClient,
        athletePriceId: config.STRIPE_ATHLETE_PRICE_ID!,
        organisationPriceId: config.STRIPE_ORGANISATION_PRICE_ID,
      },
      event
    )
    // Always 200: a non-2xx makes Stripe retry, and events we deliberately
    // ignore should not be retried forever.
    return c.json({ received: true, ...result })
  })

  // --------------------------------------------------------------- admin

  app.get("/admin/members", ...authed, requireAdmin, async (c) => {
    const rows = await db.select().from(members).orderBy(members.createdAt)
    return c.json({
      members: rows.map((row) => ({
        id: row.id,
        email: row.email,
        displayName: row.displayName,
        role: row.role,
        createdAt: row.createdAt.toISOString(),
      })),
    })
  })

  app.onError((error, c) => {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status)
    }
    console.error(error)
    return c.json({ error: "Internal server error" }, 500)
  })

  app.notFound((c) => c.json({ error: "not-found" }, 404))

  return app
}
