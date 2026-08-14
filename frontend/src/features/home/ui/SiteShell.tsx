import { Outlet } from "react-router"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"

export const SiteShell = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
