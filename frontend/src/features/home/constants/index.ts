import type { HeroContent, NavItem, Org } from "@ocra/shared"

export const ORG: Org = {
  name: "OCRA Ireland",
  nameGa: "OCRA Éireann",
  fullName: "Obstacle Course Racing Association Ireland",
  fullNameGa: "Cumann Rásaíochta Constaicí na hÉireann",
  strapline: "The national governing body for obstacle sports in Ireland.",
  recognition:
    "Recognised by World Obstacle (FISO) and the European Obstacle Sports Federation (EOSF).",
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Events", href: "#events" },
  { label: "Membership", href: "#membership" },
  { label: "Coaching", href: "#coaching" },
  { label: "About", href: "#about" },
]

export const HERO: HeroContent = {
  statementLines: ["Over every", "obstacle"],
  support:
    "The standard for obstacle sport in Ireland — sanctioning races, ranking athletes, and certifying coaches across the island.",
  ctaLabel: "Become a member",
  ctaNote: "Insurance · rankings · national team pathway",
}
