import type { NavItem, Org } from "@ocra/shared"

export const ORG: Org = {
  name: "OCRA Ireland",
  nameGa: "OCRA Éireann",
  fullName: "Obstacle Course Racing Association Ireland",
  fullNameGa: "Cumann Rásaíochta Constaicí na hÉireann",
  strapline: "The national governing body for obstacle sports in Ireland.",
  recognition:
    "Recognised by World Obstacle (FISO), the European Obstacle Sports Federation (EOSF) and the Union Internationale de Pentathlon Moderne (UIPM).",
}

export const NAV_ITEMS: NavItem[] = [
  { key: "events", href: "#events" },
  { key: "membership", href: "#membership" },
  { key: "coaching", href: "/coaching", isRoute: true },
  { key: "about", href: "/about", isRoute: true },
]

export interface RecognitionLogo {
  src: string
  alt: string
  inverse: boolean
  tall: boolean
  width: number
  height: number
}

export const RECOGNITION_LOGOS: RecognitionLogo[] = [
  {
    src: `${import.meta.env.BASE_URL}img/logo-wo.png`,
    alt: "World Obstacle — Fédération Internationale de Sports d'Obstacles",
    inverse: false,
    tall: true,
    width: 683,
    height: 225,
  },
  {
    src: `${import.meta.env.BASE_URL}img/logo-eosf.png`,
    alt: "European Obstacle Sports Federation",
    inverse: false,
    tall: true,
    width: 1149,
    height: 414,
  },
  {
    src: `${import.meta.env.BASE_URL}img/logo-uipm.png`,
    alt: "Union Internationale de Pentathlon Moderne",
    inverse: true,
    tall: false,
    width: 111,
    height: 35,
  },
]

export interface SocialLink {
  key: string
  href: string
}

export const SOCIAL_LINKS: SocialLink[] = [
  { key: "facebook", href: "https://www.facebook.com/ocrassociationireland/" },
  { key: "instagram", href: "https://www.instagram.com/ocrireland" },
]

export const CONTACT_EMAIL = "info@ocra.ie"
