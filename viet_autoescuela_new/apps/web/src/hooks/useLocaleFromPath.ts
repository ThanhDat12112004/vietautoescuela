'use client';

import { defaultLocale, isSupportedLocale } from '@/i18n/config';
import { usePathname } from 'next/navigation';

export function localeFromPathname(pathname: string): string {
  const seg = pathname.split('/').filter(Boolean)[0];
  return isSupportedLocale(seg) ? seg : defaultLocale;
}

export function useLocaleFromPath(): string {
  const pathname = usePathname();
  return localeFromPathname(pathname);
}
