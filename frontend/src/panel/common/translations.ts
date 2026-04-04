import type { HomeAssistant } from 'custom-card-helpers';
import { en } from './translations/en';
import { de } from './translations/de';
import { it } from './translations/it';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en,
  de,
  it,
};

function getLanguage(hass?: HomeAssistant): string {
  const maybeHass = hass as any;
  const language = maybeHass?.language ?? maybeHass?.selectedLanguage ?? maybeHass?.config?.language ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  return typeof language === 'string' ? language.split('-')[0].toLowerCase() : 'en';
}

function getTranslation(language: string, key: string): string | undefined {
  const translations = TRANSLATIONS[language] ?? TRANSLATIONS[language.split('-')[0]];
  return translations?.[key] ?? TRANSLATIONS.en[key];
}

export function t(hass: HomeAssistant | undefined, key: string, replacements?: Record<string, string | number>): string {
  const language = getLanguage(hass);
  const translation = getTranslation(language, key) ?? key;
  if (!replacements) {
    return translation;
  }

  return Object.entries(replacements).reduce((result, [replaceKey, replaceValue]) => {
    return result.replace(new RegExp(`\\{${replaceKey}\\}`, 'g'), String(replaceValue));
  }, translation);
}
