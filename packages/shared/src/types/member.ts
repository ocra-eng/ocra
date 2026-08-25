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
  /** Opaque token the QR encodes; never the sequential member number. */
  verificationToken: string
  type: MembershipType
  status: MembershipStatus
  /** ISO date the current period ends; absent when there is no membership. */
  currentPeriodEnd?: string
}

/**
 * Public verification payload. Carries the photo so the public card matches
 * the member's own — safe because reaching it requires scanning their QR.
 * Never carries the email.
 */
export interface MembershipVerification {
  memberNumber: string
  displayName: string
  photoUrl?: string
  type: MembershipType
  status: MembershipStatus
  currentPeriodEnd?: string
}
