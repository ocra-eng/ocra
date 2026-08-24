import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema.js"

export type Database = ReturnType<typeof createDatabase>

/**
 * Long-lived pool: the API runs as a persistent process on Render, so there
 * is no serverless connection churn to work around.
 *
 * Use Supabase's **session pooler** (…pooler.supabase.com:5432). The direct
 * endpoint (db.<ref>.supabase.co) is IPv6-only and unreachable from hosts
 * without IPv6 egress, Render's free tier included.
 */
export const createDatabase = (url: string) => {
  const { hostname, port } = new URL(url)

  if (hostname.startsWith("db.") && hostname.endsWith(".supabase.co")) {
    console.warn(
      "[db] Using Supabase's direct connection, which is IPv6-only. " +
        "Switch to the session pooler if the host lacks IPv6 egress."
    )
  }

  // Transaction mode multiplexes connections and cannot hold prepared
  // statements; postgres-js has to be told, or queries fail intermittently.
  const isTransactionPooler = port === "6543"

  const client = postgres(url, {
    max: 10,
    idle_timeout: 20,
    prepare: !isTransactionPooler,
  })
  return drizzle(client, { schema })
}

export { schema }
