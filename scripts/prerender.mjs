// Post-build prerender: snapshots each locale route of the built SPA to static
// HTML so crawlers get real content and GitHub Pages serves 200s for /:lang.
// Also writes 404.html (SPA fallback), sitemap.xml and robots.txt into dist.
// Usage: node scripts/prerender.mjs   (BASE_PATH must match the vite build)
import { createServer } from "node:http"
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { extname, join, resolve } from "node:path"
import puppeteer from "puppeteer-core"

const SITE_URL = "https://ocra.ie/"
const LOCALES = ["ga", "pl", "ru", "be"]
const PAGES = [
  "",
  "about/",
  "coaching/",
  "get-involved/",
  "membership/",
  "race-organisers/",
  "governance/",
]
const BASE = process.env.BASE_PATH ?? "/"

const root = resolve(import.meta.dirname, "..")
const dist = resolve(root, "frontend/dist")
if (!existsSync(join(dist, "index.html"))) {
  throw new Error("frontend/dist/index.html missing — run the build first")
}
const shell = readFileSync(join(dist, "index.html"))

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean)
const executablePath = CHROME_PATHS.find((p) => existsSync(p))
if (!executablePath) throw new Error("no Chrome found; set CHROME_PATH")

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".json": "application/json",
}

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost")
  let path = decodeURIComponent(url.pathname)
  if (path.startsWith(BASE)) path = path.slice(BASE.length)
  else path = path.replace(/^\//, "")
  let file = join(dist, path)
  if (path === "" || path.endsWith("/")) file = join(file, "index.html")
  if (!existsSync(file) || extname(file) === "") {
    // SPA fallback: always the original shell, so routes render client-side
    res.writeHead(200, { "content-type": "text/html" })
    res.end(shell)
    return
  }
  res.writeHead(200, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
  })
  res.end(readFileSync(file))
})

await new Promise((r) => server.listen(0, r))
const port = server.address().port
const origin = `http://localhost:${port}`

const browser = await puppeteer.launch({ executablePath, headless: true })
const snapshots = new Map()

for (const locale of ["en", ...LOCALES]) {
  for (const pagePath of PAGES) {
    const routePath = (locale === "en" ? "" : `${locale}/`) + pagePath
    const expectedCanonical = `https://ocra.ie/${routePath}`
    const page = await browser.newPage()
    await page.goto(`${origin}${BASE}${routePath}`, {
      waitUntil: "networkidle0",
    })
    await page.waitForFunction(
      (lang, canonical) =>
        document.documentElement.lang === lang &&
        document.querySelector("link[rel=canonical]")?.href === canonical &&
        // main must have content: lazy routes render a Suspense fallback
        // (empty main) before the page chunk arrives
        (document.querySelector("main")?.children.length ?? 0) > 0,
      { timeout: 15000 },
      locale,
      expectedCanonical
    )
    const html = await page.evaluate(
      () => "<!doctype html>" + document.documentElement.outerHTML
    )
    snapshots.set(routePath, html)
    await page.close()
    console.log(`snapshot: ${BASE}${routePath} (${locale})`)
  }
}
await browser.close()
server.close()

for (const [routePath, html] of snapshots) {
  const dir = join(dist, routePath)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, "index.html"), html)
}
writeFileSync(join(dist, "404.html"), shell)

const today = new Date().toISOString().slice(0, 10)
const urls = ["", ...LOCALES.map((l) => `${l}/`)]
  .flatMap((prefix) => PAGES.map((p) => `${prefix}${p}`))
  .map(
    (p) =>
      `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`
  )
  .join("\n")
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
)
writeFileSync(
  join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}sitemap.xml\n`
)
console.log(`prerender complete: ${snapshots.size} pages, 404.html, sitemap.xml, robots.txt`)
