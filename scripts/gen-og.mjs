// Regenerates frontend/public/img/og.png (1200x630 share card).
// Usage: node scripts/gen-og.mjs
import { existsSync, writeFileSync, rmSync } from "node:fs"
import { resolve } from "node:path"
import puppeteer from "puppeteer-core"

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean)
const executablePath = CHROME_PATHS.find((p) => existsSync(p))
if (!executablePath) throw new Error("no Chrome found; set CHROME_PATH")

const root = resolve(import.meta.dirname, "..")
const tmp = resolve(root, "frontend/public/_og_card.html")

writeFileSync(
  tmp,
  `<!doctype html><html><head><style>
  body { margin: 0; width: 1200px; height: 630px; display: grid; place-items: center;
    background: linear-gradient(160deg, #12362a 0%, #081711 100%); }
  img { height: 460px; width: auto; }
  .tape { position: absolute; bottom: 0; left: 0; right: 0; height: 22px;
    background: repeating-linear-gradient(-45deg, #f4520b 0 34px, #0c231a 34px 68px); }
</style></head><body><img src="brand/logo_color.svg"><div class="tape"></div></body></html>`
)

const browser = await puppeteer.launch({ executablePath, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
await page.goto("file://" + tmp)
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: resolve(root, "frontend/public/img/og.png") })
await browser.close()
rmSync(tmp)
console.log("written frontend/public/img/og.png")
