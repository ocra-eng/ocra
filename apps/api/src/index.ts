import { serve } from "@hono/node-server"
import { createApp } from "./app.js"
import { loadConfig } from "./config.js"
import { createDatabase } from "./db/index.js"

const config = loadConfig()
const db = createDatabase(config.DATABASE_URL)
const app = createApp({ config, db })

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  console.log(`api listening on :${info.port}`)
})

const shutdown = () => {
  server.close(() => process.exit(0))
}
process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
