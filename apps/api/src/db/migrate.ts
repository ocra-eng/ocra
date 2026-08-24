/**
 * Applies pending migrations. Run locally against the dev project and as a
 * pre-deploy step on Render, so the schema is always ahead of the code.
 */
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is required")
  process.exit(1)
}

// max: 1 — migrations must run on a single connection, in order.
const client = postgres(url, { max: 1 })

try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" })
  console.log("migrations applied")
} finally {
  await client.end()
}
