import { toast } from '@/components/ui/sonner';
import { getApiBaseUrl } from '@/lib/api/client';
import { clearAuth, getStoredAuth } from '@/lib/auth';
import type { I18nKey } from '@viet/i18n';
import { useEffect } from 'react';

type TkFn = (key: I18nKey) => string;

export function useAuthSessionManager(tk: TkFn) {
  useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const closeSource = () => {
      if (source) {
        source.close();
        source = null;
      }
    };

    const clearReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const emitSessionEnded = (reason: string) => {
      clearAuth();
      window.dispatchEvent(new CustomEvent('auth-updated'));
      window.dispatchEvent(
        new CustomEvent('auth-session-ended', {
          detail: { reason },
        })
      );
    };

    const connect = () => {
      clearReconnect();
      closeSource();
      const stored = getStoredAuth();
      if (!stored?.token) return;

      const url = `${getApiBaseUrl()}/auth/session/stream?token=${encodeURIComponent(stored.token)}`;
      source = new EventSource(url);

      source.addEventListener('session-replaced', () => {
        emitSessionEnded('Session expired on this device');
        closeSource();
      });

      source.onerror = () => {
        closeSource();
        if (!getStoredAuth()?.token) return;
        reconnectTimer = setTimeout(() => {
          connect();
        }, 2_000);
      };
    };

    const onAuthUpdated = () => {
      connect();
    };

    connect();
    window.addEventListener('auth-updated', onAuthUpdated);

    return () => {
      window.removeEventListener('auth-updated', onAuthUpdated);
      clearReconnect();
      closeSource();
    };
  }, []);

  useEffect(() => {
    const onSessionEnded = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail;
      const reason = String(detail?.reason || '').toLowerCase();

      if (reason.includes('session expired on this device')) {
        toast.error(tk('session.replacedTitle'), {
          description: tk('session.replacedDesc'),
        });
        return;
      }

      toast.error(tk('session.expiredTitle'), {
        description: tk('session.signInAgain'),
      });
    };

    window.addEventListener('auth-session-ended', onSessionEnded as EventListener);

    return () => {
      window.removeEventListener('auth-session-ended', onSessionEnded as EventListener);
    };
  }, [tk]);
}
