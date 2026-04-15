'use client';

import { isSupportedLocale } from '@/i18n/config';
import type { Language } from '@/lib/api/types';
import { useLanguage } from '@/hooks/useLanguage';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

/** Đổi ngôn ngữ UI và đồng bộ segment locale trên URL. */
export function useLocaleAwareSetLang() {
  const { setLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (code: Language) => {
      setLang(code);
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length && isSupportedLocale(segments[0])) {
        segments[0] = code;
        router.replace(`/${segments.join('/')}`);
        return;
      }
      router.replace(`/${code}`);
    },
    [setLang, pathname, router]
  );
}
