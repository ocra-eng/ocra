import { useTranslation } from "react-i18next"
import { HubPage } from "@/features/hub"
import { membershipResources } from "@/features/membership/i18n"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("membership", membershipResources)

const CARDS = [
  { key: "athlete", href: "#" },
  { key: "organisation", href: "#" },
]

export const Membership = () => {
  useSeo("membership", "membership/")
  const { t } = useTranslation("membership")

  return (
    <HubPage
      title={t("title")}
      intro={t("intro")}
      cards={CARDS.map((card) => ({
        ...card,
        title: t(`cards.${card.key}.title`),
        body: t(`cards.${card.key}.body`),
      }))}
    />
  )
}
