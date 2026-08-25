import { useTranslation } from "react-i18next"
import { cn } from "@ocra/ui"
import type { AdminFilter } from "@/api/client"

const ORDER: AdminFilter[] = ["active", "expired", "none", "all"]

interface FilterTabsProps {
  value: AdminFilter
  counts?: Record<AdminFilter, number>
  onChange: (filter: AdminFilter) => void
}

/** Counts sit on the tabs so the numbers are visible before clicking. */
export const FilterTabs = ({ value, counts, onChange }: FilterTabsProps) => {
  const { t } = useTranslation("admin")

  return (
    <div
      role="tablist"
      aria-label={t("filter.label")}
      className="-mx-1 flex flex-wrap gap-1 overflow-x-auto"
    >
      {ORDER.map((filter) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={value === filter}
          onClick={() => onChange(filter)}
          className={cn(
            "shrink-0 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors motion-reduce:transition-none",
            value === filter
              ? "border-tape bg-mist text-ink"
              : "border-line text-sub hover:bg-mist hover:text-ink"
          )}
        >
          {t(`filter.${filter}`)}
          {counts && (
            <span className="ml-2 text-ink/50">{counts[filter] ?? 0}</span>
          )}
        </button>
      ))}
    </div>
  )
}
