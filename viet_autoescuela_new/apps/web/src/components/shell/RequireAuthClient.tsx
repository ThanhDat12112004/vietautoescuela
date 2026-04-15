'use client';

import { APP_ROUTES } from '@/config/routes';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { getStoredAuth } from '@/lib/auth';
import { localePath } from '@/lib/i18n-routing';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

function buildLoginRedirect(locale: string, pathname: string, search: string): string {
  const from = `${pathname}${search ? `?${search}` : ''}`;
  const loginBase = localePath(locale, APP_ROUTES.LOGIN);
  return `${loginBase}?from=${encodeURIComponent(from)}`;
}

export function RequireAuthClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocaleFromPath();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getStoredAuth()?.token;
    if (!token) {
      const search = searchParams.toString();
      router.replace(buildLoginRedirect(locale, pathname, search));
      setOk(false);
      return;
    }
    setOk(true);
  }, [locale, pathname, router, searchParams]);

  if (ok !== true) {
    return null;
  }

  return <>{children}</>;
}
