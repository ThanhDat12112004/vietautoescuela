import { fetchGoogleOAuthStatus } from '@/lib/api/auth';
import { useEffect, useState } from 'react';

/** `null` = đang kiểm tra; `true`/`false` = máy chủ đã bật Google OAuth hay chưa. */
export function useGoogleOAuthStatus() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchGoogleOAuthStatus().then((v) => {
      if (!cancelled) setConfigured(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return configured;
}
