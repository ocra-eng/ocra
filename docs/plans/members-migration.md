# Members migration design

How existing members move from the v1 stack (MongoDB Atlas + Stripe + Google
OAuth) to the v2 stack (Supabase Postgres + Supabase Auth + Stripe), without
anyone losing their membership. Phase 3 of `members-replatform.md`.

Written 2026-08-24 from a read of the v1 schema and services.

## 1. The governing principle

**Stripe is the source of truth for membership. Mongo is the source of truth
for identity. Neither is trusted for anything else.**

That split matters because v1 has **no Stripe webhooks** — nothing ever wrote
subscription changes back to Mongo. A member who cancelled, whose card was
declined, or who renewed last week may have a Mongo record that says nothing
useful. `membership_subscription_id` is whatever was true the day it was
written, if it was written at all.

So the migration does not copy membership state out of Mongo. It reads the
member list from Mongo, reads live subscriptions from Stripe, and joins them.

## 2. What v1 actually stores

```ts
// Mongo: members collection
{ createdAt: String, displayName, email, emailVerified, photoUrl,
  id /* Google profile id */, role, stripe_customer_id?,
  membership_subscription_id?, profile_name? }
```

Three landmines found in the audit:

**`createdAt` is not a date.** It is written as
`new Date().toLocaleTimeString()` — a clock time with no day, e.g.
`"10:30:45"`. The schema also sets Mongoose `timestamps: true` while
declaring `createdAt` as a `String`, so the two fight and neither can be
trusted. **Use the Mongo `_id` instead**: every ObjectId embeds its creation
timestamp, which is authoritative and untouched by application code. Member
numbers are minted in `_id` order, so joining order is preserved.

**`photoUrl` holds base64 data URLs.** v1 downloaded each Google avatar and
inlined it into the document. These are not migrated — they bloat rows, they
go stale, and they are personal data we do not need to hold. v2 stores the
Google photo URL only, refreshed at sign-in.

**Identity keys on the Google profile id.** v2 keys on the Supabase user id,
which does not exist until the member first signs in. The join key between
the two worlds is therefore **email**, which is why §4 exists.

## 3. The reconciliation report (run first, changes nothing)

A read-only script that pulls Mongo members and Stripe customers and
subscriptions, joins them, and prints counts plus every exception. It must be
run, read, and understood **before** any write migration.

Buckets it reports:

| Bucket | Meaning | Migration action |
|---|---|---|
| Matched, active sub | Normal member | Migrate, mint number, status active |
| Matched, no sub | Account, never paid or long lapsed | Migrate member, no membership row |
| Matched, cancelled/past_due | Lapsed member | Migrate, mint number, status expired |
| **In Stripe, not in Mongo** | Paid but record never written | Migrate from Stripe alone (email from Stripe customer) |
| **In Mongo, not in Stripe** | Account with no customer id | Migrate member only |
| **Duplicate emails in Mongo** | Same person, two records | Manual merge before cutover |
| **Email mismatch** (Mongo vs Stripe customer) | Sign-in will not find their membership | Manual review — highest risk bucket |
| Admins | `role: "admin"` | Preserve role |

Every exception bucket gets listed with identifiers so it can be worked by
hand. The script writes a CSV alongside the summary.

## 4. The identity risk, stated plainly

A member signs into v2 with Google or an email code. We look them up **by
email**. If their Google email and their Stripe customer email differ, they
will sign in successfully and see "you are not a member yet" — while their
subscription quietly continues billing.

Mitigations, in order:

1. The report lists every mismatch before cutover; each is resolved by hand
   (correct the Stripe customer email, or record both addresses).
2. The migration stores **both** the Mongo email and the Stripe customer
   email on the member row, and sign-in matches against either.
3. Post-cutover, an admin view lists memberships with no signed-in member
   after 30 days — the safety net that catches anyone missed.

## 5. Member numbers

Minted at migration in `_id` order (see §2), so early members get low
numbers. Format `OCRA-YYYY-NNNN` where `YYYY` is the year of **first**
membership, derived from the Stripe subscription's `created` timestamp, or
the `_id` timestamp when there is no subscription.

Numbers are permanent once assigned. The migration writes them, prints them
in the report, and never regenerates them — a re-run must be idempotent on
member number (see §7).

## 6. Order of operations at cutover

1. **Freeze**: put the v1 app into read-only by disabling its Stripe
   checkout route (a one-line deploy), so no new subscriptions appear
   mid-migration. Announce a short window.
2. **Final report**: re-run the reconciliation and confirm the exception
   buckets match what was already worked.
3. **Migrate**: run the write migration against the production Supabase
   project. It is idempotent — safe to re-run.
4. **Verify**: automated checks (§8) plus a manual spot-check of five known
   members, including one admin and one lapsed member.
5. **Point Stripe's webhook** at api.ocra.ie and replay recent events with
   the Stripe CLI so anything that happened during the freeze lands.
6. **DNS**: members.ocra.ie → Pages, api.ocra.ie → Render.
7. **Watch** for 48 hours before decommissioning anything.

## 7. Idempotency and re-running

The migration upserts on a natural key so it can be run repeatedly:

- `members` upsert on `email` (lowercased, trimmed)
- `memberships` upsert on `stripe_subscription_id`
- `member_number` is written **only if null** — never reassigned

This lets us run the migration days before cutover, then again during the
freeze to catch the delta, without duplicating anyone or churning numbers.

## 8. Verification gates

Automated, run immediately after the migration:

- Count of active memberships in Postgres equals count of active
  subscriptions in Stripe for the membership product — exactly.
- No duplicate member numbers; no duplicate emails.
- Every membership row resolves to a member row.
- Every admin in Mongo is an admin in Postgres.
- Spot-check five members end to end, including sign-in.

If any gate fails, the cutover stops. Nothing has been destroyed at this
point — v1 is still live and serving.

## 9. Rollback

Until DNS is switched, rollback is: do nothing, v1 is still running.

After DNS is switched, rollback is: point DNS back and re-enable the v1
checkout route. Members who signed into v2 in the interim lose nothing —
their Stripe subscriptions were never modified. The v2 Postgres can be
dropped and rebuilt from the same script.

**The migration never writes to Mongo and never modifies Stripe.** It only
reads from both. That is what makes rollback cheap, and it is a constraint
worth keeping even when it costs convenience.

## 10. Sessions and communication

All v1 sessions die at cutover — v1 JWTs are signed with different secrets
and v2 does not honour them. Members simply sign in again with the same
Google account or their email. No password existed, so nothing to reset.

Members should be told, once, before the window:

- the portal is moving, with a short outage
- they will sign in again with Google or a code sent to their email
- their membership, number and renewal date are unchanged
- who to contact if their card does not appear

Draft and send from Blueshift; do not send anything without approval.

## 11. What we need to run this

- Read-only MongoDB Atlas connection string (v1 production)
- Stripe **restricted** API key: read on customers, subscriptions, products
- The membership product/price ids currently in use
- Supabase dev project connection string (dry run target)

The reconciliation report runs against read-only credentials only. The write
migration needs the Supabase connection string and nothing more.
