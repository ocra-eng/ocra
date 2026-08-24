import { useTranslation } from "react-i18next"
import { governanceResources } from "@/features/governance/i18n"
import { HubPage } from "@/features/hub"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("governance", governanceResources)

const CARDS = [
  { key: "structure", href: "/governance/structure", isRoute: true },
  { key: "constitution", href: "/governance/constitution-bylaws", isRoute: true },
  { key: "policies", href: "/governance/policies", isRoute: true },
  { key: "safeguarding", href: "/governance/safeguarding", isRoute: true },
  { key: "antiDoping", href: "/governance/anti-doping", isRoute: true },
  { key: "codes", href: "/governance/codes-of-conduct", isRoute: true },
  { key: "complaints", href: "/governance/complaints", isRoute: true },
  { key: "equality", href: "/governance/equality-inclusion", isRoute: true },
  { key: "data", href: "/governance/data-protection", isRoute: true },
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
