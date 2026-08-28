import { useTranslation } from "react-i18next"
import { Button } from "@ocra/ui"
import {
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  useGetHealthQuery,
  useGetOffersQuery,
} from "@/api/client"
import { MemberDiscounts, StatusBadge, useMembership } from "@/features/membership"

const BENEFIT_KEYS = ["pathway", "discounts"] as const

export const Membership = () => {
  const { t, i18n } = useTranslation("membership")
  const { membership, isLoading } = useMembership()
  const isActive = membership?.status === "active"
  const { data: health } = useGetHealthQuery()
  // Only asked for when active; the API refuses everyone else anyway.
  const { data: offers } = useGetOffersQuery(undefined, { skip: !isActive })
  const [createCheckout, checkout] = useCreateCheckoutSessionMutation()
  const [createPortal, portal] = useCreatePortalSessionMutation()
  const billingReady = health?.billing === "ok"
  const isRedirecting = checkout.isLoading || portal.isLoading

  const onBillingClick = async () => {
    // Stripe owns the payment surface; we only ever hand over a URL.
    const result = isActive ? await createPortal() : await createCheckout()
    if ("data" in result && result.data?.url) {
      window.location.assign(result.data.url)
    }
  }

  return (
    <div className="mx-auto max-w-[720px] px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">
        {t("manage.title")}
        <span className="text-tape">.</span>
      </h1>

      {!isLoading && membership && (
        <div className="mt-8 flex flex-wrap items-center gap-4 border border-line bg-panel p-6">
          <div className="mr-auto">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
              {t(`type.${membership.type}`)}
            </p>
            <p className="mt-1 font-display text-xl font-bold uppercase tracking-[0.03em]">
              {membership.memberNumber}
            </p>
            {membership.currentPeriodEnd && (
              <p className="mt-1 text-sm text-sub">
                {t(isActive ? "manage.renewsOn" : "manage.endedOn", {
                  date: new Date(
                    membership.currentPeriodEnd
                  ).toLocaleDateString(i18n.resolvedLanguage ?? "en", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }),
                })}
              </p>
            )}
          </div>
          <StatusBadge status={membership.status} />
        </div>
      )}

      <h2 className="mt-12 font-display text-2xl font-bold uppercase tracking-[0.03em]">
        {t("manage.benefits")}
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed marker:text-accent">
        {BENEFIT_KEYS.map((key) => (
          <li key={key}>{t(`benefits.${key}`)}</li>
        ))}
      </ul>

      {isActive && offers && offers.offers.length > 0 && (
        <div className="mt-12">
          <MemberDiscounts offers={offers.offers} />
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8">
        <Button
          variant="tape"
          size="brand"
          disabled={!billingReady || isRedirecting}
          onClick={onBillingClick}
        >
          {isActive ? t("manage.manageCta") : t("manage.joinCta")}
        </Button>
        {!billingReady && (
          <p className="w-full text-sm text-sub">{t("manage.unavailable")}</p>
        )}
      </div>
    </div>
  )
}
