interface SocialIconProps {
  className?: string
}

export const FacebookIcon = ({ className }: SocialIconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M14.5 8.5H17V5h-2.5C12 5 10 7 10 9.5V11H7.5v3.5H10V21h3.5v-6.5h2.6l.4-3.5h-3V9.5c0-.6.4-1 1-1Z" />
  </svg>
)

export const InstagramIcon = ({ className }: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.5" fill="currentColor" />
  </svg>
)
