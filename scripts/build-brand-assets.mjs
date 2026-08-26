/**
 * Generates the mark and wordmark SVGs in apps/marketing/public/brand.
 *
 * Both are built the same way: the triskele's plain rim is clipped off and a
 * broken arc with the tricolour set into it goes back at the same radius, so
 * the bare mark is constructed like the logo rather than sharing only the
 * spirals with it.
 *
 * The rim is not a separate subpath — the triskele is a filled disc that the
 * spirals carve into ribbons, and the rim is the edge of that disc. Probed
 * off the artwork it runs from rx 138.1 / ry 133.8 out to rx 147.1 / ry
 * 142.5, and the replacement is drawn on that same slightly-elliptical path.
 * A circular ring would leave the clip's cut edges showing at top and bottom
 * where the spiral tails run into the rim.
 *
 *   node scripts/build-brand-assets.mjs
 */
import { readFileSync, writeFileSync } from "node:fs"

/**
 * Three copies of these files exist and all three have to move together.
 * The header and footer wordmark comes from the packages/ui copy, so
 * updating only the marketing one leaves the old badge on every page.
 */
const BRAND = "apps/marketing/public/brand"
/** name -> extra directories that also want it */
const ALSO = {
  "wordmark_bog.svg": ["packages/ui/src/brand/assets"],
  "wordmark_white.svg": ["packages/ui/src/brand/assets"],
  "green.svg": ["apps/members/public/brand"],
  "white.svg": ["apps/members/public/brand"],
}
const PATHS = "apps/marketing/src/pages/brand/logoPaths.ts"

// The path data lives in a .ts module Node cannot import, so it is read out
// of the source. Every one of these is a plain string export.
const src = readFileSync(PATHS, "utf8")
const path = (name) => {
  const m = src.match(new RegExp(`export const ${name} =\\s*"([^"]*)"`))
  if (!m) throw new Error(`no such path export: ${name}`)
  return m[1]
}
const TRISKELE = path("newTriskele")
const LINE_EIREANN = path("wordmarkEireann")
const LINE_IRELAND = path("wordmarkIreland")

const CENTRE = { cx: 286.1, cy: 288.7 }
const CLIP = { rx: 137.5, ry: 133.2 } // just inside the rim's inner edge
const RX = 142.6 // the rim's centre line
const RY = 138.15
// Heavier than the rim it replaces (which was 9). At lockup size the mark
// renders about 30px tall, and at 9 the coloured notches all but vanish.
const WIDTH = 13

/** taken from the logo's own flag */
const NOTCHES = [
  { ink: "orange", from: 48, to: 73.4 },
  { ink: "white", from: 77.3, to: 102.8 },
  { ink: "green", from: 106.3, to: 131.7 },
]
/** everything else, the long way round through the top */
const RING = { from: 134.5, span: 271.5 }

const at = (deg) => {
  const t = (deg * Math.PI) / 180
  return `${(CENTRE.cx + RX * Math.cos(t)).toFixed(3)} ${(CENTRE.cy + RY * Math.sin(t)).toFixed(3)}`
}
const arc = (from, span) =>
  `M ${at(from)} A ${RX} ${RY} 0 ${span > 180 ? 1 : 0} 1 ${at(from + span)}`

const TONES = {
  color: {
    ring: "#F3F2EC",
    green: "#0F7B3F",
    white: "#FFFFFF",
    orange: "#F4520B",
    ink: "#F3F2EC",
  },
  green: mono("#0F7B3F"),
  orange: mono("#F4520B"),
  bog: mono("#0C231A"),
  white: mono("#F3F2EC"),
}
function mono(c) {
  return { ring: c, green: c, white: c, orange: c, ink: c }
}

/** the mark's geometry, for a document that has already opened an svg */
const markBody = (tone, clipId) =>
  [
    `<defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">` +
      `<ellipse cx="${CENTRE.cx}" cy="${CENTRE.cy}" rx="${CLIP.rx}" ry="${CLIP.ry}"/></clipPath></defs>`,
    `<path d="${TRISKELE}" fill="${tone.ink}" clip-path="url(#${clipId})"/>`,
    `<path d="${arc(RING.from, RING.span)}" fill="none" stroke="${tone.ring}" stroke-width="${WIDTH}"/>`,
    ...NOTCHES.map(
      (n) =>
        `<path d="${arc(n.from, n.to - n.from)}" fill="none" stroke="${tone[n.ink]}" stroke-width="${WIDTH}"/>`
    ),
  ].join("")

/** the rim's outer edge plus half a stroke */
const MARK_BOX = "139.0 146.05 294.2 285.3"
const SVG = (viewBox, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">${body}</svg>\n`

const written = []
const put = (file, body) => {
  writeFileSync(`${BRAND}/${file}`, body)
  written.push(`${BRAND}/${file}`)
  for (const dir of ALSO[file] ?? []) {
    writeFileSync(`${dir}/${file}`, body)
    written.push(`${dir}/${file}`)
  }
}

for (const [name, tone] of Object.entries(TONES)) {
  put(`${name}.svg`, SVG(MARK_BOX, markBody(tone, `rim-${name}`)))

  // the horizontal lockup: the mark in the slot the old badge held, and the
  // two lines of type exactly where they already were
  const lockup =
    `<svg x="0" y="0" width="292" height="292" viewBox="${MARK_BOX}">` +
    markBody(tone, `rim-wm-${name}`) +
    `</svg>` +
    `<path d="${LINE_EIREANN}" fill="${tone.ink}"/>` +
    `<path d="${LINE_IRELAND}" fill="${tone.ink}"/>`
  put(`wordmark_${name}.svg`, SVG("0 0 1022 292", lockup))
}

console.log(`wrote ${written.length} files`)
for (const f of written) console.log(`  ${f}`)
