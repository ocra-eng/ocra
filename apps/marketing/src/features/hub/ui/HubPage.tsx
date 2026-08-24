import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { useLocalizedPath } from "@/features/language"

export interface HubCard {
  key: string
  title: string
  body: string
  href: string
  isRoute?: boolean
}

interface HubPageProps {
  title: string
  intro: string
  cards: HubCard[]
}

const cardClass =
  "group flex flex-col border border-line bg-panel p-6 transition-colors hover:bg-mist motion-reduce:transition-none"

const CardBody = ({
  index,
  title,
  body,
}: {
  index: number
  title: string
  body: string
}) => (
  <>
    <div className="flex items-start justify-between gap-3">
      <h2 className="font-display text-xl font-bold uppercase tracking-[0.03em]">
        <span aria-hidden="true" className="text-numeral">
          {String(index + 1).padStart(2, "0")}.
        </span>{" "}
        {title}
      </h2>
      <ArrowRight
        aria-hidden="true"
        className="mt-1 h-4 w-4 shrink-0 text-numeral transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </div>
    <p className="mt-2 text-sm leading-relaxed text-sub">{body}</p>
  </>
)

export const HubPage = ({ title, intro, cards }: HubPageProps) => {
  const localize = useLocalizedPath()

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-14 md:px-11 md:py-20">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        {title}
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-6 max-w-[560px] text-lg text-sub md:text-xl">{intro}</p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) =>
          card.isRoute ? (
            <Link key={card.key} to={localize(card.href)} className={cardClass}>
              <CardBody index={index} title={card.title} body={card.body} />
            </Link>
          ) : (
            <a key={card.key} href={card.href} className={cardClass}>
              <CardBody index={index} title={card.title} body={card.body} />
            </a>
          )
        )}
      </div>
    </div>
  )
}
