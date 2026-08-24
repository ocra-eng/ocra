import { useTranslation } from "react-i18next"
import { getInvolvedResources } from "@/features/get-involved/i18n"
import { HubPage } from "@/features/hub"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("getInvolved", getInvolvedResources)

const CARDS = [
  { key: "membership", href: "/membership", isRoute: true },
  { key: "volunteer", href: "#" },
  { key: "coach", href: "/coaching", isRoute: true },
  { key: "official", href: "#" },
  { key: "club", href: "#" },
  { key: "event", href: "/race-organisers", isRoute: true },
  { key: "partner", href: "#" },
]

export const GetInvolved = () => {
  useSeo("getInvolved", "get-involved/")
  const { t } = useTranslation("getInvolved")

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
