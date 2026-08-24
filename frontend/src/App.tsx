import { lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { ContentRoute } from "@/features/content"
import { SiteShell } from "@/features/home"
import { LanguageRoute } from "@/features/language"
import { Home } from "@/pages/Home"

// Home stays in the main bundle: it is the landing route and lazy-loading it
// would delay the hero repaint (LCP). Every other page is code-split — hub
// pages via lazy(), content pages via the ContentRoute registry.
const GetInvolved = lazy(() =>
  import("@/pages/GetInvolved").then((m) => ({ default: m.GetInvolved }))
)
const RaceOrganisers = lazy(() =>
  import("@/pages/RaceOrganisers").then((m) => ({ default: m.RaceOrganisers }))
)
const Governance = lazy(() =>
  import("@/pages/Governance").then((m) => ({ default: m.Governance }))
)

const pageRoutes = (
  <>
    <Route path="about" element={<ContentRoute section="about" slug="index" />} />
    <Route path="about/:slug" element={<ContentRoute section="about" />} />
    <Route
      path="coaching"
      element={<ContentRoute section="education" slug="coaching" />}
    />
    <Route
      path="membership"
      element={<ContentRoute section="get-involved" slug="membership" />}
    />
    <Route path="compete/:slug" element={<ContentRoute section="compete" />} />
    <Route path="clubs/:slug" element={<ContentRoute section="clubs" />} />
    <Route path="education/:slug" element={<ContentRoute section="education" />} />
    <Route path="get-involved" element={<GetInvolved />} />
    <Route
      path="get-involved/:slug"
      element={<ContentRoute section="get-involved" />}
    />
    <Route path="governance" element={<Governance />} />
    <Route path="governance/:slug" element={<ContentRoute section="governance" />} />
    <Route path="race-organisers" element={<RaceOrganisers />} />
    <Route
      path="race-organisers/:slug"
      element={<ContentRoute section="race-organisers" />}
    />
  </>
)

export const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<LanguageRoute />}>
          <Route element={<SiteShell />}>
            <Route path="/" element={<Home />} />
            {pageRoutes}
            <Route path=":lang">
              <Route index element={<Home />} />
              {pageRoutes}
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
