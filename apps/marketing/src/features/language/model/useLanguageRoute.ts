import { useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router"
import { useTranslation } from "react-i18next"
import {
  DEFAULT_LANGUAGE_CODE,
  LANGUAGE_STORAGE_KEY,
  RELEASED_LANGUAGE_CODES,
} from "../constants"

interface UseLanguageRouteResult {
  isValid: boolean
}

export const useLanguageRoute = (): UseLanguageRouteResult => {
  const { lang } = useParams()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const recallDone = useRef(false)

  const target = lang ?? DEFAULT_LANGUAGE_CODE
  const isValid =
    !lang ||
    (lang !== DEFAULT_LANGUAGE_CODE && RELEASED_LANGUAGE_CODES.includes(lang))

  // On first load of the bare root, return the visitor to their last-chosen
  // language. Runs once; later in-session navigation to "/" is an explicit
  // choice and must not bounce back.
  useEffect(() => {
    const isFirstRun = !recallDone.current
    recallDone.current = true
    if (!isFirstRun || lang) return
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (
      stored &&
      stored !== DEFAULT_LANGUAGE_CODE &&
      RELEASED_LANGUAGE_CODES.includes(stored)
    ) {
      void navigate(`/${stored}`, { replace: true })
    }
  }, [lang, navigate])

  useEffect(() => {
    if (!isValid) return
    if (i18n.resolvedLanguage !== target) {
      void i18n.changeLanguage(target)
    }
    document.documentElement.lang = target
    localStorage.setItem(LANGUAGE_STORAGE_KEY, target)
  }, [isValid, target, i18n])

  return { isValid }
}
