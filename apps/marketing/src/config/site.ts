// Canonical public origin for absolute URLs (canonical, hreflang, OG, sitemap).
// The production home of the site is ocra.ie; always ends with a trailing slash.
export const SITE_URL = "https://ocra.ie/"

export const siteUrlFor = (langCode: string, defaultCode: string): string =>
  langCode === defaultCode ? SITE_URL : `${SITE_URL}${langCode}/`

/**
 * The members app. A separate origin — its own Render service, its own
 * build, its own auth — so this is a plain external link, not a route.
 * Set VITE_MEMBERS_URL per environment; the fallback is the dev service so
 * local and preview builds still go somewhere real.
 */
export const MEMBERS_URL =
  import.meta.env.VITE_MEMBERS_URL ?? "https://ocra-members-dev.onrender.com"
