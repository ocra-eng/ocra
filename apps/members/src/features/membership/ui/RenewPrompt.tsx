import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { Button } from "@ocra/ui"

/** Sits under an expired card: says what lapsed and offers the one action. */
export const RenewPrompt = () => {
  const { t } = useTranslation("membership")

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 border border-tape/40 bg-panel p-5">
      <div className="mr-auto">
        <p className="font-display text-lg font-bold uppercase tracking-[0.03em]">
          {t("empty.expired.title")}
        </p>
        <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-sub">
          {t("empty.expired.body")}
        </p>
      </div>
      <Button variant="tape" size="brand" asChild>
        <Link to="/membership">{t("empty.expired.cta")}</Link>
      </Button>
    </div>
  )
}
