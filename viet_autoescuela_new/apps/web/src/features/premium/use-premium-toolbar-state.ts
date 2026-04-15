'use client';

import { getPremiumToolbarState, type PremiumToolbarState } from '@/features/premium/premium-display';
import { AUTH_STORAGE_KEY, type AuthUser } from '@/lib/auth';
import { useMemo, useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('auth-updated', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener('auth-updated', onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * Phải trả về giá trị so sánh được ổn định (vd. chuỗi localStorage).
 * Không trả về object từ JSON.parse mỗi lần — React coi snapshot đổi liên tục → vòng lặp vô hạn.
 */
function getSnapshot(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function parseUserFromStorageRaw(raw: string | null): AuthUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser };
    if (!parsed?.token || !parsed?.user) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

/** User đăng nhập + trạng thái gói nâng cao cho UI (navbar, profile). */
export function usePremiumToolbarState(): PremiumToolbarState {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo(() => parseUserFromStorageRaw(raw), [raw]);
  return getPremiumToolbarState(user);
}
