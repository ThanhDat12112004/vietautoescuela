import { AppChrome, AppProviders, SetDocumentLang } from '@/components/shell';
import { defaultLocale, isSupportedLocale } from '@/i18n/config';
import type { Language } from '@/lib/api/types';
import type { ReactNode } from 'react';

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const locale = (isSupportedLocale(params.locale) ? params.locale : defaultLocale) as Language;

  return (
    <AppProviders initialLang={locale}>
      <SetDocumentLang locale={locale} />
      <AppChrome>{children}</AppChrome>
    </AppProviders>
  );
}
