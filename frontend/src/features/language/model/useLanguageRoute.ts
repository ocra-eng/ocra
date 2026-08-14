import { useEffect } from "react"
import { useParams } from "react-router"
import { useTranslation } from "react-i18next"
import { DEFAULT_LANGUAGE_CODE, RELEASED_LANGUAGE_CODES } from "../constants"

interface UseLanguageRouteResult {
  isValid: boolean
}

export const useLanguageRoute = (): UseLanguageRouteResult => {
  const { lang } = useParams()
  const { i18n } = useTranslation()

  const target = lang ?? DEFAULT_LANGUAGE_CODE
  const isValid =
    !lang ||
    (lang !== DEFAULT_LANGUAGE_CODE && RELEASED_LANGUAGE_CODES.includes(lang))

  useEffect(() => {
    if (!isValid) return
    if (i18n.resolvedLanguage !== target) {
      void i18n.changeLanguage(target)
    }
    document.documentElement.lang = target
  }, [isValid, target, i18n])

  return { isValid }
}
