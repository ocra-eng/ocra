import { beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type Stripe from "stripe"
import { createApp } from "../src/app.js"
import type { Database } from "../src/db/index.js"
import { members } from "../src/db/schema.js"
import { upsertMembership } from "../src/features/membership/service.js"
import { testConfig } from "./helpers/config.js"
import { createTestDb } from "./helpers/db.js"

let db: Database
let app: ReturnType<typeof createApp>

const TOKENS: Record<string, { supabaseUserId: string; email: string }> = {
  "token-member": {
    supabaseUserId: "11111111-1111-1111-1111-111111111111",
    email: "member@example.com",
  },
  "token-newcomer": {
    supabaseUserId: "22222222-2222-2222-2222-222222222222",
    email: "newcomer@example.com",
  },
  "token-admin": {
    supabaseUserId: "33333333-3333-3333-3333-333333333333",
    email: "admin@example.com",
  },
}

const verifyToken = async (token: string) => {
  const user = TOKENS[token]
  if (!user) throw new Error("bad token")
  return user
}

const stripeStub = {} as unknown as Stripe

const get = (path: string, token?: string) =>
  app.request(path, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })

interface MeResponse {
  member: {
    id: string
    email: string
    displayName: string
    profileName?: string
    photoUrl?: string
    role: string
    createdAt: string
  }
  membership: {
    memberNumber: string
    type: string
    status: string
    currentPeriodEnd?: string
  } | null
}

/** res.json() is unknown to TS; each test says what shape it expects. */
const body = async <T>(res: Response): Promise<T> => (await res.json()) as T

beforeEach(async () => {
  db = await createTestDb()
  app = createApp({ config: testConfig(), db, stripe: stripeStub, verifyToken })
})

describe("health", () => {
  it("reports api and database separately", async () => {
    const res = await get("/health")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      status: "ok",
      api: "ok",
      database: "ok",
      billing: "ok",
    })
  })
})

describe("authentication", () => {
  it("rejects a request with no token", async () => {
    expect((await get("/me")).status).toBe(401)
  })

  it("rejects an invalid token", async () => {
    expect((await get("/me", "nonsense")).status).toBe(401)
  })

  it("creates a member row on first sign-in", async () => {
    const res = await get("/me", "token-newcomer")
    expect(res.status).toBe(200)

    const payload = await body<MeResponse>(res)
    expect(payload.member.email).toBe("newcomer@example.com")
    expect(payload.membership).toBeNull()
    expect(await db.select().from(members)).toHaveLength(1)
  })

  it("claims a migrated row and binds it to the supabase user", async () => {
    await db.insert(members).values({
      email: "member@example.com",
      displayName: "Migrated Member",
    })

    const payload = await body<MeResponse>(await get("/me", "token-member"))
    expect(payload.member.displayName).toBe("Migrated Member")

    const [row] = await db.select().from(members)
    expect(row.supabaseUserId).toBe(TOKENS["token-member"].supabaseUserId)
    expect(await db.select().from(members)).toHaveLength(1)
  })

  it("matches a migrated row by billing email", async () => {
    await db.insert(members).values({
      email: "different@example.com",
      billingEmail: "member@example.com",
      displayName: "Mismatched Email",
    })

    const payload = await body<MeResponse>(await get("/me", "token-member"))
    expect(payload.member.displayName).toBe("Mismatched Email")
    expect(await db.select().from(members)).toHaveLength(1)
  })

  it("returns the membership when there is one", async () => {
    const [member] = await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })
      .returning()
    await upsertMembership(db, {
      memberId: member.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_1",
      currentPeriodEnd: new Date("2027-01-01T00:00:00Z"),
      year: 2026,
    })

    const payload = await body<MeResponse>(await get("/me", "token-member"))
    expect(payload.membership).toMatchObject({
      memberNumber: "OCRA-2026-0001",
      status: "active",
      type: "athlete",
    })
  })
})

describe("partner offers", () => {
  const OFFERS = [
    {
      key: "shop-a",
      name: "Shop A",
      percent: 10,
      shopUrl: "https://shop-a.example",
      code: "CODE10",
    },
    {
      key: "shop-b",
      name: "Shop B",
      percent: 12,
      shopUrl: "https://shop-b.example/discount/X",
    },
  ]

  const seedMember = async (status?: "active" | "expired") => {
    const [member] = await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })
      .returning()
    if (status) {
      await upsertMembership(db, {
        memberId: member.id,
        type: "athlete",
        status,
        stripeSubscriptionId: "sub_1",
        currentPeriodEnd: new Date("2027-01-01T00:00:00Z"),
        year: 2026,
      })
    }
  }

  beforeEach(() => {
    app = createApp({
      config: testConfig({ partnerOffers: OFFERS }),
      db,
      stripe: stripeStub,
      verifyToken,
    })
  })

  it("refuses an unauthenticated caller", async () => {
    expect((await get("/me/offers")).status).toBe(401)
  })

  it("refuses a member with no membership", async () => {
    await seedMember()
    expect((await get("/me/offers", "token-member")).status).toBe(403)
  })

  it("refuses a lapsed member", async () => {
    await seedMember("expired")
    expect((await get("/me/offers", "token-member")).status).toBe(403)
  })

  it("gives an active member the offers, uncached", async () => {
    await seedMember("active")
    const res = await get("/me/offers", "token-member")
    expect(res.status).toBe(200)
    expect(res.headers.get("cache-control")).toBe("private, no-store")
    expect(await res.json()).toEqual({ offers: OFFERS })
  })

  it("gives an empty list when no offers are configured", async () => {
    app = createApp({ config: testConfig(), db, stripe: stripeStub, verifyToken })
    await seedMember("active")
    const res = await get("/me/offers", "token-member")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ offers: [] })
  })
})

