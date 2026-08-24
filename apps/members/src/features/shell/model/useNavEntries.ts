import { useTranslation } from "react-i18next"
import { useSession } from "@/features/auth"

export interface NavEntry {
  to: string
  label: string
  end?: boolean
}

/** The app's destinations, filtered by role. Shared by header and nav sheet. */
export const useNavEntries = (): NavEntry[] => {
  const { t } = useTranslation("shell")
  const { isAdmin } = useSession()

  return [
    { to: "/", label: t("nav.card"), end: true },
    { to: "/membership", label: t("nav.membership") },
    ...(isAdmin ? [{ to: "/admin/members", label: t("nav.admin") }] : []),
  ]
}
