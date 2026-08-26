/**
 * Instagram carousel: where the palette came from.
 *
 * Copy follows the rationale settled under Identity. Chalk is renamed
 * Limestone. The order is the ground sequence — bog, limestone, field —
 * then the marker, then the reveal that it has been the flag all along.
 *
 * Only checked claims go on slides. The peatland line is the Europe ranking
 * rather than a percentage, because the percentage moves depending on
 * whether you mean peatland habitat, peat soils, or the EPA's wetlands
 * category.
 *
 * 1080 x 1350 — the tallest ratio the feed allows, which is what a carousel
 * wants. Switch FRAME for stories.
 */

const FRAME = { w: 1080, h: 1350 }
const PAD = 88

const BOG = "#0C231A"
const FIELD = "#0F7B3F"
const TAPE = "#F4520B"
const LIMESTONE = "#F3F2EC"

/** which mark file reads on this slide's ground */
type Mark = "color" | "white" | "bog"

type Base = { key: string; ground: string; ink: string; mark: Mark }

type Slide =
  | (Base & { kind: "title" })
  | (Base & {
      kind: "colour"
      name: string
      hex: string
      body: string
      role: string
    })
  | (Base & { kind: "band" })

const SLIDES: Slide[] = [
  { key: "title", mark: "color", kind: "title", ground: BOG, ink: LIMESTONE },
  {
    key: "bog",
    mark: "white",
    kind: "colour",
    ground: BOG,
    ink: LIMESTONE,
    name: "Bog",
    hex: "#0C231A",
    body: "Ireland has the second-highest proportion of peatland in Europe, after Finland. We cut it for fuel for centuries, burnt it for electricity for seventy years, and stopped.",
    role: "Ink · dark grounds · kit",
  },
  {
    key: "limestone",
    mark: "bog",
    kind: "colour",
    ground: LIMESTONE,
    ink: BOG,
    name: "Limestone",
    hex: "#F3F2EC",
    body: "Half the island sits on it. Ground down it sweetens sour ground; burnt and slaked it is the wash that made every white cottage white. It is what turns bog into field.",
    role: "Light ground · reversed type",
  },
  {
    key: "field",
    mark: "white",
    kind: "colour",
    ground: FIELD,
    ink: LIMESTONE,
    name: "Field",
    hex: "#0F7B3F",
    body: "82% of Irish farmland is grass. The green on the flag is who we came from. This is the green you can stand in — grazed, cut, waterlogged, grazed again.",
    role: "Brand green · accents · fills",
  },
  {
    key: "tape",
    mark: "bog",
    kind: "colour",
    ground: TAPE,
    ink: BOG,
    name: "Tape",
    hex: "#F4520B",
    body: "Orange on the flag is the other tradition. Here it is the ten percent that marks the route — the one thing on a course you are required to follow.",
    role: "Ten percent · never body text",
  },
  { key: "band", mark: "color", kind: "band", ground: BOG, ink: LIMESTONE },
]

const Frame = ({
  slide,
  children,
}: {
  slide: Base
  children: React.ReactNode
}) => (
  <svg
    viewBox={`0 0 ${FRAME.w} ${FRAME.h}`}
    className="block h-auto w-full"
    role="img"
    aria-label={`Palette slide: ${slide.key}`}
  >
    <foreignObject x="0" y="0" width={FRAME.w} height={FRAME.h}>
      <div
        // @ts-expect-error -- xmlns is required inside foreignObject
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          width: FRAME.w,
          height: FRAME.h,
          background: slide.ground,
          color: slide.ink,
          padding: PAD,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {children}
      </div>
    </foreignObject>
  </svg>
)

/** eyebrow left, mark right — the mark is the one that reads on the ground,
 *  so a dark slide gets the white mark and a light one gets the bog mark */
const Top = ({ label, mark }: { label: string; mark: Mark }) => (
  <div
    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
  >
    <p
      className="font-mono uppercase"
      style={{ opacity: 0.6, fontSize: 26, letterSpacing: "0.18em", margin: 0 }}
    >
      {label}
    </p>
    <img
      src={`${import.meta.env.BASE_URL}brand/${mark}.svg`}
      alt=""
      width={116}
      height={112}
      style={{ display: "block" }}
    />
  </div>
)

