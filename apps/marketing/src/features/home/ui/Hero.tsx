import { Button } from "@ocra/ui"
import { useHome } from "../model/useHome"
import { PhotoSlot } from "./PhotoSlot"

export const Hero = () => {
  const { org, hero } = useHome()

  return (
    <section className="bg-bg text-ink">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-stretch gap-8 px-5 py-14 md:gap-14 md:px-11 md:py-24">
        <div className="flex min-w-0 flex-1 basis-[460px] flex-col justify-center">
          <h1 className="font-display text-[clamp(46px,11vw,104px)] font-extrabold uppercase leading-[0.92]">
            {hero.statementLines[0]}
            <br />
            {hero.statementLines[1]}
            <span className="text-tape">.</span>
          </h1>
          <p className="mt-5 max-w-[44ch] text-lg text-sub md:text-[22px] md:leading-relaxed">
            {hero.support}
          </p>
          <p
            lang="ga"
            className="mt-7 font-mono text-[11px] uppercase tracking-[0.22em] text-accent"
          >
            {org.fullNameGa}
          </p>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-sub">
            {org.fullName}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button
              variant="tape"
              size="brand"
              asChild
              className="w-full sm:w-auto"
            >
              <a href="#membership">{hero.ctaLabel}</a>
            </Button>
            <span className="text-[13px] text-sub">{hero.ctaNote}</span>
          </div>
        </div>
        <PhotoSlot />
      </div>
      <div className="tape-stripe" aria-hidden="true" />
    </section>
  )
}
