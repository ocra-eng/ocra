import { beforeEach, describe, expect, it } from "vitest"
import type { Database } from "../src/db/index.js"
import { members, memberships } from "../src/db/schema.js"
import {
  findVerification,
  mapStripeStatus,
  upsertMembership,
} from "../src/features/membership/service.js"
import { createTestDb } from "./helpers/db.js"

let db: Database

const addMember = async (email: string, displayName = "Test Member") => {
  const [row] = await db
    .insert(members)
    .values({ email, displayName })
    .returning()
  return row
}

beforeEach(async () => {
  db = await createTestDb()
})

describe("mapStripeStatus", () => {
  it("treats active and trialing as entitled", () => {
    expect(mapStripeStatus("active")).toBe("active")
    expect(mapStripeStatus("trialing")).toBe("active")
  })

  it("treats incomplete as pending, everything else as expired", () => {
    expect(mapStripeStatus("incomplete")).toBe("pending")
    expect(mapStripeStatus("past_due")).toBe("expired")
    expect(mapStripeStatus("canceled")).toBe("expired")
    expect(mapStripeStatus("unpaid")).toBe("expired")
  })
})

describe("member numbers", () => {
  it("mints sequentially within a year", async () => {
    const a = await addMember("a@example.com")
    const b = await addMember("b@example.com")

    const first = await upsertMembership(db, {
      memberId: a.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_a",
      currentPeriodEnd: null,
      year: 2026,
    })
    const second = await upsertMembership(db, {
      memberId: b.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_b",
      currentPeriodEnd: null,
      year: 2026,
    })

    expect(first.memberNumber).toBe("OCRA-2026-0001")
    expect(second.memberNumber).toBe("OCRA-2026-0002")
  })

  it("keeps numbers separate per year", async () => {
    const a = await addMember("a@example.com")
    const b = await addMember("b@example.com")

    await upsertMembership(db, {
      memberId: a.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_a",
      currentPeriodEnd: null,
      year: 2025,
    })
    const second = await upsertMembership(db, {
      memberId: b.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_b",
      currentPeriodEnd: null,
      year: 2026,
    })

    expect(second.memberNumber).toBe("OCRA-2026-0001")
  })

  it("reuses the member's number when a lapsed member renews", async () => {
    const member = await addMember("renewer@example.com")

    const original = await upsertMembership(db, {
      memberId: member.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_old",
      currentPeriodEnd: null,
      year: 2025,
    })

    // Lapses, then buys a fresh subscription a year later.
    await upsertMembership(db, {
      memberId: member.id,
      type: "athlete",
      status: "expired",
      stripeSubscriptionId: "sub_old",
      currentPeriodEnd: null,
      year: 2025,
    })
    const renewed = await upsertMembership(db, {
      memberId: member.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_new",
      currentPeriodEnd: null,
      year: 2026,
    })

    expect(renewed.memberNumber).toBe(original.memberNumber)
    const rows = await db.select().from(memberships)
    expect(rows).toHaveLength(1)
  })

  it("is idempotent for a repeated subscription id", async () => {
    const member = await addMember("dup@example.com")
    const input = {
      memberId: member.id,
      type: "athlete" as const,
      status: "active" as const,
      stripeSubscriptionId: "sub_same",
      currentPeriodEnd: null,
      year: 2026,
    }
    const first = await upsertMembership(db, input)
    const again = await upsertMembership(db, input)

    expect(again.id).toBe(first.id)
    expect(again.memberNumber).toBe(first.memberNumber)
    expect(await db.select().from(memberships)).toHaveLength(1)
  })
})

describe("public verification", () => {
  it("returns only non-identifying fields", async () => {
    const member = await addMember("private@example.com", "Private Person")
    await db
      .update(members)
      .set({ photoUrl: "https://example.com/face.jpg" })
      .where(eqId(member.id))
    await upsertMembership(db, {
      memberId: member.id,
      type: "athlete",
      status: "active",
      stripeSubscriptionId: "sub_v",
      currentPeriodEnd: new Date("2027-01-01T00:00:00Z"),
      year: 2026,
    })

    const result = await findVerification(db, "OCRA-2026-0001")

    expect(result).toMatchObject({
      memberNumber: "OCRA-2026-0001",
      displayName: "Private Person",
      type: "athlete",
      status: "active",
    })
    // The v1 endpoint leaked these; the v2 one must not.
    expect(JSON.stringify(result)).not.toContain("private@example.com")
    expect(JSON.stringify(result)).not.toContain("face.jpg")
  })

  it("returns null for an unknown number", async () => {
    expect(await findVerification(db, "OCRA-2026-9999")).toBeNull()
  })

  it("hides memberships that no webhook has confirmed", async () => {
    const member = await addMember("unconfirmed@example.com")
    await db.insert(memberships).values({
      memberId: member.id,
      memberNumber: "OCRA-2026-0500",
      type: "athlete",
      status: "active",
      confirmed: false,
    })
    expect(await findVerification(db, "OCRA-2026-0500")).toBeNull()
  })
})

// small helper kept local to avoid importing drizzle operators everywhere
import { eq } from "drizzle-orm"
const eqId = (id: string) => eq(members.id, id)
