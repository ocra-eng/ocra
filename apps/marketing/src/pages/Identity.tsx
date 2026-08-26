import { useEffect } from "react"

/**
 * Identity — what the brand means. The kit lives under Branding, the posts
 * under Media.
 *
 * The case is closed: chalk is renamed limestone, the flag is the spine, and
 * the peatland and grassland numbers are sourced. What is left open is
 * imagery — each claim wants a photograph, and the briefs below say which.
 */

const BOG = "#0C231A"
const FIELD = "#0F7B3F"
const TAPE = "#F4520B"
const LIMESTONE = "#F3F2EC"

type Colour = {
  name: string
  hex: string
  /** the line that goes on the slide */
  line: string
  /** the longer one, for captions and guidelines */
  caption: string
  /** what the shot has to show, and what it must not be */
  shot: string
  /** where to start looking. Categories and searches, not vetted files. */
  hunt: { label: string; href: string }[]
}

const COLOURS: Colour[] = [
  {
    name: "Bog",
    hex: BOG,
    line: "A fifth of the country, and the oldest thing we stand on.",
    caption:
      "Second-highest proportion of peatland in Europe, after Finland. We cut it for fuel for centuries, burnt it for electricity for seventy years, and stopped — and all the while it kept what it swallowed.",
    shot: "A cut turf bank: the vertical face, sods footed in stacks beside it. Worked ground, not scenery. Failing that, blanket bog under low cloud. Not a sunset.",
    hunt: [
      {
        label: "Commons — turf cutting in Ireland",
        href: "https://commons.wikimedia.org/w/index.php?search=turf+cutting+Ireland&title=Special:MediaSearch&type=image",
      },
      {
        label: "Commons — peat bogs of Ireland",
        href: "https://commons.wikimedia.org/w/index.php?search=peat+bog+Ireland&title=Special:MediaSearch&type=image",
      },
      {
        label: "Commons — Landscapes of Ireland",
        href: "https://commons.wikimedia.org/wiki/Category:Landscapes_of_Ireland",
      },
    ],
  },
  {
    name: "Limestone",
    hex: LIMESTONE,
    line: "The rock half the country sits on. Ground down, it turns bog into field.",
    caption:
      "Half the island sits on Carboniferous limestone. Ground down it is the lime spread on sour ground to sweeten it; burnt and slaked it is the wash that made every white cottage white. It is the material that turns bog into field.",
    shot: "The Burren pavement, low and close so the clints and grikes read as fissured rock. Not the Cliffs of Moher — those are the wrong claim, and they will get used by mistake if they are in the folder.",
    hunt: [
      {
        label: "Commons — The Burren",
        href: "https://commons.wikimedia.org/w/index.php?search=Burren+limestone+pavement&title=Special:MediaSearch&type=image",
      },
      {
        label: "Commons — File:The Burren, Co. Clare, Ireland.jpg",
        href: "https://commons.wikimedia.org/wiki/File:The_Burren,Co._Clare,_Ireland.jpg",
      },
      {
        label: "Commons — Landforms of Ireland",
        href: "https://commons.wikimedia.org/wiki/Category:Landforms_of_Ireland",
      },
      {
        label: "Commons — limekilns",
        href: "https://commons.wikimedia.org/w/index.php?search=lime+kiln+Ireland&title=Special:MediaSearch&type=image",
      },
    ],
  },
  {
    name: "Field",
    hex: FIELD,
    line: "The flag's green is who we came from. This is the green you can stand in.",
    caption:
      "The green on the flag is who we came from. This one is just what is there: 82% of Irish farmland is grass, so the sea of green is a land-use fact rather than a postcard.",
    shot: "Pasture divided by stone walls or hedge, mid-distance, flat overcast light. Working land with stock in it. Anything golden-hour is the wrong green and the wrong argument.",
    hunt: [
      {
        label: "Commons — Irish pasture and farmland",
        href: "https://commons.wikimedia.org/w/index.php?search=Ireland+pasture+farmland+field&title=Special:MediaSearch&type=image",
      },
      {
        label: "Commons — Landscapes of Ireland",
        href: "https://commons.wikimedia.org/wiki/Category:Landscapes_of_Ireland",
      },
    ],
  },
  {
    name: "Tape",
    hex: TAPE,
    line: "The other tradition. Ten percent of the layout, and not decoration.",
    caption:
      "Orange on the flag is the other tradition. Here it is the ten percent that marks the route — the one thing on a course you are required to follow.",
    shot: "Course tape on a real Irish course: orange against wet green, close enough to see the ground. This is the one we should not be sourcing — shoot it at the next race and own the file.",
    hunt: [
      {
        label: "Shoot it ourselves — next sanctioned race",
        href: "https://commons.wikimedia.org/w/index.php?search=bracken+winter+Ireland+hillside&title=Special:MediaSearch&type=image",
      },
    ],
  },
]

const Meta = ({ children }: { children: string }) => (
  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
    {children}
  </p>
)

