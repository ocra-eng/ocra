import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { SITE_URL, siteUrlFor } from "@/config/site"
import { DEFAULT_LANGUAGE_CODE } from "@/features/language/constants"
import { upsertJsonLd, upsertLink, upsertMeta } from "@/features/seo/model/useSeo"
import { localesFor, type Doc } from "./registry"

/** A document translated into the locale being viewed is canonical at the
 *  locale-prefixed URL. One that is only available in English is canonical at
 *  the unprefixed URL, whatever prefix the reader arrived under — otherwise five
 *  URLs would each claim to be the canonical home of the same English text. */
export const useDocSeo = (doc: Doc) => {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? DEFAULT_LANGUAGE_CODE

  useEffect(() => {
    const path = `${doc.url.replace(/^\//, "")}/`
    const translated = localesFor(doc.url)
    const canonicalLang = translated.includes(lang) ? lang : DEFAULT_LANGUAGE_CODE
    const pageUrl = `${siteUrlFor(canonicalLang, DEFAULT_LANGUAGE_CODE)}${path}`
    const image = `${SITE_URL}img/og.png`
    const title = `${doc.title} — OCRA ÉIREANN`

    document.documentElement.lang = lang
    document.title = title
    upsertMeta("name", "description", doc.description)
    upsertLink("canonical", pageUrl)

    // Only advertise alternates that actually exist.
    for (const code of translated) {
      upsertLink(
        "alternate",
        `${siteUrlFor(code, DEFAULT_LANGUAGE_CODE)}${path}`,
        code
      )
    }

    upsertMeta("property", "og:site_name", "OCRA ÉIREANN")
    upsertMeta("property", "og:type", "article")
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", doc.description)
    upsertMeta("property", "og:url", pageUrl)
    upsertMeta("property", "og:image", image)

    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", doc.description)
    upsertMeta("name", "twitter:image", image)

    upsertJsonLd()
  }, [doc, lang])
}
