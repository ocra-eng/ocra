import { useTranslation } from "react-i18next"
import { MEMBERS_URL } from "@/config/site"
import type { HeroContent, NavItem, Org } from "@ocra/shared"
import { useLocalizedPath } from "@/features/language"
import { FOOTER_META_LINKS, FOOTER_SITEMAP, NAV_ITEMS, ORG } from "../constants"

export interface NavLink {
  key: string
  label: string
  href?: string
  isRoute?: boolean
  children?: NavLink[]
}

export interface FooterColumn {
  key: string
  heading: string
  items: NavLink[]
}

interface UseHomeResult {
  org: Org
  hero: HeroContent
  navLinks: NavLink[]
  footerColumns: FooterColumn[]
  footerMetaLinks: NavLink[]
  joinLabel: string
  signInLabel: string
  membersUrl: string
  menuOpenLabel: string
  menuCloseLabel: string
  footerRecognition: string
  footerCopyright: string
  recognitionLabel: string
}

export const useHome = (): UseHomeResult => {
  const { t } = useTranslation("home")
  const localize = useLocalizedPath()

  const toNavLink = (item: NavItem): NavLink => ({
    key: item.key,
    label: t(`nav.${item.key}`),
    href: item.isRoute && item.href ? localize(item.href) : item.href,
    isRoute: item.isRoute,
    children: item.children?.map(toNavLink),
  })

  return {
    org: ORG,
    hero: {
      statementLines: [t("hero.statement1"), t("hero.statement2")],
      support: t("hero.support"),
      ctaLabel: t("hero.ctaLabel"),
      ctaNote: t("hero.ctaNote"),
    },
    navLinks: NAV_ITEMS.map(toNavLink),
    footerColumns: FOOTER_SITEMAP.map((column) => ({
      key: column.key,
      heading: t(`nav.${column.key}`),
      items: column.items.map(toNavLink),
    })),
    footerMetaLinks: FOOTER_META_LINKS.map(toNavLink),
    joinLabel: t("nav.membership"),
    signInLabel: t("nav.signIn"),
    membersUrl: MEMBERS_URL,
    menuOpenLabel: t("menu.open"),
    menuCloseLabel: t("menu.close"),
    footerRecognition: t("footer.recognition"),
    footerCopyright: t("footer.copyright", {
      year: new Date().getFullYear(),
    }),
    recognitionLabel: t("recognition.label"),
  }
}
