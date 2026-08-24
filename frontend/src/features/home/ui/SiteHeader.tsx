import { Menu } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { useLocalizedPath } from "@/features/language"
import { useHome } from "../model/useHome"
import { useMenu } from "../model/useMenu"
import { NavDrawer } from "./NavDrawer"
import { NavDropdown } from "./NavDropdown"
import { Wordmark } from "./Wordmark"

export const SiteHeader = () => {
  const { isOpen, toggle, close, toggleRef, drawerRef } = useMenu()
  const { navLinks, joinLabel, menuOpenLabel } = useHome()
  const localize = useLocalizedPath()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel">
      <div className="mx-auto flex max-w-[1160px] items-center gap-2 px-5 py-3 md:px-11 md:py-4">
        <Link to={localize("/")} aria-label="OCRA ÉIREANN home" className="mr-auto">
          <Wordmark />
        </Link>

        <Button
          ref={toggleRef}
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls="site-nav"
          aria-label={menuOpenLabel}
          className="h-10 w-10 rounded-none text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden lg:flex lg:items-center lg:gap-2 xl:gap-4">
          {navLinks.map((item) =>
            item.children ? (
              <NavDropdown
                key={item.key}
                id={`nav-${item.key}`}
                label={item.label}
                items={item.children}
              />
            ) : item.isRoute && item.href ? (
              <Link
                key={item.key}
                to={item.href}
                className="rounded-sm px-2.5 py-1.5 text-[15px] font-semibold text-ink hover:bg-mist"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.key}
                href={item.href ?? "#"}
                className="rounded-sm px-2.5 py-1.5 text-[15px] font-semibold text-ink hover:bg-mist"
              >
                {item.label}
              </a>
            )
          )}
          <Button variant="tape" size="brand" asChild>
            <Link to={localize("/membership")}>{joinLabel}</Link>
          </Button>
        </nav>
      </div>

      <NavDrawer isOpen={isOpen} onClose={close} drawerRef={drawerRef} />
    </header>
  )
}