describe("admin", () => {
  it("refuses a non-admin", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })
    expect((await get("/admin/members", "token-member")).status).toBe(403)
  })

  it("allows an admin", async () => {
    await db.insert(members).values({
      email: "admin@example.com",
      displayName: "Admin",
      role: "admin",
    })
    const res = await get("/admin/members", "token-admin")
    expect(res.status).toBe(200)
    // Empty by default: this admin holds no membership, and the default
    // filter is people who do.
    expect((await body<{ members: unknown[] }>(res)).members).toHaveLength(0)

    const all = await get("/admin/members?status=all", "token-admin")
    expect((await body<{ members: unknown[] }>(all)).members).toHaveLength(1)
  })

  it("refuses an unauthenticated caller", async () => {
    expect((await get("/admin/members")).status).toBe(401)
  })

  describe("listing", () => {
    interface AdminResponse {
      filter: string
      members: { email: string; membership: { status: string } | null }[]
      counts: { all: number; active: number; expired: number; none: number }
    }

    const seed = async () => {
      await db.insert(members).values({
        email: "admin@example.com",
        displayName: "Admin",
        role: "admin",
      })
      const [paid] = await db
        .insert(members)
        .values({ email: "paid@example.com", displayName: "Paid" })
        .returning()
      const [lapsed] = await db
        .insert(members)
        .values({ email: "lapsed@example.com", displayName: "Lapsed" })
        .returning()
      // An account that never paid — the majority case after migration.
      await db
        .insert(members)
        .values({ email: "account@example.com", displayName: "Account" })

      await upsertMembership(db, {
        memberId: paid.id,
        type: "athlete",
        status: "active",
        stripeSubscriptionId: "sub_paid",
        currentPeriodEnd: null,
        year: 2026,
      })
      await upsertMembership(db, {
        memberId: lapsed.id,
        type: "athlete",
        status: "expired",
        stripeSubscriptionId: "sub_lapsed",
        currentPeriodEnd: null,
        year: 2025,
      })
    }

    it("defaults to members with an active membership", async () => {
      await seed()
      const body_ = await body<AdminResponse>(
        await get("/admin/members", "token-admin")
      )

      expect(body_.filter).toBe("active")
      expect(body_.members.map((m) => m.email)).toEqual(["paid@example.com"])
    })

    it("reports counts for every bucket regardless of filter", async () => {
      await seed()
      const body_ = await body<AdminResponse>(
        await get("/admin/members", "token-admin")
      )
      expect(body_.counts).toEqual({ all: 4, active: 1, expired: 1, none: 2 })
    })

    it("filters to expired, none and all", async () => {
      await seed()
      for (const [filter, expected] of [
        ["expired", ["lapsed@example.com"]],
        ["none", ["admin@example.com", "account@example.com"]],
      ] as const) {
        const body_ = await body<AdminResponse>(
          await get(`/admin/members?status=${filter}`, "token-admin")
        )
        expect(body_.members.map((m) => m.email).sort()).toEqual(
          [...expected].sort()
        )
      }
      const all = await body<AdminResponse>(
        await get("/admin/members?status=all", "token-admin")
      )
      expect(all.members).toHaveLength(4)
    })

    it("ignores an unknown filter rather than erroring", async () => {
      await seed()
      const body_ = await body<AdminResponse>(
        await get("/admin/members?status=nonsense", "token-admin")
      )
      expect(body_.filter).toBe("active")
    })

    it("lists each member once even after a renewal", async () => {
      const [member] = await db
        .insert(members)
        .values({ email: "renewer@example.com", displayName: "Renewer" })
        .returning()
      await db.insert(members).values({
        email: "admin@example.com",
        displayName: "Admin",
        role: "admin",
      })
      await upsertMembership(db, {
        memberId: member.id,
        type: "athlete",
        status: "active",
        stripeSubscriptionId: "sub_1",
        currentPeriodEnd: null,
        year: 2025,
      })
      await upsertMembership(db, {
        memberId: member.id,
        type: "athlete",
        status: "active",
        stripeSubscriptionId: "sub_2",
        currentPeriodEnd: null,
        year: 2026,
      })

      const body_ = await body<AdminResponse>(
        await get("/admin/members?status=all", "token-admin")
      )
      expect(
        body_.members.filter((m) => m.email === "renewer@example.com")
      ).toHaveLength(1)
    })
  })
})

