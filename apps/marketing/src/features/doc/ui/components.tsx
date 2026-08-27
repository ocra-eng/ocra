import type { ReactNode } from "react"
import { Link } from "react-router"
import { AlertTriangle, Clock, PhoneCall } from "lucide-react"

import { useLocalizedPath } from "@/features/language"

/** Markdown produces standard elements; these components decide how each one
 *  renders. The content stays plain markdown — nothing here leaks into it. */

/** Internal links route client-side, external links open safely. Nothing in the
 *  content has to know which it is. */
const Anchor = ({ href = "", children }: { href?: string; children?: ReactNode }) => {
  const localize = useLocalizedPath()
  if (href.startsWith("/")) {
    return (
      <Link
        to={localize(href)}
        className="font-semibold text-accent underline underline-offset-4"
      >
        {children}
      </Link>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-accent underline underline-offset-4"
    >
      {children}
    </a>
  )
}

/** Wide tables scroll inside their own container rather than pushing the page
 *  sideways. The wrapper lives here, not in the content. */
const Table = ({ children }: { children?: ReactNode }) => (
  <div className="mt-4 overflow-x-auto">
    <table className="w-full border-collapse text-left text-[0.9375rem]">
      {children}
    </table>
  </div>
)


/** A hub is a document whose :::cards block holds one h3 link per destination.
 *  The numbering is generated, so reordering the markdown reorders the grid. */
const CardGrid = ({ children }: { children?: ReactNode }) => (
  <nav
    aria-label="Sections"
    className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    {children}
  </nav>
)

/** Inside a card grid an h3 section becomes the card itself. */
const Card = ({ children, ...rest }: { children?: ReactNode }) => (
  <section
    {...rest}
    className="group flex flex-col border border-line bg-panel p-6 transition-colors hover:bg-mist motion-reduce:transition-none [&>h3]:mt-0 [&>h3]:text-xl [&>h3]:text-ink [&>h3+p]:mt-2 [&>h3+p]:text-sm [&>h3+p]:text-sub [&_a]:no-underline"
  >
    {children}
  </section>
)

const CALLOUTS = {
  "not-live": {
    icon: Clock,
    label: "Not yet live",
    className: "border-line bg-panel",
    labelClass: "text-sub",
  },
  "before-you-rely-on-this": {
    icon: AlertTriangle,
    label: "Before you rely on this",
    className: "border-tape bg-tape/5",
    labelClass: "text-tape",
  },
  escalate: {
    icon: PhoneCall,
    label: "If someone is at risk",
    className: "border-tape bg-tape/10",
    labelClass: "text-tape",
  },
} as const

type CalloutName = keyof typeof CALLOUTS

/** A callout is named for what it does to the reader, not for how severe it is.
 *  Three kinds, because the content has three kinds. */
const Callout = ({
  "data-callout": name,
  children,
}: {
  "data-callout"?: string
  children?: ReactNode
}) => {
  const kind = CALLOUTS[name as CalloutName]
  if (!kind) return <aside>{children}</aside>
  const Icon = kind.icon
  return (
    <aside className={`mt-6 border-l-[3px] p-4 pl-5 ${kind.className}`}>
      <p
        className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] ${kind.labelClass}`}
      >
        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
        {kind.label}
      </p>
      <div className="[&>p]:mt-2 [&>p]:leading-relaxed">{children}</div>
    </aside>
  )
}

export const docComponents = {
  a: Anchor,
  table: Table,
  aside: Callout,
  nav: ({
    "data-cards": isCards,
    children,
    ...rest
  }: {
    "data-cards"?: string
    children?: ReactNode
  }) =>
    isCards !== undefined ? (
      <CardGrid>{children}</CardGrid>
    ) : (
      <nav {...rest}>{children}</nav>
    ),

  h2: ({ children, ...rest }: { children?: ReactNode; id?: string }) => (
    <h2
      {...rest}
      className="mt-10 font-display text-2xl font-bold uppercase tracking-[0.03em]"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }: { children?: ReactNode; id?: string }) => (
    <h3
      {...rest}
      className="mt-7 font-display text-lg font-bold uppercase tracking-[0.03em] text-sub"
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mt-3 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed marker:font-mono marker:text-sub">
      {children}
    </ol>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-line pb-2 pr-4 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-sub">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-line py-2.5 pr-4 align-top leading-relaxed">
      {children}
    </td>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="border border-line bg-mist px-1.5 py-0.5 font-mono text-[0.85em] uppercase tracking-[0.08em]">
      {children}
    </code>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="mt-6 border-l border-line pl-5 text-sub">
      {children}
    </blockquote>
  ),
  dl: ({ children }: { children?: ReactNode }) => (
    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 leading-relaxed">
      {children}
    </dl>
  ),
  dt: ({ children }: { children?: ReactNode }) => (
    <dt className="pt-1 font-mono text-xs uppercase tracking-[0.08em] text-sub">
      {children}
    </dt>
  ),
  dd: ({ children }: { children?: ReactNode }) => <dd className="m-0">{children}</dd>,
  section: ({
    "data-card": isCard,
    children,
    ...rest
  }: {
    "data-card"?: string
    children?: ReactNode
  }) =>
    isCard !== undefined ? (
      <Card {...rest}>{children}</Card>
    ) : (
      <section {...rest}>{children}</section>
    ),
}
