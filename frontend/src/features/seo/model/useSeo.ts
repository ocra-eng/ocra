import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { SITE_URL, siteUrlFor } from "@/config/site"
import {
  DEFAULT_LANGUAGE_CODE,
  RELEASED_LANGUAGE_CODES,
} from "@/features/language/constants"

const OG_LOCALES: Record<string, string> = {
  en: "en_IE",
  ga: "ga_IE",
  pl: "pl_PL",
  ru: "ru_RU",
  be: "be_BY",
}

const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  )
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

const upsertLink = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    if (hreflang) el.setAttribute("hreflang", hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

const upsertJsonLd = () => {
  const id = "ld-organization"
  if (document.getElementById(id)) return
  const el = document.createElement("script")
  el.id = id
  el.type = "application/ld+json"
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "OCRA Ireland",
    alternateName: [
      "OCRA Éireann",
      "Obstacle Course Racing Association Ireland",
    ],
    url: SITE_URL,
    logo: `${SITE_URL}brand/green.svg`,
    sport: "Obstacle Course Racing",
  })
  document.head.appendChild(el)
}

// pagePath is the site-relative path of the page without a language prefix:
// "" for home, "about/" for the about page, etc.
export const useSeo = (namespace: string, pagePath: string) => {
  const { t, i18n } = useTranslation(namespace)
  const lang = i18n.resolvedLanguage ?? DEFAULT_LANGUAGE_CODE

  useEffect(() => {
    const title = t("meta.title")
    const description = t("meta.description")
    const pageUrl = `${siteUrlFor(lang, DEFAULT_LANGUAGE_CODE)}${pagePath}`
    const image = `${SITE_URL}img/og.png`

    document.title = title
    upsertMeta("name", "description", description)
    upsertLink("canonical", pageUrl)

    upsertMeta("property", "og:site_name", "OCRA Ireland")
    upsertMeta("property", "og:type", "website")
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", description)
    upsertMeta("property", "og:url", pageUrl)
    upsertMeta("property", "og:image", image)
    upsertMeta("property", "og:locale", OG_LOCALES[lang] ?? OG_LOCALES.en)

    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", description)
    upsertMeta("name", "twitter:image", image)

    for (const code of RELEASED_LANGUAGE_CODES) {
      upsertLink(
        "alternate",
        `${siteUrlFor(code, DEFAULT_LANGUAGE_CODE)}${pagePath}`,
        code
      )
    }
    upsertLink("alternate", `${SITE_URL}${pagePath}`, "x-default")

    upsertJsonLd()
  }, [t, lang, pagePath])
}
