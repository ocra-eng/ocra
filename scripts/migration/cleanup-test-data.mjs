/**
 * Removes the sandbox artefacts the build left in the production database.
 *
 * Identifies them by evidence, not by a hardcoded list: a membership whose
 * Stripe subscription cannot be found with the **live** key did not come
 * from a real payment, and no live webhook will ever correct it — it would
 * stay active forever, never renewing and never expiring.
 *
 * Dry run by default. Pass --commit to delete.
 *
 *   STRIPE_SECRET_KEY=<LIVE key>  DATABASE_URL=… \
 *   node scripts/migration/cleanup-test-data.mjs [--commit]
 *
 * The live key matters: with a sandbox key every live subscription looks
 * missing and this would propose deleting all of them. The script refuses
 * to run with a test key for that reason.
 */
import postgres from "postgres"

const COMMIT = process.argv.includes("--commit")

const need = (name) => {
  if (!process.env[name]) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
}

const main = async () => {
  need("DATABASE_URL")
  need("STRIPE_SECRET_KEY")

  if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_live")) {
    console.error(
      "Refusing to run: STRIPE_SECRET_KEY is not a live key.\n" +
        "With a test key every live subscription looks missing and this " +
        "would propose deleting real memberships."
    )
    process.exit(1)
  }

  const { default: Stripe } = await import("stripe")
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 1,
  })
  const sql = postgres(process.env.DATABASE_URL, { max: 1 })

  try {
    const memberships = await sql`
      select m.id, m.member_number, m.status, m.stripe_subscription_id,
             u.email
      from memberships m join members u on u.id = m.member_id
      order by m.member_number`

    const orphans = []
    for (const row of memberships) {
      if (!row.stripe_subscription_id) {
        orphans.push({ ...row, reason: "no subscription id" })
        continue
      }
      try {
        await stripe.subscriptions.retrieve(row.stripe_subscription_id)
      } catch (error) {
        if (error?.code === "resource_missing") {
          orphans.push({ ...row, reason: "subscription not in live Stripe" })
        } else {
          throw error
        }
      }
    }

    console.log(`\n${memberships.length} memberships checked against live Stripe`)
    if (orphans.length === 0) {
      console.log("  none unaccounted for — nothing to clean")
    } else {
      console.log(`  ${orphans.length} not backed by a live subscription:`)
      for (const o of orphans) {
        const who = String(o.email).replace(/^(.{2}).*@/, "$1***@")
        console.log(`    ${o.member_number}  ${o.status.padEnd(7)} ${who.padEnd(22)} ${o.reason}`)
      }
    }

    // Sandbox webhook events: recorded against events that live Stripe has
    // never heard of. Cheap to re-record if a real one is ever replayed.
    const events = await sql`select id, type from processed_stripe_events`
    const strayEvents = []
    for (const e of events) {
      try {
        await stripe.events.retrieve(e.id)
      } catch (error) {
        if (error?.code === "resource_missing") strayEvents.push(e)
        else throw error
      }
    }
    console.log(`\n${events.length} processed events checked`)
    if (strayEvents.length > 0) {
      console.log(`  ${strayEvents.length} not from live Stripe:`)
      for (const e of strayEvents) console.log(`    ${e.type}  ${e.id}`)
    }

    if (!COMMIT) {
      console.log("\nDry run only. Re-run with --commit to delete.")
      return
    }

    // Members themselves are left alone: an account with no membership
    // grants nothing, and one of these is a real OCRA address.
    for (const o of orphans) {
      await sql`delete from memberships where id = ${o.id}`
      console.log(`deleted membership ${o.member_number}`)
    }
    for (const e of strayEvents) {
      await sql`delete from processed_stripe_events where id = ${e.id}`
    }
    if (strayEvents.length > 0) {
      console.log(`deleted ${strayEvents.length} sandbox event record(s)`)
    }

    const [{ count }] = await sql`
      select count(*)::int from memberships where status = 'active'`
    console.log(`\nactive memberships remaining: ${count}`)
    console.log(
      "Supabase auth test users must be removed in the dashboard — this " +
        "script does not touch the auth schema."
    )
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
