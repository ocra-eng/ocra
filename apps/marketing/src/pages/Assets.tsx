import { useEffect } from "react"
import { Link } from "react-router"
import { useLocalizedPath } from "@/features/language"

/**
 * Assets index. Reached from the footer only — it is a working reference for
 * the people who make things with the brand, not a page we want in search
 * results or in the main navigation.
 */

const ITEMS = [
  {
    to: "/assets/identity",
    title: "Identity",
    note: "What the brand means and where it came from. The palette rationale, sourced and fact-checked.",
  },
  {
    to: "/assets/branding",
    title: "Branding",
    note: "The kit — marks and wordmarks in every colourway, colours, semantic tokens, type scale, components.",
  },
  {
    to: "/assets/media",
    title: "Media",
    note: "Things to post. The logo transition and the palette carousel, with the scripts that export them.",
  },
]

export const Assets = () => {
  const localize = useLocalizedPath()

  useEffect(() => {
    document.title = "Assets — OCRA ÉIREANN"
    const meta = document.createElement("meta")
    meta.name = "robots"
    meta.content = "noindex"
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 md:px-11">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        Assets
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg text-sub">
        Working references for anyone making something with the OCRA ÉIREANN
        brand. Not linked from the main navigation.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <Link
              to={localize(item.to)}
              className="block border border-line bg-panel p-5 transition-colors hover:bg-mist"
            >
              <p className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-sub">{item.note}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
