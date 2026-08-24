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
    return { supabaseUserId: payload.sub, email: email.trim().toLowerCase() }
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
      // First sign-in after migration: bind the row to the Supabase user.
      const member = existing.supabaseUserId
        ? existing
        : (
            await db
              .update(members)
              .set({ supabaseUserId: user.supabaseUserId, updatedAt: new Date() })
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
          displayName: user.email.split("@")[0] ?? user.email,
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
