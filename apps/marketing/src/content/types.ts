export type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "badge"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "link"; label: string; href: string }

export interface PageCta {
  label: string
  href: string
}

export interface PageContent {
  section: string
  slug: string
  /** Site-relative route, e.g. "/compete/events" */
  path: string
  title: string
  meta: { title: string; description: string }
  blocks: ContentBlock[]
  ctas: PageCta[]
}
