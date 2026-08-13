import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Wordmark } from "./Wordmark"
import { NAV_ITEMS } from "../constants"

interface NavDrawerProps {
  isOpen: boolean
  onClose: () => void
  drawerRef: React.RefObject<HTMLElement | null>
}

export const NavDrawer = ({ isOpen, onClose, drawerRef }: NavDrawerProps) => {
  return (
    <div className="md:hidden">
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
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-bog px-7 pb-8 pt-4 text-chalk",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Wordmark className="text-chalk" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close menu"
            className="h-10 w-10 rounded-none text-chalk hover:bg-chalk/10 hover:text-chalk"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 flex flex-col">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="border-b border-[#1E4433] py-4 font-display text-3xl font-bold uppercase tracking-[0.03em] text-chalk hover:text-[#5FBF87]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-6">
          <Button variant="tape" size="brand" asChild className="w-full">
            <a href="#membership" onClick={onClose}>
              Join
            </a>
          </Button>
        </div>
      </aside>
    </div>
  )
}
