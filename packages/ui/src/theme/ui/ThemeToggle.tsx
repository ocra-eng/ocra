import { Monitor, Moon, Sun } from "lucide-react"
import type { ThemeMode } from "@ocra/shared"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"

interface ThemeToggleProps {
  mode: ThemeMode
  modes: ThemeMode[]
  onChange: (mode: ThemeMode) => void
  /** Accessible label for the control, e.g. "Theme". */
  label: string
  /** Display label per mode, e.g. { light: "Light", ... }. */
  modeLabels: Record<ThemeMode, string>
  className?: string
}

const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  system: Monitor,
  dark: Moon,
}

/** Presentational: no store, no i18n. See ConnectedThemeToggle to wire both. */
export const ThemeToggle = ({
  mode,
  modes,
  onChange,
  label,
  modeLabels,
  className,
}: ThemeToggleProps) => (
  <Select value={mode} onValueChange={(value) => onChange(value as ThemeMode)}>
    <SelectTrigger aria-label={label} className={className}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {modes.map((value) => {
        const Icon = MODE_ICONS[value]
        return (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{modeLabels[value]}</span>
            </span>
          </SelectItem>
        )
      })}
    </SelectContent>
  </Select>
)
