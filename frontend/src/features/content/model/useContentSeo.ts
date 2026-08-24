import { useEffect } from "react"
import { SITE_URL } from "@/config/site"
import { upsertJsonLd, upsertLink, upsertMeta } from "@/features/seo/model/useSeo"
import type { PageContent } from "@/content"

// Content pages are English-only for now, so the canonical always points at
// the default-locale URL regardless of the locale prefix being viewed.
export const useContentSeo = (content: PageContent) => {
  useEffect(() => {
    const pageUrl = `${SITE_URL}${content.path.slice(1)}/`
    const image = `${SITE_URL}img/og.png`
    const { title, description } = content.meta

    document.title = title
    upsertMeta("name", "description", description)
    upsertLink("canonical", pageUrl)

    upsertMeta("property", "og:site_name", "OCRA ÉIREANN")
    upsertMeta("property", "og:type", "website")
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", description)
    upsertMeta("property", "og:url", pageUrl)
    upsertMeta("property", "og:image", image)
    upsertMeta("property", "og:locale", "en_IE")

    upsertMeta("name", "twitter:card", "summary_large_image")
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", description)
    upsertMeta("name", "twitter:image", image)

    upsertJsonLd()
  }, [content])
}
