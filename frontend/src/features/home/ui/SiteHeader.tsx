import { Menu } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { useLocalizedPath } from "@/features/language"
import { useHome } from "../model/useHome"
import { useMenu } from "../model/useMenu"
import { NavDrawer } from "./NavDrawer"
import { Wordmark } from "./Wordmark"

export const SiteHeader = () => {
  const { isOpen, toggle, close, toggleRef, drawerRef } = useMenu()
  const { navLinks, joinLabel, menuOpenLabel } = useHome()
  const localize = useLocalizedPath()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel">
      <div className="mx-auto flex max-w-[1160px] items-center gap-2 px-5 py-3 md:px-11 md:py-4">
        <Link to={localize("/")} aria-label="OCRA Ireland home" className="mr-auto">
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
          className="h-10 w-10 rounded-none text-ink md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden md:flex md:items-center md:gap-7">
          {navLinks.map((item) =>
            item.isRoute ? (
              <Link
                key={item.key}
                to={item.href}
                className="text-[15px] font-semibold text-ink hover:text-field"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.key}
                href={item.href}
                className="text-[15px] font-semibold text-ink hover:text-field"
              >
                {item.label}
              </a>
            )
          )}
          <Button variant="tape" size="brand" asChild>
            <a href="#membership">{joinLabel}</a>
          </Button>
        </nav>
      </div>

      <NavDrawer isOpen={isOpen} onClose={close} drawerRef={drawerRef} />
    </header>
  )
}
