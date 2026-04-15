'use client';

import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocaleFromPath } from '@/hooks/useLocaleFromPath';
import { APP_ROUTES } from '@/config/routes';
import { fetchSessionWithBearer } from '@/lib/api/auth';
import { saveAuth } from '@/lib/auth';
import { localePath } from '@/lib/i18n-routing';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const AuthCallback = () => {
  const { tk } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const locale = useLocaleFromPath();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    const qp = new URLSearchParams(hash);
    const token = qp.get('token')?.trim() || '';
    const error = qp.get('error')?.trim() || '';

    const goLogin = () => {
      router.replace(localePath(locale, APP_ROUTES.LOGIN));
    };

    const run = async () => {
      if (error) {
        toast({
          variant: 'destructive',
          title: tk('auth.oauthFailed'),
          description: decodeURIComponent(error.replace(/\+/g, ' ')),
        });
        goLogin();
        return;
      }

      if (!token) {
        goLogin();
        return;
      }

      try {
        const res = await fetchSessionWithBearer(token);
        if (!res?.user) {
          throw new Error('no_user');
        }
        saveAuth(token, res.user);
        window.dispatchEvent(new CustomEvent('auth-updated'));
        router.replace(localePath(locale, APP_ROUTES.HOME));
      } catch {
        toast({
          variant: 'destructive',
          title: tk('auth.oauthFailed'),
        });
        goLogin();
      }
    };

    void run();
  }, [locale, router, tk, toast]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4">
      <p className="text-sm text-muted-foreground">{tk('auth.processing')}</p>
    </div>
  );
};

export default AuthCallback;
