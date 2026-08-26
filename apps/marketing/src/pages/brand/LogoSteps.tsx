import { useEffect, useId, useState } from "react"
import * as P from "./logoPaths"

/**
 * Old OCRA Ireland logo → new OCRA ÉIREANN mark, as a stepper.
 *
 * Each step is a still frame we agree on by clicking through. Once the
 * sequence is right the steps become the keyframes of the animation, so a
 * step is written as a plain set of booleans — what is on screen, nothing
 * about how it got there.
 *
 * 9:16 (1080 × 1920), sized for Instagram.
 */

/** old triskele centre → new triskele centre. Shifted, the old triskele
 *  registers on the new one exactly — same artwork — so it is the fixed
 *  point the rest of the mark is built around. */
const OLD_SHIFT = "translate(-124.4, 8.4)"

const OLD = {
  triskele: "#066738",
  green: "#3eb549",
  orange: "#f5a326",
  white: "#ffffff",
}
const LIMESTONE = "#F3F2EC"

/**
 * The circle enclosing the triskele is not a separate subpath — the triskele
 * is one filled disc that the three spirals carve into ribbons, and the
 * circle is what is left of the disc's rim. So it comes off with a clip
 * rather than a split.
 *
 * Probed off the path itself: the rim's inner edge sits at rx 138.1, ry
 * 133.8 everywhere except the three points where a spiral tail flows into
 * it. Clipping just inside that takes the rim and leaves the tails whole.
 */
const RIM_CLIP = { rx: 137.5, ry: 133.2 }
/** the triskele's centre in the old mark's coordinates, pre-shift */
const OLD_CENTRE = { cx: 410.5, cy: 280.3 }
/** the mark's centre in its own coordinates */
const CENTRE = { cx: 286.1, cy: 288.7 }

/**
 * The broken ring is drawn in, rather than faded.
 *
 * Its pieces are filled outlines, not strokes, so stroke-dashoffset cannot
 * drive them directly. Instead a mask holds one stroked arc per piece and
 * each is drawn on with dashoffset, revealing the real artwork underneath.
 * The mask band sits at r 175.3 ± 10, which brackets every piece
 * (r 168.7 – 181.8) without an edge ever landing on artwork — so once drawn
 * it changes no pixels.
 *
 * One stroke per piece rather than a single sweep across all three: a
 * continuous sweep crosses a 20° dash in a seventh of the time it takes to
 * cross the 94° arc, so the short pieces snapped in while only the long one
 * read as drawn. Each now gets its own stroke, and they play in order.
 *
 * All three run anticlockwise, starting just below OCRA and unwinding away
 * from the word. Angles are padded a couple of degrees so a butt cap never
 * lands on a piece's own end.
 */
const SWEEP_R = 175.3
const SWEEP_W = 20
const DRAW = [
  { from: 158, span: 25, delay: 0, dur: 300 }, // limestone dash, 136° – 156°
  { from: 105, span: 30, delay: 340, dur: 300 }, // white notch, 77° – 103°
  { from: 48, span: 100, delay: 680, dur: 840 }, // the long arc, 311° – 45°
]

/** Green and orange draw in together, the same way the ring did. Both are
 *  25° pieces, so both get the 300ms the ring's short dashes got. */
const FLAG_DRAW = [
  { from: 134, span: 30, dur: 300 }, // green, 106° – 132°
  { from: 76, span: 30, dur: 300 }, // orange, 48° – 73°
]

/** ÉIREANN arrives a letter at a time, reading order, on the same cadence
 *  as the ring's segments. */
const EIREANN_FADE = { dur: 260, stagger: 130 }

/**
 * Every beat's timing, in one place. The css below is interpolated from
 * these and so is the autoplay, so the two cannot drift apart.
 */
const BEAT = {
  field: 900, //                      1 -> 2  the tricolour drains
  strip: 600, //                      2 -> 3  A  shamrocks and IRELAND clear
  shrink: { at: 0, dur: 800 }, //             A  OCRA shrinks where it stands
  turn: { at: 800, dur: 1000 }, //            B  OCRA swings round, and the
  //                                             ring starts drawing with it
  handover: { at: 1800, dur: 150 }, //           the typeface changes
}

