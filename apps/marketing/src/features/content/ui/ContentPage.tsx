import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

import type { ContentBlock, PageContent } from "@/content"
import { MEMBERS_URL } from "@/config/site"
import { useLocalizedPath } from "@/features/language"
import { useContentSeo } from "../model/useContentSeo"

const isInternal = (href: string) => href.startsWith("/")

const SmartLink = ({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) => {
  const localize = useLocalizedPath()
  if (isInternal(href)) {
    return (
      <Link to={localize(href)} className={className}>
        {children}
      </Link>
    )
  }
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

const Block = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-10 font-display text-2xl font-bold uppercase tracking-[0.03em]">
          {block.text}
        </h2>
      )
    case "p":
      return <p className="mt-3 leading-relaxed">{block.text}</p>
    case "badge":
      return (
        <p className="mt-4 inline-block border border-line bg-mist px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]">
          {block.text}
        </p>
      )
    case "ul":
      return (
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed marker:text-accent">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed marker:font-mono marker:text-sub">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )
    case "link":
      return (
        <p className="mt-3">
          <SmartLink
            href={block.href}
            className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline"
          >
            {block.label}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </SmartLink>
        </p>
      )
  }
}

export const ContentPage = ({ content }: { content: PageContent }) => {
  useContentSeo(content)

  return (
    <article className="mx-auto max-w-[760px] px-5 py-14 md:px-11 md:py-20">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        {content.title}
        <span className="text-tape">.</span>
      </h1>

      {content.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}

      {content.ctas.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
          {content.ctas.map((cta) => (
            <SmartLink
              key={cta.label + cta.href}
              href={cta.href === "MEMBERS_URL" ? MEMBERS_URL : cta.href}
              className={
                cta.primary
                  ? "bg-tape px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.03em] text-limestone transition-colors hover:bg-tape/90 motion-reduce:transition-none"
                  : "border border-line bg-panel px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.03em] transition-colors hover:bg-mist motion-reduce:transition-none"
              }
            >
              {cta.label}
            </SmartLink>
          ))}
        </div>
      )}
    </article>
  )
}
