import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { RELEASED_LANGUAGE_CODES } from "@/features/language/constants"
import { aboutResources } from "@/features/about/i18n"
import { coachingResources } from "@/features/coaching/i18n"
import { homeResources } from "@/features/home/i18n"
import { themeResources } from "@/features/theme/i18n"

const buildResources = () => {
  const codes = ["en", "ga", "pl", "ru", "be"] as const
  return Object.fromEntries(
    codes.map((code) => [
      code,
      {
        home: homeResources[code],
        theme: themeResources[code],
        about: aboutResources[code],
        coaching: coachingResources[code],
      },
    ])
  )
}

void i18n.use(initReactI18next).init({
  resources: buildResources(),
  lng: "en",
  fallbackLng: "en",
  supportedLngs: RELEASED_LANGUAGE_CODES,
  defaultNS: "home",
  interpolation: { escapeValue: false },
})

export default i18n
