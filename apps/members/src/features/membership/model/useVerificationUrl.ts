/**
 * Public verification URL for a membership. Keyed on the opaque token, not
 * the member number: numbers are sequential, so using them would let anyone
 * walk the membership list. Base comes from config, never hardcoded.
 */
export const useVerificationUrl = (verificationToken: string): string => {
  const base = import.meta.env.VITE_PUBLIC_URL ?? window.location.origin
  return `${base.replace(/\/$/, "")}/verify/${verificationToken}`
}
