import type { Language } from "@ocra/shared";

export const ALL_LANGUAGES: Language[] = [
  { code: "en", label: "English" },
  { code: "ga", label: "Gaeilge" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
  { code: "be", label: "Беларуская" },
];

export const RELEASED_LANGUAGE_CODES: string[] = ["en", "ru", "pl", "be", "ga"];

export const DEFAULT_LANGUAGE_CODE = "en";
