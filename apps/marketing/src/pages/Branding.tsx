import { useEffect } from "react"
import { Button } from "@ocra/ui"
import { LogoVariants } from "./brand/LogoVariants"

/**
 * Branding — the kit itself. Marks, colours, tokens, type, components.
 *
 * Why the colours are what they are lives under Identity; what gets posted
 * lives under Media. This page is only the pieces.
 */

const BRAND = [
  { name: "bog", hex: "#0c231a", note: "primary dark green — cards, headers" },
  { name: "bog-deep", hex: "#081711", note: "page background, dark theme" },
  { name: "field", hex: "#0f7b3f", note: "primary green — accent in light" },
  { name: "field-bright", hex: "#3fb873", note: "accent in dark, active status" },
  { name: "tape", hex: "#f4520b", note: "orange — CTAs only, rationed" },
  { name: "limestone", hex: "#f3f2ec", note: "off-white — bg light, text on dark" },
  { name: "stone", hex: "#5c6b60", note: "muted text" },
  { name: "moss", hex: "#d9dcd0", note: "borders, rules" },
]

const SEMANTIC = [
  { token: "bg", cls: "bg-bg" },
  { token: "panel", cls: "bg-panel" },
  { token: "mist", cls: "bg-mist" },
  { token: "line", cls: "bg-line" },
  { token: "ink", cls: "bg-ink" },
  { token: "sub", cls: "bg-sub" },
  { token: "accent", cls: "bg-accent" },
  { token: "tape", cls: "bg-tape" },
]

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className="mt-14">
    <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
      {title}
    </h2>
    <div className="mt-4">{children}</div>
  </section>
)

export const Branding = () => {
  useEffect(() => {
    document.title = "Branding — OCRA ÉIREANN"
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex"
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 md:px-11">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        Branding
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-4 max-w-[56ch] text-lg text-sub">
        The kit: marks, colours, type and components. Toggle the theme in the
        footer — the semantic tokens swap, the brand colours don't.
      </p>

      <Section title="Logo variants">
        <LogoVariants />
      </Section>

      <Section title="Brand colours — fixed">
        <div className="grid gap-3 sm:grid-cols-2">
          {BRAND.map((c) => (
            <div key={c.name} className="flex items-center gap-4 border border-line bg-panel p-3">
              <span
                className="h-14 w-14 shrink-0 border border-line"
                style={{ background: c.hex }}
              />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold uppercase tracking-[0.03em]">
                  {c.name}
                </p>
                <p className="font-mono text-xs text-sub">{c.hex}</p>
                <p className="mt-0.5 text-sm text-sub">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic tokens — swap with theme">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SEMANTIC.map((s) => (
            <div key={s.token} className="border border-line bg-panel p-3">
              <span className={`block h-12 border border-line ${s.cls}`} />
              <p className="mt-2 font-mono text-xs">{s.token}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-4 border border-line bg-panel p-6">
          <p className="font-display text-6xl font-extrabold uppercase leading-[0.95]">
            Display 6xl
          </p>
          <p className="font-display text-4xl font-extrabold uppercase leading-[0.95]">
            Display 4xl
          </p>
          <p className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
            Display 2xl — section heading
          </p>
          <p className="text-lg">Body large — Archivo, intro paragraphs</p>
          <p className="text-base">
            Body — Archivo. Obstacle racing brings together people from a wide
            range of sporting backgrounds and ability levels.
          </p>
          <p className="text-sm text-sub">Small, muted — captions and hints</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
            Mono eyebrow — labels, member numbers, dates
          </p>
        </div>
      </Section>

      <Section title="Components">
        <div className="flex flex-wrap items-center gap-3 border border-line bg-panel p-6">
          <Button variant="tape" size="brand">
            Primary
          </Button>
          <button className="border border-line bg-panel px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.03em] transition-colors hover:bg-mist">
            Secondary
          </button>
          <span className="inline-block bg-field-bright px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bog-deep">
            Active
          </span>
          <span className="inline-block bg-tape px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-limestone">
            Expired
          </span>
          <span className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
            Neutral
          </span>
        </div>
      </Section>

      <Section title="On bog — how it reads on the card">
        <div className="border border-bog-deep bg-bog p-6 text-limestone">
          <p className="font-display text-3xl font-bold uppercase">
            An Athlete
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-limestone/60">
            Athlete membership
          </p>
          <p className="mt-3 font-mono">OCRA-2026-0001</p>
          <div className="mt-4 flex gap-2">
            <span className="bg-field-bright px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bog-deep">
              Active
            </span>
            <span className="bg-tape px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-limestone">
              Tape
            </span>
          </div>
        </div>
      </Section>
    </div>
  )
}
