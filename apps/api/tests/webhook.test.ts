import { beforeEach, describe, expect, it } from "vitest"
import type Stripe from "stripe"
import type { Database } from "../src/db/index.js"
import { members, memberships, processedEvents } from "../src/db/schema.js"
import { handleStripeEvent } from "../src/features/billing/webhook.js"
import { createTestDb } from "./helpers/db.js"

let db: Database

const ATHLETE_PRICE = "price_athlete"
const ORG_PRICE = "price_org"

/** Minimal Stripe stub: only what the handler actually reaches for. */
const stripeStub = (subscription: Partial<Stripe.Subscription>) =>
  ({
    subscriptions: {
      retrieve: async () =>
        ({
          id: "sub_1",
          status: "active",
          created: Math.floor(Date.parse("2026-02-01T00:00:00Z") / 1000),
          current_period_end: Math.floor(
            Date.parse("2027-02-01T00:00:00Z") / 1000
          ),
          customer: {
            id: "cus_1",
            email: "member@example.com",
            deleted: false,
          },
          items: { data: [{ price: { id: ATHLETE_PRICE } }] },
          ...subscription,
        }) as unknown as Stripe.Subscription,
    },
  }) as unknown as Stripe

const event = (type: string, id = "evt_1"): Stripe.Event =>
  ({
    id,
    type,
    data: { object: { id: "sub_1" } },
  }) as unknown as Stripe.Event

const deps = (stripe: Stripe) => ({
  db,
  stripe,
  athletePriceId: ATHLETE_PRICE,
  organisationPriceId: ORG_PRICE,
})

beforeEach(async () => {
  db = await createTestDb()
})

describe("stripe webhook", () => {
  it("activates a membership and mints a number", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })

    const result = await handleStripeEvent(
      deps(stripeStub({})),
      event("customer.subscription.created")
    )

    expect(result.handled).toBe(true)
    const [row] = await db.select().from(memberships)
    expect(row.status).toBe("active")
    expect(row.memberNumber).toBe("OCRA-2026-0001")
    expect(row.confirmed).toBe(true)
  })

  it("ignores a replayed event", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })
    const stripe = stripeStub({})

    await handleStripeEvent(deps(stripe), event("customer.subscription.created"))
    const second = await handleStripeEvent(
      deps(stripe),
      event("customer.subscription.created")
    )

    expect(second).toEqual({ handled: false, reason: "duplicate" })
    expect(await db.select().from(processedEvents)).toHaveLength(1)
    expect(await db.select().from(memberships)).toHaveLength(1)
  })

  it("expires a membership when the subscription is cancelled", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })

    await handleStripeEvent(
      deps(stripeStub({})),
      event("customer.subscription.created", "evt_created")
    )
    await handleStripeEvent(
      deps(stripeStub({ status: "canceled" })),
      event("customer.subscription.deleted", "evt_deleted")
    )

    const [row] = await db.select().from(memberships)
    expect(row.status).toBe("expired")
    // The number survives cancellation.
    expect(row.memberNumber).toBe("OCRA-2026-0001")
  })

  it("matches a migrated member on billing email", async () => {
    await db.insert(members).values({
      email: "signin@example.com",
      billingEmail: "member@example.com",
      displayName: "Migrated",
    })

    const result = await handleStripeEvent(
      deps(stripeStub({})),
      event("customer.subscription.created")
    )

    expect(result.handled).toBe(true)
    expect(await db.select().from(memberships)).toHaveLength(1)
  })

  it("records the customer id on first match so later events are direct", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })

    await handleStripeEvent(deps(stripeStub({})), event("customer.subscription.created"))

    const [member] = await db.select().from(members)
    expect(member.stripeCustomerId).toBe("cus_1")
  })

  it("reports an unmatched subscription rather than dropping it", async () => {
    const result = await handleStripeEvent(
      deps(stripeStub({})),
      event("customer.subscription.created")
    )
    expect(result).toEqual({ handled: false, reason: "unmatched-member" })
    expect(await db.select().from(memberships)).toHaveLength(0)
  })

  it("ignores subscriptions for other products", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })

    const result = await handleStripeEvent(
      deps(stripeStub({ items: { data: [{ price: { id: "price_other" } }] } as never })),
      event("customer.subscription.created")
    )

    expect(result).toEqual({ handled: false, reason: "not-membership" })
  })

  it("marks an organisation subscription with the right type", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Org" })

    await handleStripeEvent(
      deps(
        stripeStub({ items: { data: [{ price: { id: ORG_PRICE } }] } as never })
      ),
      event("customer.subscription.created")
    )

    const [row] = await db.select().from(memberships)
    expect(row.type).toBe("organisation")
  })

  it("ignores event types it does not handle", async () => {
    const result = await handleStripeEvent(
      deps(stripeStub({})),
      event("invoice.paid")
    )
    expect(result).toEqual({ handled: false, reason: "ignored" })
  })
})
