import { useTranslation } from "react-i18next"
import { useParams } from "react-router"
import { Wordmark } from "@ocra/ui"
import { useGetVerificationQuery } from "@/api/client"
import { CardSkeleton, MembershipCard } from "@/features/membership"

/**
 * The public card, reached by scanning a member's QR. Renders the same card
 * component as My Card so an official sees exactly what the member sees —
 * minus the QR, since this page is already the scan's destination.
 */
export const Verify = () => {
  const { t } = useTranslation("membership")
  const { token = "" } = useParams()
  const { data, isLoading, isError } = useGetVerificationQuery(token, {
    skip: !token,
  })

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <div className="mx-auto w-full max-w-[560px] px-5 py-12">
        <Wordmark className="mb-8" />
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
                {t("verify.notFound.bodyToken")}
              </p>
            </div>
          ) : (
            <>
              <MembershipCard
                holder={{
                  displayName: data.displayName,
                  photoUrl: data.photoUrl,
                }}
                membership={data}
                muted={data.status !== "active"}
              />
              <p className="mt-4 text-sm leading-relaxed text-sub">
                {t(
                  data.status === "active"
                    ? "verify.confirmed"
                    : "verify.notActive"
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
