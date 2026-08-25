import { Suspense } from "react"
import { Outlet } from "react-router"
import { RouteTransition } from "@ocra/ui"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"

export const SiteShell = () => {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={null}>
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
