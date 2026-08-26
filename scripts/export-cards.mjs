/**
 * Renders the palette carousel on /assets/media to 1080 x 1350 PNGs, one per
 * slide, numbered in posting order.
 *
 *   npm run dev
 *   node scripts/export-cards.mjs [outDir]
 */
import puppeteer from "puppeteer-core"
import { existsSync, mkdirSync, rmSync, readdirSync } from "node:fs"

const OUT = process.argv[2] ?? "apps/marketing/public/media/palette-carousel"
const URL = "http://localhost:5173/assets/media"
const exe = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean).find(existsSync)
if (!exe) throw new Error("no Chrome found; set CHROME_PATH")

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ executablePath: exe, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1240, height: 1500, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: "domcontentloaded" })
await page.waitForSelector('[data-slide]', { timeout: 20000 })

// Unclamp to true post size. The grid has to go first: widening a slide
// inside its track just makes it overflow and get overdrawn by the next one,
// which reads as cropped text.
const names = await page.evaluate(() => {
  const slides = [...document.querySelectorAll('[data-slide]')]
  const grid = slides[0].parentElement.parentElement
  grid.style.cssText = "display:block;width:1080px;max-width:none"
  for (const svg of slides) {
    svg.parentElement.style.cssText =
      "display:block;width:1080px;max-width:none;border:none;margin:0 0 40px"
  }
  return slides.map((s) => s.getAttribute("aria-label").replace("Palette slide: ", ""))
})
// the marks are <img> inside foreignObject; screenshot before they decode
// and they come out blank
await page.evaluate(() =>
  Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
)
await new Promise((r) => setTimeout(r, 1500))

const slides = await page.$$('[data-slide]')
for (const [i, el] of slides.entries()) {
  const file = `${OUT}/${String(i + 1).padStart(2, "0")}-${names[i]}.png`
  await el.screenshot({ path: file })
  console.log(`  ${file}`)
}
await browser.close()
console.log(`\n${readdirSync(OUT).length} slides in ${OUT}/ — post in filename order`)
