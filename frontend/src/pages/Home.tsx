import { Hero, RecognitionStrip, SiteFooter, SiteHeader } from "@/features/home"

export const Home = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <RecognitionStrip />
      </main>
      <SiteFooter />
    </div>
  )
}
