/**
 * Renders PNG app icons from the brand SVG.
 *
 * Home-screen icons cannot be SVG and must not be transparent — iOS
 * composites transparency onto black — so the mark is drawn on bog green,
 * matching the splash screen.
 *
 * Usage: node scripts/make-icons.mjs <source.svg> <outDir>
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join, resolve } from "node:path"
import puppeteer from "puppeteer-core"

const [source, outDir] = process.argv.slice(2)
if (!source || !outDir) {
  console.error("usage: node scripts/make-icons.mjs <source.svg> <outDir>")
  process.exit(1)
}

const BACKGROUND = "#0c231a"
/** Fraction of the canvas the mark occupies, leaving breathing room. */
const INSET = 0.72
const SIZES = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
]

const CHROME = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter((p) => p && existsSync(p))[0]
if (!CHROME) throw new Error("no Chrome found; set CHROME_PATH")

const svg = readFileSync(resolve(source), "utf8")
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`

mkdirSync(resolve(outDir), { recursive: true })

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()

for (const { name, size } of SIZES) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 })
  await page.setContent(`
    <body style="margin:0;width:${size}px;height:${size}px;background:${BACKGROUND};
                 display:grid;place-items:center">
      <img src="${dataUri}" style="width:${Math.round(size * INSET)}px" />
    </body>`)
  await page.evaluate(
    () =>
      new Promise((done) => {
        const img = document.querySelector("img")
        img?.complete ? done() : img?.addEventListener("load", () => done())
      })
  )
  writeFileSync(join(resolve(outDir), name), await page.screenshot())
  console.log(`${name} (${size}x${size})`)
}

await browser.close()