/** the ring starts with OCRA's turn, not with the shrink: the word settles
 *  to its new size first, then travels while the line unwinds behind it */
const RING_AT = BEAT.turn.at

/** how long each move takes, end to end */
const DURATION = [
  BEAT.field,
  Math.max(
    BEAT.handover.at + BEAT.handover.dur,
    RING_AT + Math.max(...DRAW.map((d) => d.delay + d.dur))
  ),
  Math.max(
    ...FLAG_DRAW.map((d) => d.dur),
    (7 - 1) * EIREANN_FADE.stagger + EIREANN_FADE.dur
  ),
]
/**
 * Playback rhythm. The sequence should read as one continuous move, so the
 * gap between beats is short — long enough to separate them, not long
 * enough to stall. The opening frame gets a proper beat so the old logo
 * registers before anything happens to it, and the finished mark gets one
 * before a looping player starts again.
 */
const LEAD_IN = 700
const HOLD = 140
const REST = 1400

/** an arc as a path, so the direction is ours to choose: sweep-flag 0 is
 *  anticlockwise on screen, which `<circle>` cannot express */
const arcPath = (r: number, fromDeg: number, spanDeg: number) => {
  const at = (deg: number) => {
    const t = (deg * Math.PI) / 180
    return `${(CENTRE.cx + r * Math.cos(t)).toFixed(3)} ${(CENTRE.cy + r * Math.sin(t)).toFixed(3)}`
  }
  return `M ${at(fromDeg)} A ${r} ${r} 0 ${spanDeg > 180 ? 1 : 0} 0 ${at(fromDeg - spanDeg)}`
}

/**
 * The OCRA move, per letter, in two beats.
 *
 * `dx, dy` pulls the glyph in along its own radius, from where the old mark
 * sets it (r 180–196) to where the new one does (r 175–180). `turn` then
 * swings it about the mark centre to its new angle. A rotation about the
 * centre carries the glyph's orientation with it, which is exactly what
 * type set on a circle needs, so no second rotation is required.
 *
 * It has to be per letter: the old mark letterspaces OCRA across 110° of
 * arc and the new one packs it into 38°, so each letter travels a different
 * distance and the word contracts as it goes.
 */
const OCRA_MOVE = [
  { dx: 14.7, dy: 10.4, turn: -45.8 }, // O
  { dx: 3.6, dy: 14.3, turn: -71.7 }, // C
  { dx: -4.4, dy: 12.3, turn: -93.1 }, // R
  { dx: -4.7, dy: 3.3, turn: -116.8 }, // A
]
/** cap height of the new O over the old O — the roundest glyph, so the least
 *  sensitive to how it sits on the arc */
const OCRA_SCALE = 0.459

const shrink = (i: number) =>
  `translate(${OCRA_MOVE[i].dx}px, ${OCRA_MOVE[i].dy}px) scale(${OCRA_SCALE})`

type Frame = {
  title: string
  note: string
  /** the tricolour wedges and the white disc under them */
  field: boolean
  /** the athlete on top of the wedges */
  athlete: boolean
  /** the rim of the triskele's own disc, hidden under the tricolour until
   *  the field drains */
  oldRing: boolean
  /** shamrocks left and right */
  shamrocks: boolean
  /** IRELAND along the bottom */
  ireland: boolean
  /** OCRA along the top, in the old typeface at old size */
  oldOcra: boolean
  /** the triskele goes limestone instead of dark green */
  triskeleChalk: boolean
  /** the tricolour band across the bottom, one flag per segment —
   *  green sits at 106°, white at 77°, orange at 48°, reading left to right */
  notchGreen: boolean
  notchWhite: boolean
  notchOrange: boolean
  /** the rest of the broken ring: the long limestone sweep, and the limestone dash
   *  that continues the band up the left side */
  arc: boolean
  /** OCRA in the new typeface, in its new place */
  newOcra: boolean
  /** ÉIREANN in the new typeface */
  eireann: boolean
}

