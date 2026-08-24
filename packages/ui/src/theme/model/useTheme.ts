import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { ThemeMode } from "@ocra/shared"
import { THEME_MODES, THEME_STORAGE_KEY } from "../constants"
import { setMode, type ThemeState } from "./slice"

/** Minimal store shape this hook needs: mount themeReducer under `theme`. */
export interface WithThemeState {
  theme: ThemeState
}

interface UseThemeResult {
  mode: ThemeMode
  modes: ThemeMode[]
  setThemeMode: (mode: ThemeMode) => void
}

export const useTheme = (): UseThemeResult => {
  const mode = useSelector((state: WithThemeState) => state.theme.mode)
  const dispatch = useDispatch()

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
