import { useCallback, useEffect, useRef, useState } from "react"

interface UseMenuResult {
  isOpen: boolean
  toggle: () => void
  close: () => void
  toggleRef: React.RefObject<HTMLButtonElement | null>
  drawerRef: React.RefObject<HTMLElement | null>
}

const FOCUSABLE = "a[href], button:not([disabled])"

export const useMenu = (): UseMenuResult => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const drawerRef = useRef<HTMLElement | null>(null)

  const toggle = useCallback(() => setIsOpen((open) => !open), [])
  const close = useCallback(() => setIsOpen(false), [])
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
        return
      }
      if (event.key !== "Tab" || !drawerRef.current) return

      const focusable =
        drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, close])
  useEffect(() => {
    if (!isOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])
  useEffect(() => {
    if (isOpen) {
      const first = drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    } else {
      toggleRef.current?.focus()
    }
  }, [isOpen])

  return { isOpen, toggle, close, toggleRef, drawerRef }
}
