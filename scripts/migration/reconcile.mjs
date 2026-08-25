/**
 * Members migration — reconciliation report (READ ONLY).
 *
 * Joins the v1 Mongo member list against live Stripe subscriptions and
 * reports what the write migration would do, including every exception that
 * needs working by hand. Writes nothing to Mongo, Stripe or Postgres.
 *
 * Design notes live in docs/plans/members-migration.md. In short:
 *   - Stripe is truth for membership state (v1 had no webhooks)
 *   - Mongo is truth for identity
 *   - Mongo `createdAt` is a clock string, so joining order comes from the
 *     ObjectId timestamp instead
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://…" \
 *   STRIPE_SECRET_KEY="rk_live_…" \
 *   STRIPE_MEMBERSHIP_PRICE_ID="price_…"   # optional but recommended
 *   node scripts/migration/reconcile.mjs [--out ./migration-report]
 *
 * The console summary is deliberately redacted; full detail goes to CSV for
 * whoever is working the exceptions.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const outDir = (() => {
  const i = process.argv.indexOf("--out")
  return i === -1 ? "./migration-report" : process.argv[i + 1]
})()

const PRICE_ID = process.env.STRIPE_MEMBERSHIP_PRICE_ID ?? null
const PRODUCT_ID = process.env.STRIPE_MEMBERSHIP_PRODUCT_ID ?? null

export const norm = (email) => (email ?? "").trim().toLowerCase()

/** demo@ocra.ie -> d***@ocra.ie — enough to identify, not to leak. */
const mask = (email) => {
  const [user, domain] = String(email ?? "").split("@")
  if (!domain) return "(none)"
  return `${user.slice(0, 1)}***@${domain}`
}

/** Stripe statuses that mean "currently entitled to membership". */
const ACTIVE = new Set(["active", "trialing"])
/** Statuses that mean "was a member, is not now". */
const LAPSED = new Set(["past_due", "canceled", "unpaid", "incomplete_expired"])

export const toCsv = (rows) => {
  if (rows.length === 0) return ""
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  const cell = (v) => {
    const s = v === undefined || v === null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  return [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => cell(r[c])).join(",")),
  ].join("\n")
}

// ---------------------------------------------------------------- load v1

const loadMembers = async () => {
  const { MongoClient, ObjectId } = await import("mongodb")
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  try {
    const db = client.db(process.env.MONGODB_DB || undefined)
    const docs = await db.collection("members").find({}).toArray()
    return docs.map((doc) => ({
      mongoId: String(doc._id),
      // The ObjectId timestamp is the only trustworthy join date: the
      // `createdAt` field is written as toLocaleTimeString() (no date).
      joinedAt: new ObjectId(doc._id).getTimestamp(),
      googleId: doc.id ?? null,
      email: norm(doc.email),
      displayName: doc.displayName ?? "",
      profileName: doc.profile_name ?? null,
      // v1 wrote roles inconsistently ("admin" and "ADMIN"), so compare
      // case-insensitively and keep the raw value for the report.
      role: String(doc.role ?? "").trim().toLowerCase() === "admin"
        ? "admin"
        : "member",
      rawRole: doc.role ?? null,
      stripeCustomerId: doc.stripe_customer_id ?? null,
      // Recorded once and never updated — reported for interest only, not
      // used to decide membership state.
      staleSubscriptionId: doc.membership_subscription_id ?? null,
      hasBase64Photo: String(doc.photoUrl ?? "").startsWith("data:"),
    }))
  } finally {
    await client.close()
  }
}

const loadSubscriptions = async () => {
  const { default: Stripe } = await import("stripe")
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const subs = []
  for await (const sub of stripe.subscriptions.list({
    status: "all",
    limit: 100,
    expand: ["data.customer"],
  })) {
    const priceIds = sub.items.data.map((item) => item.price?.id)
    const productIds = sub.items.data.map((item) =>
      typeof item.price?.product === "string"
        ? item.price.product
        : item.price?.product?.id
    )
    if (PRICE_ID && !priceIds.includes(PRICE_ID)) continue
    if (PRODUCT_ID && !productIds.includes(PRODUCT_ID)) continue
    const customer =
      sub.customer && typeof sub.customer === "object" ? sub.customer : null
    subs.push({
      subscriptionId: sub.id,
      status: sub.status,
      customerId: typeof sub.customer === "string" ? sub.customer : customer?.id,
      customerEmail: norm(customer?.email),
      customerDeleted: Boolean(customer?.deleted),
      created: new Date(sub.created * 1000),
      // Stripe moved current_period_end onto subscription items in the 2025
      // API versions. Read the item first and fall back to the legacy field,
      // so this works whichever version the account is pinned to.
      currentPeriodEnd: (() => {
        const fromItems = sub.items?.data
          ?.map((item) => item.current_period_end)
          .filter((value) => typeof value === "number")
          .sort((a, b) => b - a)[0]
        const seconds = fromItems ?? sub.current_period_end
        return seconds ? new Date(seconds * 1000) : null
      })(),
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000) : null,
      priceIds: priceIds.join(" "),
    })
  }
  return subs
}

