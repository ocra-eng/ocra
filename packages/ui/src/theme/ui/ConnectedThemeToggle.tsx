import { useTranslation } from "react-i18next"
import type { ThemeMode } from "@ocra/shared"

import { useTheme } from "../model/useTheme"
import { ThemeToggle } from "./ThemeToggle"

interface ConnectedThemeToggleProps {
  className?: string
}

/**
 * Convenience wiring of useTheme + the "theme" i18n namespace to the
 * presentational toggle. Apps that need different plumbing can compose
 * useTheme and ThemeToggle themselves.
 */
export const ConnectedThemeToggle = ({
  className,
}: ConnectedThemeToggleProps) => {
  const { mode, modes, setThemeMode } = useTheme()
  const { t } = useTranslation("theme")

  const modeLabels = Object.fromEntries(
    modes.map((value) => [value, t(`modes.${value}`)])
  ) as Record<ThemeMode, string>

  return (
    <ThemeToggle
      mode={mode}
      modes={modes}
      onChange={setThemeMode}
      label={t("label")}
      modeLabels={modeLabels}
      className={className}
    />
  )
}
