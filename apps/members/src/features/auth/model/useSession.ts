import { useCallback } from "react"
import type { Member } from "@ocra/shared"
import { useGetMeQuery, membersApi } from "@/api/client"
import { supabase } from "@/lib/supabase"
import { useAppDispatch, useAppSelector } from "@/store/hooks"

interface UseSessionResult {
  member: Member | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

export const useSession = (): UseSessionResult => {
  const dispatch = useAppDispatch()
  const status = useAppSelector((state) => state.session.status)
  const isAuthenticated = status === "authenticated"

  // The member row is server state, fetched once the session exists.
  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // Drop cached member data so the next sign-in cannot see the last one's.
    dispatch(membersApi.util.resetApiState())
  }, [dispatch])

  return {
    member: data?.member ?? null,
    isAuthenticated,
    isLoading: status === "loading" || (isAuthenticated && isLoading),
    isAdmin: data?.member.role === "admin",
    signOut,
  }
}
