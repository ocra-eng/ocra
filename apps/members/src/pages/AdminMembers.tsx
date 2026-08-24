import { useTranslation } from "react-i18next"

export const AdminMembers = () => {
  const { t } = useTranslation("shell")

  return (
    <div className="mx-auto max-w-[960px] px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">
        {t("nav.admin")}
        <span className="text-tape">.</span>
      </h1>
      <p className="mt-4 text-sub">{t("adminPlaceholder")}</p>
    </div>
  )
}
