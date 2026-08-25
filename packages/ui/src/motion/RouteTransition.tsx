import { useEffect, type ReactNode } from "react"
import { useLocation } from "react-router"

interface RouteTransitionProps {
  children: ReactNode
  /** Skip the scroll reset when the surrounding layout handles it. */
  preserveScroll?: boolean
  className?: string
}

/**
 * Softens route changes: resets scroll to the top and fades the new page in.
 *
 * The scroll reset is the important half — without it a navigation from
 * halfway down a long page lands halfway down the next one, which reads as
 * a jump rather than a page change.
 *
 * Keying on pathname remounts the subtree so the animation replays on every
 * navigation; page-level components hold no state worth preserving.
 */
export const RouteTransition = ({
  children,
  preserveScroll = false,
  className,
}: RouteTransitionProps) => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!preserveScroll) window.scrollTo(0, 0)
  }, [pathname, preserveScroll])

  return (
    <div
      key={pathname}
      className={className ? `route-enter ${className}` : "route-enter"}
    >
      {children}
    </div>
  )
}
