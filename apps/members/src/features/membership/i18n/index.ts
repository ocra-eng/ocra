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
    share: {
      title: "My OCRA membership",
      share: "Share card",
      copy: "Copy link",
      copied: "Link copied",
    },
    empty: {
      none: {
        title: "You're not a member yet",
        body: "Membership is your route into the Team Ireland pathway and OCRA competition.",
        cta: "Join OCRA",
      },
      pending: {
        title: "Payment is being confirmed",
        body: "Your membership will activate as soon as the payment clears. This is usually instant.",
        cta: "Check membership",
      },
      expired: {
        title: "Your membership has expired",
        body: "Renew to get your card back and stay eligible for qualifying events.",
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
      pathway: "Access to the Team Ireland qualification pathway",
      discounts:
        "Member discounts at partner businesses — currently Tiger Obstacle (10%) and Officine del Grip (12%)",
    },
    discounts: {
      title: "Member discounts",
      intro:
        "Offers from partner businesses for OCRA members. The codes and links are for members only — please do not share them.",
      off: "{{percent}}% off",
      useCode: "Use code",
      linkApplies:
        "Open the shop through this link and the discount is applied at checkout.",
      openShop: "Open {{name}}",
    },
    verify: {
      title: "Membership check",
      validUntil: "Valid until {{date}}",
      notFound: {
        title: "No membership found",
        bodyToken: "This code does not match an active OCRA membership.",
      },
      confirmed: "This membership is active and in good standing.",
      notActive: "This membership is not currently active.",
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
    share: {
      title: "Mo bhallraíocht OCRA",
      share: "Roinn an cárta",
      copy: "Cóipeáil an nasc",
      copied: "Nasc cóipeáilte",
    },
    empty: {
      none: {
        title: "Níl tú i do bhall fós",
        body: "Cuimsíonn ballraíocht conair Fhoireann na hÉireann agus comórtais OCRA.",
        cta: "Bí i do bhall",
      },
      pending: {
        title: "Íocaíocht á deimhniú",
        body: "Beidh do bhallraíocht gníomhach chomh luath is a ghlanfaidh an íocaíocht. Bíonn sé seo láithreach de ghnáth.",
        cta: "Seiceáil ballraíocht",
      },
      expired: {
        title: "Tá do bhallraíocht as feidhm",
        body: "Athnuaigh í chun do chárta a fháil ar ais agus fanacht incháilithe d'imeachtaí cáilithe.",
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
      pathway: "Rochtain ar chonair cháilithe Fhoireann na hÉireann",
      discounts:
        "Lascainí do bhaill ó ghnólachtaí comhpháirtíochta — Tiger Obstacle (10%) agus Officine del Grip (12%) faoi láthair",
    },
    discounts: {
      title: "Lascainí do bhaill",
      intro:
        "Tairiscintí ó ghnólachtaí comhpháirtíochta do bhaill OCRA. Is do bhaill amháin na cóid agus na naisc — ná roinn iad, le do thoil.",
      off: "{{percent}}% lascaine",
      useCode: "Úsáid an cód",
      linkApplies:
        "Oscail an siopa tríd an nasc seo agus cuirfear an lascaine i bhfeidhm ag an seiceáil amach.",
      openShop: "Oscail {{name}}",
    },
    verify: {
      title: "Seiceáil ballraíochta",
      validUntil: "Bailí go dtí {{date}}",
      notFound: {
        title: "Níor aimsíodh ballraíocht",
        bodyToken: "Ní ionann an cód seo agus ballraíocht ghníomhach OCRA.",
      },
      confirmed: "Tá an ballraíocht seo gníomhach agus in ord.",
      notActive: "Níl an ballraíocht seo gníomhach faoi láthair.",
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
    share: {
      title: "Moje członkostwo OCRA",
      share: "Udostępnij kartę",
      copy: "Kopiuj link",
      copied: "Link skopiowany",
    },
    empty: {
      none: {
        title: "Nie jesteś jeszcze członkiem",
        body: "Członkostwo otwiera ścieżkę do Reprezentacji Irlandii i zawody OCRA.",
        cta: "Dołącz do OCRA",
      },
      pending: {
        title: "Potwierdzamy płatność",
        body: "Członkostwo aktywuje się, gdy tylko płatność zostanie rozliczona. Zwykle dzieje się to natychmiast.",
        cta: "Sprawdź członkostwo",
      },
      expired: {
        title: "Twoje członkostwo wygasło",
        body: "Odnów je, aby odzyskać kartę i zachować prawo startu w zawodach kwalifikacyjnych.",
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
      pathway: "Dostęp do ścieżki kwalifikacji Reprezentacji Irlandii",
      discounts:
        "Zniżki dla członków u firm partnerskich — obecnie Tiger Obstacle (10%) i Officine del Grip (12%)",
    },
    discounts: {
      title: "Zniżki dla członków",
      intro:
        "Oferty firm partnerskich dla członków OCRA. Kody i linki są tylko dla członków — prosimy ich nie udostępniać.",
      off: "{{percent}}% zniżki",
      useCode: "Użyj kodu",
      linkApplies:
        "Otwórz sklep przez ten link, a zniżka zostanie naliczona przy płatności.",
      openShop: "Otwórz {{name}}",
    },
    verify: {
      title: "Weryfikacja członkostwa",
      validUntil: "Ważne do {{date}}",
      notFound: {
        title: "Nie znaleziono członkostwa",
        bodyToken: "Ten kod nie odpowiada aktywnemu członkostwu OCRA.",
      },
      confirmed: "To członkostwo jest aktywne i w porządku.",
      notActive: "To członkostwo nie jest obecnie aktywne.",
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
    share: {
      title: "Моё членство OCRA",
      share: "Поделиться картой",
      copy: "Копировать ссылку",
      copied: "Ссылка скопирована",
    },
    empty: {
      none: {
        title: "Вы ещё не участник",
        body: "Членство открывает путь в сборную Ирландии и соревнования OCRA.",
        cta: "Вступить в OCRA",
      },
      pending: {
        title: "Платёж подтверждается",
        body: "Членство активируется, как только пройдёт платёж. Обычно это происходит мгновенно.",
        cta: "Проверить членство",
      },
      expired: {
        title: "Ваше членство истекло",
        body: "Продлите его, чтобы вернуть карту и сохранить право участия в квалификационных гонках.",
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
      pathway: "Доступ к квалификационному пути сборной Ирландии",
      discounts:
        "Скидки для членов у партнёров — сейчас Tiger Obstacle (10%) и Officine del Grip (12%)",
    },
    discounts: {
      title: "Скидки для членов",
      intro:
        "Предложения партнёров для членов OCRA. Коды и ссылки только для членов — пожалуйста, не делитесь ими.",
      off: "Скидка {{percent}}%",
      useCode: "Используйте код",
      linkApplies:
        "Откройте магазин по этой ссылке — скидка применится при оформлении заказа.",
      openShop: "Открыть {{name}}",
    },
    verify: {
      title: "Проверка членства",
      validUntil: "Действительно до {{date}}",
      notFound: {
        title: "Членство не найдено",
        bodyToken: "Этот код не соответствует активному членству OCRA.",
      },
      confirmed: "Членство активно и в порядке.",
      notActive: "Это членство сейчас не активно.",
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
    share: {
      title: "Маё сяброўства OCRA",
      share: "Падзяліцца картай",
      copy: "Скапіяваць спасылку",
      copied: "Спасылка скапіявана",
    },
    empty: {
      none: {
        title: "Вы яшчэ не ўдзельнік",
        body: "Сяброўства адкрывае шлях у зборную Ірландыі і змаганні OCRA.",
        cta: "Далучыцца да OCRA",
      },
      pending: {
        title: "Плацёж пацвярджаецца",
        body: "Сяброўства актывуецца, як толькі пройдзе плацёж. Звычайна гэта адбываецца імгненна.",
        cta: "Праверыць сяброўства",
      },
      expired: {
        title: "Ваша сяброўства скончылася",
        body: "Падоўжыце яго, каб вярнуць карту і захаваць права ўдзелу ў кваліфікацыйных гонках.",
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
      pathway: "Доступ да кваліфікацыйнага шляху зборнай Ірландыі",
      discounts:
        "Зніжкі для сяброў у партнёраў — цяпер Tiger Obstacle (10%) і Officine del Grip (12%)",
    },
    discounts: {
      title: "Зніжкі для сяброў",
      intro:
        "Прапановы партнёраў для сяброў OCRA. Коды і спасылкі толькі для сяброў — калі ласка, не дзяліцеся імі.",
      off: "Зніжка {{percent}}%",
      useCode: "Выкарыстайце код",
      linkApplies:
        "Адкрыйце краму па гэтай спасылцы — зніжка прымяніцца пры афармленні заказу.",
      openShop: "Адкрыць {{name}}",
    },
    verify: {
      title: "Праверка сяброўства",
      validUntil: "Дзейнічае да {{date}}",
      notFound: {
        title: "Сяброўства не знойдзена",
        bodyToken: "Гэты код не адпавядае актыўнаму сяброўству OCRA.",
      },
      confirmed: "Сяброўства актыўнае і ў парадку.",
      notActive: "Гэта сяброўства зараз не актыўнае.",
    },
  },
} as const
