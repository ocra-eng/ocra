import { Monitor, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { ThemeMode } from "@ocra/shared"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "../model/useTheme"

interface ThemeToggleProps {
  className?: string
}

const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  system: Monitor,
  dark: Moon,
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { mode, modes, setThemeMode } = useTheme()
  const { t } = useTranslation("theme")

  return (
    <Select
      value={mode}
      onValueChange={(value) => setThemeMode(value as ThemeMode)}
    >
      <SelectTrigger aria-label={t("label")} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {modes.map((value) => {
          const Icon = MODE_ICONS[value]
          return (
            <SelectItem key={value} value={value}>
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{t(`modes.${value}`)}</span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
