import { useTranslation } from "react-i18next"
import { DEFAULT_LANGUAGE_CODE } from "../constants"

export const useLocalizedPath = () => {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage ?? DEFAULT_LANGUAGE_CODE

  return (path: string): string =>
    lang === DEFAULT_LANGUAGE_CODE ? path : `/${lang}${path === "/" ? "" : path}`
}
