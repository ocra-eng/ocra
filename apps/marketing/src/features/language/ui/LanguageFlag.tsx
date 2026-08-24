import { cn } from "@ocra/ui"

interface FlagProps {
  className?: string
}

interface LanguageFlagProps {
  code: string
  className?: string
}

const FLAG_CLASS = "h-[15px] w-5 shrink-0 border border-line"

const IrishFlag = ({ className }: FlagProps) => (
  <svg viewBox="0 0 20 15" className={cn(FLAG_CLASS, className)} aria-hidden="true">
    <rect width="20" height="15" fill="#ffffff" />
    <rect width="6.67" height="15" fill="#169b62" />
    <rect x="13.33" width="6.67" height="15" fill="#ff883e" />
  </svg>
)

const PolishFlag = ({ className }: FlagProps) => (
  <svg viewBox="0 0 20 15" className={cn(FLAG_CLASS, className)} aria-hidden="true">
    <rect width="20" height="15" fill="#ffffff" />
    <rect y="7.5" width="20" height="7.5" fill="#dc143c" />
  </svg>
)

const RussianFlag = ({ className }: FlagProps) => (
  <svg viewBox="0 0 20 15" className={cn(FLAG_CLASS, className)} aria-hidden="true">
    <rect width="20" height="15" fill="#ffffff" />
    <rect y="5" width="20" height="5" fill="#0039a6" />
    <rect y="10" width="20" height="5" fill="#d52b1e" />
  </svg>
)

const BelarusianFlag = ({ className }: FlagProps) => (
  <svg viewBox="0 0 20 15" className={cn(FLAG_CLASS, className)} aria-hidden="true">
    <rect width="20" height="15" fill="#ce1720" />
    <rect y="10" width="20" height="5" fill="#007c30" />
    <rect width="2.5" height="15" fill="#ffffff" />
    <path
      d="M1.25 1.2 L1.9 2.2 L1.25 3.2 L0.6 2.2 Z M1.25 5.2 L1.9 6.2 L1.25 7.2 L0.6 6.2 Z M1.25 9.2 L1.9 10.2 L1.25 11.2 L0.6 10.2 Z M1.25 12.8 L1.9 13.8 L1.25 14.8 L0.6 13.8 Z"
      fill="#ce1720"
    />
  </svg>
)

export const LanguageFlag = ({ code, className }: LanguageFlagProps) => {
  switch (code) {
    case "en":
    case "ga":
      return <IrishFlag className={className} />
    case "pl":
      return <PolishFlag className={className} />
    case "ru":
      return <RussianFlag className={className} />
    case "be":
      return <BelarusianFlag className={className} />
    default:
      return null
  }
}
