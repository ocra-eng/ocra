import { LogOut } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { NavLink } from "react-router"
import { ConnectedThemeToggle, Wordmark, cn } from "@ocra/ui"
import type { NavEntry } from "../model/useNavEntries"

interface NavSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  entries: NavEntry[]
  signOutLabel: string
  onSignOut: () => void
}

/**
 * Full-height nav that stops above the action bar, so the bar stays visible
 * and the menu button remains under the thumb.
 */
export const NavSheet = ({
  open,
  onOpenChange,
  title,
  entries,
  signOutLabel,
  onSignOut,
}: NavSheetProps) => (
  <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="nav-overlay"
        className="fixed inset-x-0 top-0 z-40 bg-bog-deep/50 backdrop-blur-sm lg:hidden"
        style={{ bottom: "var(--bar-total)" }}
      />
      <SheetPrimitive.Content
        data-slot="nav-sheet"
        aria-describedby={undefined}
        className="fixed inset-x-0 top-0 z-50 flex flex-col border-b border-line bg-panel lg:hidden"
        style={{ bottom: "var(--bar-total)" }}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <SheetPrimitive.Title className="sr-only">{title}</SheetPrimitive.Title>
          <Wordmark />
        </header>

        <nav className="flex flex-1 flex-col overflow-y-auto py-2">
          {entries.map((entry) => (
            <NavLink
              key={entry.to}
              to={entry.to}
              end={entry.end}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  "border-l-2 px-5 py-4 font-display text-2xl font-bold uppercase tracking-[0.03em] transition-colors motion-reduce:transition-none",
                  isActive
                    ? "border-tape bg-mist text-ink"
                    : "border-transparent text-sub hover:text-ink"
                )
              }
            >
              {entry.label}
            </NavLink>
          ))}
        </nav>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onSignOut()
            }}
            className="flex items-center gap-2 text-sm font-semibold text-sub transition-colors hover:text-ink motion-reduce:transition-none"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {signOutLabel}
          </button>
          <ConnectedThemeToggle />
        </footer>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  </SheetPrimitive.Root>
)
