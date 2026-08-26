/**
 * Renders the logo transition on /assets/media to a 1080 × 1920 PNG
 * sequence, ready to encode as an Instagram reel or story.
 *
 * Deterministic rather than filmed: it drives the stepper, pauses the CSS
 * transitions and scrubs them frame by frame. No dropped frames, no timing
 * jitter, and the run takes as long as it takes.
 *
 * Move durations are read back off the paused animations, so those stay
 * correct when the timings in LogoSteps.tsx change. The pauses between
 * moves are this script's own — keep them in step with LEAD_IN / HOLD /
 * REST there if you change them.
 *
 *   npm run dev                                  # marketing app must be up
 *   node scripts/export-reel.mjs [out.mp4] [fps]
 */
import puppeteer from "puppeteer-core"
import { execFileSync } from "node:child_process"
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

/** the committed artefact — served by the site and linked from Media */
const MP4 = process.argv[2] ?? "apps/marketing/public/media/logo-transition.mp4"
/** frames are scaffolding; they go to a temp dir and get cleaned up */
const OUT = join(tmpdir(), "ocra-reel-frames")
const FPS = Number(process.argv[3] ?? 30)
const URL = "http://localhost:5173/assets/media"

/** mirrors LogoSteps.tsx */
const LEAD_IN = 700
const HOLD = 140
const REST = 1400

/** a stepper has one position per frame plus the play-through; this is a
 *  backstop against ever looping on it forever again */
const MAX_MOVES = 12

const exe = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
]
  .filter(Boolean)
  .find(existsSync)
if (!exe) throw new Error("no Chrome found; set CHROME_PATH")

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ executablePath: exe, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1240, height: 2040, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: "networkidle0" })
await page.waitForSelector("svg[role=img]")

// The stepper is the first mark on the page. Unclamp it and its column so
// the svg renders at true reel size rather than the 300px it sits at.
await page.evaluate(() => {
  const svg = document.querySelector("svg[role=img]")
  svg.parentElement.style.cssText = "width:1080px;max-width:none;border:none"
  svg.parentElement.parentElement.style.cssText = "width:1080px;max-width:none"
})
await page.evaluate(() =>
  Promise.all([...document.images].map((i) => i.decode().catch(() => {})))
)
await new Promise((r) => setTimeout(r, 600))

const el = await page.$("svg[role=img]")
const name = (n) => `${OUT}/frame-${String(n).padStart(5, "0")}.png`
let n = 0
const shot = async () => {
  await el.screenshot({ path: name(n++) })
}
/** hold on the last frame by repeating it — cheaper than re-rendering */
const hold = (ms) => {
  const last = name(n - 1)
  for (let i = 0; i < Math.round((ms / 1000) * FPS); i++) {
    copyFileSync(last, name(n++))
  }
}

/** the label tells us where we are: Next mid-sequence, Play on the last
 *  frame, Replay once playing. Reading the button beats scraping the page. */
const nextLabel = () =>
  page.evaluate(
    () =>
      [...document.querySelectorAll("button")]
        .map((b) => b.textContent.trim())
        .find((t) => ["Next", "Play", "Replay"].includes(t)) ?? null
  )
const clickNext = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .find((b) => b.textContent.trim() === "Next")
      ?.click()
  )

/** run a snippet against the mark's own animations only, so the looping
 *  player alongside it cannot interfere */
const anims = (body, arg) =>
  page.evaluate(
    (arg, src) => {
      const svg = document.querySelector("svg[role=img]")
      return new Function("anims", "arg", src)(
        svg.getAnimations({ subtree: true }),
        arg
      )
    },
    arg,
    body
  )

await shot() // the first frame, at rest
hold(LEAD_IN)

for (let move = 0; move < MAX_MOVES; move++) {
  const label = await nextLabel()
  if (label !== "Next") {
    // "Play" means we are on the last frame; the next click would start the
    // play-through, which is the thing we are producing here
    if (label !== "Play") console.warn(`unexpected button: ${label}`)
    break
  }

  await clickNext()
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => r()))
  )
  const dur = await anims(
    `anims.forEach(a => a.pause());
     return Math.max(0, ...anims.map(a => {
       const t = a.effect.getTiming()
       return (t.delay || 0) + (t.duration || 0)
     }))`
  )
  const count = Math.max(1, Math.round((dur / 1000) * FPS))
  for (let i = 0; i <= count; i++) {
    await anims(`anims.forEach(a => { a.currentTime = arg }); return 0`, (dur * i) / count)
    await shot()
  }
  await anims(`anims.forEach(a => a.play()); return 0`)
  console.log(`move ${move + 1}: ${Math.round(dur)}ms, ${count + 1} frames`)
  hold(HOLD)
}

hold(REST) // rest on the finished mark before the loop point

const total = readdirSync(OUT).length
await browser.close()
console.log(`\n${total} frames rendered — ${(total / FPS).toFixed(1)}s at ${FPS}fps`)

mkdirSync(MP4.replace(/\/[^/]+$/, ""), { recursive: true })
try {
  execFileSync(
    "ffmpeg",
    ["-y", "-framerate", String(FPS), "-i", `${OUT}/frame-%05d.png`,
     "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
     "-crf", "18", "-movflags", "+faststart", MP4],
    { stdio: ["ignore", "ignore", "pipe"] }
  )
} catch (error) {
  console.error(
    `\nffmpeg failed or is not installed. Frames are still at ${OUT}/ —\n` +
      `  ffmpeg -y -framerate ${FPS} -i ${OUT}/frame-%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${MP4}`
  )
  throw error
}
rmSync(OUT, { recursive: true, force: true })
console.log(`${MP4} — ${(statSync(MP4).size / 1024).toFixed(0)}KB`)
