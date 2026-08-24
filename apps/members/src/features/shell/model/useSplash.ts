import { useEffect } from "react"

/** Set true to pin the splash open while working on the animation. */
const HOLD_SPLASH = false

/** Minimum spin time, so a fast boot doesn't flash the sequence. */
const MIN_VISIBLE_MS = 900
/** Angle where the logo's semi-arc rests (its start point, clockwise). */
const ARC_ANGLE = 312
/** Ease the spinner into place over this long. */
const SETTLE_MS = 780
/** Reveal choreography runs ~1.1s after the arc lands. */
const REVEAL_MS = 1100
/** Must match the #splash opacity transition in index.html. */
const FADE_MS = 420

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

/** Current rotation of an element in degrees, read from its live matrix. */
const currentAngle = (el: Element): number => {
  const { transform } = getComputedStyle(el)
  if (!transform || transform === "none") return 0
  const matrix = new DOMMatrixReadOnly(transform)
  return (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
}

/**
 * Stops the spin where it currently is and eases it round to the arc's
 * resting angle, then triggers the reveal of the remaining logo parts.
 */
const settle = (splash: HTMLElement): Promise<void> => {
  const ring = splash.querySelector<SVGElement>(".splash-ring")
  if (!ring) return Promise.resolve()

  if (prefersReducedMotion()) {
    ring.style.animation = "none"
    ring.style.transform = `rotate(${ARC_ANGLE}deg)`
    splash.classList.add("is-ready")
    return Promise.resolve()
  }

  const from = currentAngle(ring)
  // Always travel forwards, plus a full turn so it decelerates rather than
  // snapping back to a nearby angle.
  const to = from + 360 + ((ARC_ANGLE - from) % 360 + 360) % 360

  ring.style.animation = "none"
  ring.style.transform = `rotate(${from}deg)`
  void ring.getBoundingClientRect() // flush, so the transition has a start

  ring.style.transition = `transform ${SETTLE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
  ring.style.transform = `rotate(${to}deg)`

  return new Promise((resolve) => {
    setTimeout(() => {
      splash.classList.add("is-ready")
      setTimeout(resolve, REVEAL_MS)
    }, SETTLE_MS)
  })
}

const dismiss = (splash: HTMLElement) => {
  splash.classList.add("is-leaving")
  setTimeout(() => splash.remove(), FADE_MS)
}

export const useSplash = () => {
  useEffect(() => {
    const splash = document.getElementById("splash")
    if (!splash) return

    if (HOLD_SPLASH) {
      // Review mode: click to watch the reveal, click again to dismiss.
      const onClick = () => {
        if (splash.classList.contains("is-ready")) dismiss(splash)
        else void settle(splash)
      }
      splash.addEventListener("click", onClick)
      return () => splash.removeEventListener("click", onClick)
    }

    let cancelled = false
    const wait = Math.max(0, MIN_VISIBLE_MS - performance.now())
    const timer = setTimeout(() => {
      void settle(splash).then(() => {
        if (!cancelled) dismiss(splash)
      })
    }, wait)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])
}
