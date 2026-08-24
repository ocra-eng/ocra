import { useTranslation } from "react-i18next"
import { coachingResources } from "@/features/coaching/i18n"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("coaching", coachingResources)

const LIST_SECTIONS = ["objectives", "pathway", "principles"] as const
const PROSE_SECTIONS = ["progression", "adaptive", "assessment", "contact"] as const

export const Coaching = () => {
  useSeo("coaching", "coaching/")
  const { t } = useTranslation("coaching")

  return (
    <article className="mx-auto max-w-[760px] px-5 py-14 md:px-11 md:py-20">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        {t("title")}
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-6 text-lg text-sub md:text-xl">{t("intro")}</p>

      {LIST_SECTIONS.map((key) => {
        const items = t(`sections.${key}.items`, {
          returnObjects: true,
        }) as string[]
        const List = key === "pathway" ? "ol" : "ul"
        return (
          <section key={key} className="mt-10">
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
              {t(`sections.${key}.heading`)}
            </h2>
            <List
              className={
                key === "pathway"
                  ? "mt-3 list-decimal space-y-2 pl-5 leading-relaxed marker:font-mono marker:text-sub"
                  : "mt-3 list-disc space-y-2 pl-5 leading-relaxed marker:text-accent"
              }
            >
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </List>
          </section>
        )
      })}

      {PROSE_SECTIONS.map((key) => (
        <section key={key} className="mt-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
            {t(`sections.${key}.heading`)}
          </h2>
          <p className="mt-3 leading-relaxed">{t(`sections.${key}.body`)}</p>
        </section>
      ))}
    </article>
  )
}
