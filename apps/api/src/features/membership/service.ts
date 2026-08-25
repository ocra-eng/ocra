import { and, desc, eq, like, sql } from "drizzle-orm"
import type { Database } from "../../db/index.js"

/** The transaction handle drizzle hands to db.transaction callbacks. */
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0]
import { members, memberships } from "../../db/schema.js"
import type { Membership } from "../../db/schema.js"

/** Stripe statuses that entitle someone to membership right now. */
const ACTIVE_STATUSES = new Set(["active", "trialing"])

export const mapStripeStatus = (
  stripeStatus: string
): "active" | "expired" | "pending" =>
  ACTIVE_STATUSES.has(stripeStatus)
    ? "active"
    : stripeStatus === "incomplete"
      ? "pending"
      : "expired"

/**
 * Mints the next member number for a year: OCRA-YYYY-NNNN.
 *
 * Runs inside the caller's transaction and takes an advisory lock so two
 * concurrent webhooks can't hand out the same number. The unique index is
 * the backstop; this makes the collision rare rather than routine.
 */
export const mintMemberNumber = async (
  tx: Tx | Database,
  year: number
): Promise<string> => {
  await tx.execute(sql`select pg_advisory_xact_lock(${year})`)

  const [latest] = await tx
    .select({ memberNumber: memberships.memberNumber })
    .from(memberships)
    .where(like(memberships.memberNumber, `OCRA-${year}-%`))
    .orderBy(desc(memberships.memberNumber))
    .limit(1)

  const next = latest
    ? Number.parseInt(latest.memberNumber.split("-")[2] ?? "0", 10) + 1
    : 1

  return `OCRA-${year}-${String(next).padStart(4, "0")}`
}

interface UpsertInput {
  memberId: string
  type: "athlete" | "organisation"
  status: "active" | "expired" | "pending"
  stripeSubscriptionId: string
  currentPeriodEnd: Date | null
  /** Year to mint against when this is the member's first membership. */
  year: number
}

/**
 * Creates or updates the membership for a subscription. Member numbers are
 * minted once and never reassigned, so a lapsed member who renews keeps the
 * number they have always had.
 */
export const upsertMembership = async (
  db: Database,
  input: UpsertInput
): Promise<Membership> =>
  db.transaction(async (tx) => {
    const [bySubscription] = await tx
      .select()
      .from(memberships)
      .where(eq(memberships.stripeSubscriptionId, input.stripeSubscriptionId))
      .limit(1)

    if (bySubscription) {
      const [updated] = await tx
        .update(memberships)
        .set({
          status: input.status,
          currentPeriodEnd: input.currentPeriodEnd,
          confirmed: true,
          updatedAt: new Date(),
        })
        .where(eq(memberships.id, bySubscription.id))
        .returning()
      return updated
    }

    // Reuse the member's existing number if they have ever had one.
    const [previous] = await tx
      .select()
      .from(memberships)
      .where(eq(memberships.memberId, input.memberId))
      .orderBy(memberships.createdAt)
      .limit(1)

    const memberNumber =
      previous?.memberNumber ?? (await mintMemberNumber(tx, input.year))

    if (previous) {
      const [updated] = await tx
        .update(memberships)
        .set({
          type: input.type,
          status: input.status,
          stripeSubscriptionId: input.stripeSubscriptionId,
          currentPeriodEnd: input.currentPeriodEnd,
          confirmed: true,
          updatedAt: new Date(),
        })
        .where(eq(memberships.id, previous.id))
        .returning()
      return updated
    }

    const [created] = await tx
      .insert(memberships)
      .values({
        memberId: input.memberId,
        memberNumber,
        type: input.type,
        status: input.status,
        stripeSubscriptionId: input.stripeSubscriptionId,
        currentPeriodEnd: input.currentPeriodEnd,
        confirmed: true,
      })
      .returning()
    return created
  })

export const findMembershipForMember = async (
  db: Database,
  memberId: string
): Promise<Membership | null> => {
  const [row] = await db
    .select()
    .from(memberships)
    .where(eq(memberships.memberId, memberId))
    .orderBy(desc(memberships.createdAt))
    .limit(1)
  return row ?? null
}

/**
 * Public verification lookup. Returns only what a person checking a card at
 * a race needs — never email, never photo.
 */
export const findVerification = async (db: Database, memberNumber: string) => {
  const [row] = await db
    .select({
      memberNumber: memberships.memberNumber,
      type: memberships.type,
      status: memberships.status,
      currentPeriodEnd: memberships.currentPeriodEnd,
      displayName: members.displayName,
      profileName: members.profileName,
    })
    .from(memberships)
    .innerJoin(members, eq(memberships.memberId, members.id))
    .where(
      and(
        eq(memberships.memberNumber, memberNumber),
        eq(memberships.confirmed, true)
      )
    )
    .limit(1)

  if (!row) return null
  return {
    memberNumber: row.memberNumber,
    displayName: row.profileName?.trim() || row.displayName,
    type: row.type,
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString(),
  }
}

export type AdminFilter = "active" | "expired" | "none" | "all"

export interface AdminMemberRow {
  id: string
  email: string
  displayName: string
  role: "member" | "admin"
  createdAt: string
  membership: {
    memberNumber: string
    type: "athlete" | "organisation"
    status: "active" | "expired" | "pending"
    currentPeriodEnd?: string
  } | null
}

/**
 * Admin listing. "Member" is ambiguous here — an account exists from first
 * sign-in, but membership only exists once Stripe confirms payment. The
 * counts make both visible so the filter is an informed choice rather than
 * a number the admin has to trust.
 */
export const listMembersForAdmin = async (
  db: Database,
  filter: AdminFilter = "active"
): Promise<{ members: AdminMemberRow[]; counts: Record<string, number> }> => {
  const rows = await db
    .select({
      id: members.id,
      email: members.email,
      displayName: members.displayName,
      profileName: members.profileName,
      role: members.role,
      createdAt: members.createdAt,
      memberNumber: memberships.memberNumber,
      type: memberships.type,
      status: memberships.status,
      currentPeriodEnd: memberships.currentPeriodEnd,
      membershipCreatedAt: memberships.createdAt,
    })
    .from(members)
    .leftJoin(
      memberships,
      and(
        eq(memberships.memberId, members.id),
        eq(memberships.confirmed, true)
      )
    )
    .orderBy(members.createdAt)

  // A member could hold more than one membership row over time; keep the
  // newest so the list reflects their current standing.
  const byMember = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    const existing = byMember.get(row.id)
    if (
      !existing ||
      (row.membershipCreatedAt ?? 0) > (existing.membershipCreatedAt ?? 0)
    ) {
      byMember.set(row.id, row)
    }
  }

  const all: AdminMemberRow[] = [...byMember.values()].map((row) => ({
    id: row.id,
    email: row.email,
    displayName: row.profileName?.trim() || row.displayName,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    membership: row.memberNumber
      ? {
          memberNumber: row.memberNumber,
          type: row.type!,
          status: row.status!,
          currentPeriodEnd: row.currentPeriodEnd?.toISOString(),
        }
      : null,
  }))

  const counts = {
    all: all.length,
    active: all.filter((m) => m.membership?.status === "active").length,
    expired: all.filter((m) => m.membership?.status === "expired").length,
    none: all.filter((m) => !m.membership).length,
  }

  const matches = (row: AdminMemberRow) =>
    filter === "all"
      ? true
      : filter === "none"
        ? !row.membership
        : row.membership?.status === filter

  return { members: all.filter(matches), counts }
}
