import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@ocra/ui"
import { GoogleMark } from "./GoogleMark"

interface EmailStepProps {
  isBusy: boolean
  error: boolean
  onSubmit: (email: string) => void
  onGoogle: () => void
}

export const EmailStep = ({
  isBusy,
  error,
  onSubmit,
  onGoogle,
}: EmailStepProps) => {
  const { t } = useTranslation("auth")
  const [email, setEmail] = useState("")

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (email.trim()) onSubmit(email.trim())
        }}
        className="flex flex-col gap-3"
      >
        <label
          htmlFor="email"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub"
        >
          {t("email.label")}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("email.placeholder")}
          aria-invalid={error}
          className="w-full border border-line bg-bg px-4 py-3 text-ink outline-none focus-visible:border-accent"
        />
        {error && (
          <p role="alert" className="text-sm text-tape">
            {t("email.error")}
          </p>
        )}
        <Button type="submit" variant="tape" size="brand" disabled={isBusy}>
          {isBusy ? t("email.sending") : t("email.submit")}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
          {t("or")}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-3 border border-line bg-panel px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.03em] text-ink transition-colors hover:bg-mist disabled:opacity-60 motion-reduce:transition-none"
      >
        <GoogleMark className="h-5 w-5" />
        {t("google")}
      </button>
    </>
  )
}
