import { useState } from "react"
import { Eye, EyeOff, Search } from "lucide-react"
import { useTranslation } from "react-i18next"
import { FilterTabs, MemberList, useAdminMembers } from "@/features/admin"
import { CardSkeleton } from "@/features/membership"

export const AdminMembers = () => {
  const { t } = useTranslation("admin")
  const [revealEmails, setRevealEmails] = useState(false)
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
    // Fixed header block, scrolling rows: the filters stay reachable no
    // matter how far down the list you are.
    <div className="mx-auto flex h-full max-w-[960px] flex-col px-5 pt-10 md:px-8 md:pt-14">
      <div className="shrink-0">
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

          <div className="flex gap-2">
            <label className="relative flex-1">
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
            <button
              type="button"
              onClick={() => setRevealEmails((shown) => !shown)}
              aria-pressed={revealEmails}
              title={revealEmails ? t("hideEmails") : t("showEmails")}
              aria-label={revealEmails ? t("hideEmails") : t("showEmails")}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center border border-line text-sub transition-colors hover:bg-mist hover:text-ink motion-reduce:transition-none"
            >
              {revealEmails ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-8">
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
          <MemberList members={members} revealEmails={revealEmails} />
        )}
      </div>
    </div>
  )
}
