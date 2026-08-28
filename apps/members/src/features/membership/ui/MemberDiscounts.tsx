import { useTranslation } from "react-i18next"
import type { PartnerOffer } from "@ocra/shared"

/** Partner discounts, one card each. The offers come from GET /me/offers,
 *  which only answers an active member — nothing here decides eligibility.
 *  The logo is looked up by the offer's key and dropped if we have none. */
export const MemberDiscounts = ({ offers }: { offers: PartnerOffer[] }) => {
  const { t } = useTranslation("membership")

  return (
    <section aria-labelledby="member-discounts">
      <h2
        id="member-discounts"
        className="font-display text-2xl font-bold uppercase tracking-[0.03em]"
      >
        {t("discounts.title")}
      </h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-sub">
        {t("discounts.intro")}
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {offers.map((offer) => (
          <li key={offer.key} className="flex flex-col border border-line bg-panel">
            <div className="flex justify-center border-b border-line bg-white p-5 empty:hidden">
              <img
                src={`${import.meta.env.BASE_URL}img/partners/${offer.key}.jpeg`}
                alt={offer.name}
                loading="lazy"
                decoding="async"
                className="h-24 w-auto object-contain"
                onError={(event) => event.currentTarget.remove()}
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
                {t("discounts.off", { percent: offer.percent })}
              </p>
              <p className="mt-1 font-display text-xl font-bold uppercase tracking-[0.03em]">
                {offer.name}
              </p>
              {offer.code ? (
                <p className="mt-3 text-sm leading-relaxed">
                  {t("discounts.useCode")}{" "}
                  <code className="select-all border border-line bg-mist px-1.5 py-0.5 font-mono text-[0.95em]">
                    {offer.code}
                  </code>
                </p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-sub">
                  {t("discounts.linkApplies")}
                </p>
              )}
              <a
                href={offer.shopUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-auto pt-4 text-sm font-semibold text-accent underline underline-offset-4"
              >
                {t("discounts.openShop", { name: offer.name })}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
