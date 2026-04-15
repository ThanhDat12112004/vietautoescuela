'use client';

import { FloatingContactButton } from '@/components/layout';
import { APP_ROUTES } from '@/config/routes';
import { stripLocalePrefix } from '@/lib/i18n-routing';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = stripLocalePrefix(pathname);
  const hideFloating = bare.startsWith(APP_ROUTES.QUIZ_PREFIX);

  return (
    <>
      {!hideFloating && <FloatingContactButton />}
      {children}
    </>
  );
}
