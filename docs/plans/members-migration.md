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

**There is one environment, and it is production.** The Supabase project and
the Render services (named `ocra-*-dev` for historical reasons — kept
deliberately) hold real member data. Most of what a cutover plan would
normally cover is therefore already done: the schema is applied, the tables
are RLS-locked, auth and SMTP are configured, and the 23 members are
migrated. What remains is smaller than it looks.

Everything before step 5 is reversible by doing nothing: v1 is still live
and serving until DNS moves.

**Already done**

- Supabase project: schema, RLS lockdown, Google provider, email OTP with
  "Confirm email" off, Workspace SMTP, branded templates carrying
  `{{ .Token }}`
- Render services for the API and members app, on the session-pooler
  connection string
- Migration run and verified — 23 members, 9 memberships, gate passing

**1. Remove the test data.** The build put sandbox artefacts in the
production database. One of them matters:

| Row | Why it has to go |
|---|---|
| Membership `OCRA-2026-0006` | Backed by a **sandbox** subscription. Under live Stripe keys that subscription does not exist, so no webhook can ever correct it: it would stay active forever, never renewing and never expiring. It also holds a member number a real member should get. |
| 3 rows in `processed_stripe_events` | Sandbox event ids. Harmless, but they make the table lie about what has been processed. |
| auth user `it+otp@ocra.ie` | A plus-addressed test sign-in. |

The `it@ocra.ie` member row and auth user can stay — an account with no
membership grants nothing.

**2. Switch Stripe from sandbox to live** on the API service. The sandbox
keys currently point at production data, a combination that can neither take
real money nor resolve live customers:

- Restricted live secret key (write on Customers, Subscriptions, Checkout
  Sessions, Billing Portal; read on Products, Prices)
- `STRIPE_ATHLETE_PRICE_ID=price_1RgQkERxZ1j3VLtmlWrSFBuE`
- `APP_ENV=production`, so missing Stripe config fails the boot instead of
  silently disabling billing
- **Customer portal configuration on the live account** — the sandbox has
  one, live has none, and without it cancel and card-update 503

**3. Live webhook endpoint** at the API's URL, subscribed to
`checkout.session.completed` and `customer.subscription.created|updated|
deleted`, with its signing secret set. Create this **when the URL resolves**,
not before: Stripe disables endpoints that fail repeatedly.

**4. Prove it with one real transaction.** Buy a membership with a real
card, confirm the webhook mints the number, then refund it. Nothing else
proves the live key, price id, webhook secret and portal config are all
correct *together*, and it costs one refund.

**5. Freeze v1** by disabling its Stripe checkout route, then run the final
reconciliation and the migration delta. Idempotent, so this is cheap.

**6. Verify** (§8), then move DNS: `api.ocra.ie` and `members.ocra.ie` →
Render. Specific records override the `*.ocra.ie` wildcard that currently
answers for every subdomain. Update `ALLOWED_ORIGINS`, `MEMBERS_APP_URL`,
`VITE_API_URL` (a build-time value — needs a redeploy) and Supabase's Site
URL and redirect list to the real hosts.

**After**

7. **Watch for 48 hours.** Then disable the two legacy Stripe webhook
   endpoints (a Supabase edge function on an unrelated project, and a
   Firestore Stripe extension) — leaving them means three consumers of the
   same events and no way to tell which is authoritative.
8. **Move off free tiers.** A paused Supabase project or a sleeping API is
   an outage now, not an inconvenience. The keep-alive cron is protecting
   production until then, so its failure is worth alerting on.
9. **Rotate every credential shared during the build**: the live Stripe
   secret key and the Mongo admin password.
10. Archive both v1 repos; tear down the Vercel projects and Atlas.

## 7. Idempotency and re-running

The migration upserts on a natural key so it can be run repeatedly:

- `members` upsert on `email` (lowercased, trimmed)
- `memberships` upsert on `stripe_subscription_id`
- `member_number` is written **only if null** — never reassigned

This lets us run the migration days before cutover, then again during the
freeze to catch the delta, without duplicating anyone or churning numbers.

## 8. Verification gates

Automated, run immediately after the migration:

- Every migrated subscription active in Postgres exactly when Stripe says
  it is. The script gates on **the subscriptions it touched**, not on every
  active row — a database that also holds direct purchases would otherwise
  always fail.
- No duplicate member numbers; no duplicate emails.
- Every membership row resolves to a member row.
- Every admin in Mongo is an admin in Postgres. v1 stored the role as
  `ADMIN` in one record and `member` in the rest, so the comparison is
  case-insensitive — a case-sensitive check silently demotes every admin.
- Every active membership has a `current_period_end`. Stripe moved that
  field onto subscription items in the 2025 API versions; reading the old
  location returns null and members see a card with no expiry.

Manual, before DNS:

- Sign in as a migrated member and confirm the card shows their number.
- Sign in as the admin and confirm `/admin/members` lists the right count.
- Scan a card's QR and confirm the public page renders.
- Buy a membership with a live card, then refund it. This is the only way
  to prove the live webhook secret, price id and portal config are all
  correct together, and it costs one refund.

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

## 12. Environment traps found while building

Recorded because each cost time and none is obvious from the code.

**Supabase's direct database host is IPv6-only.** `db.<ref>.supabase.co`
resolves to IPv6 only, and Render's free tier has no IPv6 egress, so
migrations fail with `ENETUNREACH` while working fine from a developer
laptop. Always use the **session pooler** host. The db client warns if it
sees the direct host, and disables prepared statements automatically on
port 6543, since transaction mode cannot hold them.

**`NODE_ENV` is not the environment.** Render sets `NODE_ENV=production` on
every service including dev, so gating "Stripe required" on it stops the
dev API from booting. `APP_ENV` (`local | dev | production`) says what the
environment actually is.

**`npm ci` skips devDependencies when `NODE_ENV=production`** — including
TypeScript. Build commands pass `--include=dev`.

**Vite bakes `VITE_*` values in at build time.** Changing one in the Render
dashboard does nothing without a redeploy; runtime vars on the API restart
in place.

**Do not pin environment hostnames in `render.yaml`.** A value there
overwrites the working dashboard value on every Blueprint sync, which broke
the API URL and then the CORS origin in turn.

**Test-mode Stripe cannot see live customers.** A database migrated from
live Stripe holds live customer ids, so test keys produce
`No such customer`. The billing routes now forget an unresolvable customer
id and create a new one, which also covers a customer deleted in Stripe.

**`stripe trigger` invents a new customer**, so the webhook correctly
declines it as unmatched and records nothing. Verify against a real
member's subscription instead — for example toggling
`cancel_at_period_end`, which fires a real event and changes nothing
material.