const STEPS: Frame[] = [
  {
    title: "The old logo",
    note: "OCRA Ireland, whole and untouched.",
    field: true,
    athlete: true,
    oldRing: true,
    shamrocks: true,
    ireland: true,
    oldOcra: true,
    triskeleChalk: false,
    notchGreen: false,
    notchWhite: false,
    notchOrange: false,
    arc: false,
    newOcra: false,
    eireann: false,
  },
  {
    title: "The field drains",
    note: "Tricolour and athlete gone. The triskele goes limestone as they leave, so the mark never disappears against the bog.",
    field: false,
    athlete: false,
    oldRing: true,
    shamrocks: true,
    ireland: true,
    oldOcra: true,
    triskeleChalk: true,
    notchGreen: false,
    notchWhite: false,
    notchOrange: false,
    arc: false,
    newOcra: false,
    eireann: false,
  },
  {
    title: "OCRA crosses, the ring follows",
    note: "Shamrocks and IRELAND go. OCRA shrinks and swings into its new place, and the limestone ring unwinds away from it. Colourless so far.",
    field: false,
    athlete: false,
    oldRing: true,
    shamrocks: false,
    ireland: false,
    oldOcra: false,
    triskeleChalk: true,
    notchGreen: false,
    notchWhite: true,
    notchOrange: false,
    arc: true,
    newOcra: true,
    eireann: false,
  },
  {
    title: "The mark completes",
    note: "Green and orange draw on either side of the white while ÉIREANN arrives a letter at a time. The old badge's three colours, back as a flag.",
    field: false,
    athlete: false,
    oldRing: true,
    shamrocks: false,
    ireland: false,
    oldOcra: false,
    triskeleChalk: true,
    notchGreen: true,
    notchWhite: true,
    notchOrange: true,
    arc: true,
    newOcra: true,
    eireann: true,
  },
]

/**
 * Every element is always in the tree; a step only sets its opacity. That
 * way a step's resting state is byte-identical to the frame that was
 * approved, and the movement between steps is pure CSS interpolation —
 * nothing appears or disappears mid-transition that the frames did not
 * already agree on.
 */
const on = (visible: boolean) => ({ opacity: visible ? 1 : 0 })

/**
 * Only the pairs we have designed a transition for animate. Everything else
 * snaps, exactly as it did before, so an undesigned step cannot quietly
 * acquire a crossfade. `lt-1-2` is the only one built so far.
 */
const css = `
/* the shrink happens about each glyph's own centre; the turn happens about
   the mark's centre, which is why OCRA sits outside the shifted group —
   view-box coordinates are the only ones the mark centre is written in */
.lt-ocra-glyph { transform-box: fill-box; transform-origin: 50% 50% }
.lt-ocra-turn { transform-box: view-box; transform-origin: 286.1px 288.7px }

/* 1 -> 2: the tricolour field and the athlete go, and the triskele
   recolours with them */
.lt-1-2 .lt-field { transition: opacity ${BEAT.field}ms ease }
.lt-1-2 .lt-triskele { transition: fill ${BEAT.field}ms ease }

/* 2 -> 3, in two beats:
     A  0 - 800ms     shamrocks and IRELAND clear while each letter of OCRA
                      shrinks and settles onto the new radius, still spread
                      across the top
     B  800 - 1800    each letter swings round the mark centre to its place,
                      and the ring begins drawing at the same moment
   OCRA holds full opacity throughout and hands over to the new typeface
   only once it has landed. */
.lt-2-3 .lt-strip { transition: opacity ${BEAT.strip}ms ease }
.lt-2-3 .lt-ocra-glyph {
  transition: transform ${BEAT.shrink.dur}ms ease ${BEAT.shrink.at}ms;
}
.lt-2-3 .lt-ocra-turn {
  transition: transform ${BEAT.turn.dur}ms cubic-bezier(0.5, 0, 0.2, 1)
              ${BEAT.turn.at}ms;
}
.lt-2-3 .lt-ocra-old {
  transition: opacity ${BEAT.handover.dur}ms ease ${BEAT.handover.at}ms;
}
.lt-2-3 .lt-ocra-new {
  transition: opacity ${BEAT.handover.dur}ms ease ${BEAT.handover.at}ms;
}

/* ...and, on the same move, the ring draws itself round the foot. The
   pieces are at full opacity from the first frame; what changes is how much
   of the sweep mask has uncovered them. */
.lt-2-3 .lt-arc-sweep {
  transition: stroke-dashoffset var(--dur) ease-in-out var(--delay);
}

/* 3 -> 4: green and orange draw on together, either side of the white,
   while ÉIREANN arrives a letter at a time reading clockwise. Both start
   together and the letters carry on past the flag. */
.lt-3-4 .lt-flag-sweep { transition: stroke-dashoffset var(--dur) ease-in-out }
.lt-3-4 .lt-eireann {
  transition: opacity ${EIREANN_FADE.dur}ms ease var(--delay);
}

@media (prefers-reduced-motion: reduce) {
  .lt-1-2 *, .lt-2-3 * { transition: none !important }
}
`

