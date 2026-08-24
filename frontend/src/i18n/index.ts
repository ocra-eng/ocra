import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { RELEASED_LANGUAGE_CODES } from "@/features/language/constants"
import { homeResources } from "@/features/home/i18n"
import { themeResources } from "@/features/theme/i18n"

// Only shell namespaces (needed on every page) are bundled eagerly.
// Page namespaces ship inside their route chunk and register themselves
// via registerPageResources at module load.
const buildResources = () => {
  const codes = ["en", "ga", "pl", "ru", "be"] as const
  return Object.fromEntries(
    codes.map((code) => [
      code,
      {
        home: homeResources[code],
        theme: themeResources[code],
      },
    ])
  )
}

void i18n.use(initReactI18next).init({
  resources: buildResources(),
  partialBundledLanguages: true,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: RELEASED_LANGUAGE_CODES,
  defaultNS: "home",
  interpolation: { escapeValue: false },
})

export const registerPageResources = (
  ns: string,
  resources: Record<string, object>
) => {
  for (const [lng, res] of Object.entries(resources)) {
    if (!i18n.hasResourceBundle(lng, ns)) {
      i18n.addResourceBundle(lng, ns, res, true, true)
    }
  }
}

export default i18n
