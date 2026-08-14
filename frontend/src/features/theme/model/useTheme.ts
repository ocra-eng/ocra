import { useCallback, useEffect } from "react"
import type { ThemeMode } from "@ocra/shared"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { THEME_MODES, THEME_STORAGE_KEY } from "../constants"
import { setMode } from "./slice"

interface UseThemeResult {
  mode: ThemeMode
  modes: ThemeMode[]
  setThemeMode: (mode: ThemeMode) => void
}

export const useTheme = (): UseThemeResult => {
  const mode = useAppSelector((state) => state.theme.mode)
  const dispatch = useAppDispatch()

  const setThemeMode = useCallback(
    (next: ThemeMode) => dispatch(setMode(next)),
    [dispatch]
  )

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
    if (mode === "system") {
      document.documentElement.removeAttribute("data-theme")
    } else {
      document.documentElement.setAttribute("data-theme", mode)
    }
  }, [mode])

  return { mode, modes: THEME_MODES, setThemeMode }
}
