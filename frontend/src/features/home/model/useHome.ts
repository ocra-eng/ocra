import type { HeroContent, Org } from "@ocra/shared"
import { HERO, ORG } from "../constants"

interface UseHomeResult {
  org: Org
  hero: HeroContent
}

export const useHome = (): UseHomeResult => {
  return { org: ORG, hero: HERO }
}
