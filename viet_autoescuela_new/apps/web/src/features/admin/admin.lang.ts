import type { Language } from '@/lib/api/types';
import { tKey } from '@viet/i18n';

/** Entity row with vi/es/(optional)en name or title fields. */
export function adminTrilingualField(
  lang: Language,
  vi: string | null | undefined,
  es: string | null | undefined,
  en?: string | null | undefined
): string {
  if (lang === 'vi') return String(vi ?? '');
  if (lang === 'en') return String((en && String(en).trim()) || es || vi || '');
  return String(es ?? '');
}

/** Suffix for inactive / hidden entities in admin dropdowns and lists. */
export function adminHiddenLabelSuffix(lang: Language): string {
  return tKey(lang, 'adminUi.hidden');
}
