import { BrowserRouter, Route, Routes } from "react-router"
import { LanguageRoute } from "@/features/language"
import { Home } from "@/pages/Home"

export const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<LanguageRoute />}>
          <Route path="/" element={<Home />} />
          <Route path=":lang" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
