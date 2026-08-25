import { BrowserRouter, Route, Routes } from "react-router"
import { RequireAuth, useAuthListener } from "@/features/auth"
import { AppShell, useSplash } from "@/features/shell"
import { AdminMembers } from "@/pages/AdminMembers"
import { Card } from "@/pages/Card"
import { Login } from "@/pages/Login"
import { Membership } from "@/pages/Membership"
import { Verify } from "@/pages/Verify"

export const App = () => {
  useSplash()
  useAuthListener()

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:token" element={<Verify />} />

        {/* Members */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Card />} />
            <Route path="/membership" element={<Membership />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RequireAuth adminOnly />}>
          {/* fill: the admin list owns its own scrolling */}
          <Route element={<AppShell fill />}>
            <Route path="/admin/members" element={<AdminMembers />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
