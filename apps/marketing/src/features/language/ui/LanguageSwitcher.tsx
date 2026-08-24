import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ocra/ui"
import { useLanguage } from "../model/useLanguage"
import { LanguageFlag } from "./LanguageFlag"

interface LanguageSwitcherProps {
  className?: string
}

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { current, released, isSwitcherVisible, setLanguage } = useLanguage()

  if (!isSwitcherVisible) return null

  return (
    <Select value={current} onValueChange={setLanguage}>
      <SelectTrigger aria-label="Language" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {released.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="flex items-center gap-2">
              <LanguageFlag code={language.code} />
              <span>{language.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
