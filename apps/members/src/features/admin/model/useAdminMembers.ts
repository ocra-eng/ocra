import { useMemo, useState } from "react"
import type { AdminFilter, AdminMemberRow } from "@/api/client"
import { useGetAdminMembersQuery } from "@/api/client"

interface UseAdminMembersResult {
  filter: AdminFilter
  setFilter: (filter: AdminFilter) => void
  search: string
  setSearch: (term: string) => void
  members: AdminMemberRow[]
  counts?: Record<AdminFilter, number>
  isLoading: boolean
  isError: boolean
}

const matchesSearch = (member: AdminMemberRow, term: string) => {
  const haystack = [
    member.displayName,
    member.email,
    member.membership?.memberNumber ?? "",
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(term)
}

/**
 * Filtering happens on the server (it decides what "member" means);
 * searching happens here, because the list is small and instant feedback
 * beats a round trip.
 */
export const useAdminMembers = (): UseAdminMembersResult => {
  const [filter, setFilter] = useState<AdminFilter>("active")
  const [search, setSearch] = useState("")
  const { data, isLoading, isError } = useGetAdminMembersQuery(filter)

  const members = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return data?.members ?? []
    return (data?.members ?? []).filter((member) => matchesSearch(member, term))
  }, [data?.members, search])

  return {
    filter,
    setFilter,
    search,
    setSearch,
    members,
    counts: data?.counts,
    isLoading,
    isError,
  }
}
