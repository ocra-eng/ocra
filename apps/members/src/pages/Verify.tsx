import { useTranslation } from "react-i18next"
import { useParams } from "react-router"
import { Wordmark } from "@ocra/ui"
import { useGetVerificationQuery } from "@/api/client"
import { CardSkeleton, StatusBadge } from "@/features/membership"

/**
 * Public page reached by scanning a member's QR. Shows only what someone
 * checking a membership at a race needs — the API redacts the rest.
 */
export const Verify = () => {
  const { t, i18n } = useTranslation("membership")
  const { memberNumber = "" } = useParams()
  const { data, isLoading, isError } = useGetVerificationQuery(memberNumber, {
    skip: !memberNumber,
  })

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <div className="mx-auto w-full max-w-[520px] px-5 py-14">
        <Wordmark className="mb-10" />
        <h1 className="font-display text-3xl font-extrabold uppercase leading-[0.95]">
          {t("verify.title")}
          <span className="text-tape">.</span>
        </h1>

        <div className="mt-8">
          {isLoading ? (
            <CardSkeleton />
          ) : isError || !data ? (
            <div className="border border-line bg-panel p-8 text-center">
              <p className="font-display text-xl font-bold uppercase tracking-[0.03em]">
                {t("verify.notFound.title")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-sub">
                {t("verify.notFound.body", { memberNumber })}
              </p>
            </div>
          ) : (
            <div className="border border-line bg-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
                    {t(`type.${data.type}`)}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold uppercase leading-tight">
                    {data.displayName}
                  </p>
                  <p className="mt-2 font-mono text-sm">{data.memberNumber}</p>
                </div>
                <StatusBadge status={data.status} />
              </div>
              {data.currentPeriodEnd && (
                <p className="mt-4 border-t border-line pt-4 text-sm text-sub">
                  {t("verify.validUntil", {
                    date: new Date(data.currentPeriodEnd).toLocaleDateString(
                      i18n.resolvedLanguage ?? "en",
                      { day: "numeric", month: "long", year: "numeric" }
                    ),
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
