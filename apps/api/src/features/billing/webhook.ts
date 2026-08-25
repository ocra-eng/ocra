import { eq } from "drizzle-orm"
import type Stripe from "stripe"
import type { Database } from "../../db/index.js"
import { members, processedEvents } from "../../db/schema.js"
import { mapStripeStatus, upsertMembership } from "../membership/service.js"

const HANDLED = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

interface Deps {
  db: Database
  stripe: Stripe
  athletePriceId: string
  organisationPriceId?: string
}

const normaliseEmail = (email: string | null | undefined) =>
  (email ?? "").trim().toLowerCase()

/**
 * Finds the member a subscription belongs to. Tries the Stripe customer id
 * first, then either email. A subscription we cannot attribute is recorded
 * as unmatched rather than silently dropped.
 */
const resolveMember = async (
  db: Database,
  {
    memberId,
    customerId,
    email,
  }: { memberId?: string; customerId: string | null; email: string }
) => {
  // Set by our own checkout, so it is exact where it exists.
  if (memberId) {
    const [byMetadata] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1)
    if (byMetadata) return byMetadata
  }

  if (customerId) {
    const [byCustomer] = await db
      .select()
      .from(members)
      .where(eq(members.stripeCustomerId, customerId))
      .limit(1)
    if (byCustomer) return byCustomer
  }

  if (email) {
    const [byEmail] = await db
      .select()
      .from(members)
      .where(eq(members.email, email))
      .limit(1)
    if (byEmail) {
      // Remember the customer id so later events resolve on the fast path.
      if (customerId && !byEmail.stripeCustomerId) {
        await db
          .update(members)
          .set({ stripeCustomerId: customerId, updatedAt: new Date() })
          .where(eq(members.id, byEmail.id))
      }
      return byEmail
    }

    const [byBilling] = await db
      .select()
      .from(members)
      .where(eq(members.billingEmail, email))
      .limit(1)
    if (byBilling) return byBilling
  }

  return null
}

export const handleStripeEvent = async (
  { db, stripe, athletePriceId, organisationPriceId }: Deps,
  event: Stripe.Event
): Promise<{ handled: boolean; reason?: string }> => {
  if (!HANDLED.has(event.type)) return { handled: false, reason: "ignored" }

  // Stripe delivers at least once; replays must be no-ops.
  const [seen] = await db
    .select()
    .from(processedEvents)
    .where(eq(processedEvents.id, event.id))
    .limit(1)
  if (seen) return { handled: false, reason: "duplicate" }

  const subscription = await resolveSubscription(stripe, event)
  if (!subscription) return { handled: false, reason: "no-subscription" }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer?.id ?? null)

  const email = normaliseEmail(
    typeof subscription.customer === "object" && !subscription.customer.deleted
      ? subscription.customer.email
      : null
  )

  const member = await resolveMember(db, {
    memberId:
      typeof subscription.metadata?.memberId === "string"
        ? subscription.metadata.memberId
        : undefined,
    customerId,
    email,
  })
  if (!member) return { handled: false, reason: "unmatched-member" }

  const priceIds = subscription.items.data.map((item) => item.price?.id)
  const type =
    organisationPriceId && priceIds.includes(organisationPriceId)
      ? "organisation"
      : "athlete"

  // Ignore subscriptions for products that are not membership.
  if (!priceIds.includes(athletePriceId) && type === "athlete") {
    if (!organisationPriceId || !priceIds.includes(organisationPriceId)) {
      return { handled: false, reason: "not-membership" }
    }
  }

  // Stripe moved current_period_end onto subscription items in the 2025
  // API versions; take the furthest-out item as the membership's end date.
  const periodEnd = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => b - a)[0]

  await upsertMembership(db, {
    memberId: member.id,
    type,
    status: mapStripeStatus(subscription.status),
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    year: new Date(subscription.created * 1000).getUTCFullYear(),
  })

  await db
    .insert(processedEvents)
    .values({ id: event.id, type: event.type })
    .onConflictDoNothing()

  return { handled: true }
}

/** Every handled event carries, or can fetch, the subscription it concerns. */
const resolveSubscription = async (
  stripe: Stripe,
  event: Stripe.Event
): Promise<Stripe.Subscription | null> => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const id =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id
    if (!id) return null
    return stripe.subscriptions.retrieve(id, { expand: ["customer"] })
  }

  const subscription = event.data.object as Stripe.Subscription
  // Re-fetch so the customer is expanded and the state is current.
  return stripe.subscriptions.retrieve(subscription.id, {
    expand: ["customer"],
  })
}
