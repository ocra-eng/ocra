import { Mail } from "lucide-react"
import { Link } from "react-router"
import { LanguageSwitcher } from "@/features/language"
import { ThemeToggle } from "@/features/theme"
import { CONTACT_EMAIL, SOCIAL_LINKS } from "../constants"
import type { NavLink } from "../model/useHome"
import { useHome } from "../model/useHome"
import { FacebookIcon, InstagramIcon } from "./SocialIcons"
import { Wordmark } from "./Wordmark"

const SOCIAL_ICONS: Record<string, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
}

const FooterLink = ({ item, className }: { item: NavLink; className: string }) =>
  item.isRoute && item.href ? (
    <Link to={item.href} className={className}>
      {item.label}
    </Link>
  ) : (
    <a href={item.href ?? "#"} className={className}>
      {item.label}
    </a>
  )

export const SiteFooter = () => {
  const { footerColumns, footerMetaLinks, footerRecognition, footerCopyright } =
    useHome()

  return (
    <footer className="border-t border-line bg-panel text-ink">
      <div className="mx-auto max-w-[1160px] px-5 py-10 md:px-11 md:py-12">
        <nav
          aria-label="Sitemap"
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4"
        >
          {footerColumns.map((column) => (
            <div key={column.key}>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
                {column.heading}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item.key}>
                    <FooterLink
                      item={item}
                      className="-mx-1.5 rounded-sm px-1.5 py-0.5 text-sm font-medium text-ink hover:bg-mist hover:underline"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6">
          {footerMetaLinks.map((item) => (
            <FooterLink
              key={item.key}
              item={item}
              className="-mx-1.5 rounded-sm px-1.5 py-0.5 text-sm font-medium text-sub hover:bg-mist hover:text-ink hover:underline"
            />
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-x-6 gap-y-8">
          <Wordmark />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICONS[social.key]
                return (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.key}
                    className="flex h-9 w-9 items-center justify-center rounded-sm text-sub hover:bg-mist hover:text-ink"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                )
              })}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label={CONTACT_EMAIL}
                className="flex h-9 w-9 items-center justify-center rounded-sm text-sub hover:bg-mist hover:text-ink"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="mt-9 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
          <p>{footerRecognition}</p>
          <p>{footerCopyright}</p>
        </div>
      </div>
    </footer>
  )
}