const Mark = ({ f, pair }: { f: Frame; pair: string }) => {
  // ids must be unique per instance: two marks on one page would otherwise
  // both resolve url(#...) to whichever appeared first in the document, and
  // one would drive the other's mask
  const uid = useId().replace(/:/g, "")
  const rimClip = `lt-no-rim-${uid}`
  const arcMask = `lt-arc-draw-${uid}`
  const flagMask = `lt-flag-draw-${uid}`

  return (
  <svg
    viewBox="0 0 1080 1920"
    className={`block h-auto w-full ${pair}`}
    role="img"
    aria-label={f.title}
  >
    <defs>
      <mask
        id={arcMask}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="571"
        height="571"
      >
        {DRAW.map((d, i) => (
          <path
            key={i}
            className="lt-arc-sweep"
            d={arcPath(SWEEP_R, d.from, d.span)}
            fill="none"
            stroke="#fff"
            strokeWidth={SWEEP_W}
            pathLength={100}
            strokeDasharray={100}
            style={
              {
                "--dur": `${d.dur}ms`,
                "--delay": `${RING_AT + d.delay}ms`,
                strokeDashoffset: f.arc ? 0 : 100,
              } as React.CSSProperties
            }
          />
        ))}
      </mask>

      <mask
        id={flagMask}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="571"
        height="571"
      >
        {FLAG_DRAW.map((d, i) => (
          <path
            key={i}
            className="lt-flag-sweep"
            d={arcPath(SWEEP_R, d.from, d.span)}
            fill="none"
            stroke="#fff"
            strokeWidth={SWEEP_W}
            pathLength={100}
            strokeDasharray={100}
            style={
              {
                "--dur": `${d.dur}ms`,
                strokeDashoffset: f.notchGreen ? 0 : 100,
              } as React.CSSProperties
            }
          />
        ))}
      </mask>

      <clipPath id={rimClip} clipPathUnits="userSpaceOnUse">
        <ellipse
          cx={OLD_CENTRE.cx}
          cy={OLD_CENTRE.cy}
          rx={RIM_CLIP.rx}
          ry={RIM_CLIP.ry}
        />
      </clipPath>
    </defs>

    <style>{css}</style>

    <rect x="0" y="0" width="1080" height="1920" fill="#0c231a" />

    {/* The mark keeps its own viewport, so everything below stays written in
        the logo's own 571 coordinates rather than the taller canvas.
        Centred across, a little above the middle to leave room for
        Instagram's own furniture. */}
    <svg x="150" y="470" width="780" height="780" viewBox="0 0 571 571">
      {/* Drawn in the order the source file draws it. That order is
          load-bearing: the athlete sits on top of the tricolour wedges, and
          the wedges sit on top of the triskele. */}
      <g transform={OLD_SHIFT}>
        <path
          className="lt-field"
          style={on(f.field)}
          d={P.oldLeafWhite}
          fill={OLD.white}
        />
        <ellipse
          className="lt-field"
          style={on(f.field)}
          cx={P.oldDisc.cx}
          cy={P.oldDisc.cy}
          rx={P.oldDisc.rx}
          ry={P.oldDisc.ry}
          fill={OLD.white}
        />

        <path
          className="lt-triskele"
          d={P.oldTriskele}
          fill={f.triskeleChalk ? LIMESTONE : OLD.triskele}
          clipPath={f.oldRing ? undefined : `url(#${rimClip})`}
        />

        <path
          className="lt-field"
          style={on(f.field)}
          d={P.oldLeafGreen}
          fill={OLD.green}
        />
        <path
          className="lt-field"
          style={on(f.field)}
          d={P.oldLeafOrange}
          fill={OLD.orange}
        />

        <image
          className="lt-field"
          style={on(f.athlete)}
          href="/brand/old-athlete.png"
          x="333.622"
          y="166.544"
          width="156.271"
          height="237.227"
        />

        <path
          className="lt-strip"
          style={on(f.shamrocks)}
          d={P.oldShamrockL}
          fill={OLD.white}
        />
        <path
          className="lt-strip"
          style={on(f.shamrocks)}
          d={P.oldShamrockR}
          fill={OLD.white}
        />

        {P.oldLetters.slice(4).map((d, i) => (
          <path
            key={i}
            className="lt-strip"
            style={on(f.ireland)}
            d={d}
            fill={OLD.white}
          />
        ))}

      </g>

      {/* OCRA lives outside the shifted group: each letter turns about the
          mark centre, and that centre is only expressible in the mark's own
          viewBox coordinates. The shift moves inside, per letter, where it
          is a plain attribute and cannot disturb a transform origin. */}
      <g className="lt-ocra-old" style={on(f.oldOcra)}>
        {P.oldLetters.slice(0, 4).map((d, i) => (
          <g
            key={i}
            className="lt-ocra-turn"
            style={{
              transform: f.oldOcra
                ? undefined
                : `rotate(${OCRA_MOVE[i].turn}deg)`,
            }}
          >
            <g transform={OLD_SHIFT}>
              <path
                className="lt-ocra-glyph"
                style={{ transform: f.oldOcra ? undefined : shrink(i) }}
                d={d}
                fill={OLD.white}
              />
            </g>
          </g>
        ))}
      </g>

      <path
        className="lt-flag"
        mask={pair === "lt-3-4" ? `url(#${flagMask})` : undefined}
        style={on(f.notchGreen)}
        d={P.newNotchGreen}
        fill="#0F7B3F"
      />
      <path
        className="lt-arc"
        mask={pair === "lt-2-3" ? `url(#${arcMask})` : undefined}
        style={on(f.notchWhite)}
        d={P.newNotchWhite}
        fill="#ffffff"
      />
      <path
        className="lt-flag"
        mask={pair === "lt-3-4" ? `url(#${flagMask})` : undefined}
        style={on(f.notchOrange)}
        d={P.newNotchOrange}
        fill="#F4520B"
      />

      <path
        className="lt-arc"
        mask={pair === "lt-2-3" ? `url(#${arcMask})` : undefined}
        style={on(f.arc)}
        d={P.newNotchChalk}
        fill={LIMESTONE}
      />
      <path
        className="lt-arc"
        mask={pair === "lt-2-3" ? `url(#${arcMask})` : undefined}
        style={on(f.arc)}
        d={P.newArc}
        fill={LIMESTONE}
      />

      <path
        className="lt-ocra-new"
        style={on(f.newOcra)}
        d={P.newTextOcra}
        fill={LIMESTONE}
      />
      {P.newEireannGlyphs.map((d, i) => (
        <path
          key={i}
          className="lt-eireann"
          style={
            {
              ...on(f.eireann),
              "--delay": `${i * EIREANN_FADE.stagger}ms`,
            } as React.CSSProperties
          }
          d={d}
          fill={LIMESTONE}
        />
      ))}
      </svg>
    </svg>
  )
}