// ------------------------------------------------------------------ join

/** Best subscription for a member: active beats lapsed, newest first. */
export const pickSubscription = (candidates) => {
  if (candidates.length === 0) return null
  const rank = (s) => (ACTIVE.has(s.status) ? 0 : LAPSED.has(s.status) ? 1 : 2)
  return [...candidates].sort(
    (a, b) => rank(a) - rank(b) || b.created - a.created
  )[0]
}

export const build = (members, subs) => {
  const byCustomer = new Map()
  const byEmail = new Map()
  for (const sub of subs) {
    if (sub.customerId) {
      byCustomer.set(sub.customerId, [
        ...(byCustomer.get(sub.customerId) ?? []),
        sub,
      ])
    }
    if (sub.customerEmail) {
      byEmail.set(sub.customerEmail, [...(byEmail.get(sub.customerEmail) ?? []), sub])
    }
  }

  const claimed = new Set()
  const rows = []

  // Mongo drives the member list; ObjectId order preserves joining order.
  for (const member of [...members].sort((a, b) => a.joinedAt - b.joinedAt)) {
    const viaCustomer = member.stripeCustomerId
      ? (byCustomer.get(member.stripeCustomerId) ?? [])
      : []
    const viaEmail = member.email ? (byEmail.get(member.email) ?? []) : []
    const sub = pickSubscription([...viaCustomer, ...viaEmail])
    if (sub) claimed.add(sub.subscriptionId)

    const matchedBy = !sub
      ? "none"
      : viaCustomer.some((s) => s.subscriptionId === sub.subscriptionId)
        ? "customer_id"
        : "email"

    rows.push({
      source: "mongo",
      ...member,
      subscriptionId: sub?.subscriptionId ?? null,
      subscriptionStatus: sub?.status ?? null,
      subscriptionEmail: sub?.customerEmail ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      firstSubscribedAt: sub?.created ?? null,
      matchedBy,
      emailMismatch: Boolean(
        sub?.customerEmail && member.email && sub.customerEmail !== member.email
      ),
      membershipStatus: !sub
        ? "none"
        : ACTIVE.has(sub.status)
          ? "active"
          : LAPSED.has(sub.status)
            ? "expired"
            : "pending",
    })
  }

  // Subscriptions with no Mongo member: someone paid, the record never
  // landed. They are still members and must be migrated from Stripe alone.
  for (const sub of subs) {
    if (claimed.has(sub.subscriptionId)) continue
    rows.push({
      source: "stripe_only",
      mongoId: null,
      joinedAt: sub.created,
      googleId: null,
      email: sub.customerEmail,
      displayName: "",
      profileName: null,
      role: "member",
      stripeCustomerId: sub.customerId,
      staleSubscriptionId: null,
      hasBase64Photo: false,
      subscriptionId: sub.subscriptionId,
      subscriptionStatus: sub.status,
      subscriptionEmail: sub.customerEmail,
      currentPeriodEnd: sub.currentPeriodEnd,
      firstSubscribedAt: sub.created,
      matchedBy: "stripe_only",
      emailMismatch: false,
      membershipStatus: ACTIVE.has(sub.status)
        ? "active"
        : LAPSED.has(sub.status)
          ? "expired"
          : "pending",
    })
  }

  return rows
}

/** Preview member numbers: OCRA-<year of first membership>-<seq in year>. */
export const assignNumbers = (rows) => {
  const withMembership = rows
    .filter((r) => r.membershipStatus !== "none")
    .sort(
      (a, b) =>
        new Date(a.firstSubscribedAt ?? a.joinedAt) -
        new Date(b.firstSubscribedAt ?? b.joinedAt)
    )
  const seq = new Map()
  for (const row of withMembership) {
    const year = new Date(row.firstSubscribedAt ?? row.joinedAt).getFullYear()
    const next = (seq.get(year) ?? 0) + 1
    seq.set(year, next)
    row.proposedMemberNumber = `OCRA-${year}-${String(next).padStart(4, "0")}`
  }
}

