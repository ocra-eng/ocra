import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import type { Root } from "hast"

import {
  DEFAULT_LANGUAGE_CODE,
  RELEASED_LANGUAGE_CODES,
} from "@/features/language/constants"
import { useLocalizedPath } from "@/features/language"
import { docFor, type Doc } from "../model/registry"
import { useDocSeo } from "../model/useDocSeo"
import { docComponents } from "./components"

/** Renders a compiled document. The markdown was parsed at build time; this
 *  turns the resulting tree into React elements, with docComponents deciding
 *  how each element looks and behaves. */
const Rendered = ({ doc, tree }: { doc: Doc; tree: Root }) => {
  useDocSeo(doc)
  return (
    <article className="mx-auto max-w-[760px] px-5 py-14 md:px-11 md:py-20">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        {doc.title}
        <span className="text-tape">.</span>
      </h1>
      {doc.standfirst && (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
          {doc.standfirst}
        </p>
      )}
      {toJsxRuntime(tree, {
        Fragment,
        jsx,
        jsxs,
        components: docComponents,
      })}
    </article>
  )
}

/** One route serves every document, because each document declares its own URL. */
export const DocPage = () => {
  const { pathname } = useLocation()
  const localize = useLocalizedPath()
  const { i18n } = useTranslation()

  // Documents are English-only and served at the same path under every locale.
  const segments = pathname.replace(/\/+$/, "").split("/")
  if (
    segments[1] &&
    segments[1] !== DEFAULT_LANGUAGE_CODE &&
    RELEASED_LANGUAGE_CODES.includes(segments[1])
  ) {
    segments.splice(1, 1)
  }
  const doc = docFor(
    segments.join("/") || "/",
    i18n.resolvedLanguage ?? DEFAULT_LANGUAGE_CODE
  )

  const [tree, setTree] = useState<Root | null>(null)
  useEffect(() => {
    setTree(null)
    if (!doc) return
    let cancelled = false
    void doc.load().then((mod) => {
      if (!cancelled) setTree(mod.tree)
    })
    return () => {
      cancelled = true
    }
  }, [doc])

  if (!doc) return <Navigate to={localize("/")} replace />
  if (!tree) return null
  return <Rendered doc={doc} tree={tree} />
}
