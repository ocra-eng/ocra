// Post-build prerender: snapshots each locale route of the built SPA to
// static HTML so crawlers get real content and the host serves 200s for
// /:lang. Also writes 404.html (SPA fallback), sitemap.xml and robots.txt.
// Usage: node scripts/prerender.mjs   (BASE_PATH must match the vite build)
import { createServer } from "node:http"
import {
  existsSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
} from "node:fs"
import { extname, join, resolve } from "node:path"
import puppeteer from "puppeteer-core"

const SITE_URL = "https://ocra.ie/"
const LOCALES = ["ga", "pl", "ru", "be"]
// Localized routes: prerendered per locale.
const PAGES = ["", "get-involved/", "governance/", "race-organisers/"]
// Documents are English-only for now: prerendered at the default locale. The
// list is read from the documents themselves — each declares its own url in
// frontmatter — so there is no route map here to fall out of step with the app.
const docsRoot = resolve(import.meta.dirname, "../docs/content")
const CONTENT_PAGES = readdirSync(docsRoot)
  .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  .sort()
  .map((file) => {
    const source = readFileSync(join(docsRoot, file), "utf8")
    const url = source.match(/^url:\s*(\S+)\s*$/m)?.[1]
    if (!url) throw new Error(`docs/content/${file}: no url in frontmatter`)
    return url.replace(/^\//, "") + "/"
  })

const BASE = process.env.BASE_PATH ?? "/"

const root = resolve(import.meta.dirname, "..")
const dist = resolve(root, "apps/marketing/dist")
if (!existsSync(join(dist, "index.html"))) {
  throw new Error("apps/marketing/dist/index.html missing — run the build first")
}
const shell = readFileSync(join(dist, "index.html"))

// Build hosts differ: CI has Chrome on PATH, macOS has the app bundle, and
// Render installs one via @puppeteer/browsers. That installer lays out
// <root>/<platform>-<version>/chrome-<platform>/<exe>, so walk it rather
// than hardcoding a version.
const EXECUTABLES = [
  "chrome-linux64/chrome",
  "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
  "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
]

const installedChromes = () => {
  const roots = [
    process.env.PUPPETEER_CACHE_DIR,
    join(root, ".chrome/chrome"),
    join(process.env.HOME ?? "", ".cache/puppeteer/chrome"),
  ].filter((dir) => dir && existsSync(dir))

  return roots.flatMap((dir) =>
    readdirSync(dir).flatMap((version) =>
      EXECUTABLES.map((exe) => join(dir, version, exe))
    )
  )
}


const CHROME_PATHS = [
  process.env.CHROME_PATH,
  ...installedChromes(),
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean)
const executablePath = CHROME_PATHS.find((p) => existsSync(p))
if (!executablePath) {
  throw new Error(
    `No Chrome found. Set CHROME_PATH, or install one with:\n` +
      `  npx @puppeteer/browsers install chrome@stable\nTried:\n  ` +
      CHROME_PATHS.join("\n  ")
  )
}
console.log(`using chrome: ${executablePath}`)

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

const targets = []
for (const locale of ["en", ...LOCALES])
  for (const pagePath of PAGES)
    targets.push({
      locale,
      routePath: (locale === "en" ? "" : `${locale}/`) + pagePath,
      canonicalPath: (locale === "en" ? "" : `${locale}/`) + pagePath,
    })
for (const pagePath of CONTENT_PAGES)
  targets.push({ locale: "en", routePath: pagePath, canonicalPath: pagePath })

{
  for (const { locale, routePath, canonicalPath } of targets) {
    const expectedCanonical = `https://ocra.ie/${canonicalPath}`
    const page = await browser.newPage()
    // Pages share a browser profile: clear recalled language/theme prefs so a
    // previously snapshotted locale can't redirect an unprefixed route.
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.clear()
      } catch {
        /* storage unavailable */
      }
    })
    page.on("pageerror", (e) =>
      console.error(`pageerror ${routePath}: ${e.message}`)
    )
    page.on("requestfailed", (r) =>
      console.error(`requestfailed ${routePath}: ${r.url()} ${r.failure()?.errorText}`)
    )
    await page.goto(`${origin}${BASE}${routePath}`, {
      waitUntil: "networkidle0",
    })
    try {
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
    } catch (err) {
      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        canonical: document.querySelector("link[rel=canonical]")?.href,
        mainChildren: document.querySelector("main")?.children.length,
        url: location.href,
      }))
      console.error(
        `wait failed for ${routePath} (expected ${expectedCanonical}):`,
        JSON.stringify(state)
      )
      throw err
    }
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
const urls = [
  ...["", ...LOCALES.map((l) => `${l}/`)].flatMap((prefix) =>
    PAGES.map((p) => `${prefix}${p}`)
  ),
  ...CONTENT_PAGES,
]
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
