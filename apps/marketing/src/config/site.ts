// Canonical public origin for absolute URLs (canonical, hreflang, OG, sitemap).
// The production home of the site is ocra.ie; always ends with a trailing slash.
export const SITE_URL = "https://ocra.ie/"

export const siteUrlFor = (langCode: string, defaultCode: string): string =>
  langCode === defaultCode ? SITE_URL : `${SITE_URL}${langCode}/`
