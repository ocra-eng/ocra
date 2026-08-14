import { cn } from "@/lib/utils"
import { RECOGNITION_LOGOS } from "../constants"
import { useHome } from "../model/useHome"

export const RecognitionStrip = () => {
  const { recognitionLabel } = useHome()

  return (
    <section className="border-b border-line">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-x-9 gap-y-4 px-5 py-5 md:px-11">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sub">
          {recognitionLabel}
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
          {RECOGNITION_LOGOS.map((logo) => (
            <img
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className={cn(
                logo.inverse ? "logo-mark-inverse" : "logo-mark",
                logo.tall ? "h-9" : "h-7",
                "w-auto"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
