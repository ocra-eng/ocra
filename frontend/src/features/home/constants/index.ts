import type { NavItem, Org } from "@ocra/shared"

export const ORG: Org = {
  name: "OCRA ÉIREANN",
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
  { key: "events", href: "/compete/events", isRoute: true },
  { key: "championships", href: "/compete/championships", isRoute: true },
  { key: "teamIreland", href: "/compete/team-ireland", isRoute: true },
  { key: "resultsRankings", href: "/compete/results", isRoute: true },
  { key: "rules", href: "/compete/rules", isRoute: true },
]

const CLUB_LINKS: NavItem[] = [
  { key: "findClubGym", href: "/clubs/find-a-gym", isRoute: true },
  { key: "startClub", href: "/clubs/start-a-club", isRoute: true },
  { key: "affiliation", href: "/clubs/affiliation", isRoute: true },
  { key: "community", href: "/clubs/community", isRoute: true },
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
      { key: "volunteer", href: "/get-involved/volunteer", isRoute: true },
      { key: "coaching", href: "/coaching", isRoute: true },
      { key: "technicalOfficials", href: "/education/technical-officials", isRoute: true },
      { key: "coursesTraining", href: "/education/courses-training", isRoute: true },
      { key: "raceOrganisers", href: "/race-organisers", isRoute: true },
      { key: "partner", href: "/get-involved/partner", isRoute: true },
    ],
  },
  {
    key: "governance",
    items: [
      { key: "safeguarding", href: "/governance/safeguarding", isRoute: true },
      { key: "antiDoping", href: "/governance/anti-doping", isRoute: true },
      { key: "policies", href: "/governance/policies", isRoute: true },
      { key: "codesOfConduct", href: "/governance/codes-of-conduct", isRoute: true },
      { key: "complaints", href: "/governance/complaints", isRoute: true },
      { key: "equality", href: "/governance/equality-inclusion", isRoute: true },
      { key: "dataProtection", href: "/governance/data-protection", isRoute: true },
    ],
  },
]

export const FOOTER_META_LINKS: NavItem[] = [
  { key: "aboutOcra", href: "/about", isRoute: true },
  { key: "whatIsOcr", href: "/about/what-is-ocr", isRoute: true },
  { key: "contact", href: "/about/contact", isRoute: true },
  { key: "constitution", href: "/governance/constitution-bylaws", isRoute: true },
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
