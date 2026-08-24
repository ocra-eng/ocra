/**
 * Public verification URL for a member number. Derived from config, never
 * hardcoded — the v1 app pinned members.ocra.ie into the QR and broke on
 * every other environment.
 */
export const useVerificationUrl = (memberNumber: string): string => {
  const base = import.meta.env.VITE_PUBLIC_URL ?? window.location.origin
  return `${base.replace(/\/$/, "")}/verify/${memberNumber}`
}
