import { Hero, SiteHeader } from "@/features/home"

export const Home = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  )
}
