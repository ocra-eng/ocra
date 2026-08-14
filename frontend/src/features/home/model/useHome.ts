import { useTranslation } from "react-i18next"
import type { HeroContent, NavItem, Org } from "@ocra/shared"
import { useLocalizedPath } from "@/features/language"
import { NAV_ITEMS, ORG } from "../constants"

interface NavLink extends NavItem {
  label: string
}

interface UseHomeResult {
  org: Org
  hero: HeroContent
  navLinks: NavLink[]
  joinLabel: string
  menuOpenLabel: string
  menuCloseLabel: string
  footerRecognition: string
  footerCopyright: string
  recognitionLabel: string
}

export const useHome = (): UseHomeResult => {
  const { t } = useTranslation("home")
  const localize = useLocalizedPath()

  return {
    org: ORG,
    hero: {
      statementLines: [t("hero.statement1"), t("hero.statement2")],
      support: t("hero.support"),
      ctaLabel: t("hero.ctaLabel"),
      ctaNote: t("hero.ctaNote"),
    },
    navLinks: NAV_ITEMS.map((item) => ({
      ...item,
      href: item.isRoute ? localize(item.href) : item.href,
      label: t(`nav.${item.key}`),
    })),
    joinLabel: t("join"),
    menuOpenLabel: t("menu.open"),
    menuCloseLabel: t("menu.close"),
    footerRecognition: t("footer.recognition"),
    footerCopyright: t("footer.copyright", {
      year: new Date().getFullYear(),
    }),
    recognitionLabel: t("recognition.label"),
  }
}
