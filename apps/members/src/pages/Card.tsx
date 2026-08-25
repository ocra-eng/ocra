import { useTranslation } from "react-i18next"
import { useSession } from "@/features/auth"
import {
  CardSkeleton,
  MembershipCard,
  NoMembership,
  RenewPrompt,
  ShareCard,
  useMembership,
  useVerificationUrl,
} from "@/features/membership"

export const Card = () => {
  const { t } = useTranslation("membership")
  const { member } = useSession()
  const { membership, isLoading } = useMembership()
  const verificationUrl = useVerificationUrl(membership?.verificationToken ?? "")

  const isLapsed = membership?.status === "expired"
  // A pending membership has no number to show yet, so it reads as "not a
  // member" with a different message rather than as a card.
  const hasCard =
    membership && (membership.status === "active" || isLapsed)

  return (
    <div className="mx-auto max-w-[720px] px-5 py-10 md:px-8 md:py-14">
      <h1 className="mb-8 font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">
        {t("card.title")}
        <span className="text-tape">.</span>
      </h1>

      {isLoading || !member ? (
        <CardSkeleton />
      ) : !hasCard ? (
        <NoMembership pending={membership?.status === "pending"} />
      ) : (
        <>
          <MembershipCard
            holder={{
              displayName: member.profileName ?? member.displayName,
              photoUrl: member.photoUrl,
            }}
            membership={membership}
            verificationUrl={verificationUrl}
            muted={isLapsed}
          />
          {isLapsed ? (
            <RenewPrompt />
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ShareCard url={verificationUrl} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-sub">
                {t("card.scanHint")}
              </p>
            </>
          )}
        </>
      )}
    </div>
  )
}
