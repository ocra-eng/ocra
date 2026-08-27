import { lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { DocPage, allDocs } from "@/features/doc"
import { SiteShell } from "@/features/home"
import { LanguageRoute } from "@/features/language"
import { Home } from "@/pages/Home"

// Home stays in the main bundle: it is the landing route and lazy-loading it
// would delay the hero repaint (LCP). Every other page is a markdown document,
// code-split per page by the doc registry.
// Assets and its subroutes are reachable from the footer only, and are
// noindex — a working reference, not part of the site's navigation.
const Assets = lazy(() =>
  import("@/pages/Assets").then((m) => ({ default: m.Assets }))
)
const Identity = lazy(() =>
  import("@/pages/Identity").then((m) => ({ default: m.Identity }))
)
const Branding = lazy(() =>
  import("@/pages/Branding").then((m) => ({ default: m.Branding }))
)
const Media = lazy(() =>
  import("@/pages/Media").then((m) => ({ default: m.Media }))
)

const pageRoutes = (
  <>
    <Route path="assets" element={<Assets />} />
    <Route path="assets/identity" element={<Identity />} />
    <Route path="assets/branding" element={<Branding />} />
    <Route path="assets/media" element={<Media />} />

    {/* Every other page is a markdown document in docs/content that declares
        its own URL in frontmatter. The route table is derived from those, so
        moving a page means editing its `url` and nothing else. Relative paths,
        because these are nested under the optional :lang segment. */}
    {allDocs.map((doc) => (
      <Route
        key={doc.url}
        path={doc.url.replace(/^\//, "")}
        element={<DocPage />}
      />
    ))}
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
