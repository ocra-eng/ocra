export type MemberRole = "member" | "admin"

export type MembershipType = "athlete" | "organisation"

/** Mirrors Stripe subscription lifecycle, narrowed to what the UI needs. */
export type MembershipStatus = "active" | "expired" | "pending" | "none"

export interface Member {
  id: string
  email: string
  displayName: string
  profileName?: string
  photoUrl?: string
  role: MemberRole
  createdAt: string
}

export interface Membership {
  memberNumber: string
  type: MembershipType
  status: MembershipStatus
  /** ISO date the current period ends; absent when there is no membership. */
  currentPeriodEnd?: string
}

/** Public verification payload — deliberately excludes email and photo. */
export interface MembershipVerification {
  memberNumber: string
  displayName: string
  type: MembershipType
  status: MembershipStatus
  currentPeriodEnd?: string
}
