import { cn } from "@/lib/utils"

interface WordmarkProps {
  className?: string
  onDark?: boolean
}

const BRAND_BASE = `${import.meta.env.BASE_URL}brand/`
const WORDMARK_WIDTH = 1022
const WORDMARK_HEIGHT = 292

export const Wordmark = ({ className, onDark = false }: WordmarkProps) => {
  if (onDark) {
    return (
      <img
        src={`${BRAND_BASE}wordmark_white.svg`}
        alt="OCRA Éireann"
        width={WORDMARK_WIDTH}
        height={WORDMARK_HEIGHT}
        className={cn("h-10 w-auto md:h-11", className)}
      />
    )
  }

  return (
    <span className={cn("flex items-center", className)}>
      <img
        src={`${BRAND_BASE}wordmark_bog.svg`}
        alt="OCRA Éireann"
        width={WORDMARK_WIDTH}
        height={WORDMARK_HEIGHT}
        className="wordmark-light h-10 w-auto md:h-11"
      />
      <img
        src={`${BRAND_BASE}wordmark_white.svg`}
        alt=""
        aria-hidden="true"
        width={WORDMARK_WIDTH}
        height={WORDMARK_HEIGHT}
        className="wordmark-dark h-10 w-auto md:h-11"
      />
    </span>
  )
}
