import { useTranslation } from "react-i18next"
import { Wordmark } from "@ocra/ui"
import { OTP_LENGTH } from "../constants"
import { useLogin } from "../model/useLogin"
import { EmailStep } from "./EmailStep"
import { OtpStep } from "./OtpStep"

/** Composes the login hook with the two presentational steps. */
export const LoginPanel = () => {
  const { t } = useTranslation("auth")
  const {
    status,
    email,
    isBusy,
    error,
    sendCode,
    verifyCode,
    resend,
    restart,
    signInWithGoogle,
  } = useLogin()

  const awaitingCode = status === "otp-sent"

  return (
    <div className="mx-auto w-full max-w-[420px] px-5 py-14">
      <Wordmark className="mb-10" />

      <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95]">
        {awaitingCode ? t("otp.title") : t("email.title")}
        <span className="text-tape">.</span>
      </h1>
      <p className="mb-8 mt-3 text-sub">
        {awaitingCode
          ? t("otp.intro")
          : t("email.intro", { length: OTP_LENGTH })}
      </p>

      {awaitingCode ? (
        <OtpStep
          email={email}
          isBusy={isBusy}
          error={error === "invalid-code"}
          onSubmit={verifyCode}
          onResend={resend}
          onBack={restart}
        />
      ) : (
        <EmailStep
          isBusy={isBusy}
          error={error === "send-failed"}
          onSubmit={sendCode}
          onGoogle={signInWithGoogle}
        />
      )}
    </div>
  )
}
