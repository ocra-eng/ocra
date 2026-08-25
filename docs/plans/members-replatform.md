# Members app re-engineering plan

Replatform members.ocra.ie (FE + BE) onto the marketing site's stack, theme,
and deployment model. Drafted 2026-08-24 from a full read of both repos
(`theMangledBadger/ocra-members-app` @ eb396bb, `theMangledBadger/ocra-members-be`,
both last pushed Sept 2025). Architecture finalised same day after review —
see §5 decision log.

## 0. Current state

One journey works end to end: Google sign-in → digital membership card →
Stripe Checkout redirect → public card lookup by QR. Everything else is
scaffolding or placeholder (admin page is a single div; email/password auth
is commented out; events don't exist).

**Frontend** (~6,300 LOC, React 18 + Fluent UI + styled-components, Vercel):

- Teams-dark Fluent theme, no light mode, Century Gothic/Barlow font conflict,
  brand green hardcoded 35× despite a token existing
- Tokens stored three ways (localStorage ×2 keys + redux-persist), logout
  doesn't clear them; route guard reads persisted Redux, not the token
- `/members` admin route has no role check — the menu item is just hidden
- Membership status computed client-side from `VITE_MEMBERSHIP_PRICE_ID`
- QR hardcodes `https://members.ocra.ie`; share button uses `location.origin`
- 8 locales (de/es/fr/nl/pl/pt/ru + en-IE), roughly half the UI bypasses i18n
- Login healthcheck exists (status dot + disabled button) but retries only
  ~6s and the endpoint doesn't check the database
- PWA plugin at defaults with two competing manifests; `dev-dist/` committed
- 4 trivial tests, no CI; ~⅓ of components/deps unreferenced

**Backend** (22 files, Express 5 + Mongoose + Passport Google + Stripe,
single Vercel function):

- OAuth callback puts access AND refresh JWTs **in the redirect URL** as well
  as cookies — tokens in browser history
- `POST /stripe/subscription` and `POST /members` are **unprotected**
- **No Stripe webhooks** — subscription state is client-driven
- Public `GET /membership/:uid` returns **name, email, photo** for any id
- `createdAt` stored as `toLocaleTimeString()`; avatars stored as base64
  data URLs in MongoDB; Cloudinary dependency unused
- Auth middleware console.logs cookie/token metadata

Verdict: **rewrite, not refactor.** Keepable primitives: the Stripe account,
the Google OAuth client, the refresh-mutex idea and the healthcheck idea from
the FE. Mongo/Atlas is retired (see §5).

## 1. Goals and non-goals

**Goals**

1. Same stack as marketing: Vite + React 19 + TS, Tailwind v4 + brand tokens,
   shadcn, Redux Toolkit + RTK Query, react-router v7, react-i18next,
   oxlint + vitest, npm workspaces, GH Actions CI
2. Same theme: OCRA brand tokens (chalk/bog/field/tape/mist/numeral), light +
   dark with the existing toggle, display-caps typography
3. Passwordless-first auth (email OTP + Google), no passwords ever stored
4. Server-authoritative membership state (Stripe webhooks), locked-down API,
   GDPR-clean public verification
5. Foundation for athlete vs organisational membership

**Non-goals (this replatform)**

- Events, race entries, full admin CRM
- Password or Apple/Facebook auth
- Offline PWA (revisit once the card page is stable)

## 2. Target architecture

```
Members FE (Render static) ──auth────► Supabase Auth (Google + email OTP)
Members FE ──everything else──► API (Render) ──Drizzle──► Supabase Postgres
                                   │
                                   └──► Stripe (checkout, portal, webhooks)
```

All three services run on Render from one `render.yaml`. GitHub Pages was
the original plan and was dropped: it allows one site per repository, which
would have forced the members build into a separate artifact repo purely to
get a second domain. Moving also retired `BASE_PATH=/ocra/`.

### Repo layout — one monorepo, ocra-eng/ocra

```
apps/
  marketing/      (today's frontend/ workspace, renamed)
  members/        (new FE)
  api/            (new BE)
packages/
  shared/         (today's shared/ — types, constants)
  ui/             (extracted: index.css tokens, fonts, Button, Wordmark,
                   ThemeToggle, LanguageSwitcher, HubPage card pattern)
scripts/          (prerender etc.)
```

Both members repos are archived after cutover; new code lives in ocra-eng.

### Auth (Supabase)

- **One login screen**: email field + "Send me a code" + Google button.
  `signInWithOtp` auto-creates accounts, so register and login are one flow.
- **OTP-code-first, link included**: codes avoid magic-link failure modes
  (in-app email browsers, cross-device clicks, link-prefetching mail
  scanners). The email carries both. Length is a Supabase setting that must
  match `OTP_LENGTH` in the members app; the field is one box per digit and
  a pasted code fills all of them.
- **"Confirm email" must be off.** With it on, Supabase treats a first email
  sign-in as a signup needing confirmation and sends a link regardless of
  the templates. Entering a code that only arrived in that mailbox is itself
  proof of control, so the extra step adds nothing.
- Settings: ~60s resend cooldown, ~10 min OTP expiry.
- **Email**: custom SMTP via Google Workspace (`smtp.gmail.com`, app
  password), which needed no DNS change since the sending address is already
  SPF/DKIM-aligned. Supabase's built-in sender is dev-only — rate-limited and
  restricted to project members — and custom SMTP is also what unlocks
  template editing. Templates live in `docs/email-templates/`. Stripe sends
  payment receipts itself.
- Sessions: supabase-js manages tokens client-side (localStorage +
  auto-refresh) — an accepted trade, mitigated by short expiry; see §6.
- The API verifies Supabase JWTs (JWKS) and maps the Supabase user id to a
  members row on first contact. Roles live in our members table, not in
  Supabase metadata.

### API (apps/api, on Render)

- Hono preferred (built-in zod validation, lighter tests); Express 5 equally
  viable — final call at Phase 1 kickoff. TS, feature folders, structured
  logging.
- Endpoints: `GET /health` (with DB probe), `GET/PATCH /me`,
  `GET /verify/:token` (public), `POST /billing/checkout-session`,
  `POST /billing/portal-session`, `POST /webhooks/stripe` (raw body),
  `GET /admin/members` (role-gated).
- **Billing**: Stripe Checkout + webhooks (`checkout.session.completed`,
  `customer.subscription.updated/deleted`) as the source of truth; billing
  portal for renew/cancel. The client never decides membership status.
- **Public verification** is keyed on an opaque per-membership token, not
  the member number. Numbers are sequential, so keying on them would make
  the whole membership enumerable. Because reaching the page requires
  scanning a real QR, it can safely return the photo and match the member's
  own card. Never the email.

### Data (Supabase Postgres + Drizzle)

Drizzle ORM: schema as typed TS in the repo, drizzle-kit migrations in CI,
typed queries in the API. Connects over a plain connection string, so the
data layer is portable to any Postgres if ever needed — Supabase lock-in
stays confined to auth.

```
members      { id, supabaseUserId, email, displayName, profileName?,
               photoUrl?, role: member|admin, stripeCustomerId?, timestamps }
memberships  { id, memberId → members, type: athlete|organisation,
               memberNumber UNIQUE, verificationToken UNIQUE,
               stripeSubscriptionId, status, currentPeriodEnd,
               confirmed, timestamps }
```

Member numbers `OCRA-YYYY-NNNN`, minted at first activation, stable across
renewals, uniqueness enforced by the database. Athlete is the only
purchasable type at launch; organisational is a second Stripe product later
with no schema change.

### Cold starts and availability (free-tier preview phase)

- Render free tier sleeps (~30–60s wake): FE fires the `/health` ping **at
  app load** so the wake runs in parallel with sign-in; the login CTA gates
  on health with a ~90s backoff and "waking the server…" UX (port of the
  existing healthcheck idea, with a realistic budget).
- `/health` probes the DB through the same Drizzle connection real queries
  use — `{ api, db }` reported separately.
- Supabase free tier **pauses** after ~1 week idle and does not auto-resume:
  prevented by a scheduled GH Actions keep-alive (trivial query every 1–2
  days). The health gate handles Render; the cron handles Supabase.
- At go-live (paid tiers) none of this fires; it degrades into an outage
  indicator, kept.

## 3. Deployment and environments

Two standing environments — dev exists from Phase 0, prod comes alive at
cutover. Both origins are pre-registered in Google OAuth and Supabase from
day one, so cutover is a pure DNS change, never an auth-config change.

| | dev (from Phase 0) | prod (at cutover) |
|---|---|---|
| marketing | — | ocra.ie, GH Pages, this repo (unchanged) |
| members FE | **dev-members.ocra.ie** — Pages artifact repo, deploys on every main push | **members.ocra.ie** — second Pages artifact repo, deploys on release |
| API | **dev-api.ocra.ie** — Render free (sleeps; health gate covers it) | **api.ocra.ie** — Render Starter ~$7/mo, next to rops |
| Auth + Postgres | Supabase dev project (free; keep-alive cron) | Supabase prod project (Pro ~$25/mo) |
| Stripe | test keys | live keys |
| Email | Resend + SPF/DKIM on ocra.ie (shared) | same |

members.ocra.ie DNS stays pointed at the old Vercel app, untouched, until
cutover day. Decommissioned at cutover: both Vercel projects, MongoDB Atlas.
End state platforms: GitHub + Render + Supabase + Stripe + Resend, with
dev-members / dev-api surviving as a permanent staging channel.

Local dev: 5173 + 4000 + the Supabase dev project + Stripe test keys.
Secrets in GH Actions + Render + Supabase.

## 4. Phases

**Phase 0 — Scaffolding (1 session)**
Workspace restructure to `apps/*` + `packages/ui` extraction (marketing
consumes it, proving the package), CI matrix per workspace, empty
`apps/members` and `apps/api` shells deployed to preview URLs.
*Done when: marketing still ships from the new layout.*

**Phase 1 — API + platform (2–3 sessions) — DONE**
Supabase project + Google provider + OTP templates; Resend SMTP + SPF/DKIM
on ocra.ie; Drizzle schema + migrations; JWT verification middleware; member
endpoints; Stripe checkout + webhooks + portal; redacted verify; health with
DB probe; keep-alive cron. Vitest coverage on webhook handlers, JWT
middleware, verification redaction, member-number minting (Stripe CLI replay
in CI).
*Done when: a test member can sign in with an emailed code, pay with a Stripe
test card, and the webhook flips their membership active with a minted
member number.*

**Phase 2 — Members FE (2–3 sessions) — DONE**
Login (OTP + Google), card (QR + share, config-driven URL), purchase/manage
via portal, public verify page, profile edit, admin members table (read-only
v1), five locales (en/ga/pl/ru/be, full coverage), light/dark brand theme,
app-load pre-warm + waking UX.
*Done when: the full journey works on the github.io preview in all five
locales.*

**Phase 3 — Cutover (1 session, gated on main-site launch)**
Migration: read old Mongo + Stripe (Stripe is truth for subscription state),
write Supabase Postgres, mint member numbers for active members, drop base64
photos in favour of Google photo URLs. Dry-run report first. Upgrade
Supabase Pro + Render Starter, DNS members.ocra.ie + api.ocra.ie, archive
old repos, tear down Vercel + Atlas. Old sessions invalid — members simply
sign in again (same identity, no data loss).
*Done when: old infra is off and a pre-existing member's card shows active.*

**Phase 4 — Post-cutover**
PostHog analytics + error tracking, organisational membership product, admin
actions (roles, refunds via portal), revisit PWA/offline card.

## 5. Decision log (2026-08-24)

1. **Monorepo merge** — YES, into ocra-eng/ocra.
2. **Go-live constraint** — nothing on members.ocra.ie until the main-site
   launch; the standing dev environment (dev-members.ocra.ie +
   dev-api.ocra.ie) carries everything until then and remains as staging
   after cutover.
3. **Locales** — drop de/es/fr/nl/pt; align on en/ga/pl/ru/be.
4. **api.ocra.ie** — DNS available; attached at cutover.
5. **Member numbers** — `OCRA-YYYY-NNNN` approved.
6. **API host: Render** — rops already lives there and fees are already
   being paid; consolidation, not addition. Long-lived Node: natural
   connection pooling, trivial raw-body webhooks.
7. **Auth + DB: Supabase** (Google + email-OTP passwordless, managed
   Postgres). Familiarity counts: the maintainer knows Supabase, and auth is
   the worst place to learn a new tool under pressure. Considered and
   declined: hand-rolled JWT (v1 proved the point), Better Auth (technically
   tidy but unfamiliar), Firebase (Auth is excellent but Firestore re-imports
   the document-model problem we left Mongo over, with deeper lock-in; its
   email advantage evaporates once production email is done properly on a
   custom domain either way).
8. **Database: Postgres over Mongo** — the migration script runs at cutover
   regardless, and the federation roadmap (results, rankings, clubs,
   certifications) is relational; unique member numbers and referential
   integrity belong in the database, not app code.
9. **Costs accepted**: ~$0 during preview; at go-live Supabase Pro ~$25/mo
   (free tier pauses are unacceptable for live auth) + Render Starter ~$7/mo.

## 5b. Status, 2026-08-25

Phases 0–2 are complete and proven against real data in the dev
environment. What was verified end to end, not just built:

- Passwordless sign-in, Google and email OTP, against the real Supabase
  project with custom SMTP and branded templates
- A real (sandbox) card payment minting `OCRA-2026-0006`, with the webhook
  confirming it on the deployed Render service, signature checked
- `cancel_at_period_end` correctly leaving a membership active until the
  period ends, rather than expiring someone who has paid
- Customer portal sessions creating
- The public card, keyed on an opaque token so the sequential member
  numbers cannot be enumerated
- Admin listing over the 23 migrated members and 10 memberships
- The migration run three times, proving idempotency: no duplicates, no
  reassigned member numbers

Remaining work is cutover, not building — see the migration plan §6.
Deployment traps discovered along the way are recorded in §12 there.

## 6. Risks and accepted trades

- **Stripe webhook correctness** is the heart of the rebuild — Stripe CLI
  replay tests in CI, idempotent handlers.
- **Identity linking**: Google sign-in and email OTP with the same address
  must resolve to one member row — a written test case, not an assumption; a
  duplicate member is a duplicate member number.
- **Sessions in localStorage** (supabase-js on a static SPA): accepted trade
  vs httpOnly cookies, mitigated by short token expiry and no third-party
  scripts; revisit if the threat model changes.
- **Supabase free-tier pause** during preview: keep-alive cron; monitor it
  (a failed cron for 8 days = paused project needing manual restore).
- **Existing subscribers count unknown** until we query Stripe — migration
  dry-run report before cutover.
- **Email deliverability** is part of the login path: verified before
  cutover, not after. Sending goes through Google Workspace SMTP, which
  needed no DNS change; the trade is no delivery logs, so "the code never
  arrived" cannot be answered definitively. Move to Resend when that first
  happens.
- **OTP length is coupled** between Supabase's setting and `OTP_LENGTH` in
  the members app. They must match or a valid code cannot be entered.
- **The customer portal must be configured per Stripe environment.**
  Nothing in the code reveals its absence until a member tries to cancel.
