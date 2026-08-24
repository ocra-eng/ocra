import { useTranslation } from "react-i18next"
import { getInvolvedResources } from "@/features/get-involved/i18n"
import { HubPage } from "@/features/hub"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("getInvolved", getInvolvedResources)

const CARDS = [
  { key: "membership", href: "/membership", isRoute: true },
  { key: "volunteer", href: "/get-involved/volunteer", isRoute: true },
  { key: "coach", href: "/coaching", isRoute: true },
  { key: "official", href: "/education/technical-officials", isRoute: true },
  { key: "club", href: "/clubs/start-a-club", isRoute: true },
  { key: "event", href: "/race-organisers", isRoute: true },
  { key: "partner", href: "/get-involved/partner", isRoute: true },
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
