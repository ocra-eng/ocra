import type { ReactNode } from "react"
import { cn } from "@ocra/ui"

interface ActionBarProps {
  label: string
  /** Contextual actions for the current page. */
  children?: ReactNode
  trailing?: ReactNode
  className?: string
}

/**
 * Persistent bottom bar. Mobile only — desktop uses the header nav.
 * Height is published as --bar-h so the nav sheet can stop above it.
 */
export const ActionBar = ({
  label,
  children,
  trailing,
  className,
}: ActionBarProps) => (
  <div
    className={cn(
      "fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-panel/95 backdrop-blur lg:hidden",
      "pb-[env(safe-area-inset-bottom)]",
      className
    )}
  >
    <div
      role="toolbar"
      aria-label={label}
      className="mx-auto flex h-[var(--bar-h)] w-full max-w-[720px] items-center gap-1 px-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">{children}</div>
      {trailing !== undefined && (
        <div className="flex shrink-0 items-center">{trailing}</div>
      )}
    </div>
  </div>
)
