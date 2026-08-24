import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema.js"

export type Database = ReturnType<typeof createDatabase>

/**
 * Long-lived pool: the API runs as a persistent process on Render, so there
 * is no serverless connection churn to work around.
 */
export const createDatabase = (url: string) => {
  const client = postgres(url, { max: 10, idle_timeout: 20 })
  return drizzle(client, { schema })
}

export { schema }
