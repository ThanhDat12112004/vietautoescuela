import type { Locale } from '@viet/shared-types';

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${String(x)}`);
}

export function toLocaleLabel(locale: Locale) {
  if (locale === 'vi') return 'Tiếng Việt';
  if (locale === 'es') return 'Español';
  return 'English';
}
