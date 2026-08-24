import { cn } from "../utils"
import wordmarkBog from "./assets/wordmark_bog.svg"
import wordmarkWhite from "./assets/wordmark_white.svg"

interface WordmarkProps {
  className?: string
  /** Force the light-on-dark mark instead of following the theme. */
  onDark?: boolean
}

const WIDTH = 1022
const HEIGHT = 292
const SIZE = "h-10 w-auto md:h-11"

export const Wordmark = ({ className, onDark = false }: WordmarkProps) => {
  if (onDark) {
    return (
      <img
        src={wordmarkWhite}
        alt="OCRA Éireann"
        width={WIDTH}
        height={HEIGHT}
        className={cn(SIZE, className)}
      />
    )
  }

  return (
    <span className={cn("flex items-center", className)}>
      <img
        src={wordmarkBog}
        alt="OCRA Éireann"
        width={WIDTH}
        height={HEIGHT}
        className={cn("wordmark-light", SIZE)}
      />
      <img
        src={wordmarkWhite}
        alt=""
        aria-hidden="true"
        width={WIDTH}
        height={HEIGHT}
        className={cn("wordmark-dark", SIZE)}
      />
    </span>
  )
}
