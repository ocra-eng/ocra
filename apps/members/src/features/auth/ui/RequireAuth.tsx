import { Navigate, Outlet, useLocation } from "react-router"
import { useSession } from "../model/useSession"

interface RequireAuthProps {
  /** Restrict to admins as well as authenticated members. */
  adminOnly?: boolean
}

export const RequireAuth = ({ adminOnly = false }: RequireAuthProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useSession()
  const location = useLocation()

  // Supabase restores the session asynchronously; redirecting before it
  // resolves would bounce a signed-in member to /login on every refresh.
  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
