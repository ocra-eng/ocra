import { cn } from "@ocra/ui"

interface MemberAvatarProps {
  name: string
  photoUrl?: string
  className?: string
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

/**
 * Photo when we have one, initials when we don't — members who sign in with
 * an email code have no Google avatar, so the fallback is the common case,
 * not an edge case.
 */
export const MemberAvatar = ({ name, photoUrl, className }: MemberAvatarProps) => (
  <span
    className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-limestone/25 bg-limestone/10",
      className
    )}
  >
    {photoUrl ? (
      <img
        src={photoUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    ) : (
      <span
        aria-hidden="true"
        className="font-display text-lg font-bold uppercase tracking-[0.03em]"
      >
        {initials(name)}
      </span>
    )}
  </span>
)
