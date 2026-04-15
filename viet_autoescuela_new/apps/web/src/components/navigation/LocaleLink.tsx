'use client';

import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { localePath } from '@/lib/i18n-routing';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';

type NextLinkProps = ComponentProps<typeof NextLink>;

export type LocaleLinkProps = Omit<NextLinkProps, 'href'> & {
  /** Đường dẫn không có locale (ví dụ `/quizzes`, `/materials?type=x`). */
  href: string;
};

function localizedHref(locale: string, href: string): string {
  const [pathPart, query] = href.split('?');
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  const withLocale = localePath(locale, path);
  return query ? `${withLocale}?${query}` : withLocale;
}

export function LocaleLink({ href, ...rest }: LocaleLinkProps) {
  const locale = useLocaleFromPath();
  return <NextLink href={localizedHref(locale, href)} {...rest} />;
}
