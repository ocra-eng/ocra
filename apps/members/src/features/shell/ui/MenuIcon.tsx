import { cn } from "@ocra/ui"

interface MenuIconProps {
  open: boolean
  className?: string
}

/** Two bars that cross into an X when the nav sheet is open. */
export const MenuIcon = ({ open, className }: MenuIconProps) => (
  <span
    aria-hidden="true"
    className={cn("relative block h-4 w-5", className)}
  >
    <span
      className={cn(
        "absolute left-0 block h-0.5 w-full bg-current transition-transform duration-200 motion-reduce:transition-none",
        open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"
      )}
    />
    <span
      className={cn(
        "absolute left-0 block h-0.5 w-full bg-current transition-transform duration-200 motion-reduce:transition-none",
        open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"
      )}
    />
  </span>
)
