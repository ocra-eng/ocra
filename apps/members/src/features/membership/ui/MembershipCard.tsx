import { useTranslation } from "react-i18next"
import QRCode from "react-qr-code"
import type { Member, Membership } from "@ocra/shared"
import { TriskeleMark, Wordmark, cn } from "@ocra/ui"
import { MemberAvatar } from "./MemberAvatar"
import { StatusBadge } from "./StatusBadge"

interface MembershipCardProps {
  member: Member
  membership: Membership
  verificationUrl: string
  /** Drain the colour when the membership is no longer valid. */
  muted?: boolean
}

const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/**
 * Presentational membership card. Always dark-green regardless of theme —
 * it represents a physical card, not a page surface.
 */
export const MembershipCard = ({
  member,
  membership,
  verificationUrl,
  muted = false,
}: MembershipCardProps) => {
  const { t, i18n } = useTranslation("membership")
  const locale = i18n.resolvedLanguage ?? "en"

  return (
    <article
      className={cn(
        "relative isolate overflow-hidden border border-bog-deep bg-bog text-chalk",
        muted && "grayscale-[0.85] opacity-70"
      )}
    >
      <TriskeleMark className="pointer-events-none absolute -right-10 -top-10 -z-10 h-56 w-56 text-chalk/5" />

      <div className="flex items-start justify-between gap-4 border-b border-chalk/15 px-6 py-5">
        <Wordmark onDark className="h-8 md:h-8" />
        <StatusBadge status={membership.status} />
      </div>

      <div className="flex flex-col gap-6 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <MemberAvatar
            name={member.profileName ?? member.displayName}
            photoUrl={member.photoUrl}
            className="h-16 w-16"
          />
          <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/60">
            {t(`type.${membership.type}`)}
          </p>
          <p className="mt-1 truncate font-display text-3xl font-bold uppercase leading-tight">
            {member.profileName ?? member.displayName}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/60">
                {t("card.number")}
              </dt>
              <dd className="mt-0.5 font-mono">{membership.memberNumber}</dd>
            </div>
            {membership.currentPeriodEnd && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-chalk/60">
                  {t("card.validUntil")}
                </dt>
                <dd className="mt-0.5 font-mono">
                  {formatDate(membership.currentPeriodEnd, locale)}
                </dd>
              </div>
            )}
          </dl>
          </div>
        </div>

        <div className="shrink-0 self-center bg-chalk p-2.5">
          <QRCode
            value={verificationUrl}
            size={112}
            bgColor="#f3f2ec"
            fgColor="#0c231a"
            aria-label={t("card.qrLabel")}
          />
        </div>
      </div>
    </article>
  )
}
