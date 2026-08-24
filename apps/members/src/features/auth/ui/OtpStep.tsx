import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Button } from "@ocra/ui"

interface OtpStepProps {
  email: string
  isBusy: boolean
  error: boolean
  onSubmit: (code: string) => void
  onResend: () => void
  onBack: () => void
}

const CODE_LENGTH = 6

export const OtpStep = ({
  email,
  isBusy,
  error,
  onSubmit,
  onResend,
  onBack,
}: OtpStepProps) => {
  const { t } = useTranslation("auth")
  const [code, setCode] = useState("")

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (code.length === CODE_LENGTH) onSubmit(code)
      }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm leading-relaxed text-sub">
        <Trans
          i18nKey="otp.sentTo"
          ns="auth"
          values={{ email }}
          components={{ strong: <strong className="text-ink" /> }}
        />
      </p>

      <label
        htmlFor="code"
        className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-sub"
      >
        {t("otp.label")}
      </label>
      <input
        id="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        value={code}
        onChange={(event) =>
          setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
        }
        aria-invalid={error}
        autoFocus
        className="w-full border border-line bg-bg px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-ink outline-none focus-visible:border-accent"
      />
      {error && (
        <p role="alert" className="text-sm text-tape">
          {t("otp.error")}
        </p>
      )}

      <Button
        type="submit"
        variant="tape"
        size="brand"
        disabled={isBusy || code.length !== CODE_LENGTH}
      >
        {isBusy ? t("otp.verifying") : t("otp.submit")}
      </Button>

      <div className="mt-2 flex justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-sub underline-offset-4 hover:text-ink hover:underline"
        >
          {t("otp.back")}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={isBusy}
          className="text-sub underline-offset-4 hover:text-ink hover:underline"
        >
          {t("otp.resend")}
        </button>
      </div>
    </form>
  )
}