const Nav = ({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="border border-line px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.03em] transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
  >
    {label}
  </button>
)

/** one past the last frame: the stepper position that plays the whole thing */
const PLAY = STEPS.length

/**
 * Walks the frames on their real timings. Returns the frame on screen and
 * the one before it — that pair is what picks the transition, so a caller
 * only has to hand the two of them to `Mark`.
 *
 * `run` is a nonce: change it to replay without unmounting. `loop` starts
 * again from the top instead of resting on the last frame.
 */
const usePlaythrough = ({
  enabled,
  run = 0,
  loop = false,
}: {
  enabled: boolean
  run?: number
  loop?: boolean
}) => {
  const [frame, setFrame] = useState(0)
  const [from, setFrom] = useState(0)
  /** counts completed passes, which is what restarts a looping player */
  const [pass, setPass] = useState(0)

  useEffect(() => {
    if (!enabled) return
    // back to the top with from === frame, so the reset snaps rather than
    // animating backwards through five frames at once
    setFrom(0)
    setFrame(0)
    let at = LEAD_IN
    const timers = STEPS.slice(1).map((_, i) => {
      const fire = window.setTimeout(() => {
        setFrom(i)
        setFrame(i + 1)
      }, at)
      at += DURATION[i] + HOLD
      return fire
    })
    if (loop) {
      timers.push(window.setTimeout(() => setPass((n) => n + 1), at + REST))
    }
    return () => timers.forEach(clearTimeout)
  }, [enabled, run, loop, pass])

  return { frame, from }
}

/** "lt-<from>-<to>" in 1-based frame numbers. Only pairs with a rule in the
 *  css above animate; every other jump snaps. */
const pairOf = (from: number, frame: number) =>
  from === frame
    ? ""
    : `lt-${Math.min(from, frame) + 1}-${Math.max(from, frame) + 1}`

/** end to end: every move, plus the beats between them */
const RUNTIME = DURATION.reduce((t, d) => t + d + HOLD, LEAD_IN)

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-[300px]">{children}</div>
)

