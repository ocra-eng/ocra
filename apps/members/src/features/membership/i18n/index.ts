export const membershipResources = {
  en: {
    status: {
      active: "Active",
      expired: "Expired",
      pending: "Pending",
      none: "Not a member",
    },
    type: { athlete: "Athlete membership", organisation: "Organisational membership" },
    card: {
      title: "My card",
      number: "Member number",
      validUntil: "Valid until",
      qrLabel: "QR code linking to your public membership check",
      scanHint:
        "Show this at registration. Scanning the code confirms your membership without sharing your contact details.",
    },
    empty: {
      none: {
        title: "You're not a member yet",
        body: "Membership covers insurance, national rankings and the Team Ireland pathway.",
        cta: "Join OCRA",
      },
      pending: {
        title: "Payment is being confirmed",
        body: "Your membership will activate as soon as the payment clears. This is usually instant.",
        cta: "Check membership",
      },
      expired: {
        title: "Your membership has expired",
        body: "Renew to get your card back and stay eligible for ranked and qualifying events.",
        cta: "Renew membership",
      },
    },
    manage: {
      title: "Membership",
      renewsOn: "Renews on {{date}}",
      endedOn: "Ended on {{date}}",
      benefits: "What membership covers",
      unavailable: "Payments are not available right now. Try again shortly.",
      manageCta: "Manage membership",
      joinCta: "Join OCRA",
    },
    benefits: {
      insurance: "Insurance cover at sanctioned events",
      rankings: "Eligibility for national rankings",
      pathway: "Access to the Team Ireland qualification pathway",
      discounts: "Member discounts with OCRA partners",
    },
    verify: {
      title: "Membership check",
      validUntil: "Valid until {{date}}",
      notFound: {
        title: "No membership found",
        body: "We couldn't find a membership with the number {{memberNumber}}.",
      },
    },
  },
  ga: {
    status: {
      active: "Gníomhach",
      expired: "As feidhm",
      pending: "Ar feitheamh",
      none: "Gan ballraíocht",
    },
    type: { athlete: "Ballraíocht lúthchleasaí", organisation: "Ballraíocht eagraíochta" },
    card: {
      title: "Mo chárta",
      number: "Uimhir bhaill",
      validUntil: "Bailí go dtí",
      qrLabel: "Cód QR a nascann le do sheiceáil ballraíochta poiblí",
      scanHint:
        "Taispeáin é seo ag an gclárú. Deimhníonn scanadh an chóid do bhallraíocht gan do shonraí teagmhála a roinnt.",
    },
    empty: {
      none: {
        title: "Níl tú i do bhall fós",
        body: "Cuimsíonn ballraíocht árachas, rangú náisiúnta agus conair Fhoireann na hÉireann.",
        cta: "Bí i do bhall",
      },
      pending: {
        title: "Íocaíocht á deimhniú",
        body: "Beidh do bhallraíocht gníomhach chomh luath is a ghlanfaidh an íocaíocht. Bíonn sé seo láithreach de ghnáth.",
        cta: "Seiceáil ballraíocht",
      },
      expired: {
        title: "Tá do bhallraíocht as feidhm",
        body: "Athnuaigh í chun do chárta a fháil ar ais agus fanacht incháilithe d'imeachtaí rangaithe.",
        cta: "Athnuaigh ballraíocht",
      },
    },
    manage: {
      title: "Ballraíocht",
      renewsOn: "Athnuachan ar {{date}}",
      endedOn: "Críochnaithe ar {{date}}",
      benefits: "Cad a chuimsíonn ballraíocht",
      unavailable: "Níl íocaíochtaí ar fáil faoi láthair. Bain triail eile as ar ball.",
      manageCta: "Bainistigh ballraíocht",
      joinCta: "Bí i do bhall",
    },
    benefits: {
      insurance: "Clúdach árachais ag imeachtaí ceadaithe",
      rankings: "Incháilitheacht do rangú náisiúnta",
      pathway: "Rochtain ar chonair cháilithe Fhoireann na hÉireann",
      discounts: "Lascainí ball le comhpháirtithe OCRA",
    },
    verify: {
      title: "Seiceáil ballraíochta",
      validUntil: "Bailí go dtí {{date}}",
      notFound: {
        title: "Níor aimsíodh ballraíocht",
        body: "Níorbh fhéidir linn ballraíocht leis an uimhir {{memberNumber}} a aimsiú.",
      },
    },
  },
  pl: {
    status: {
      active: "Aktywne",
      expired: "Wygasłe",
      pending: "Oczekujące",
      none: "Brak członkostwa",
    },
    type: { athlete: "Członkostwo zawodnicze", organisation: "Członkostwo organizacyjne" },
    card: {
      title: "Moja karta",
      number: "Numer członkowski",
      validUntil: "Ważne do",
      qrLabel: "Kod QR prowadzący do publicznej weryfikacji członkostwa",
      scanHint:
        "Pokaż to przy rejestracji. Zeskanowanie kodu potwierdza członkostwo bez udostępniania danych kontaktowych.",
    },
    empty: {
      none: {
        title: "Nie jesteś jeszcze członkiem",
        body: "Członkostwo obejmuje ubezpieczenie, krajowe rankingi i ścieżkę do Reprezentacji Irlandii.",
        cta: "Dołącz do OCRA",
      },
      pending: {
        title: "Potwierdzamy płatność",
        body: "Członkostwo aktywuje się, gdy tylko płatność zostanie rozliczona. Zwykle dzieje się to natychmiast.",
        cta: "Sprawdź członkostwo",
      },
      expired: {
        title: "Twoje członkostwo wygasło",
        body: "Odnów je, aby odzyskać kartę i zachować prawo startu w zawodach rankingowych.",
        cta: "Odnów członkostwo",
      },
    },
    manage: {
      title: "Członkostwo",
      renewsOn: "Odnawia się {{date}}",
      endedOn: "Zakończone {{date}}",
      benefits: "Co obejmuje członkostwo",
      unavailable: "Płatności są chwilowo niedostępne. Spróbuj ponownie za chwilę.",
      manageCta: "Zarządzaj członkostwem",
      joinCta: "Dołącz do OCRA",
    },
    benefits: {
      insurance: "Ubezpieczenie na zawodach sankcjonowanych",
      rankings: "Prawo do udziału w rankingach krajowych",
      pathway: "Dostęp do ścieżki kwalifikacji Reprezentacji Irlandii",
      discounts: "Zniżki członkowskie u partnerów OCRA",
    },
    verify: {
      title: "Weryfikacja członkostwa",
      validUntil: "Ważne do {{date}}",
      notFound: {
        title: "Nie znaleziono członkostwa",
        body: "Nie znaleźliśmy członkostwa o numerze {{memberNumber}}.",
      },
    },
  },
  ru: {
    status: {
      active: "Активно",
      expired: "Истекло",
      pending: "Ожидает",
      none: "Не участник",
    },
    type: { athlete: "Членство атлета", organisation: "Членство организации" },
    card: {
      title: "Моя карта",
      number: "Номер участника",
      validUntil: "Действительно до",
      qrLabel: "QR-код для публичной проверки членства",
      scanHint:
        "Покажите это при регистрации. Сканирование кода подтверждает членство без передачи ваших контактов.",
    },
    empty: {
      none: {
        title: "Вы ещё не участник",
        body: "Членство включает страховку, национальные рейтинги и путь в сборную Ирландии.",
        cta: "Вступить в OCRA",
      },
      pending: {
        title: "Платёж подтверждается",
        body: "Членство активируется, как только пройдёт платёж. Обычно это происходит мгновенно.",
        cta: "Проверить членство",
      },
      expired: {
        title: "Ваше членство истекло",
        body: "Продлите его, чтобы вернуть карту и сохранить право участия в рейтинговых гонках.",
        cta: "Продлить членство",
      },
    },
    manage: {
      title: "Членство",
      renewsOn: "Продление {{date}}",
      endedOn: "Завершено {{date}}",
      benefits: "Что включает членство",
      unavailable: "Платежи сейчас недоступны. Попробуйте позже.",
      manageCta: "Управлять членством",
      joinCta: "Вступить в OCRA",
    },
    benefits: {
      insurance: "Страховое покрытие на санкционированных гонках",
      rankings: "Право участия в национальных рейтингах",
      pathway: "Доступ к квалификационному пути сборной Ирландии",
      discounts: "Скидки для участников у партнёров OCRA",
    },
    verify: {
      title: "Проверка членства",
      validUntil: "Действительно до {{date}}",
      notFound: {
        title: "Членство не найдено",
        body: "Мы не нашли членство с номером {{memberNumber}}.",
      },
    },
  },
  be: {
    status: {
      active: "Актыўнае",
      expired: "Скончылася",
      pending: "Чакае",
      none: "Не ўдзельнік",
    },
    type: { athlete: "Сяброўства атлета", organisation: "Сяброўства арганізацыі" },
    card: {
      title: "Мая карта",
      number: "Нумар удзельніка",
      validUntil: "Дзейнічае да",
      qrLabel: "QR-код для публічнай праверкі сяброўства",
      scanHint:
        "Пакажыце гэта пры рэгістрацыі. Сканаванне коду пацвярджае сяброўства без перадачы вашых кантактаў.",
    },
    empty: {
      none: {
        title: "Вы яшчэ не ўдзельнік",
        body: "Сяброўства ўключае страхоўку, нацыянальныя рэйтынгі і шлях у зборную Ірландыі.",
        cta: "Далучыцца да OCRA",
      },
      pending: {
        title: "Плацёж пацвярджаецца",
        body: "Сяброўства актывуецца, як толькі пройдзе плацёж. Звычайна гэта адбываецца імгненна.",
        cta: "Праверыць сяброўства",
      },
      expired: {
        title: "Ваша сяброўства скончылася",
        body: "Падоўжыце яго, каб вярнуць карту і захаваць права ўдзелу ў рэйтынгавых гонках.",
        cta: "Падоўжыць сяброўства",
      },
    },
    manage: {
      title: "Сяброўства",
      renewsOn: "Падаўжэнне {{date}}",
      endedOn: "Завершана {{date}}",
      benefits: "Што ўключае сяброўства",
      unavailable: "Плацяжы зараз недаступныя. Паспрабуйце пазней.",
      manageCta: "Кіраваць сяброўствам",
      joinCta: "Далучыцца да OCRA",
    },
    benefits: {
      insurance: "Страхавое пакрыццё на санкцыянаваных гонках",
      rankings: "Права ўдзелу ў нацыянальных рэйтынгах",
      pathway: "Доступ да кваліфікацыйнага шляху зборнай Ірландыі",
      discounts: "Зніжкі для ўдзельнікаў у партнёраў OCRA",
    },
    verify: {
      title: "Праверка сяброўства",
      validUntil: "Дзейнічае да {{date}}",
      notFound: {
        title: "Сяброўства не знойдзена",
        body: "Мы не знайшлі сяброўства з нумарам {{memberNumber}}.",
      },
    },
  },
} as const
