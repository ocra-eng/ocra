export interface Org {
  name: string
  nameGa: string
  fullName: string
  fullNameGa: string
  strapline: string
  recognition: string
}

export interface NavItem {
  key: string
  href: string
  isRoute?: boolean
}

export interface HeroContent {
  statementLines: [string, string]
  support: string
  ctaLabel: string
  ctaNote: string
}
