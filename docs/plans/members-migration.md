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

Everything up to step 8 is reversible by doing nothing.

**Prepare (days before, no downtime)**

1. **Supabase production project**, in eu-west-1. Configure, in this order,
   because each has a lead time:
   - Google provider, with the production callback added to the *existing*
     Google OAuth client (add, never replace — v1 must keep working)
   - Redirect URLs for `https://members.ocra.ie/**` **and** the Render
     `*.onrender.com` host, so a DNS delay cannot lock everyone out
   - Custom SMTP (Workspace or Resend) — templates cannot be edited without
     it, and the built-in sender only reaches project members
   - Both email templates carrying `{{ .Token }}`. **Confirm signup matters
     most**: every migrated member hits that one, not Magic Link, because
     none of them exist in Supabase auth yet
   - "Confirm email" **off** — otherwise OTP sign-in sends a confirmation
     link instead of a code
   - Email OTP length, which must equal `OTP_LENGTH` in
     `apps/members/src/features/auth/constants.ts`
2. **Render production services** from `render.yaml`, with:
   - `DATABASE_URL` from Supabase's **session pooler**, never the direct
     `db.<ref>.supabase.co` host — that is IPv6-only and unreachable from
     Render (§12)
   - `APP_ENV=production`, which makes missing Stripe config fatal rather
     than silently disabling billing
   - `ALLOWED_ORIGINS` and `MEMBERS_APP_URL` set to whatever host is
     actually serving, onrender or custom domain
3. **Live Stripe**: customer portal configuration (none exists on the live
   account today, so cancel and card-update would 503), a restricted API
   key, and a webhook endpoint at `https://api.ocra.ie/webhooks/stripe`
   subscribed to `checkout.session.completed` and
   `customer.subscription.created|updated|deleted`. Create the endpoint
   **at cutover**, not before: Stripe disables endpoints that fail
   repeatedly, and the URL will not resolve until then.
4. **Dry run** the migration against production Supabase and read the
   report. Work every exception bucket while there is time.

**Cut over (short window)**

5. **Freeze**: disable v1's Stripe checkout route so no new subscriptions
   appear mid-migration. Announce the window.
6. **Final reconciliation**, then the write migration. Idempotent, so this
   is just the delta.
7. **Verify** (§8) before touching DNS.
8. **DNS**: `api.ocra.ie` and `members.ocra.ie` → Render. Specific records
   override the `*.ocra.ie` wildcard that currently answers for every
   subdomain.
9. **Live Stripe webhook** created and its secret set; replay any events
   from the freeze window with the Stripe CLI.

**After**

10. **Watch for 48 hours.** Then disable the two legacy Stripe webhook
    endpoints (a Supabase edge function on an unrelated project, and a
    Firestore Stripe extension) — leaving them means three consumers of the
    same events and no way to tell which is authoritative.
11. **Rotate every credential** that has been shared during the build,
    including the live Stripe secret key and the Mongo admin password.
12. Archive both v1 repos; tear down the Vercel projects and Atlas.

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
