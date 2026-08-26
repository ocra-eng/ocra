import { useTranslation } from "react-i18next"
import type { MembershipStatus } from "@ocra/shared"
import { cn } from "@ocra/ui"

const TONE: Record<MembershipStatus, string> = {
  active: "bg-field-bright text-bog-deep",
  pending: "bg-limestone/20 text-limestone",
  expired: "bg-tape text-limestone",
  none: "bg-limestone/20 text-limestone",
}

interface StatusBadgeProps {
  status: MembershipStatus
  className?: string
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { t } = useTranslation("membership")

  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        TONE[status],
        className
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}
