import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type {
  Member,
  Membership,
  MembershipVerification,
} from "@ocra/shared"
import { supabase } from "@/lib/supabase"

export interface MeResponse {
  member: Member
  membership: Membership | null
}

export type AdminFilter = "active" | "expired" | "none" | "all"

export interface AdminMemberRow {
  id: string
  email: string
  displayName: string
  photoUrl?: string
  role: "member" | "admin"
  createdAt: string
  membership: {
    memberNumber: string
    verificationToken: string
    type: "athlete" | "organisation"
    status: "active" | "expired" | "pending"
    currentPeriodEnd?: string
  } | null
}

export interface AdminMembersResponse {
  filter: AdminFilter
  members: AdminMemberRow[]
  counts: Record<AdminFilter, number>
}

export interface HealthResponse {
  status: "ok" | "degraded"
  api: string
  database: string
  billing: "ok" | "disabled"
}

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

export const membersApi = createApi({
  reducerPath: "membersApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers) => {
      // getSession refreshes the token when it is close to expiring, so the
      // API never sees an expired one under normal use.
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) headers.set("authorization", `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/health",
    }),
    getMe: builder.query<MeResponse, void>({
      query: () => "/me",
      providesTags: ["Me"],
    }),
    updateProfile: builder.mutation<{ profileName?: string }, { profileName: string }>({
      query: (body) => ({ url: "/me", method: "PATCH", body }),
      invalidatesTags: ["Me"],
    }),
    getVerification: builder.query<MembershipVerification, string>({
      query: (memberNumber) => `/verify/${memberNumber}`,
    }),
    createCheckoutSession: builder.mutation<{ url: string }, void>({
      query: () => ({ url: "/billing/checkout-session", method: "POST" }),
    }),
    createPortalSession: builder.mutation<{ url: string }, void>({
      query: () => ({ url: "/billing/portal-session", method: "POST" }),
    }),
    getAdminMembers: builder.query<AdminMembersResponse, AdminFilter>({
      query: (status) => `/admin/members?status=${status}`,
    }),
  }),
})

export const {
  useGetHealthQuery,
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetVerificationQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  useGetAdminMembersQuery,
} = membersApi
