import { TriskeleMark } from "@/components/brand/TriskeleMark"
import { cn } from "@/lib/utils"

interface WordmarkProps {
  className?: string
}

export const Wordmark = ({ className }: WordmarkProps) => {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <TriskeleMark className="h-10 w-10 shrink-0 md:h-11 md:w-11" />
      <span className="flex flex-col justify-center font-display uppercase leading-none tracking-[0.06em]">
        <span lang="ga" className="text-[15px] font-bold md:text-[17px]">
          OCRA Éireann
        </span>
        <span className="mt-[3px] text-[15px] font-normal md:text-[17px]">
          OCRA Ireland
        </span>
      </span>
    </span>
  )
}
