import { lazy } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import { SiteShell } from "@/features/home"
import { LanguageRoute } from "@/features/language"
import { Home } from "@/pages/Home"

// Home stays in the main bundle: it is the landing route and lazy-loading it
// would delay the hero repaint (LCP). Every other page is code-split.
const About = lazy(() =>
  import("@/pages/About").then((m) => ({ default: m.About }))
)
const Coaching = lazy(() =>
  import("@/pages/Coaching").then((m) => ({ default: m.Coaching }))
)

export const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<LanguageRoute />}>
          <Route element={<SiteShell />}>
            <Route path="/" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="coaching" element={<Coaching />} />
            <Route path=":lang">
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="coaching" element={<Coaching />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
