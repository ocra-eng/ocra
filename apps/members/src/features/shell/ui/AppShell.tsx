import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { ConnectedThemeToggle, RouteTransition, Wordmark, cn } from "@ocra/ui"
import { useSession } from "@/features/auth"
import { useNavEntries } from "../model/useNavEntries"
import { ActionBar } from "./ActionBar"
import { MenuIcon } from "./MenuIcon"
import { NavSheet } from "./NavSheet"

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-sm px-2.5 py-1.5 text-[15px] font-semibold transition-colors hover:bg-mist motion-reduce:transition-none",
    isActive ? "text-accent" : "text-ink"
  )

interface AppShellProps {
  /**
   * Constrain the shell to the viewport so the page can own its scrolling
   * (the admin list scrolls its rows while filters stay put). Default is a
   * normally-scrolling document.
   */
  fill?: boolean
}

export const AppShell = ({ fill = false }: AppShellProps) => {
  const { t } = useTranslation("shell")
  const { member, signOut } = useSession()
  const entries = useNavEntries()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // A route change from anywhere (including a card CTA) should leave the
  // menu closed.
  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div
      className={cn(
        "flex flex-col bg-bg text-ink",
        fill
          ? "h-dvh overflow-hidden pb-[var(--bar-total)] lg:pb-0"
          : "min-h-dvh"
      )}
    >
      <header className="sticky top-0 z-40 border-b border-line bg-panel">
        <div className="mx-auto flex max-w-[960px] items-center gap-3 px-5 py-3 md:px-8">
          <Link to="/" aria-label={t("home")} className="mr-auto">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {entries.map((entry) => (
              <NavLink
                key={entry.to}
                to={entry.to}
                end={entry.end}
                className={navClass}
              >
                {entry.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={signOut}
            aria-label={t("signOut")}
            title={member?.email}
            className="hidden h-9 w-9 items-center justify-center rounded-sm text-sub transition-colors hover:bg-mist hover:text-ink motion-reduce:transition-none lg:flex"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* pb clears the fixed action bar on mobile */}
      <main
        className={cn(
          "flex-1",
          fill
            ? "min-h-0 overflow-hidden"
            : "pb-[calc(var(--bar-total)+8px)] lg:pb-0"
        )}
      >
        <RouteTransition className={fill ? "h-full" : undefined}>
          <Outlet />
        </RouteTransition>
      </main>

      <footer
        className={cn(
          "hidden border-t border-line bg-panel",
          fill ? "" : "lg:block"
        )}
      >
        <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-4 px-5 py-6 md:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
            {t("footer", { year: new Date().getFullYear() })}
          </p>
          <ConnectedThemeToggle />
        </div>
      </footer>

      <ActionBar
        label={t("nav.label")}
        trailing={
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t("nav.close") : t("nav.open")}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-ink transition-colors hover:bg-mist motion-reduce:transition-none"
          >
            <MenuIcon open={menuOpen} />
          </button>
        }
      >
        <p className="truncate px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
          {entries.find((entry) =>
            entry.end
              ? location.pathname === entry.to
              : location.pathname.startsWith(entry.to)
          )?.label ?? ""}
        </p>
      </ActionBar>

      <NavSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={t("nav.label")}
        entries={entries}
        signOutLabel={t("signOut")}
        onSignOut={signOut}
      />
    </div>
  )
}
