import { Navigate, Outlet } from "react-router"
import { useLanguageRoute } from "../model/useLanguageRoute"

export const LanguageRoute = () => {
  const { isValid } = useLanguageRoute()

  if (!isValid) return <Navigate to="/" replace />

  return <Outlet />
}
