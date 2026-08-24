import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { useLocalizedPath } from "@/features/language"
import { cn } from "@/lib/utils"
import type { NavLink } from "../model/useHome"
import { useHome } from "../model/useHome"
import { Wordmark } from "./Wordmark"

interface NavDrawerProps {
  isOpen: boolean
  onClose: () => void
  drawerRef: React.RefObject<HTMLElement | null>
}

const rowClass =
  "border-b border-[#1E4433] py-4 font-display text-3xl font-bold uppercase tracking-[0.03em] text-chalk hover:text-[#5FBF87]"

const DrawerLink = ({
  item,
  onClose,
  className,
}: {
  item: NavLink
  onClose: () => void
  className: string
}) =>
  item.isRoute && item.href ? (
    <Link to={item.href} onClick={onClose} className={className}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href ?? "#"} onClick={onClose} className={className}>
      {item.label}
    </a>
  )

export const NavDrawer = ({ isOpen, onClose, drawerRef }: NavDrawerProps) => {
  const { navLinks, joinLabel, menuCloseLabel } = useHome()
  const localize = useLocalizedPath()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="lg:hidden">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-bog-deep/60 transition-opacity duration-300 motion-reduce:transition-none",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        ref={drawerRef as React.RefObject<HTMLElement>}
        id="site-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto bg-bog px-7 pb-8 pt-4 text-chalk",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Wordmark onDark />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={menuCloseLabel}
            className="h-10 w-10 rounded-none text-chalk hover:bg-chalk/10 hover:text-chalk"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 flex flex-col">
          {navLinks.map((item) =>
            item.children ? (
              <div key={item.key} className="border-b border-[#1E4433]">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((open) => (open === item.key ? null : item.key))
                  }
                  aria-expanded={expanded === item.key}
                  aria-controls={`drawer-${item.key}`}
                  className="flex w-full items-center justify-between py-4 font-display text-3xl font-bold uppercase tracking-[0.03em] text-chalk hover:text-[#5FBF87]"
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-6 w-6 transition-transform motion-reduce:transition-none",
                      expanded === item.key && "rotate-180"
                    )}
                  />
                </button>
                <div
                  id={`drawer-${item.key}`}
                  inert={expanded !== item.key}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
                    expanded === item.key ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col pb-4">
                      {item.children.map((child) => (
                        <DrawerLink
                          key={child.key}
                          item={child}
                          onClose={onClose}
                          className="py-2.5 pl-4 text-lg font-semibold text-chalk/85 hover:text-[#5FBF87]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <DrawerLink
                key={item.key}
                item={item}
                onClose={onClose}
                className={rowClass}
              />
            )
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-6 pt-8">
          <Button variant="tape" size="brand" asChild className="w-full">
            <Link to={localize("/membership")} onClick={onClose}>
              {joinLabel}
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  )
}
