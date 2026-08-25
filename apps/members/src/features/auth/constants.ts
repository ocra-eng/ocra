/**
 * Must match Supabase's "Email OTP Length"
 * (Authentication → Sign In / Providers → Email). If the two disagree the
 * code field either truncates a valid code or refuses to submit it.
 */
export const OTP_LENGTH = 8
