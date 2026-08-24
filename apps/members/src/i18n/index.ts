import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { themeResources } from "@ocra/ui"
import { authResources } from "@/features/auth/i18n"
import { membershipResources } from "@/features/membership/i18n"
import { shellResources } from "@/features/shell/i18n"

export const LANGUAGE_CODES = ["en", "ga", "pl", "ru", "be"] as const

const STORAGE_KEY = "ocra-lang"

const buildResources = () =>
  Object.fromEntries(
    LANGUAGE_CODES.map((code) => [
      code,
      {
        theme: themeResources[code],
        auth: authResources[code],
        membership: membershipResources[code],
        shell: shellResources[code],
      },
    ])
  )

const stored =
  typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY)

void i18n.use(initReactI18next).init({
  resources: buildResources(),
  lng: LANGUAGE_CODES.includes(stored as (typeof LANGUAGE_CODES)[number])
    ? (stored as string)
    : "en",
  fallbackLng: "en",
  supportedLngs: [...LANGUAGE_CODES],
  defaultNS: "shell",
  interpolation: { escapeValue: false },
})

export default i18n
