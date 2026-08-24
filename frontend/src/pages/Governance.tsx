import { useTranslation } from "react-i18next"
import { governanceResources } from "@/features/governance/i18n"
import { HubPage } from "@/features/hub"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("governance", governanceResources)

const CARDS = [
  { key: "constitution", href: "#" },
  { key: "policies", href: "#" },
  { key: "safeguarding", href: "#" },
  { key: "antiDoping", href: "#" },
  { key: "codes", href: "#" },
  { key: "complaints", href: "#" },
  { key: "equality", href: "#" },
  { key: "data", href: "#" },
]

export const Governance = () => {
  useSeo("governance", "governance/")
  const { t } = useTranslation("governance")

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
