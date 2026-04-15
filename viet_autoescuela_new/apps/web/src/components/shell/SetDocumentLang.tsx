'use client';

import type { Language } from '@/lib/api/types';
import { useEffect } from 'react';

/** BCP 47 cho <html lang> — khớp locale URL (vi | es | en). */
const HTML_LANG: Record<Language, string> = {
  vi: 'vi',
  es: 'es',
  en: 'en',
};

export function SetDocumentLang({ locale }: { locale: Language }) {
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale] ?? locale;
  }, [locale]);

  return null;
}
