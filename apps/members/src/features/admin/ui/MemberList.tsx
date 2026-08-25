import { useTranslation } from "react-i18next"
import type { AdminMemberRow } from "@/api/client"
import { StatusBadge } from "@/features/membership"

interface MemberListProps {
  members: AdminMemberRow[]
}

const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/**
 * One row per member. Stacked cards on mobile rather than a scrolling
 * table — admins check this on a phone at events.
 */
export const MemberList = ({ members }: MemberListProps) => {
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
          <div className="min-w-0 md:flex-1">
            <p className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.03em]">
              <span className="truncate">{member.displayName}</span>
              {member.role === "admin" && (
                <span className="shrink-0 border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-sub">
                  {t("adminTag")}
                </span>
              )}
            </p>
            <p className="mt-0.5 truncate text-sm text-sub">{member.email}</p>
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
          </dl>
        </li>
      ))}
    </ul>
  )
}
