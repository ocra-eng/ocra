import { Navigate } from "react-router"
import { LoginPanel, useSession } from "@/features/auth"

export const Login = () => {
  const { isAuthenticated } = useSession()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <LoginPanel />
    </div>
  )
}
