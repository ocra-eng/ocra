import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAppDispatch } from "@/store/hooks"
import { sessionResolved } from "./slice"

/**
 * Single subscription to Supabase auth, mounted once at the app root.
 * Covers the initial page load, the OAuth redirect back, OTP verification,
 * token refresh and sign-out in other tabs.
 */
export const useAuthListener = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data }) => {
      if (active) dispatch(sessionResolved(Boolean(data.session)))
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch(sessionResolved(Boolean(session)))
      }
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [dispatch])
}
