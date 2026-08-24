/**
 * Members migration — write phase.
 *
 * Reads v1 Mongo + live Stripe (never writes to either), then upserts into
 * the v2 Postgres. Reuses the join logic from reconcile.mjs so the report
 * and the migration can never disagree about who is a member.
 *
 * Idempotent by design (docs/plans/members-migration.md §7):
 *   - members upsert on email
 *   - memberships upsert on stripe_subscription_id
 *   - member_number is written once and never reassigned
 *
 * Dry run by default. Pass --commit to write.
 *
 *   MONGODB_URI=… MONGODB_DB=ocra STRIPE_SECRET_KEY=… \
 *   STRIPE_MEMBERSHIP_PRODUCT_ID=… DATABASE_URL=… \
 *   node scripts/migration/migrate.mjs [--commit]
 */
import postgres from "postgres"
import { loadAll } from "./reconcile.mjs"

const COMMIT = process.argv.includes("--commit")

const need = (name) => {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

/** v1 wrote names with stray whitespace; a name ends up on a card. */
const clean = (value) => {
  const trimmed = String(value ?? "").trim()
  return trimmed.length > 0 ? trimmed : null
}

const main = async () => {
  need("MONGODB_URI")
  need("STRIPE_SECRET_KEY")
  need("DATABASE_URL")

  const { rows } = await loadAll()
  console.log(`\n${rows.length} rows to migrate (${COMMIT ? "COMMIT" : "DRY RUN"})`)

  const sql = postgres(process.env.DATABASE_URL, { max: 1 })
  const summary = {
    members_inserted: 0,
    members_updated: 0,
    memberships_written: 0,
    numbers_minted: 0,
    numbers_preserved: 0,
    skipped_no_email: 0,
  }

  try {
    for (const row of rows) {
      const email = clean(row.email)?.toLowerCase()
      if (!email) {
        summary.skipped_no_email += 1
        console.warn(`  skip: row with no email (mongo ${row.mongoId ?? "-"})`)
        continue
      }

      const displayName =
        clean(row.displayName) ?? clean(row.profileName) ?? email.split("@")[0]
      // Stripe's email is kept when it differs, so a mismatch can never hide
      // someone's membership at sign-in (§4).
      const billingEmail =
        row.subscriptionEmail && row.subscriptionEmail !== email
          ? row.subscriptionEmail
          : null

      if (!COMMIT) {
        console.log(
          `  ${email.padEnd(34)} ${row.role.padEnd(6)} ${
            row.membershipStatus.padEnd(8)
          } ${row.proposedMemberNumber ?? "-"}`
        )
        continue
      }

      const [member] = await sql`
        insert into members
          (email, billing_email, display_name, profile_name, role,
           stripe_customer_id, created_at)
        values
          (${email}, ${billingEmail}, ${displayName},
           ${clean(row.profileName)}, ${row.role},
           ${row.stripeCustomerId ?? null}, ${new Date(row.joinedAt)})
        on conflict (email) do update set
          billing_email = coalesce(excluded.billing_email, members.billing_email),
          display_name = excluded.display_name,
          profile_name = coalesce(excluded.profile_name, members.profile_name),
          role = excluded.role,
          stripe_customer_id =
            coalesce(excluded.stripe_customer_id, members.stripe_customer_id),
          updated_at = now()
        returning id, (xmax = 0) as inserted`
      member.inserted ? (summary.members_inserted += 1) : (summary.members_updated += 1)

      if (row.membershipStatus === "none" || !row.subscriptionId) continue

      // Never reassign a number: reuse whatever this member already has.
      const [existing] = await sql`
        select member_number from memberships
        where member_id = ${member.id} limit 1`
      const memberNumber = existing?.member_number ?? row.proposedMemberNumber
      existing
        ? (summary.numbers_preserved += 1)
        : (summary.numbers_minted += 1)

      await sql`
        insert into memberships
          (member_id, member_number, type, status, stripe_subscription_id,
           current_period_end, confirmed)
        values
          (${member.id}, ${memberNumber}, 'athlete', ${row.membershipStatus},
           ${row.subscriptionId},
           ${row.currentPeriodEnd ? new Date(row.currentPeriodEnd) : null}, true)
        on conflict (stripe_subscription_id) do update set
          status = excluded.status,
          current_period_end = excluded.current_period_end,
          confirmed = true,
          updated_at = now()`
      summary.memberships_written += 1
    }

    if (COMMIT) {
      console.log("\n── Written ──────────────────────────────")
      for (const [k, v] of Object.entries(summary)) {
        console.log(`  ${k.padEnd(22)} ${v}`)
      }

      // Gate: what is in Postgres must match what Stripe says (§8).
      const [{ count: active }] = await sql`
        select count(*)::int from memberships where status = 'active'`
      const expected = rows.filter((r) => r.membershipStatus === "active").length
      console.log(
        `\n  Gate — active in Postgres (${active}) === expected (${expected}): ${
          active === expected ? "PASS" : "FAIL"
        }`
      )
      if (active !== expected) process.exitCode = 1
    } else {
      console.log("\nDry run only. Re-run with --commit to write.")
    }
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