describe("public verification", () => {
  const seedActive = async () => {
    const [member] = await db
      .insert(members)
      .values({
        email: "member@example.com",
        displayName: "Public Person",
        photoUrl: "https://example.com/face.jpg",
      })
      .returning()
    const membership = await upsertMembership(db, {
      memberId: member.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_1",
      currentPeriodEnd: null,
      year: 2026,
    })
    return membership
  }

  it("returns the card, with the photo but never the email", async () => {
    const membership = await seedActive()
    const res = await get(`/verify/${membership.verificationToken}`)
    expect(res.status).toBe(200)

    const raw = await res.text()
    expect(raw).toContain("Public Person")
    // The photo is intentional: the public card matches the member's own.
    expect(raw).toContain("face.jpg")
    expect(raw).not.toContain("member@example.com")
  })

  it("refuses the member number, so the membership cannot be enumerated", async () => {
    await seedActive()
    expect((await get("/verify/OCRA-2026-0001")).status).toBe(404)
  })

  it("404s an unknown token without leaking whether it existed", async () => {
    const res = await get("/verify/00000000-0000-0000-0000-000000000000")
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: "not-found" })
  })

  it("needs no authentication", async () => {
    const membership = await seedActive()
    expect((await get(`/verify/${membership.verificationToken}`)).status).toBe(
      200
    )
  })
})

describe("profile", () => {
  it("updates the profile name and trims it", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })

    const res = await app.request("/me", {
      method: "PATCH",
      headers: {
        authorization: "Bearer token-member",
        "content-type": "application/json",
      },
      body: JSON.stringify({ profileName: "  New Name  " }),
    })

    expect(res.status).toBe(200)
    const [row] = await db
      .select()
      .from(members)
      .where(eq(members.email, "member@example.com"))
    expect(row.profileName).toBe("New Name")
  })

  it("rejects an empty profile name", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "Member" })

    const res = await app.request("/me", {
      method: "PATCH",
      headers: {
        authorization: "Bearer token-member",
        "content-type": "application/json",
      },
      body: JSON.stringify({ profileName: "   " }),
    })
    expect(res.status).toBe(400)
  })
})

describe("billing", () => {
  /** Minimal Stripe double: enough for the customer-resolution paths. */
  const missingCustomerStripe = {
    customers: {
      retrieve: async () => {
        throw Object.assign(new Error("No such customer"), {
          code: "resource_missing",
        })
      },
      create: async () => ({ id: "cus_new" }),
    },
    checkout: {
      sessions: { create: async () => ({ url: "https://checkout.test/session" }) },
    },
    billingPortal: {
      sessions: {
        create: async () => {
          throw Object.assign(new Error("No such customer"), {
            code: "resource_missing",
          })
        },
      },
    },
  } as unknown as Stripe

  beforeEach(() => {
    app = createApp({
      config: testConfig(),
      db,
      stripe: missingCustomerStripe,
      verifyToken,
    })
  })

  const post = (path: string) =>
    app.request(path, {
      method: "POST",
      headers: { authorization: "Bearer token-member" },
    })

  it("replaces a customer id Stripe no longer knows, and checks out", async () => {
    // A live-mode id in a database used with test keys, or a customer
    // deleted in Stripe: either way it cannot be reused.
    await db.insert(members).values({
      email: "member@example.com",
      displayName: "Stale Customer",
      stripeCustomerId: "cus_from_another_mode",
    })

    const res = await post("/billing/checkout-session")
    expect(res.status).toBe(200)

    const [row] = await db.select().from(members)
    expect(row.stripeCustomerId).toBe("cus_new")
  })

  it("reports no billing account rather than 500 when the portal customer is gone", async () => {
    await db.insert(members).values({
      email: "member@example.com",
      displayName: "Stale Customer",
      stripeCustomerId: "cus_from_another_mode",
    })

    const res = await post("/billing/portal-session")
    expect(res.status).toBe(409)

    // And the dead id is forgotten, so the next checkout starts clean.
    const [row] = await db.select().from(members)
    expect(row.stripeCustomerId).toBeNull()
  })

  it("409s the portal for a member with no billing account", async () => {
    await db
      .insert(members)
      .values({ email: "member@example.com", displayName: "No Billing" })
    expect((await post("/billing/portal-session")).status).toBe(409)
  })
})

describe("webhook endpoint", () => {
  it("rejects a request with no stripe signature", async () => {
    const res = await app.request("/webhooks/stripe", {
      method: "POST",
      body: "{}",
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: "missing-signature" })
  })
})
