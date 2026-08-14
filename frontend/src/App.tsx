import { BrowserRouter, Route, Routes } from "react-router"
import { SiteShell } from "@/features/home"
import { LanguageRoute } from "@/features/language"
import { About } from "@/pages/About"
import { Coaching } from "@/pages/Coaching"
import { Home } from "@/pages/Home"

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
