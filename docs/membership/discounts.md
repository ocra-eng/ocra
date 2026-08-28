# Member discounts

Partner offers available to OCRA members: what was agreed, how a member
redeems it, and the assets we hold. One row per partner. Add to the table
when a new offer is agreed; move a row to "Ended" rather than deleting it.

Started 2026-08-28.

**The codes, discount links and QR codes are not in this repo.** The repo is
public and the codes are the benefit. They live in the `partner_offers` table
in the API's Postgres (Supabase), each row with an `active` switch, and are
served by `GET /me/offers` to a signed-in member with an active membership
only. The table is closed to the Supabase Data API like `members` is. See
`docs/plans/partner-offers-api.md`.

## Live offers

| Partner | Offer | How to redeem | Assets in this folder |
| --- | --- | --- | --- |
| Tiger Obstacle | 10% off | A code typed at checkout on their shop | `tigerobstacle_logo.jpeg` |
| Officine del Grip | 12% off | A discount link that applies the code at checkout (they also supplied it as a QR code, kept out of git) | `officienedelgrip_logo.jpeg` |

### Tiger Obstacle

- Code case not confirmed with the partner; their shop is Shopify, where
  codes are not case-sensitive.
- Site checked 2026-08-28: resolves.

### Officine del Grip

- The link is Shopify's discount-link format: opening it attaches the code to
  the visitor's basket and lands on the shop homepage.
- Link checked 2026-08-28: resolves, redirects to their homepage.
- Asset filenames are spelled `officiene…`; left as received.

## Ended

None.

## Where they are shown

- **Public site, `/membership`** — one card per partner with its logo and the
  headline offer ("10% off for OCRA members"), no code and no link. The
  `:::partners` block in `docs/content/membership.md`. Web copies of the logos
  live in `apps/marketing/public/img/partners/` (the Officine del Grip copy has
  its light-grey background lifted to white and is downscaled to 800px; the
  original above is untouched).
- **Members app, Membership page only** — the offers with codes and links,
  fetched from `GET /me/offers`, shown only while the membership is active.
  Lapsed members get nothing. My card shows no offers: it is what gets held up
  at registration. Logos are looked up by offer key in
  `apps/members/public/img/partners/<key>.jpeg`. Copy is in all five
  languages in `apps/members/src/features/membership/i18n/index.ts`.

## Adding, pausing or ending a partner

1. Insert a row in `partner_offers` (Supabase → Table editor, or SQL):
   `key` (kebab-case, also names the logo), `name`, `percent`, `shop_url`,
   `code` (null when the URL carries it). It is live immediately; no deploy.
2. Add the logo as `apps/members/public/img/partners/<key>.jpeg` and a
   logo-and-headline card to `docs/content/membership.md`. Deploy.
3. Add a row above.

To pause or end an offer, set `active = false` on its row. Do not delete
rows; the history of what was offered stays.
