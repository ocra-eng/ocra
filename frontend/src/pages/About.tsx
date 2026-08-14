import { useTranslation } from "react-i18next"
import { useSeo } from "@/features/seo"

const SECTIONS = ["mission", "community", "recognition", "who"] as const

export const About = () => {
  useSeo("about", "about/")
  const { t } = useTranslation("about")

  return (
    <article className="mx-auto max-w-[760px] px-5 py-14 md:px-11 md:py-20">
      <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.95] md:text-6xl">
        {t("title")}
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-6 text-lg text-sub md:text-xl">{t("intro")}</p>
      {SECTIONS.map((key) => (
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
