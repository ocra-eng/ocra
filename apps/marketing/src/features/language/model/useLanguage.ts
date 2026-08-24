import { useLocation, useNavigate, useParams } from "react-router"
import { useTranslation } from "react-i18next"
import type { Language } from "@ocra/shared"
import {
  ALL_LANGUAGES,
  DEFAULT_LANGUAGE_CODE,
  RELEASED_LANGUAGE_CODES,
} from "../constants"

interface UseLanguageResult {
  current: string
  released: Language[]
  isSwitcherVisible: boolean
  setLanguage: (code: string) => void
}

export const useLanguage = (): UseLanguageResult => {
  const { i18n } = useTranslation()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const released = ALL_LANGUAGES.filter((language) =>
    RELEASED_LANGUAGE_CODES.includes(language.code)
  )

  const setLanguage = (code: string) => {
    const rest = lang
      ? location.pathname.slice(`/${lang}`.length)
      : location.pathname
    const prefix = code === DEFAULT_LANGUAGE_CODE ? "" : `/${code}`
    const pathname = `${prefix}${rest}` || "/"
    navigate({ pathname, search: location.search, hash: location.hash })
  }

  return {
    current: i18n.resolvedLanguage ?? i18n.language,
    released,
    isSwitcherVisible: released.length > 1,
    setLanguage,
  }
}
