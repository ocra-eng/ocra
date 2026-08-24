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

// Spike: sub-links are placeholders ("#") until their pages exist.
// Structure follows docs/structure/menu-proposed.txt.
const COMPETE_LINKS: NavItem[] = [
  { key: "events", href: "#" },
  { key: "championships", href: "#" },
  { key: "teamIreland", href: "#" },
  { key: "resultsRankings", href: "#" },
  { key: "rules", href: "#" },
]

const CLUB_LINKS: NavItem[] = [
  { key: "findClubGym", href: "#" },
  { key: "startClub", href: "#" },
  { key: "affiliation", href: "#" },
  { key: "community", href: "#" },
]

export const NAV_ITEMS: NavItem[] = [
  { key: "compete", children: COMPETE_LINKS },
  { key: "clubs", children: CLUB_LINKS },
  { key: "getInvolved", href: "/get-involved", isRoute: true },
  { key: "about", href: "/about", isRoute: true },
  { key: "governance", href: "/governance", isRoute: true },
]

export interface FooterColumnDef {
  key: string
  items: NavItem[]
}

export const FOOTER_SITEMAP: FooterColumnDef[] = [
  { key: "compete", items: COMPETE_LINKS },
  { key: "clubsCommunity", items: CLUB_LINKS },
  {
    key: "getInvolved",
    items: [
      { key: "membership", href: "/membership", isRoute: true },
      { key: "volunteer", href: "#" },
      { key: "coaching", href: "/coaching", isRoute: true },
      { key: "technicalOfficials", href: "#" },
      { key: "coursesTraining", href: "#" },
      { key: "raceOrganisers", href: "/race-organisers", isRoute: true },
      { key: "partner", href: "#" },
    ],
  },
  {
    key: "governance",
    items: [
      { key: "safeguarding", href: "#" },
      { key: "antiDoping", href: "#" },
      { key: "policies", href: "#" },
      { key: "codesOfConduct", href: "#" },
      { key: "complaints", href: "#" },
      { key: "equality", href: "#" },
      { key: "dataProtection", href: "#" },
    ],
  },
]

export const FOOTER_META_LINKS: NavItem[] = [
  { key: "aboutOcra", href: "/about", isRoute: true },
  { key: "whatIsOcr", href: "#" },
  { key: "contact", href: "#" },
  { key: "constitution", href: "#" },
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
