# Partner offers behind the API

Move the partner discount codes and links out of the members app bundle and
into an authenticated API call, so only a member with an **active**
membership can get them. Planned 2026-08-28 for Monday 2026-08-31.

## 1. Why

Today the codes sit in `apps/members/src/features/membership/ui/MemberDiscounts.tsx`
(uncommitted). The UI only renders them for an active member, but:

- anyone can download the members bundle from `members.ocra.ie` without
  signing in and read them out of the JavaScript;
- `ocra-eng/ocra` is a public repo, so committing them publishes them.

"Hidden from non-members" is not "unavailable to non-members". The fix is
the same one the membership status already uses: the API decides, the app
renders what it is given.

## 2. Shape

```
GET /me/offers            Authorization: Bearer <supabase jwt>

200  { "offers": [ { key, name, percent, shopUrl, code? } ] }   active member
403  { "message": "Membership is not active" }                  any other status, or no membership
401                                                             no / bad token
```

- `Cache-Control: private, no-store` on the 200, so no proxy or the browser
  keeps a copy.
- `code` is optional: Officine del Grip is a Shopify discount **link**
  (`/discount/<code>`), Tiger Obstacle is a code typed at checkout.
- The API returns everything the card needs, including `name` and `percent`,
  so adding a partner is an env change on Render, not a client deploy. The
  logo is the one exception: the app looks for
  `public/img/partners/<key>.jpeg` and renders without an image if missing.

## 3. Where the codes live

An env var on the API service, JSON, validated at boot like everything else
in `apps/api/src/config.ts`:

```
PARTNER_OFFERS=[{"key":"tiger-obstacle","name":"Tiger Obstacle","percent":10,"shopUrl":"https://www.tigerobstacle.com","code":"<code>"},{"key":"officine-del-grip","name":"Officine del Grip","percent":12,"shopUrl":"https://officinedelgrip.com/discount/<code>"}]
```

- Missing or empty → `offers: []`, not fatal. Two partners do not justify a
  table and an admin screen; revisit if the list passes ~ten or partners
  need to self-serve.
- Set in the Render dashboard (`sync: false` in `render.yaml`, same as the
  Stripe keys). Changing it restarts the API; no rebuild.
- Locally: one line in `apps/api/.env` (gitignored).

## 4. Work, in order

### API — `apps/api`

1. `packages/shared/src/types/member.ts`: add and export

   ```ts
   export interface PartnerOffer {
     key: string
     name: string
     percent: number
     shopUrl: string
     /** Absent when the shopUrl itself carries the discount. */
     code?: string
   }
   ```

2. `src/config.ts`: `PARTNER_OFFERS: z.string().default("[]")`, parsed with
   a zod array schema for `PartnerOffer` (`key` kebab-case, `percent` 1–100,
   `shopUrl` https). Expose as `config.partnerOffers`. A malformed value
   fails boot with the usual "Invalid environment configuration" message.

3. `src/app.ts`, next to `GET /me`:

   ```ts
   app.get("/me/offers", ...authed, async (c) => {
     const membership = await findMembershipForMember(db, c.get("member").id)
     if (membership?.status !== "active") {
       throw new HTTPException(403, { message: "Membership is not active" })
     }
     c.header("Cache-Control", "private, no-store")
     return c.json({ offers: config.partnerOffers })
   })
   ```

   Reuses `authed` (JWT + member row) and `findMembershipForMember`. No new
   middleware, no new query.

4. `tests/app.test.ts` (pglite, `createApp({ config, db, verifyToken })`
   already set up): unauthenticated → 401; active → 200 with the configured
   offers and the `no-store` header; expired → 403; no membership → 403;
   `PARTNER_OFFERS` unset → 200 `[]`. Plus one config test: malformed JSON
   refuses to boot.

5. `.env.example` and `render.yaml`: document `PARTNER_OFFERS`, `sync: false`.

### Members app — `apps/members`

6. `src/api/client.ts`: `getOffers: builder.query<{ offers: PartnerOffer[] }, void>({ query: () => "/me/offers" })`.

7. `MemberDiscounts.tsx`: delete the `OFFERS` constant. Take `offers` as a
   prop. Logo `src` becomes `${BASE_URL}img/partners/${offer.key}.jpeg`
   with `onError` hiding the image well.

8. `pages/Membership.tsx`: `useGetOffersQuery(undefined, { skip: !isActive })`;
   render `<MemberDiscounts offers={data.offers} />` when it returns a
   non-empty list. Nothing while loading; nothing on error (the benefits
   line above already says discounts exist).

9. `pages/Card.tsx`: **remove `MemberDiscounts` entirely** — both the
   loading-state preview hack and the active-branch placement. My card shows
   no offers (decided, §6).

10. i18n: no new strings unless an error line is wanted. The existing
    `discounts.*` keys in five languages carry over unchanged.

### Repo hygiene — before the first commit

11. Strip the codes from `docs/membership/discounts.md`: keep partner,
    offer, how to redeem *in words*, and "value held in `PARTNER_OFFERS` on
    the API service". No code, no link with the code in it.
12. Do not commit `docs/membership/officienedelgrip_qr_code.jpeg` — the QR
    *is* the discount link. Delete it or add it to `.gitignore`. The two
    logos are fine to commit.
13. `git grep -i` for each of the two codes must return nothing.

The codes have never been committed or pushed, so nothing needs rotating
with the partners.

## 5. Rollout

1. PR with 1–13. CI runs both apps' tests.
2. Render dashboard → `ocra-api-dev` → Environment → add `PARTNER_OFFERS`.
   Save restarts the service.
3. Merge. API deploys; members app deploys (static, `VITE_API_URL` already
   points at `api.ocra.ie`).
4. Check, in this order:
   - `curl -s -o /dev/null -w "%{http_code}" https://api.ocra.ie/me/offers`
     → `401`
   - signed in as an **active** member: Membership page shows both cards;
     Network tab shows `/me/offers` with `cache-control: private, no-store`
   - signed in as a **non**-member (or expired): no cards, `/me/offers` → 403
   - `curl -s https://members.ocra.ie/assets/index-*.js | grep -c <code>` → `0`

Half a day, most of it tests.

## 6. Decisions (Emmett, 2026-08-28)

- **Which page: the Membership page only.** My card is what gets held up at
  registration, so no code is ever on that screen.
- **Lapsed members get nothing.** `status === "active"`, no grace period.
  The route's 403 and the UI's `skip: !isActive` are the only two checks,
  and they must agree.

## 7. Not in this plan

- The self-destroying `sw.js` for the v1 service worker still cached in
  returning members' browsers. Separate, one file, ships whenever.
- The public marketing cards (`docs/content/membership.md`) stay as they
  are: logo, headline offer, no code.
