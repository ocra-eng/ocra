import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Link } from "react-router"

import { cn } from "@/lib/utils"
import type { NavLink } from "../model/useHome"

interface NavDropdownProps {
  id: string
  label: string
  items: NavLink[]
}

export const NavDropdown = ({ id, label, items }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  const itemClass =
    "block px-5 py-2.5 text-[15px] font-semibold text-ink hover:bg-mist"

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={id}
        className="flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-[15px] font-semibold text-ink hover:bg-mist"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 transition-transform motion-reduce:transition-none",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        id={id}
        hidden={!isOpen}
        className="absolute left-0 top-full z-50 mt-3 min-w-56 border border-line bg-panel py-2 shadow-lg"
      >
        {items.map((item) =>
          item.isRoute && item.href ? (
            <Link
              key={item.key}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={itemClass}
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.key}
              href={item.href ?? "#"}
              onClick={() => setIsOpen(false)}
              className={itemClass}
            >
              {item.label}
            </a>
          )
        )}
      </div>
    </div>
  )
}
