import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { cn } from "@ocra/ui"
import type { AdminMemberRow } from "@/api/client"
import { MemberAvatar, StatusBadge } from "@/features/membership"

interface MemberListProps {
  members: AdminMemberRow[]
  /** Emails are masked unless the admin asks to see them. */
  revealEmails?: boolean
}

const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/** demo@ocra.ie -> d•••@ocra.ie — identifiable without being readable. */
const maskEmail = (email: string) => {
  const [user, domain] = email.split("@")
  if (!domain || !user) return "•••"
  return `${user.slice(0, 1)}•••@${domain}`
}

/** Short id is enough to correlate with logs; the full one is copyable. */
const CopyableId = ({ id }: { id: string }) => {
  const { t } = useTranslation("admin")
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(id)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      title={id}
      aria-label={copied ? t("copied") : t("copyId")}
      className="group flex items-center gap-1.5 font-mono text-xs text-sub transition-colors hover:text-ink motion-reduce:transition-none"
    >
      {id.slice(0, 8)}
      {copied ? (
        <Check className="h-3 w-3 text-accent" aria-hidden="true" />
      ) : (
        <Copy
          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none"
          aria-hidden="true"
        />
      )}
    </button>
  )
}

/**
 * One row per member. Stacked cards on mobile rather than a scrolling
 * table — admins check this on a phone at events.
 */
export const MemberList = ({ members, revealEmails = false }: MemberListProps) => {
  const { t, i18n } = useTranslation("admin")
  const locale = i18n.resolvedLanguage ?? "en"

  if (members.length === 0) {
    return (
      <p className="border border-line bg-panel p-8 text-center text-sm text-sub">
        {t("empty")}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {members.map((member) => (
        <li
          key={member.id}
          className="border border-line bg-panel p-4 md:flex md:items-center md:gap-4"
        >
          <MemberAvatar
            name={member.displayName}
            photoUrl={member.photoUrl}
            className="mb-3 h-11 w-11 border-line bg-mist text-ink md:mb-0 md:shrink-0"
          />

          <div className="min-w-0 md:flex-1">
            <p className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.03em]">
              <span className="truncate">{member.displayName}</span>
              {member.role === "admin" && (
                <span className="shrink-0 border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-sub">
                  {t("adminTag")}
                </span>
              )}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-sm text-sub",
                !revealEmails && "select-none"
              )}
            >
              {revealEmails ? member.email : maskEmail(member.email)}
            </p>
            <div className="mt-1.5">
              <CopyableId id={member.id} />
            </div>
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 md:mt-0 md:shrink-0">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
                {t("column.number")}
              </dt>
              <dd className="mt-0.5 font-mono text-sm">
                {member.membership?.memberNumber ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
                {t("column.renews")}
              </dt>
              <dd className="mt-0.5 font-mono text-sm">
                {member.membership?.currentPeriodEnd
                  ? formatDate(member.membership.currentPeriodEnd, locale)
                  : "—"}
              </dd>
            </div>
            {member.membership ? (
              <StatusBadge status={member.membership.status} />
            ) : (
              <span className="border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
                {t("filter.none")}
              </span>
            )}

            {/* Only active memberships: the public card is what a race
                official would see, and there is nothing to check for
                someone whose membership has lapsed or never existed. */}
            {member.membership?.status === "active" && (
              <Link
                to={`/verify/${member.membership.verificationToken}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sub transition-colors hover:bg-mist hover:text-ink motion-reduce:transition-none"
              >
                {t("viewCard")}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            )}
          </dl>
        </li>
      ))}
    </ul>
  )
}