// ---------------------------------------------------------------- report

const need = (name) => {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

/** Loads both sources and produces the joined, numbered rows. */
export const loadAll = async () => {
  console.log("Reading v1 Mongo…")
  const members = await loadMembers()
  console.log(`  ${members.length} member documents`)

  console.log("Reading Stripe subscriptions…")
  const subs = await loadSubscriptions()
  console.log(
    `  ${subs.length} subscriptions${PRICE_ID ? ` for price ${PRICE_ID}` : PRODUCT_ID ? ` for product ${PRODUCT_ID}` : " (unfiltered)"}`
  )

  const rows = build(members, subs)
  assignNumbers(rows)
  return { members, subs, rows }
}

const main = async () => {
  need("MONGODB_URI")
  need("STRIPE_SECRET_KEY")

  const { members, subs, rows } = await loadAll()

  const emailCounts = new Map()
  for (const r of rows) {
    if (r.email) emailCounts.set(r.email, (emailCounts.get(r.email) ?? 0) + 1)
  }

  const exceptions = {
    stripe_only: rows.filter((r) => r.source === "stripe_only"),
    email_mismatch: rows.filter((r) => r.emailMismatch),
    duplicate_email: rows.filter((r) => emailCounts.get(r.email) > 1),
    missing_email: rows.filter((r) => !r.email),
    matched_by_email_only: rows.filter((r) => r.matchedBy === "email"),
    base64_photos: rows.filter((r) => r.hasBase64Photo),
    stale_subscription_id: rows.filter(
      (r) =>
        r.staleSubscriptionId && r.staleSubscriptionId !== r.subscriptionId
    ),
  }

  const counts = {
    mongo_members: members.length,
    stripe_subscriptions: subs.length,
    rows_total: rows.length,
    membership_active: rows.filter((r) => r.membershipStatus === "active").length,
    membership_expired: rows.filter((r) => r.membershipStatus === "expired").length,
    membership_pending: rows.filter((r) => r.membershipStatus === "pending").length,
    membership_none: rows.filter((r) => r.membershipStatus === "none").length,
    admins: rows.filter((r) => r.role === "admin").length,
    admins_active_membership: rows.filter(
      (r) => r.role === "admin" && r.membershipStatus === "active"
    ).length,
  }

  console.log("\n── Summary ──────────────────────────────")
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(24)} ${v}`)
  }

  const rawRoles = new Map()
  for (const r of rows) {
    const key = r.rawRole ?? "(none)"
    rawRoles.set(key, (rawRoles.get(key) ?? 0) + 1)
  }
  console.log(
    `  ${"raw role values".padEnd(24)} ${[...rawRoles].map(([k, v]) => `${k}:${v}`).join("  ")}`
  )

  console.log("\n── Exceptions (detail in CSV) ───────────")
  for (const [name, list] of Object.entries(exceptions)) {
    console.log(`  ${name.padEnd(24)} ${list.length}`)
  }

  const worrying = exceptions.email_mismatch.length + exceptions.duplicate_email.length
  if (worrying > 0) {
    console.log(
      `\n  ${worrying} row(s) need manual work before cutover — see the CSVs.`
    )
    for (const r of [...exceptions.email_mismatch, ...exceptions.duplicate_email].slice(0, 10)) {
      console.log(
        `    ${mask(r.email)}  mongo=${r.mongoId ?? "-"}  stripe=${r.subscriptionId ?? "-"}  ${r.subscriptionEmail ? `stripeEmail=${mask(r.subscriptionEmail)}` : ""}`
      )
    }
  }

  // The active count is the gate the cutover depends on.
  const stripeActive = subs.filter((s) => ACTIVE.has(s.status)).length
  const ok = stripeActive === counts.membership_active
  console.log(
    `\n  Gate — active in Stripe (${stripeActive}) === active after migration (${counts.membership_active}): ${ok ? "PASS" : "FAIL"}`
  )

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "all-members.csv"), toCsv(rows))
  for (const [name, list] of Object.entries(exceptions)) {
    if (list.length > 0) writeFileSync(join(outDir, `${name}.csv`), toCsv(list))
  }
  writeFileSync(
    join(outDir, "summary.json"),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), counts, exceptions: Object.fromEntries(Object.entries(exceptions).map(([k, v]) => [k, v.length])), gatePassed: ok },
      null,
      2
    )
  )
  console.log(`\nWrote report to ${outDir}/ (contains personal data — do not commit)`)
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
