import { createRemoteJWKSet, jwtVerify } from "jose"
import { eq, or } from "drizzle-orm"
import type { MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import type { Database } from "../../db/index.js"
import { members } from "../../db/schema.js"
import type { Member } from "../../db/schema.js"

export interface AuthedUser {
  supabaseUserId: string
  email: string
  /** From the provider, via Supabase user_metadata. */
  name?: string
  avatarUrl?: string
}

/** Verified caller plus their member row, attached by requireMember. */
declare module "hono" {
  interface ContextVariableMap {
    user: AuthedUser
    member: Member
  }
}

type Verifier = (token: string) => Promise<AuthedUser>

/** Verifies Supabase access tokens against the project's rotating JWKS. */
export const createSupabaseVerifier = (supabaseUrl: string): Verifier => {
  const jwks = createRemoteJWKSet(
    new URL(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/.well-known/jwks.json`)
  )

  return async (token: string) => {
    const { payload } = await jwtVerify(token, jwks)
    const email = typeof payload.email === "string" ? payload.email : null
    if (!payload.sub || !email) {
      throw new HTTPException(401, { message: "Token missing subject or email" })
    }

    // Supabase puts the provider's profile in user_metadata. Google spells
    // these two ways depending on the flow, so accept either.
    const metadata = (payload.user_metadata ?? {}) as Record<string, unknown>
    const pick = (...keys: string[]) => {
      for (const key of keys) {
        const value = metadata[key]
        if (typeof value === "string" && value.trim()) return value.trim()
      }
      return undefined
    }

    return {
      supabaseUserId: payload.sub,
      email: email.trim().toLowerCase(),
      name: pick("full_name", "name"),
      avatarUrl: pick("avatar_url", "picture"),
    }
  }
}

const bearer = (header: string | undefined): string | null => {
  if (!header?.startsWith("Bearer ")) return null
  const token = header.slice(7).trim()
  return token.length > 0 ? token : null
}

/** Verifies the token only. Use for routes that don't need a member row. */
export const requireAuth = (verify: Verifier): MiddlewareHandler => {
  return async (c, next) => {
    const token = bearer(c.req.header("authorization"))
    if (!token) throw new HTTPException(401, { message: "Not authenticated" })

    try {
      c.set("user", await verify(token))
    } catch {
      throw new HTTPException(401, { message: "Invalid or expired token" })
    }
    await next()
  }
}

/**
 * Resolves the caller to a member row, creating one on first sign-in and
 * claiming any migrated row that matches their email. Matching on
 * billingEmail too is what stops a Stripe/Google email mismatch from hiding
 * someone's membership (see docs/plans/members-migration.md §4).
 */
export const requireMember = (db: Database): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get("user")

    const [existing] = await db
      .select()
      .from(members)
      .where(
        or(
          eq(members.supabaseUserId, user.supabaseUserId),
          eq(members.email, user.email),
          eq(members.billingEmail, user.email)
        )
      )
      .limit(1)

    if (existing) {
      // Bind the row to the Supabase user on first sign-in after migration,
      // and refresh the provider photo — Google's avatar URLs rotate, and a
      // stale one renders as a broken image on the member's card.
      const patch: Partial<typeof members.$inferInsert> = {}
      if (!existing.supabaseUserId) patch.supabaseUserId = user.supabaseUserId
      if (user.avatarUrl && user.avatarUrl !== existing.photoUrl) {
        patch.photoUrl = user.avatarUrl
      }
      // Only fill a name we do not already have: an admin or the member may
      // have corrected it, and the provider should not overwrite that.
      if (user.name && !existing.displayName.trim()) {
        patch.displayName = user.name
      }

      const member =
        Object.keys(patch).length === 0
          ? existing
          : (
              await db
                .update(members)
                .set({ ...patch, updatedAt: new Date() })
                .where(eq(members.id, existing.id))
                .returning()
            )[0]
      c.set("member", member)
    } else {
      const [created] = await db
        .insert(members)
        .values({
          supabaseUserId: user.supabaseUserId,
          email: user.email,
          displayName: user.name ?? user.email.split("@")[0] ?? user.email,
          photoUrl: user.avatarUrl,
        })
        .returning()
      c.set("member", created)
    }

    await next()
  }
}

/** Route guard for admin-only endpoints. Assumes requireMember has run. */
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  if (c.get("member").role !== "admin") {
    throw new HTTPException(403, { message: "Admin access required" })
  }
  await next()
}