export const LogoSteps = () => {
  const [pos, setPos] = useState(0)
  const [manual, setManual] = useState({ frame: 0, from: 0 })
  const [run, setRun] = useState(0)

  const playing = pos === PLAY
  const played = usePlaythrough({ enabled: playing, run })
  const { frame, from } = playing ? played : manual

  const goto = (next: number) => {
    setPos(next)
    if (next < PLAY) setManual({ from: manual.frame, frame: next })
  }

  const f = STEPS[frame]

  return (
    <Frame>
      <div className="border border-bog-deep">
        <Mark f={f} pair={pairOf(from, frame)} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Nav label="Back" disabled={pos === 0} onClick={() => goto(pos - 1)} />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
          {playing
            ? `Playing ${frame + 1} / ${STEPS.length}`
            : `Step ${pos + 1} / ${PLAY + 1}`}
        </p>
        <Nav
          label={playing ? "Replay" : pos === PLAY - 1 ? "Play" : "Next"}
          disabled={false}
          onClick={() => (playing ? setRun(run + 1) : goto(pos + 1))}
        />
      </div>

      <div className="mt-3 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-[0.03em]">
          {playing ? "Play through" : f.title}
        </p>
        <p className="mt-1 text-sm text-sub">
          {playing
            ? `The whole sequence, on its real timings. About ${Math.round(RUNTIME / 1000)} seconds.`
            : f.note}
        </p>
      </div>
    </Frame>
  )
}

/** The sequence on its own, looping. Nothing to click — this is the thing
 *  we are actually making. */
export const LogoPlayer = () => {
  const { frame, from } = usePlaythrough({ enabled: true, loop: true })
  return (
    <Frame>
      <div className="border border-bog-deep">
        <Mark f={STEPS[frame]} pair={pairOf(from, frame)} />
      </div>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
        Looping · 1080 × 1920
      </p>
    </Frame>
  )
}
