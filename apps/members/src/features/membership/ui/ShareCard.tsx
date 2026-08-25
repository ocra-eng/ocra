import { Check, Link2, Share2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useShareCard } from "../model/useShareCard"

interface ShareCardProps {
  url: string
}

/** Share/copy the public card link that the QR encodes. */
export const ShareCard = ({ url }: ShareCardProps) => {
  const { t } = useTranslation("membership")
  const { canShare, state, share } = useShareCard(url, t("share.title"))

  const copied = state === "copied"
  const Icon = copied ? Check : canShare ? Share2 : Link2

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="flex items-center gap-2 border border-line bg-panel px-4 py-2.5 font-display text-sm font-bold uppercase tracking-[0.03em] text-ink transition-colors hover:bg-mist motion-reduce:transition-none"
    >
      <Icon
        className={copied ? "h-4 w-4 text-accent" : "h-4 w-4"}
        aria-hidden="true"
      />
      {copied ? t("share.copied") : canShare ? t("share.share") : t("share.copy")}
    </button>
  )
}
