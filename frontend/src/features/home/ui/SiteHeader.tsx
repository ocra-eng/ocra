import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "../constants"
import { useMenu } from "../model/useMenu"
import { NavDrawer } from "./NavDrawer"
import { Wordmark } from "./Wordmark"

export const SiteHeader = () => {
  const { isOpen, toggle, close, toggleRef, drawerRef } = useMenu()

  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-[1160px] items-center gap-3.5 px-5 py-3 md:px-11 md:py-4">
        <a href="/" aria-label="OCRA Ireland home" className="mr-auto">
          <Wordmark />
        </a>

        <Button
          ref={toggleRef}
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls="site-nav"
          aria-label="Open menu"
          className="h-10 w-10 rounded-none text-ink md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden md:flex md:items-center md:gap-7">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[15px] font-semibold text-ink hover:text-field"
            >
              {item.label}
            </a>
          ))}
          <Button variant="tape" size="brand" asChild>
            <a href="#membership">Join</a>
          </Button>
        </nav>
      </div>

      <NavDrawer isOpen={isOpen} onClose={close} drawerRef={drawerRef} />
    </header>
  )
}
