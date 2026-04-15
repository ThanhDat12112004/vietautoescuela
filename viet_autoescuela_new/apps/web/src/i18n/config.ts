import { defaultLocale, supportedLocales } from '@viet/i18n';
import type { Locale } from '@viet/shared-types';

export { defaultLocale, supportedLocales };

export function isSupportedLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}
