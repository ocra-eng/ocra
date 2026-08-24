import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const memberRole = pgEnum("member_role", ["member", "admin"])
export const membershipType = pgEnum("membership_type", [
  "athlete",
  "organisation",
])
export const membershipStatus = pgEnum("membership_status", [
  "active",
  "expired",
  "pending",
])

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Supabase auth user id; null until their first sign-in after migration. */
    supabaseUserId: uuid("supabase_user_id"),
    /** Lowercased, trimmed. The natural key the migration upserts on. */
    email: text("email").notNull(),
    /**
     * Stripe's email when it differs from the sign-in email. Sign-in matches
     * either, so a mismatch can't silently hide someone's membership.
     */
    billingEmail: text("billing_email"),
    displayName: text("display_name").notNull(),
    profileName: text("profile_name"),
    photoUrl: text("photo_url"),
    role: memberRole("role").notNull().default("member"),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("members_email_idx").on(table.email),
    uniqueIndex("members_supabase_user_idx").on(table.supabaseUserId),
    index("members_billing_email_idx").on(table.billingEmail),
    index("members_stripe_customer_idx").on(table.stripeCustomerId),
  ]
)

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    /** OCRA-YYYY-NNNN. Minted once at first activation, never reassigned. */
    memberNumber: text("member_number").notNull(),
    type: membershipType("type").notNull().default("athlete"),
    status: membershipStatus("status").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** True once the Stripe webhook has confirmed, not just checkout return. */
    confirmed: boolean("confirmed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("memberships_number_idx").on(table.memberNumber),
    uniqueIndex("memberships_subscription_idx").on(table.stripeSubscriptionId),
    index("memberships_member_idx").on(table.memberId),
  ]
)

/**
 * Stripe delivers webhooks at least once, so every processed event id is
 * recorded and re-deliveries are ignored.
 */
export const processedEvents = pgTable("processed_stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert
