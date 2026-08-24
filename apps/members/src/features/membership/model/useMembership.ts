import type { Membership } from "@ocra/shared"
import { useGetMeQuery } from "@/api/client"
import { useAppSelector } from "@/store/hooks"

interface UseMembershipResult {
  membership: Membership | null
  isLoading: boolean
}

/**
 * Membership comes from /me alongside the member, so the card renders from
 * one request. A null membership is a valid answer: they have never joined.
 */
export const useMembership = (): UseMembershipResult => {
  const isAuthenticated = useAppSelector(
    (state) => state.session.status === "authenticated"
  )
  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  })

  return { membership: data?.membership ?? null, isLoading }
}
