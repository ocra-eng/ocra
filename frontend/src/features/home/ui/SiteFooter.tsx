import { LanguageSwitcher } from "@/features/language"
import { ThemeToggle } from "@/features/theme"
import { useHome } from "../model/useHome"
import { Wordmark } from "./Wordmark"

export const SiteFooter = () => {
  const { footerRecognition, footerCopyright } = useHome()

  return (
    <footer className="border-t border-line bg-panel text-ink">
      <div className="mx-auto max-w-[1160px] px-5 py-10 md:px-11 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-8">
          <Wordmark />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-9 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
          <p>{footerRecognition}</p>
          <p>{footerCopyright}</p>
        </div>
      </div>
    </footer>
  )
}
