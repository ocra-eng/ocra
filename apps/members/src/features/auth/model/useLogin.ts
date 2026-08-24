import { useCallback, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { loginRestarted, otpRequested } from "./slice"

type LoginError = "send-failed" | "invalid-code" | "google-failed" | null

interface UseLoginResult {
  status: "loading" | "anonymous" | "otp-sent" | "authenticated"
  email: string
  isBusy: boolean
  error: LoginError
  sendCode: (email: string) => Promise<void>
  verifyCode: (code: string) => Promise<void>
  resend: () => Promise<void>
  restart: () => void
  signInWithGoogle: () => Promise<void>
}

/**
 * Passwordless sign-in against Supabase. shouldCreateUser is left on: an
 * account costs nothing and grants nothing — membership is what matters,
 * and that comes from Stripe.
 */
export const useLogin = (): UseLoginResult => {
  const dispatch = useAppDispatch()
  const { status, pendingEmail } = useAppSelector((state) => state.session)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<LoginError>(null)

  const sendCode = useCallback(
    async (email: string) => {
      setIsBusy(true)
      setError(null)
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      setIsBusy(false)
      if (sendError) {
        setError("send-failed")
        return
      }
      dispatch(otpRequested(email))
    },
    [dispatch]
  )

  const verifyCode = useCallback(
    async (code: string) => {
      if (!pendingEmail) return
      setIsBusy(true)
      setError(null)
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: code,
        type: "email",
      })
      setIsBusy(false)
      // The auth listener flips status on success.
      if (verifyError) setError("invalid-code")
    },
    [pendingEmail]
  )

  const resend = useCallback(async () => {
    if (pendingEmail) await sendCode(pendingEmail)
  }, [pendingEmail, sendCode])

  const restart = useCallback(() => {
    setError(null)
    dispatch(loginRestarted())
  }, [dispatch])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    })
    if (oauthError) setError("google-failed")
  }, [])

  return {
    status,
    email: pendingEmail ?? "",
    isBusy,
    error,
    sendCode,
    verifyCode,
    resend,
    restart,
    signInWithGoogle,
  }
}