export const Identity = () => {
  useEffect(() => {
    document.title = "Identity — OCRA ÉIREANN"
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex"
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 md:px-11">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        Identity
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-4 max-w-[58ch] text-lg text-sub">
        What the brand means. Four colours off the ground, and a flag hiding
        in the proportions.
      </p>

      <div className="mt-8 border border-line bg-panel p-6">
        <p className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
          The spine
        </p>
        <p className="mt-3 max-w-[62ch] text-base">
          The flag is green and orange with white between, and the white was
          put there for a truce that hadn't happened yet. The palette says the
          same thing in the language of ground: the land you race on, the
          material that joins it, and the marker you have to follow.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          <span className="bg-bog px-2.5 py-1 text-limestone">Bog</span>
          <span className="text-sub">→</span>
          <span className="bg-limestone px-2.5 py-1 text-bog">Limestone</span>
          <span className="text-sub">→</span>
          <span className="bg-field px-2.5 py-1 text-limestone">Field</span>
          <span className="ml-2 text-sub">and</span>
          <span className="bg-tape px-2.5 py-1 text-limestone">Tape</span>
          <span className="text-sub">at ten percent</span>
        </div>
        <p className="mt-4 max-w-[62ch] text-sm text-sub">
          Ground limestone is what gets spread on sour ground to sweeten it,
          so the sequence is an order of operations rather than a list. And
          the 60/30/10 ratio is the flag itself — nobody has to paint it on.
        </p>
      </div>

      <div className="mt-6 border border-line bg-bog p-6 text-limestone">
        <p className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
          The white band
        </p>
        <p className="mt-3 max-w-[62ch] text-base">
          Limestone and the flag's white are the same thing twice over, and
          this is the idea the whole set hangs on.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="border border-limestone/20 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-limestone/60">
              On the flag
            </p>
            <div className="mt-3 flex h-12">
              <div className="flex-1 bg-field" />
              <div className="flex-1 bg-limestone" />
              <div className="flex-1 bg-tape" />
            </div>
            <p className="mt-3 text-sm text-limestone/80">
              White was not spacing. Meagher put it between the two traditions
              as a truce that had not happened yet — the band that lets the
              other two share a flag.
            </p>
          </div>

          <div className="border border-limestone/20 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-limestone/60">
              On the ground
            </p>
            <div className="mt-3 flex h-12">
              <div className="w-[60%] bg-field" />
              <div className="w-[30%] bg-limestone" />
              <div className="w-[10%] bg-tape" />
            </div>
            <p className="mt-3 text-sm text-limestone/80">
              In the ratio, limestone lands in the same position between the
              same two colours. Not by arrangement — that is just where
              60/30/10 puts it.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-[62ch] text-base">
          And the job is literal. Ground limestone is an alkali, spread to
          neutralise acid ground. It does not remove the acidity — it makes
          the ground workable. That is what a truce is, and it is the one part
          of this that is chemistry rather than a nice idea.
        </p>
        <p className="mt-3 max-w-[62ch] text-sm text-limestone/70">
          Say it carefully. The chemistry is fact and the position is fact;
          the reading between them is ours, and nobody in 1848 was thinking
          about soil pH. Claim the structure, not a historical intention — and
          keep it about being an all-island body, which is true, rather than
          about the politics, which is not ours to narrate.
        </p>
      </div>

      <div className="mt-14 space-y-10">
        {COLOURS.map((c) => (
          <section key={c.name} className="border border-line bg-panel">
            <div className="flex items-stretch border-b border-line">
              <span
                className="w-24 shrink-0 border-r border-line"
                style={{ background: c.hex }}
              />
              <div className="min-w-0 p-5">
                <p className="font-display text-3xl font-bold uppercase tracking-[0.03em]">
                  {c.name}
                </p>
                <p className="font-mono text-xs text-sub">{c.hex}</p>
              </div>
            </div>

            <div className="p-5">
              <Meta>Line</Meta>
              <p className="mt-1 max-w-[34ch] font-display text-2xl font-bold uppercase leading-tight tracking-[0.02em]">
                {c.line}
              </p>

              <div className="mt-5">
                <Meta>Caption</Meta>
              </div>
              <p className="mt-1 max-w-[62ch] text-base">{c.caption}</p>

              <div className="mt-6 border border-line bg-bg p-4">
                <Meta>The shot</Meta>
                <p className="mt-1 max-w-[62ch] text-sm">{c.shot}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {c.hunt.map((h) => (
                    <a
                      key={h.href}
                      href={h.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub underline decoration-line underline-offset-2 hover:text-ink"
                    >
                      {h.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border border-line bg-panel p-5">
        <p className="font-display text-xl font-bold uppercase tracking-[0.03em]">
          Before any of these get used
        </p>
        <ul className="mt-3 space-y-2 text-sm text-sub">
          <li>
            Those links are entry points, not vetted files — searches and
            categories. I have not opened the individual images.
          </li>
          <li>
            Licences vary file by file on Commons. Public domain, CC0, CC-BY
            and CC-BY-SA all live there and only the first two are free of
            obligations. CC-BY needs a credit; CC-BY-SA infects what it
            touches. Check each one.
          </li>
          <li>
            Tape should be our own photograph. It is the only claim we can
            shoot for nothing at the next sanctioned race, and owning the file
            is worth more than finding one.
          </li>
        </ul>
      </div>
    </div>
  )
}
