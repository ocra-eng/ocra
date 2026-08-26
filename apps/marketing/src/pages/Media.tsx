import { useEffect } from "react"
import { ColourStory } from "./brand/ColourStory"
import { LogoSteps } from "./brand/LogoSteps"

/**
 * Media — the things that get posted.
 *
 * Everything here is a deliverable rather than a reference. The files live
 * in public/media and are produced by scripts/export-reel.mjs and
 * scripts/export-cards.mjs, which overwrite them in place — so what is on
 * this page is what downloads.
 */

/**
 * The files themselves, served from public/media so they can be grabbed
 * without running anything. The scripts below regenerate them in place.
 */
const MEDIA = `${import.meta.env.BASE_URL}media/`

const ASSETS = [
  {
    name: "Logo transition",
    file: "logo-transition.mp4",
    spec: "1080 × 1920 · 30fps · 6.9s · 320KB",
    note: "Reel or story. Rendered by scrubbing the paused transitions frame by frame, so nothing is dropped.",
  },
]

const CAROUSEL = [
  { file: "01-title.png", label: "Terrain, not flag", size: "64KB" },
  { file: "02-bog.png", label: "Bog", size: "76KB" },
  { file: "03-limestone.png", label: "Limestone", size: "84KB" },
  { file: "04-field.png", label: "Field", size: "72KB" },
  { file: "05-tape.png", label: "Tape", size: "60KB" },
  { file: "06-band.png", label: "The white band", size: "88KB" },
]


const Download = ({
  href,
  name,
  meta,
}: {
  href: string
  name: string
  meta: string
}) => (
  <a
    href={href}
    download
    className="flex items-center justify-between gap-4 border border-line bg-panel px-4 py-3 transition-colors hover:bg-mist"
  >
    <span className="min-w-0">
      <span className="block font-display text-base font-bold uppercase tracking-[0.03em]">
        {name}
      </span>
      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
        {meta}
      </span>
    </span>
    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-tape">
      Download ↓
    </span>
  </a>
)

const Section = ({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) => (
  <section className="mt-14">
    <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
      {title}
    </h2>
    {note && <p className="mt-2 max-w-[62ch] text-sm text-sub">{note}</p>}
    <div className="mt-4">{children}</div>
  </section>
)

export const Media = () => {
  useEffect(() => {
    document.title = "Media — OCRA ÉIREANN"
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex"
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 md:px-11">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        Media
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-4 max-w-[56ch] text-lg text-sub">
        Things to post. Rendered from these components, so the export and the
        page cannot drift.
      </p>

      <Section
        title="Logo transition — old to new"
        note="Five frames, four moves. Step through it on the left. On the right is the exported file itself, not a re-run of the animation — what you see is what downloads."
      >
        <div className="flex flex-wrap items-start justify-center gap-8">
          <LogoSteps />
          <div className="w-full max-w-[300px]">
            <video
              src={`${MEDIA}logo-transition.mp4`}
              autoPlay
              loop
              muted
              playsInline
              className="block w-full border border-bog-deep"
            />
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
              The export · 1080 × 1920 · 6.9s
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Palette carousel — where the colours came from"
        note="Copy follows the rationale under Identity. Post in slide order."
      >
        <ColourStory />
      </Section>

      <Section
        title="Download"
        note="Straight from the repo — nothing to run. Post the carousel in filename order."
      >
        <div className="space-y-2">
          {ASSETS.map((a) => (
            <div key={a.file}>
              <Download
                href={`${MEDIA}${a.file}`}
                name={a.name}
                meta={a.spec}
              />
              <p className="mt-1 max-w-[62ch] px-1 text-sm text-sub">{a.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
          Palette carousel — six slides, 1080 × 1350
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {CAROUSEL.map((c, i) => (
            <Download
              key={c.file}
              href={`${MEDIA}palette-carousel/${c.file}`}
              name={`${i + 1}. ${c.label}`}
              meta={`${c.file} · ${c.size}`}
            />
          ))}
        </div>
      </Section>

    </div>
  )
}