const Eyebrow = ({ children }: { children: string }) => (
  <p
    className="font-mono uppercase"
    style={{ opacity: 0.6, fontSize: 26, letterSpacing: "0.18em", margin: 0 }}
  >
    {children}
  </p>
)

const Foot = ({ children }: { children: string }) => (
  <p
    className="font-mono uppercase"
    style={{ fontSize: 24, letterSpacing: "0.14em", opacity: 0.65, margin: 0 }}
  >
    {children}
  </p>
)

const BarLabel = ({ children }: { children: string }) => (
  <p
    className="font-mono uppercase"
    style={{
      fontSize: 22,
      letterSpacing: "0.16em",
      opacity: 0.55,
      margin: "0 0 12px",
    }}
  >
    {children}
  </p>
)

const Bar = ({ parts }: { parts: { w: string; c: string }[] }) => (
  <div style={{ display: "flex", height: 88 }}>
    {parts.map((p, i) => (
      <div key={i} style={{ width: p.w, background: p.c }} />
    ))}
  </div>
)

const Slide = ({ slide }: { slide: Slide }) => {
  if (slide.kind === "title") {
    return (
      <Frame slide={slide}>
        <Top label="OCRA Éireann" mark={slide.mark} />
        <div>
          <p
            className="font-display uppercase"
            style={{ fontSize: 172, fontWeight: 800, lineHeight: 0.88, margin: 0 }}
          >
            Terrain,
            <br />
            not flag
            <span style={{ color: TAPE }}>.</span>
          </p>
          <p style={{ fontSize: 42, lineHeight: 1.32, marginTop: 40, maxWidth: 800 }}>
            Four colours, all of them off the ground. None of them painted on.
          </p>
        </div>
        <Eyebrow>Swipe →</Eyebrow>
      </Frame>
    )
  }

  if (slide.kind === "band") {
    return (
      <Frame slide={slide}>
        <Top label="The white band" mark={slide.mark} />
        <div>
          <p
            className="font-display uppercase"
            style={{ fontSize: 112, fontWeight: 800, lineHeight: 0.9, margin: 0 }}
          >
            It was the flag
            <br />
            all along
            <span style={{ color: TAPE }}>.</span>
          </p>

          <div style={{ marginTop: 48 }}>
            <BarLabel>The flag</BarLabel>
            <Bar
              parts={[
                { w: "33.34%", c: FIELD },
                { w: "33.33%", c: LIMESTONE },
                { w: "33.33%", c: TAPE },
              ]}
            />
          </div>

          <div style={{ marginTop: 28 }}>
            <BarLabel>Our ratio — 60 / 30 / 10</BarLabel>
            <Bar
              parts={[
                { w: "60%", c: FIELD },
                { w: "30%", c: LIMESTONE },
                { w: "10%", c: TAPE },
              ]}
            />
          </div>

          <p style={{ fontSize: 38, lineHeight: 1.32, marginTop: 40, maxWidth: 880 }}>
            White sits between green and orange as a truce. Limestone lands in
            the same place — and ground limestone is an alkali. It does not
            remove the acid, it makes the ground workable.
          </p>
        </div>
        <Foot>That is what a truce is</Foot>
      </Frame>
    )
  }

  return (
    <Frame slide={slide}>
      <Top label={slide.hex} mark={slide.mark} />
      <div>
        <p
          className="font-display uppercase"
          style={{ fontSize: 196, fontWeight: 800, lineHeight: 0.85, margin: 0 }}
        >
          {slide.name}
        </p>
        <p style={{ fontSize: 42, lineHeight: 1.32, marginTop: 44, maxWidth: 840 }}>
          {slide.body}
        </p>
      </div>
      <Foot>{slide.role}</Foot>
    </Frame>
  )
}

export const ColourStory = () => (
  <div>
    <p className="max-w-[62ch] text-sm text-sub">
      {FRAME.w} × {FRAME.h}, the tallest ratio the feed allows. Copy follows
      the rationale under Identity — chalk is renamed limestone, and the peatland
      claim is the Europe ranking rather than a percentage, because the
      percentage moves with the definition.
    </p>
    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
      {SLIDES.map((slide) => (
        <div key={slide.key} className="border border-line">
          <Slide slide={slide} />
        </div>
      ))}
    </div>
  </div>
)
