import { Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { FilterTabs, MemberList, useAdminMembers } from "@/features/admin"
import { CardSkeleton } from "@/features/membership"

export const AdminMembers = () => {
  const { t } = useTranslation("admin")
  const {
    filter,
    setFilter,
    search,
    setSearch,
    members,
    counts,
    isLoading,
    isError,
  } = useAdminMembers()

  return (
    <div className="mx-auto max-w-[960px] px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">
        {t("title")}
        <span className="text-tape">.</span>
      </h1>
      {counts && (
        <p className="mt-3 text-sub">
          {t("intro_active", { count: counts.active })}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <FilterTabs value={filter} counts={counts} onChange={setFilter} />

        <label className="relative">
          <span className="sr-only">{t("search")}</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sub"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            className="w-full border border-line bg-bg py-2.5 pl-10 pr-3 text-sm text-ink outline-none focus-visible:border-accent"
          />
        </label>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <CardSkeleton />
        ) : isError ? (
          <p
            role="alert"
            className="border border-tape/40 bg-panel p-6 text-sm text-sub"
          >
            {t("error")}
          </p>
        ) : (
          <MemberList members={members} />
        )}
      </div>
    </div>
  )
}
