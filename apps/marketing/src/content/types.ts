export type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "badge"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "link"; label: string; href: string }

export interface PageCta {
  label: string
  /** a path, an absolute URL, or the literal "MEMBERS_URL" — resolved at
   *  render time so the members app's host can differ per environment */
  href: string
  /** the one action the page is actually for; rendered in tape */
  primary?: boolean
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
