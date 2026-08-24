import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { Button } from "@ocra/ui"

interface NoMembershipProps {
  /** Payment started but not yet confirmed by the Stripe webhook. */
  pending?: boolean
}

export const NoMembership = ({ pending = false }: NoMembershipProps) => {
  const { t } = useTranslation("membership")
  const key = pending ? "pending" : "none"

  return (
    <div className="border border-line bg-panel p-8 text-center">
      <h2 className="font-display text-2xl font-bold uppercase tracking-[0.03em]">
        {t(`empty.${key}.title`)}
      </h2>
      <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-sub">
        {t(`empty.${key}.body`)}
      </p>
      <Button variant="tape" size="brand" asChild className="mt-6">
        <Link to="/membership">{t(`empty.${key}.cta`)}</Link>
      </Button>
    </div>
  )
}
