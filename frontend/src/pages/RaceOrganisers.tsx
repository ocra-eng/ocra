import { useTranslation } from "react-i18next"
import { HubPage } from "@/features/hub"
import { raceOrganisersResources } from "@/features/race-organisers/i18n"
import { useSeo } from "@/features/seo"
import { registerPageResources } from "@/i18n"

registerPageResources("raceOrganisers", raceOrganisersResources)

const CARDS = [
  { key: "workWithOcra", href: "/race-organisers/work-with-ocra", isRoute: true },
  { key: "recognition", href: "/race-organisers/sanctioning", isRoute: true },
  { key: "standards", href: "/race-organisers/standards", isRoute: true },
  { key: "submit", href: "/race-organisers/submit-an-event", isRoute: true },
  { key: "resources", href: "/race-organisers/resources", isRoute: true },
]

export const RaceOrganisers = () => {
  useSeo("raceOrganisers", "race-organisers/")
  const { t } = useTranslation("raceOrganisers")

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
