import type { Language } from '@/lib/api/types';
import { defaultLocale, isSupportedLocale } from '@/i18n/config';

/** Path gốc (không có segment locale), ví dụ `/materials`, `/`. */
export function localePath(locale: string, path: string): string {
  const loc = (isSupportedLocale(locale) ? locale : defaultLocale) as Language;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `/${loc}`;
  return `/${loc}${normalized}`;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length && isSupportedLocale(segments[0])) {
    const rest = segments.slice(1);
    return rest.length ? `/${rest.join('/')}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function isRouteActive(pathname: string, routePath: string): boolean {
  const current = stripLocalePrefix(pathname);
  if (routePath === '/') return current === '/' || current === '';
  return current === routePath || current.startsWith(`${routePath}/`);
}

export function quizDetailHref(locale: string, quizId: string | number, query?: string): string {
  const base = localePath(locale, `/quiz/${quizId}`);
  return query ? `${base}?${query}` : base;
}
