import { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Button } from "@ocra/ui"
import { OTP_LENGTH } from "../constants"
import { OtpInput } from "./OtpInput"

interface OtpStepProps {
  email: string
  isBusy: boolean
  error: boolean
  onSubmit: (code: string) => void
  onResend: () => void
  onBack: () => void
}

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
        if (code.length === OTP_LENGTH) onSubmit(code)
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

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
        {t("otp.label", { length: OTP_LENGTH })}
      </p>
      <OtpInput
        length={OTP_LENGTH}
        value={code}
        onChange={setCode}
        // Filling the last box is the member's intent; make them press
        // nothing extra.
        onComplete={onSubmit}
        invalid={error}
        disabled={isBusy}
        label={t("otp.label", { length: OTP_LENGTH })}
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
        disabled={isBusy || code.length !== OTP_LENGTH}
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
