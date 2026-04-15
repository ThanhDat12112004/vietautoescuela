import { APP_ROUTES } from '@/config/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { getStoredAuth } from '@/lib/auth';
import { localePath } from '@/lib/i18n-routing';
import type { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export function useAdminShell(queryClient: QueryClient) {
  const router = useRouter();
  const { lang } = useLanguage();
  const [auth, setAuth] = useState(() => getStoredAuth());
  const isAdmin = useMemo(() => auth?.user?.role === 'admin', [auth]);

  useEffect(() => {
    const syncAuth = () => {
      setAuth(getStoredAuth());
    };

    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(localePath(lang, APP_ROUTES.LOGIN));
      return;
    }
    if (!isAdmin) {
      router.replace(localePath(lang, APP_ROUTES.HOME));
    }
  }, [auth, isAdmin, lang, router]);

  async function invalidateHomeQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['home'] }),
      queryClient.invalidateQueries({ queryKey: ['materials'] }),
    ]);
  }

  return { auth, isAdmin, invalidateHomeQueries };
}
